import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { Avatar } from '@/components/admin/Bausteine';
import KontaktWahl from '@/components/admin/KontaktWahl';
import { FELD, massText } from '@/lib/crm/massblatt';
import { tagDatum } from '@/lib/zeit';

export const metadata: Metadata = { title: 'Massblätter' };
export const dynamic = 'force-dynamic';

type Zeile = { id: string; kontakt_id: string; name: string; brand_domain: string | null; version: number; gemessen_am: Date; masse: Record<string, number | string>; koerper: string[]; versionen: number; auftrag: string | null };

export default async function MassblaetterPage() {
  const [liste, kontakte] = await Promise.all([
    db().execute<Zeile>(sql`
      select m.id, m.kontakt_id, k.name, k.brand_domain, m.version, m.gemessen_am, m.masse, m.koerper,
        (select count(*)::int from massblatt x where x.kontakt_id = m.kontakt_id) as versionen,
        (select a.nummer from auftrag a where a.id = m.auftrag_id) as auftrag
      from massblatt m join kontakt k on k.id = m.kontakt_id
      where m.aktiv and k.zusammengefuehrt_in is null order by m.gemessen_am desc limit 500`),
    db().execute<{ id: string; name: string; email: string | null; status: string }>(sql`
      select id, name, email, status from kontakt where zusammengefuehrt_in is null and name <> '' order by (status = 'kunde') desc, aktualisiert_am desc limit 500`),
  ]);
  const KURZ = ['sakko.brust', 'sakko.taille', 'hose.bund', 'hemd.hals'];

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Atelier</span>
          <h1>Massblätter</h1>
          <p className="a-sub">
            <span className="zahl">{liste.length}</span> Kunden mit Massblatt · jede Messung ist eine Version mit Vergleich zur vorherigen
          </p>
        </div>
        <div style={{ minWidth: 280 }}>
          <KontaktWahl optionen={kontakte.map((k) => ({ wert: k.id, label: k.name, sub: [k.status === 'kunde' ? 'Kunde' : k.status === 'lead' ? 'Lead' : 'Inaktiv', k.email].filter(Boolean).join(' · ') }))} ziel="/admin/massblaetter/neu/?kontakt=" platzhalter="Neues Massblatt für …" />
        </div>
      </div>

      <div className="a-karte">
        {liste.length === 0 ? (
          <div className="a-leer">
            <Icon name="mass" />
            <h3>Noch keine Massblätter</h3>
            <p>Wählen Sie oben einen Kunden — die Eingabe ist für das Tablet im Atelier gemacht.</p>
          </div>
        ) : (
          <div className="a-tabelle" role="table">
            <div className="a-tabelle-kopf mass" role="row">
              <span>Kunde</span>
              <span>Kernmasse</span>
              <span>Version</span>
              <span className="r">Gemessen</span>
            </div>
            {liste.map((m) => (
              <Link key={m.id} href={`/admin/massblaetter/${m.id}/`} className="a-tabelle-zeile mass" role="row">
                <span className="a-tz-kunde">
                  <Avatar name={m.name || '?'} brandDomain={m.brand_domain} />
                  <span>
                    <b>{m.name}</b>
                    <small>{m.koerper.length ? m.koerper.slice(0, 3).join(' · ') : `${Object.keys(m.masse).length} Masse`}</small>
                  </span>
                </span>
                <span className="a-kern zahl" data-label="Kernmasse">
                  {KURZ.filter((f) => m.masse[f] !== undefined).map((f) => (
                    <span key={f}>
                      <small>{FELD[f].label.replace('umfang', '').replace('weite', '')}</small> {massText(m.masse[f])}
                    </span>
                  ))}
                </span>
                <span data-label="Version" className="zahl">
                  V{m.version}
                  {m.versionen > 1 ? ` · ${m.versionen} Messungen` : ''}
                  {m.auftrag ? ` · ${m.auftrag}` : ''}
                </span>
                <span className="r" data-label="Gemessen">
                  <time>{tagDatum(new Date(m.gemessen_am))}</time>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
