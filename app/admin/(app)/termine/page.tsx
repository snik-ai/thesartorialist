import type { Metadata } from 'next';
import Link from 'next/link';
import { and, asc, desc, eq, gte, inArray, sql, type SQL } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { relativ, terminKurz, TZ } from '@/lib/zeit';
import { STATUS_LABEL } from '@/lib/crm/status';

export const metadata: Metadata = { title: 'Termine' };
export const dynamic = 'force-dynamic';

const FILTER = {
  offen: { label: 'Offen', status: ['angefragt', 'vorgeschlagen'] },
  bestaetigt: { label: 'Bestätigt', status: ['bestaetigt'] },
  erledigt: { label: 'Erledigt & abgesagt', status: ['erledigt', 'abgesagt'] },
  alle: { label: 'Alle', status: null },
} as const;
type Filter = keyof typeof FILTER;

export default async function TerminePage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const sp = await searchParams;
  const f: Filter = sp.f && sp.f in FILTER ? (sp.f as Filter) : 'offen';
  const t = schema.termin;
  const k = schema.kontakt;

  const zaehler = await db()
    .select({ status: t.status, n: sql<number>`count(*)::int` })
    .from(t)
    .groupBy(t.status);
  const anzahl = (s: readonly string[] | null) => zaehler.filter((z) => !s || s.includes(z.status)).reduce((a, z) => a + z.n, 0);

  const bed: SQL[] = [];
  const status = FILTER[f].status;
  if (status) bed.push(inArray(t.status, [...status]));
  // Bestätigt: nur kommende (ab heute), chronologisch
  if (f === 'bestaetigt') bed.push(gte(t.bestaetigtStart, sql`date_trunc('day', now() at time zone ${TZ}) at time zone ${TZ}`));
  const reihen = await db()
    .select({
      id: t.id,
      art: t.art,
      zweck: t.zweck,
      status: t.status,
      wunschStart: t.wunschStart,
      wunschText: t.wunschText,
      bestaetigtStart: t.bestaetigtStart,
      stilAnzahl: sql<number>`jsonb_array_length(${t.stil})`,
      stoffe: t.stoffe,
      gelesenAm: t.gelesenAm,
      erstelltAm: t.erstelltAm,
      name: k.name,
      telefon: k.telefon,
      email: k.email,
    })
    .from(t)
    .innerJoin(k, eq(k.id, t.kontaktId))
    .where(bed.length ? and(...bed) : undefined)
    .orderBy(f === 'bestaetigt' ? asc(t.bestaetigtStart) : desc(t.erstelltAm))
    .limit(200);

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Eingang</span>
          <h1>Termine &amp; Rückrufe</h1>
          <p className="a-sub">Anfragen von der Website — bestätigen, neuen Termin vorschlagen oder zurückrufen.</p>
        </div>
        <div className="a-segment" role="navigation" aria-label="Ansicht">
          <Link href="/admin/termine/" aria-current="page">
            Liste
          </Link>
          <Link href="/admin/termine/woche/">
            <Icon name="kalender" /> Woche
          </Link>
        </div>
      </div>

      <div className="a-chips" style={{ marginBottom: 16 }} role="navigation" aria-label="Filter">
        {(Object.keys(FILTER) as Filter[]).map((key) => (
          <Link key={key} href={key === 'offen' ? '/admin/termine/' : `/admin/termine/?f=${key}`} className="a-chip" aria-current={f === key ? 'page' : undefined}>
            {FILTER[key].label}
            <span className="zahl">{key === 'bestaetigt' ? '' : anzahl(FILTER[key].status)}</span>
          </Link>
        ))}
      </div>

      <div className="a-karte">
        {reihen.length === 0 ? (
          <div className="a-leer">
            <h3>{f === 'offen' ? 'Alles erledigt' : 'Keine Einträge'}</h3>
            <p>{f === 'offen' ? 'Neue Anfragen von der Website erscheinen hier sofort.' : 'In dieser Ansicht gibt es nichts.'}</p>
          </div>
        ) : (
          <div className="a-liste">
            {reihen.map((r) => {
              const start = r.bestaetigtStart ?? r.wunschStart;
              const tag = start ? start.toLocaleDateString('de-CH', { timeZone: TZ, day: 'numeric' }).replace('.', '') : '';
              const monat = start ? start.toLocaleDateString('de-CH', { timeZone: TZ, month: 'short' }).replace('.', '') : '';
              return (
                <Link key={r.id} href={`/admin/termine/${r.id}/`} className={`a-zeile${r.gelesenAm ? '' : ' neu'}`}>
                  {r.art === 'rueckruf' || r.zweck === 'telefon' ? (
                    <span className="a-avatar rueckruf">
                      <Icon name="telefon" />
                    </span>
                  ) : (
                    <span className="a-avatar termin">
                      {start ? (
                        <>
                          <b className="zahl">{tag}</b>
                          <small>{monat}</small>
                        </>
                      ) : (
                        <small>offen</small>
                      )}
                    </span>
                  )}
                  <span style={{ minWidth: 0 }}>
                    <span className="a-zeile-titel" style={{ display: 'block' }}>
                      {r.name || r.telefon || r.email || 'Ohne Namen'}
                    </span>
                    <span className="a-zeile-sub" style={{ display: 'block' }}>
                      {r.art === 'rueckruf' ? `Rückruf · ${r.wunschText || 'Zeit egal'}` : r.zweck === 'telefon' && r.bestaetigtStart ? `Telefontermin · ${terminKurz(r.bestaetigtStart)}` : r.bestaetigtStart ? `Bestätigt · ${terminKurz(r.bestaetigtStart)}` : r.wunschStart ? `Wunsch · ${terminKurz(r.wunschStart)}` : `Wunsch · ${r.wunschText || 'nach Absprache'}`}
                      {r.stilAnzahl > 0 ? ` · Stil ${r.stilAnzahl}` : ''}
                      {r.stoffe.length ? ` · Stoff ${r.stoffe.join(', ')}` : ''}
                    </span>
                  </span>
                  <span className="a-zeile-rechts">
                    <span className={`a-pill ${r.status}`}>{STATUS_LABEL[r.status]}</span>
                    <time dateTime={r.erstelltAm.toISOString()}>{relativ(r.erstelltAm)}</time>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
