import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { Avatar } from '@/components/admin/Bausteine';
import Icon from '@/components/admin/Icon';
import { LEAD_PHASEN } from '@/lib/crm/belege';
import { telAnzeige, telLink, waLink } from '@/lib/crm/telefon';
import { TZ, relativ } from '@/lib/zeit';

// PDF-Downloads: jeder Abruf des Ratgebers «Der passende Anzug» (Lead-Magnet, Name + Telefon)
// mit Kontakt, Zeitpunkt, Seite, Einwilligung WhatsApp/SMS und Stand des Leads.
export const metadata: Metadata = { title: 'PDF-Downloads' };
export const dynamic = 'force-dynamic';

type Download = {
  id: string;
  erstellt_am: Date;
  pfad: string | null;
  konzept: string | null;
  neuer_kontakt: boolean | null;
  kontakt_id: string;
  name: string;
  telefon: string | null;
  email: string | null;
  brand_domain: string | null;
  status: string;
  lead_phase: string;
  einwilligung: boolean;
  anzahl: number;
};

const ZEITRAUM = [
  { key: 'alle', label: 'Alle', tage: null },
  { key: '7', label: '7 Tage', tage: 7 },
  { key: '30', label: '30 Tage', tage: 30 },
  { key: '90', label: '90 Tage', tage: 90 },
] as const;

const zeitpunkt = (d: Date) =>
  new Date(d).toLocaleString('de-CH', { timeZone: TZ, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default async function RatgeberPage({ searchParams }: { searchParams: Promise<{ z?: string }> }) {
  const z = (await searchParams).z;
  const zr = ZEITRAUM.find((x) => x.key === z) ?? ZEITRAUM[0];
  const seit = zr.tage ? sql`and a.erstellt_am > now() - (${zr.tage} || ' days')::interval` : sql``;

  const [reihen, [k]] = await Promise.all([
    db().execute<Download>(sql`
      select a.id, a.erstellt_am, a.daten->>'pfad' as pfad, a.daten->>'konzept' as konzept,
        (a.daten->>'neuerKontakt')::boolean as neuer_kontakt,
        k.id as kontakt_id, k.name, k.telefon, k.email, k.brand_domain, k.status, k.lead_phase,
        (k.einwilligung_whatsapp is not null) as einwilligung,
        (select count(*)::int from aktivitaet b where b.kontakt_id = k.id and b.daten->>'art' = 'ratgeber') as anzahl
      from aktivitaet a
      join kontakt k on k.id = coalesce((select z.zusammengefuehrt_in from kontakt z where z.id = a.kontakt_id), a.kontakt_id)
      where a.daten->>'art' = 'ratgeber' ${seit}
      order by a.erstellt_am desc
      limit 500`),
    db().execute<{ gesamt: number; woche: number; monat: number; personen: number; einwilligung: number; kunden: number }>(sql`
      select count(*)::int as gesamt,
        count(*) filter (where a.erstellt_am > now() - interval '7 days')::int as woche,
        count(*) filter (where a.erstellt_am > now() - interval '30 days')::int as monat,
        count(distinct a.kontakt_id)::int as personen,
        count(distinct a.kontakt_id) filter (where k.einwilligung_whatsapp is not null)::int as einwilligung,
        count(distinct a.kontakt_id) filter (where k.status = 'kunde')::int as kunden
      from aktivitaet a join kontakt k on k.id = a.kontakt_id
      where a.daten->>'art' = 'ratgeber'`),
  ]);

  const phase = (p: string) => LEAD_PHASEN.find((x) => x.key === p)?.label ?? p;

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Vertrieb</span>
          <h1>PDF-Downloads</h1>
          <p className="a-sub">Wer den Ratgeber «Der passende Anzug» heruntergeladen hat, mit Name, Telefon und Zeitpunkt. Jeder Download ist auch als Lead angelegt.</p>
        </div>
        <Link href="/admin/leads/" className="a-knopf linie">
          <Icon name="leads" /> Zu den Leads
        </Link>
      </div>

      <div className="a-kpis">
        <div className="a-kpi akzent">
          <span className="a-kicker">Downloads gesamt</span>
          <strong>{k.gesamt}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Letzte 7 Tage</span>
          <strong>{k.woche}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Letzte 30 Tage</span>
          <strong>{k.monat}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Personen</span>
          <strong>{k.personen}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">WhatsApp/SMS erlaubt</span>
          <strong>{k.einwilligung}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Schon Kunde</span>
          <strong>{k.kunden}</strong>
        </div>
      </div>

      <div className="a-chips" style={{ marginBottom: 16 }} role="navigation" aria-label="Zeitraum">
        {ZEITRAUM.map((x) => (
          <Link key={x.key} href={x.key === 'alle' ? '/admin/ratgeber/' : `/admin/ratgeber/?z=${x.key}`} className="a-chip" aria-current={zr.key === x.key ? 'page' : undefined}>
            {x.label}
          </Link>
        ))}
      </div>

      <div className="a-karte">
        {reihen.length === 0 ? (
          <div className="a-leer">
            <h3>Noch keine Downloads</h3>
            <p>Sobald jemand auf der Website den Ratgeber mit Name und Telefon anfordert, erscheint er hier — und als Lead unter «Leads».</p>
          </div>
        ) : (
          <div className="a-liste">
            {reihen.map((r) => (
              <div key={r.id} className="a-zeile rg-zeile">
                <Avatar name={r.name || '?'} brandDomain={r.brand_domain} />
                <span className="rg-wer">
                  <Link href={`/admin/kontakte/${r.kontakt_id}/`} className="a-zeile-titel">
                    {r.name || (r.telefon ? telAnzeige(r.telefon) : 'Ohne Namen')}
                  </Link>
                  <span className="a-zeile-sub">
                    {r.telefon ? telAnzeige(r.telefon) : '–'}
                    {r.email ? ` · ${r.email}` : ''}
                  </span>
                  <span className="rg-tags">
                    <span className={`a-pill ${r.status === 'kunde' ? 'bestaetigt' : 'ratgeber'}`}>{r.status === 'kunde' ? 'Kunde' : `Lead · ${phase(r.lead_phase)}`}</span>
                    {r.einwilligung && <span className="a-pill vorgeschlagen">WhatsApp/SMS erlaubt</span>}
                    {r.anzahl > 1 && <span className="a-pill erledigt">{r.anzahl}× heruntergeladen</span>}
                    {r.neuer_kontakt === false && <span className="a-pill erledigt">bekannter Kontakt</span>}
                  </span>
                </span>
                <span className="rg-wann">
                  <time dateTime={new Date(r.erstellt_am).toISOString()}>{zeitpunkt(r.erstellt_am)}</time>
                  <small>
                    {relativ(new Date(r.erstellt_am))}
                    {r.pfad ? ` · über ${r.pfad}` : ''}
                  </small>
                </span>
                <span className="rg-aktion">
                  {r.telefon && (
                    <a href={telLink(r.telefon)} className="a-knopf linie klein" aria-label={`${r.name} anrufen`}>
                      <Icon name="telefon" /> Anrufen
                    </a>
                  )}
                  {r.telefon && r.einwilligung && (
                    <a
                      href={waLink(r.telefon, `Guten Tag ${r.name.split(' ')[0]}, danke für Ihr Interesse an unserem Ratgeber «Der passende Anzug». Dürfen wir Sie zu einer unverbindlichen Beratung im Atelier einladen? — The Sartorialist, Kuttelgasse 7, Zürich`)}
                      target="_blank"
                      rel="noopener"
                      className="a-knopf gruen klein"
                    >
                      <Icon name="whatsapp" /> WhatsApp
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
