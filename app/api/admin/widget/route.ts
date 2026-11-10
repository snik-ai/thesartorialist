// Kennzahlen für das Schreibtisch-Widget der Mac-App (/admin/widget/, desktop/). Nur mit Admin-Sitzung, nur Kennzahlen
// und je Bereich der nächste Eintrag (Name + Link), keine Kontaktdaten.
import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { apiAdmin } from '@/lib/admin/zugang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type WidgetDaten = {
  stand: string;
  termine: { heute: number; naechster: { id: string; start: string; name: string; zweck: string } | null };
  anfragen: { termine: number; rueckrufe: number; neueste: { id: string; name: string; art: string } | null };
  rechnungen: { offenAnzahl: number; offenRp: number; ueberfaelligAnzahl: number; ueberfaelligRp: number };
  auftraege: { laufend: number; naechsteLieferung: { id: string; nummer: string | null; titel: string; liefertermin: string } | null };
  besucher: { heute: number; jetzt: number };
};

const HEUTE = sql`(date_trunc('day', now() at time zone 'Europe/Zurich') at time zone 'Europe/Zurich')`;

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const d = db();
  const [[k], [nt], [na], [nl]] = await Promise.all([
    d.execute<{
      termine_heute: number; anfragen_termin: number; anfragen_rueckruf: number; re_offen: number; re_offen_rp: number;
      re_ueber: number; re_ueber_rp: number; laufend: number; besucher_heute: number; besucher_jetzt: number;
    }>(sql`
      select
        (select count(*)::int from termin where status = 'bestaetigt' and bestaetigt_start >= ${HEUTE} and bestaetigt_start < ${HEUTE} + interval '1 day') as termine_heute,
        (select count(*)::int from termin where status = 'angefragt' and art = 'termin') as anfragen_termin,
        (select count(*)::int from termin where status = 'angefragt' and art = 'rueckruf') as anfragen_rueckruf,
        (select count(*)::int from rechnung where status in ('offen', 'teilbezahlt')) as re_offen,
        (select coalesce(sum(betrag_rp - bezahlt_rp), 0)::bigint::int from rechnung where status in ('offen', 'teilbezahlt')) as re_offen_rp,
        (select count(*)::int from rechnung where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day') as re_ueber,
        (select coalesce(sum(betrag_rp - bezahlt_rp), 0)::bigint::int from rechnung where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day') as re_ueber_rp,
        (select count(*)::int from auftrag where status not in ('abgeholt', 'abgeschlossen', 'storniert')) as laufend,
        (select count(distinct besucher)::int from ereignis where typ = 'pageview' and zeit >= ${HEUTE}) as besucher_heute,
        (select count(distinct besucher)::int from ereignis where typ = 'pageview' and zeit >= now() - interval '5 minutes') as besucher_jetzt`),
    d.execute<{ id: string; start: string; name: string; zweck: string }>(sql`
      select t.id, t.bestaetigt_start as start, coalesce(k.name, '') as name, t.zweck
        from termin t join kontakt k on k.id = t.kontakt_id
       where t.status = 'bestaetigt' and t.bestaetigt_start >= now() - interval '30 minutes'
       order by t.bestaetigt_start asc limit 1`),
    d.execute<{ id: string; name: string; art: string }>(sql`
      select t.id, coalesce(k.name, '') as name, t.art
        from termin t join kontakt k on k.id = t.kontakt_id
       where t.status = 'angefragt' order by t.erstellt_am desc limit 1`),
    d.execute<{ id: string; nummer: string | null; titel: string; liefertermin: string }>(sql`
      select id, nummer, titel, liefertermin from auftrag
       where status not in ('abgeholt', 'abgeschlossen', 'storniert') and liefertermin >= ${HEUTE}
       order by liefertermin asc limit 1`),
  ]);
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v));
  const daten: WidgetDaten = {
    stand: new Date().toISOString(),
    termine: { heute: k?.termine_heute ?? 0, naechster: nt ? { ...nt, start: iso(nt.start) } : null },
    anfragen: { termine: k?.anfragen_termin ?? 0, rueckrufe: k?.anfragen_rueckruf ?? 0, neueste: na ?? null },
    rechnungen: { offenAnzahl: k?.re_offen ?? 0, offenRp: k?.re_offen_rp ?? 0, ueberfaelligAnzahl: k?.re_ueber ?? 0, ueberfaelligRp: k?.re_ueber_rp ?? 0 },
    auftraege: { laufend: k?.laufend ?? 0, naechsteLieferung: nl ? { ...nl, liefertermin: iso(nl.liefertermin) } : null },
    besucher: { heute: k?.besucher_heute ?? 0, jetzt: k?.besucher_jetzt ?? 0 },
  };
  return NextResponse.json(daten, { headers: { 'Cache-Control': 'no-store' } });
}
