// Wochenplanung (Server): Kundentermine + private Einträge einer Woche, belegte Zeiten für Slot-Picker und Kollisionen.
import { and, eq, gte, isNotNull, lt, ne, or, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { ueberlappt, vorkommen, type Bereich, type KalItem, type KalTyp } from '@/lib/kalender';
import { zuerichTeile } from '@/lib/zeit';

const TAG = 86400_000;

/** Alle Einträge im Bereich [von, bis) — für das Wochenraster */
export async function kalenderItems(von: Date, bis: Date): Promise<KalItem[]> {
  const t = schema.termin;
  const k = schema.kontakt;
  const startSql = sql`coalesce(${t.bestaetigtStart}, ${t.wunschStart})`;
  const [termine, privat] = await Promise.all([
    db()
      .select({ t, k })
      .from(t)
      .innerJoin(k, eq(k.id, t.kontaktId))
      .where(
        and(
          ne(t.status, 'abgesagt'),
          or(
            and(sql`${startSql} >= ${new Date(von.getTime() - TAG).toISOString()}::timestamptz`, sql`${startSql} < ${bis.toISOString()}::timestamptz`),
            eq(t.status, 'vorgeschlagen'),
          ),
        ),
      )
      .limit(800),
    privateEintraege(von, bis),
  ]);

  const items: KalItem[] = [];
  for (const { t: x, k: kk } of termine) {
    const kontakt = {
      id: kk.id,
      name: kk.name || kk.telefon || kk.email || 'Ohne Namen',
      telefon: kk.telefon,
      email: kk.email,
      whatsappOk: Boolean(kk.einwilligungWhatsapp),
      smsOk: Boolean(kk.einwilligungSms),
      abgemeldet: Boolean(kk.abgemeldet),
      sprache: kk.sprache,
    };
    const typ: KalTyp = x.art === 'rueckruf' ? 'telefon' : x.zweck;
    const dauer = (x.art === 'rueckruf' ? 15 : x.dauerMin || 60) * 60_000;
    const basis = { id: x.id, quelle: 'termin' as const, typ, titel: kontakt.name, ganztaegig: false, status: x.status, erledigt: x.status === 'erledigt', kontakt };
    if (x.status === 'vorgeschlagen') {
      for (const v of x.vorschlaege) {
        const s = new Date(v);
        if (Number.isNaN(s.getTime()) || !ueberlappt(s.getTime(), s.getTime() + dauer, von.getTime(), bis.getTime())) continue;
        items.push({ ...basis, key: `${x.id}@${v}`, start: s.toISOString(), ende: new Date(s.getTime() + dauer).toISOString(), offen: true, beweglich: false });
      }
      continue;
    }
    const s = x.status === 'angefragt' ? x.wunschStart : (x.bestaetigtStart ?? x.wunschStart);
    if (!s || !ueberlappt(s.getTime(), s.getTime() + dauer, von.getTime(), bis.getTime())) continue;
    items.push({ ...basis, key: x.id, start: s.toISOString(), ende: new Date(s.getTime() + dauer).toISOString(), offen: x.status === 'angefragt', beweglich: x.status === 'bestaetigt' && x.art === 'termin' });
  }
  for (const p of privat) {
    for (const v of vorkommen(p, von, bis)) {
      items.push({
        key: `${p.id}@${v.start.toISOString()}`,
        id: p.id,
        quelle: 'privat',
        typ: 'privat',
        titel: p.titel,
        start: v.start.toISOString(),
        ende: v.ende.toISOString(),
        ganztaegig: p.ganztaegig,
        offen: false,
        erledigt: false,
        beweglich: true,
        notiz: p.notiz,
        wiederholung: p.wiederholung,
        basisStart: p.start.toISOString(),
        basisEnde: p.ende.toISOString(),
      });
    }
  }
  return items.sort((a, b) => a.start.localeCompare(b.start));
}

/** Private Einträge, die in [von, bis) vorkommen können (Serien ab ihrem Start) */
export async function privateEintraege(von: Date, bis: Date) {
  const e = schema.kalenderEintrag;
  return db()
    .select()
    .from(e)
    .where(and(lt(e.start, bis), or(gte(e.ende, von), isNotNull(e.wiederholung))))
    .limit(500);
}

/** Belegte Zeiten in [von, bis): bestätigte Termine (mit Dauer) und private Einträge (Serien aufgelöst). */
export async function belegtBereiche(von: Date, bis: Date, o: { ohneTermin?: string; ohnePrivat?: string; mitTitel?: boolean } = {}): Promise<Bereich[]> {
  const t = schema.termin;
  const [termine, privat] = await Promise.all([
    db()
      .select({ id: t.id, start: t.bestaetigtStart, dauer: t.dauerMin, zweck: t.zweck })
      .from(t)
      .where(and(eq(t.status, 'bestaetigt'), isNotNull(t.bestaetigtStart), gte(t.bestaetigtStart, new Date(von.getTime() - TAG)), lt(t.bestaetigtStart, bis))),
    privateEintraege(von, bis),
  ]);
  const out: Bereich[] = [];
  for (const x of termine) {
    if (x.id === o.ohneTermin || !x.start) continue;
    out.push({ start: x.start.toISOString(), ende: new Date(x.start.getTime() + (x.dauer || 60) * 60_000).toISOString(), art: 'termin' });
  }
  for (const p of privat) {
    if (p.id === o.ohnePrivat) continue;
    for (const v of vorkommen(p, von, bis)) out.push({ start: v.start.toISOString(), ende: v.ende.toISOString(), art: 'privat', titel: o.mitTitel ? p.titel : undefined });
  }
  return out;
}

/** Für die Slot-Picker im Backend: belegte Zeiten ab gestern für die nächsten 6 Monate */
export async function belegtFuerPicker(o: { ohneTermin?: string } = {}) {
  const von = new Date(Date.now() - TAG);
  return belegtBereiche(von, new Date(von.getTime() + 190 * TAG), o);
}

/** Erster private Blocker, der [start, ende) überlappt (Kundentermine dürfen dort nicht liegen) */
export async function privatKollision(start: Date, ende: Date) {
  const b = await belegtBereiche(new Date(start.getTime() - TAG), new Date(ende.getTime() + TAG), { mitTitel: true });
  const p = b.find((x) => x.art === 'privat' && ueberlappt(new Date(x.start).getTime(), new Date(x.ende).getTime(), start.getTime(), ende.getTime()));
  return p ? `${p.titel} (${zuerichTeile(new Date(p.start)).zeit}–${zuerichTeile(new Date(p.ende)).zeit})` : null;
}
