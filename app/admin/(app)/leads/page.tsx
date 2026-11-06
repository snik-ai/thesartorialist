import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { Avatar } from '@/components/admin/Bausteine';
import NeuKontakt from '@/components/admin/NeuKontakt';
import Icon from '@/components/admin/Icon';
import { LEAD_PHASEN } from '@/lib/crm/belege';
import { chfKurz } from '@/lib/crm/geld';
import { relativ, terminKurz } from '@/lib/zeit';

export const metadata: Metadata = { title: 'Leads' };
export const dynamic = 'force-dynamic';

type Lead = {
  id: string;
  name: string;
  email: string | null;
  telefon: string | null;
  firma: string | null;
  brand_domain: string | null;
  lead_phase: string;
  verloren_grund: string | null;
  potenzial_rp: number | null;
  angebot_rp: number | null;
  angebot_nummer: string | null;
  angebot_id: string | null;
  angebot_angesehen: boolean | null;
  termin_start: Date | null;
  termin_status: string | null;
  stil: number;
  letzte: Date;
};

export default async function LeadsPage() {
  const leads = await db().execute<Lead>(sql`
    select k.id, k.name, k.email, k.telefon, k.firma, k.brand_domain, k.lead_phase, k.verloren_grund, k.potenzial_rp,
      an.total_rp as angebot_rp, an.nummer as angebot_nummer, an.id as angebot_id, (an.angesehen_am is not null) as angebot_angesehen,
      tn.start as termin_start, tn.status as termin_status,
      coalesce((select max(jsonb_array_length(t.stil)) from termin t where t.kontakt_id = k.id), 0)::int as stil,
      greatest(k.aktualisiert_am, coalesce((select max(a.erstellt_am) from aktivitaet a where a.kontakt_id = k.id), k.aktualisiert_am)) as letzte
    from kontakt k
    left join lateral (select id, nummer, total_rp, angesehen_am from angebot a where a.kontakt_id = k.id and a.status in ('entwurf', 'gesendet') order by a.erstellt_am desc limit 1) an on true
    left join lateral (select coalesce(t.bestaetigt_start, t.wunsch_start) as start, t.status from termin t where t.kontakt_id = k.id and t.status in ('angefragt', 'vorgeschlagen', 'bestaetigt') order by t.erstellt_am desc limit 1) tn on true
    where k.zusammengefuehrt_in is null and k.status = 'lead'
    order by letzte desc limit 400`);

  const spalten = LEAD_PHASEN.filter((p) => p.key !== 'gewonnen');
  const wert = (l: Lead) => l.potenzial_rp ?? l.angebot_rp ?? 0;
  const offen = leads.filter((l) => l.lead_phase !== 'verloren');

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Vertrieb</span>
          <h1>Leads</h1>
          <p className="a-sub">
            <span className="zahl">{offen.length}</span> offene Leads · Potenzial <span className="zahl">{chfKurz(offen.reduce((a, l) => a + wert(l), 0))}</span> · wer ein Angebot annimmt, wird automatisch Kunde.
          </p>
        </div>
        <NeuKontakt standard="lead" />
      </div>

      <div className="a-board">
        {spalten.map((p) => {
          const karten = leads.filter((l) => l.lead_phase === p.key);
          return (
            <section key={p.key} id={p.key} className={`a-spalte ${p.key}`}>
              <header>
                <div>
                  <b>{p.label}</b>
                  <small>{p.text}</small>
                </div>
                <span className="zahl">
                  {karten.length}
                  {karten.some((l) => wert(l)) && <em>{chfKurz(karten.reduce((a, l) => a + wert(l), 0))}</em>}
                </span>
              </header>
              <div className="a-spalte-karten">
                {karten.length === 0 && <p className="a-spalte-leer">Keine Leads</p>}
                {karten.slice(0, 60).map((l) => (
                  <Link key={l.id} href={`/admin/kontakte/${l.id}/`} className="a-bkarte">
                    <div className="a-bkarte-kopf">
                      <Avatar name={l.name || l.email || '?'} brandDomain={l.brand_domain} />
                      <span>
                        <b>{l.name || l.email || l.telefon || 'Ohne Namen'}</b>
                        <small>{l.firma || l.email || l.telefon || ''}</small>
                      </span>
                    </div>
                    <div className="a-bkarte-info">
                      {l.termin_start && (
                        <span>
                          <Icon name="kalender" /> {terminKurz(new Date(l.termin_start))}
                          {l.termin_status === 'bestaetigt' ? ' ✓' : ''}
                        </span>
                      )}
                      {l.angebot_nummer && (
                        <span>
                          <Icon name="dokument" /> {l.angebot_nummer}
                          {l.angebot_angesehen ? ' · angesehen' : ''}
                        </span>
                      )}
                      {l.stil > 0 && (
                        <span>
                          <Icon name="mass" /> Stil-Auswahl {l.stil}
                        </span>
                      )}
                      {l.verloren_grund && <span className="grund">{l.verloren_grund}</span>}
                    </div>
                    <div className="a-bkarte-fuss">
                      <time>{relativ(new Date(l.letzte))}</time>
                      {wert(l) > 0 && <b className="zahl">{chfKurz(wert(l))}</b>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
