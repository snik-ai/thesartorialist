import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, inArray, lt, sql, type SQL } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { Avatar } from '@/components/admin/Bausteine';
import { RECHNUNG_ART, RECHNUNG_STATUS, rechnungAnzeigeStatus } from '@/lib/crm/belege';
import { chf, chfKurz } from '@/lib/crm/geld';
import { faelligText, tagDatum } from '@/lib/zeit';
import type { RechnungStatus } from '@/lib/db/schema';

export const metadata: Metadata = { title: 'Rechnungen' };
export const dynamic = 'force-dynamic';

const FILTER: Record<string, { label: string; status: RechnungStatus[] | null; ueber?: boolean }> = {
  offen: { label: 'Offen', status: ['offen', 'teilbezahlt'] },
  ueberfaellig: { label: 'Überfällig', status: ['offen', 'teilbezahlt'], ueber: true },
  bezahlt: { label: 'Bezahlt', status: ['bezahlt'] },
  entwurf: { label: 'Entwürfe', status: ['entwurf'] },
  alle: { label: 'Alle', status: null },
};

export default async function RechnungenPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const sp = await searchParams;
  const f = sp.f && sp.f in FILTER ? sp.f : 'offen';
  const R = schema.rechnung;
  const K = schema.kontakt;
  const bed: SQL[] = [];
  if (FILTER[f].status) bed.push(inArray(R.status, FILTER[f].status!));
  if (FILTER[f].ueber) bed.push(lt(R.faelligAm, sql`now() - interval '1 day'`));
  const [reihen, [z]] = await Promise.all([
    db()
      .select({ r: R, name: K.name, email: K.email, brandDomain: K.brandDomain })
      .from(R)
      .innerJoin(K, eq(K.id, R.kontaktId))
      .where(bed.length ? and(...bed) : undefined)
      .orderBy(desc(R.erstelltAm))
      .limit(300),
    db().execute<{ offen: number; offen_rp: number; ueber: number; ueber_rp: number; bezahlt: number; entwurf: number; alle: number }>(sql`select
      count(*) filter (where status in ('offen', 'teilbezahlt'))::int as offen,
      coalesce(sum(betrag_rp - bezahlt_rp) filter (where status in ('offen', 'teilbezahlt')), 0)::int as offen_rp,
      count(*) filter (where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day')::int as ueber,
      coalesce(sum(betrag_rp - bezahlt_rp) filter (where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day'), 0)::int as ueber_rp,
      count(*) filter (where status = 'bezahlt')::int as bezahlt,
      count(*) filter (where status = 'entwurf')::int as entwurf,
      count(*)::int as alle from rechnung`),
  ]);
  const zahl: Record<string, number> = { offen: z.offen, ueberfaellig: z.ueber, bezahlt: z.bezahlt, entwurf: z.entwurf, alle: z.alle };

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Atelier</span>
          <h1>Rechnungen</h1>
          <p className="a-sub">
            Offen <span className="zahl">{chfKurz(z.offen_rp)}</span>
            {z.ueber > 0 && (
              <>
                {' '}
                · davon überfällig <span className="zahl">{chfKurz(z.ueber_rp)}</span>
              </>
            )}{' '}
            · Swiss QR-Rechnung, Anzahlung und Schlussrechnung aus dem Auftrag
          </p>
        </div>
      </div>

      <div className="a-chips" style={{ marginBottom: 16 }} role="navigation" aria-label="Filter">
        {Object.entries(FILTER).map(([key, x]) => (
          <Link key={key} href={key === 'offen' ? '/admin/rechnungen/' : `/admin/rechnungen/?f=${key}`} className={`a-chip${key === 'ueberfaellig' && z.ueber ? ' warn' : ''}`} aria-current={f === key ? 'page' : undefined}>
            {x.label}
            <span className="zahl">{zahl[key]}</span>
          </Link>
        ))}
      </div>

      <div className="a-karte">
        {reihen.length === 0 ? (
          <div className="a-leer">
            <Icon name="rechnung" />
            <h3>{f === 'ueberfaellig' ? 'Nichts überfällig' : 'Keine Rechnungen'}</h3>
            <p>Rechnungen entstehen aus dem Auftrag: Anzahlung bei Bestellung, Schlussrechnung bei Abholung.</p>
          </div>
        ) : (
          <div className="a-tabelle" role="table">
            <div className="a-tabelle-kopf beleg" role="row">
              <span>Nr.</span>
              <span>Kunde</span>
              <span>Status</span>
              <span className="r">Betrag</span>
              <span className="r">Fällig</span>
            </div>
            {reihen.map(({ r, name, email, brandDomain }) => {
              const st = rechnungAnzeigeStatus(r);
              return (
                <Link key={r.id} href={`/admin/rechnungen/${r.id}/`} className="a-tabelle-zeile beleg" role="row">
                  <span className="zahl a-beleg-nr">{r.nummer}</span>
                  <span className="a-tz-kunde">
                    <Avatar name={name || email || '?'} brandDomain={brandDomain} />
                    <span>
                      <b>{name || email}</b>
                      <small>
                        {RECHNUNG_ART[r.art]}
                        {r.titel ? ` · ${r.titel}` : ''}
                      </small>
                    </span>
                  </span>
                  <span data-label="Status">
                    <span className={`a-pill re-${st}`}>{RECHNUNG_STATUS[st]}</span>
                  </span>
                  <span className="r zahl" data-label="Betrag">
                    {chf(r.betragRp)}
                    {r.bezahltRp > 0 && r.status !== 'bezahlt' && <small className="a-sub" style={{ display: 'block', margin: 0 }}>offen {chf(r.betragRp - r.bezahltRp)}</small>}
                  </span>
                  <span className={`r${st === 'ueberfaellig' ? ' warn' : ''}`} data-label="Fällig">
                    <time>{r.status === 'bezahlt' ? `bezahlt ${tagDatum(r.bezahltAm)}` : r.faelligAm ? (st === 'ueberfaellig' ? faelligText(r.faelligAm) : tagDatum(r.faelligAm)) : '–'}</time>
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
