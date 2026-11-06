import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { Avatar } from '@/components/admin/Bausteine';
import { ANGEBOT_STATUS, angebotAnzeigeStatus } from '@/lib/crm/belege';
import { chf, chfKurz } from '@/lib/crm/geld';
import { tagDatum } from '@/lib/zeit';
import type { AngebotStatus } from '@/lib/db/schema';

export const metadata: Metadata = { title: 'Angebote' };
export const dynamic = 'force-dynamic';

const FILTER: Record<string, { label: string; status: AngebotStatus[] | null }> = {
  offen: { label: 'Offen', status: ['entwurf', 'gesendet'] },
  angenommen: { label: 'Angenommen', status: ['angenommen'] },
  abgelehnt: { label: 'Abgelehnt & storniert', status: ['abgelehnt', 'storniert'] },
  alle: { label: 'Alle', status: null },
};

export default async function AngebotePage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const sp = await searchParams;
  const f = sp.f && sp.f in FILTER ? sp.f : 'offen';
  const A = schema.angebot;
  const K = schema.kontakt;
  const bed: SQL[] = [];
  if (FILTER[f].status) bed.push(inArray(A.status, FILTER[f].status!));
  const [reihen, zaehler] = await Promise.all([
    db()
      .select({ a: A, name: K.name, firma: K.firma, brandDomain: K.brandDomain, email: K.email })
      .from(A)
      .innerJoin(K, eq(K.id, A.kontaktId))
      .where(bed.length ? and(...bed) : undefined)
      .orderBy(desc(A.erstelltAm))
      .limit(300),
    db().select({ status: A.status, n: sql<number>`count(*)::int`, rp: sql<number>`coalesce(sum(${A.totalRp}), 0)::int` }).from(A).groupBy(A.status),
  ]);
  const z = (st: AngebotStatus[] | null) => zaehler.filter((x) => !st || st.includes(x.status)).reduce((a, x) => ({ n: a.n + x.n, rp: a.rp + x.rp }), { n: 0, rp: 0 });
  const gesendet = zaehler.find((x) => x.status === 'gesendet');
  const angenommen = zaehler.find((x) => x.status === 'angenommen');
  const quote = (angenommen?.n ?? 0) + (zaehler.find((x) => x.status === 'abgelehnt')?.n ?? 0);

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Atelier</span>
          <h1>Angebote</h1>
          <p className="a-sub">
            <span className="zahl">{chfKurz(gesendet?.rp ?? 0)}</span> beim Kunden offen · Annahmequote{' '}
            <span className="zahl">{quote ? `${Math.round(((angenommen?.n ?? 0) / quote) * 100)} %` : '–'}</span> · Angebote entstehen aus der Kundenakte.
          </p>
        </div>
        <Link href="/admin/leads/" className="a-knopf linie">
          <Icon name="leads" /> Zu den Leads
        </Link>
      </div>

      <div className="a-chips" style={{ marginBottom: 16 }} role="navigation" aria-label="Filter">
        {Object.entries(FILTER).map(([key, x]) => (
          <Link key={key} href={key === 'offen' ? '/admin/angebote/' : `/admin/angebote/?f=${key}`} className="a-chip" aria-current={f === key ? 'page' : undefined}>
            {x.label}
            <span className="zahl">{z(x.status).n}</span>
          </Link>
        ))}
      </div>

      <div className="a-karte">
        {reihen.length === 0 ? (
          <div className="a-leer">
            <Icon name="dokument" />
            <h3>Keine Angebote</h3>
            <p>Öffnen Sie einen Lead oder Kunden und wählen Sie «Angebot» — die Stil-Auswahl aus dem Konfigurator lässt sich übernehmen.</p>
          </div>
        ) : (
          <div className="a-tabelle" role="table">
            <div className="a-tabelle-kopf beleg" role="row">
              <span>Nr.</span>
              <span>Kunde · Titel</span>
              <span>Status</span>
              <span className="r">Total</span>
              <span className="r">Datum</span>
            </div>
            {reihen.map(({ a, name, firma, brandDomain, email }) => {
              const st = angebotAnzeigeStatus(a);
              return (
                <Link key={a.id} href={`/admin/angebote/${a.id}/`} className="a-tabelle-zeile beleg" role="row">
                  <span className="zahl a-beleg-nr">{a.nummer}</span>
                  <span className="a-tz-kunde">
                    <Avatar name={name || email || '?'} brandDomain={brandDomain} />
                    <span>
                      <b>
                        {name || email}
                        {firma && <em> · {firma}</em>}
                      </b>
                      <small>
                        {a.titel || 'Angebot'}
                        {a.angesehenAm && a.status === 'gesendet' ? ' · angesehen' : ''}
                      </small>
                    </span>
                  </span>
                  <span data-label="Status">
                    <span className={`a-pill an-${st}`}>{ANGEBOT_STATUS[st]}</span>
                  </span>
                  <span className="r zahl" data-label="Total">
                    {chf(a.totalRp)}
                  </span>
                  <span className="r" data-label="Datum">
                    <time>{tagDatum(a.gesendetAm ?? a.erstelltAm)}</time>
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
