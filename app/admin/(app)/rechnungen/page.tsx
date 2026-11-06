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
import { zuMahnen } from '@/lib/crm/mahnung';
import { firma } from '@/lib/crm/firma';
import { mailBereit } from '@/lib/mail';
import { MahnKnopf } from '@/components/admin/MahnPanel';
import { NeuBelegKnopf } from '@/components/admin/NeuBeleg';

export const metadata: Metadata = { title: 'Rechnungen' };
export const dynamic = 'force-dynamic';

const FILTER: Record<string, { label: string; status: RechnungStatus[] | null; ueber?: boolean }> = {
  offen: { label: 'Offen', status: ['offen', 'teilbezahlt'] },
  ueberfaellig: { label: 'Überfällig', status: ['offen', 'teilbezahlt'], ueber: true },
  mahnen: { label: 'Zu mahnen', status: ['offen', 'teilbezahlt'], ueber: true },
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
  const [reihen, [z], mahnListe, f0, mailOk] = await Promise.all([
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
    zuMahnen(),
    firma(),
    Promise.resolve(mailBereit()),
  ]);
  const faelligMahnen = mahnListe.filter((x) => x.faellig);
  const zahl: Record<string, number> = { offen: z.offen, ueberfaellig: z.ueber, mahnen: faelligMahnen.length, bezahlt: z.bezahlt, entwurf: z.entwurf, alle: z.alle };

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Atelier</span>
          <h1>Rechnungen</h1>
          <p className="a-sub">Swiss QR-Rechnung als A4-Blatt – aus dem Auftrag (Raten, Schlussrechnung) oder direkt für einen Verkauf im Store.</p>
        </div>
        <div className="a-knopfreihe">
          <NeuBelegKnopf art="rechnung" label="Neue Rechnung" />
        </div>
      </div>

      <div className="a-vk-kpis a-karte">
        <div>
          <small>Offen</small>
          <b className="zahl">{chfKurz(z.offen_rp)}</b>
          <span className="zahl">{z.offen} Rechnungen</span>
        </div>
        <div className={z.ueber ? 'warn' : ''}>
          <small>Überfällig</small>
          <b className="zahl">{chfKurz(z.ueber_rp)}</b>
          <span className="zahl">{z.ueber} Rechnungen</span>
        </div>
        <div className={faelligMahnen.length ? 'warn' : ''}>
          <small>Zu mahnen</small>
          <b className="zahl">{faelligMahnen.length}</b>
          <span>Vorschlag fällig</span>
        </div>
        <div>
          <small>Entwürfe</small>
          <b className="zahl">{z.entwurf}</b>
          <span>noch nicht versendet</span>
        </div>
      </div>

      <div className="a-chips" style={{ marginBottom: 16 }} role="navigation" aria-label="Filter">
        {Object.entries(FILTER).map(([key, x]) => (
          <Link key={key} href={key === 'offen' ? '/admin/rechnungen/' : `/admin/rechnungen/?f=${key}`} className={`a-chip${(key === 'ueberfaellig' && z.ueber) || (key === 'mahnen' && faelligMahnen.length && f !== 'mahnen') ? ' warn' : ''}`} aria-current={f === key ? 'page' : undefined}>
            {x.label}
            <span className="zahl">{zahl[key]}</span>
          </Link>
        ))}
      </div>

      {f === 'mahnen' ? (
        <div className="a-karte">
          {mahnListe.length === 0 ? (
            <div className="a-leer">
              <Icon name="check" />
              <h3>Nichts zu mahnen</h3>
              <p>Überfällige Rechnungen erscheinen hier mit der nächsten Mahnstufe{f0.mahnVorschlagAktiv ? ` (vorgeschlagen ab ${f0.mahnTage1} Tagen nach Fälligkeit)` : ''}.</p>
            </div>
          ) : (
            mahnListe.map(({ r, name, email, brandDomain, vorschlag, faellig }) => (
              <div key={r.id} className="zm-zeile">
                <Link href={`/admin/rechnungen/${r.id}/`} className="zm-kunde">
                  <Avatar name={name || email || '?'} brandDomain={brandDomain} />
                  <span style={{ minWidth: 0 }}>
                    <b>{name || email}</b>
                    <small className="zahl">
                      {r.nummer} · {RECHNUNG_ART[r.art]} · fällig {tagDatum(r.faelligAm)}
                    </small>
                  </span>
                </Link>
                <span className="zm-stand">
                  <span className="zahl">{chf(r.betragRp + r.mahngebuehrenRp - r.bezahltRp)} offen</span>
                  <span>
                    {r.mahnstufe > 0 && <span className="a-pill re-ueberfaellig">{['', 'Erinnerung', '1. Mahnung', '2. Mahnung'][r.mahnstufe]} verschickt</span>}{' '}
                    <span className="a-sub" style={{ margin: 0 }}>{vorschlag ? `${vorschlag.tageUeberfaellig} Tage überfällig` : faelligText(r.faelligAm!)}</span>
                  </span>
                </span>
                {vorschlag ? (
                  faellig ? (
                    <MahnKnopf rechnungId={r.id} stufe={vorschlag.stufe} label={['', 'Erinnerung', '1. Mahnung', '2. Mahnung'][vorschlag.stufe]} mail={Boolean(email) && mailOk} />
                  ) : (
                    <span className="a-sub" style={{ margin: 0 }}>{vorschlag.bezeichnung} ab {tagDatum(vorschlag.ab)}</span>
                  )
                ) : (
                  <span className="a-sub" style={{ margin: 0 }}>2. Mahnung verschickt – Betreibung prüfen</span>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
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
                    {r.mahnstufe > 0 && r.status !== 'bezahlt' && <span className="a-pill re-ueberfaellig" style={{ marginLeft: 4 }}>{['', 'Erinnerung', '1. Mahnung', '2. Mahnung'][r.mahnstufe]}</span>}
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
      )}
    </>
  );
}
