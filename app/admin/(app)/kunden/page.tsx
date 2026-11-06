import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { Avatar } from '@/components/admin/Bausteine';
import NeuKontakt from '@/components/admin/NeuKontakt';
import { chf, chfKurz } from '@/lib/crm/geld';
import { telAnzeige } from '@/lib/crm/telefon';
import { relativ, tagDatum } from '@/lib/zeit';

export const metadata: Metadata = { title: 'Kunden' };
export const dynamic = 'force-dynamic';

const FILTER = {
  alle: 'Alle Kunden',
  laufend: 'Mit laufendem Auftrag',
  offen: 'Mit offenem Betrag',
  inaktiv: 'Inaktiv',
} as const;
type Filter = keyof typeof FILTER;

type Kunde = { id: string; name: string; email: string | null; telefon: string | null; firma: string | null; brand_domain: string | null; kunde_seit: Date | null; status: string; laufend: number; auftraege: number; umsatz: number; offen: number; letzte: Date };

const likeEsc = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export default async function KundenPage({ searchParams }: { searchParams: Promise<{ q?: string; f?: string; neu?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 80);
  const f: Filter = sp.f && sp.f in FILTER ? (sp.f as Filter) : 'alle';
  const muster = `%${likeEsc(q)}%`;
  const ziffern = q.replace(/\D/g, '');
  const kunden = await db().execute<Kunde>(sql`
    select * from (
      select k.id, k.name, k.email, k.telefon, k.firma, k.brand_domain, k.kunde_seit, k.status,
        (select count(*)::int from auftrag a where a.kontakt_id = k.id and a.status not in ('abgeschlossen', 'storniert')) as laufend,
        (select count(*)::int from auftrag a where a.kontakt_id = k.id and a.status <> 'storniert') as auftraege,
        (select coalesce(sum(z.betrag_rp), 0)::int from zahlung z join rechnung r on r.id = z.rechnung_id where r.kontakt_id = k.id) as umsatz,
        (select coalesce(sum(r.betrag_rp - r.bezahlt_rp), 0)::int from rechnung r where r.kontakt_id = k.id and r.status in ('offen', 'teilbezahlt')) as offen,
        greatest(k.aktualisiert_am, coalesce((select max(a.erstellt_am) from aktivitaet a where a.kontakt_id = k.id), k.aktualisiert_am)) as letzte
      from kontakt k
      where k.zusammengefuehrt_in is null and k.status = ${f === 'inaktiv' ? 'inaktiv' : 'kunde'}
        ${q ? sql`and (k.name ilike ${muster} or k.email ilike ${muster} or k.firma ilike ${muster} ${ziffern.length >= 3 ? sql`or k.telefon_norm like ${`%${ziffern.slice(-9)}%`}` : sql``})` : sql``}
    ) x
    ${f === 'laufend' ? sql`where laufend > 0` : f === 'offen' ? sql`where offen > 0` : sql``}
    order by letzte desc limit 300`);

  const summe = kunden.reduce((a, k) => ({ umsatz: a.umsatz + k.umsatz, offen: a.offen + k.offen }), { umsatz: 0, offen: 0 });

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">CRM</span>
          <h1>Kunden</h1>
          <p className="a-sub">
            <span className="zahl">{kunden.length}</span> {f === 'inaktiv' ? 'inaktive Kunden' : 'Kunden'} · Umsatz <span className="zahl">{chfKurz(summe.umsatz)}</span>
            {summe.offen > 0 && (
              <>
                {' '}
                · offen <span className="zahl">{chfKurz(summe.offen)}</span>
              </>
            )}
          </p>
        </div>
        <NeuKontakt standard="kunde" offen={sp.neu === '1'} />
      </div>

      <div className="a-filterleiste">
        <form className="a-suche" role="search">
          <Icon name="suche" />
          <input className="a-input" type="search" name="q" defaultValue={q} placeholder="Name, E-Mail, Telefon oder Firma" aria-label="Kunden durchsuchen" />
          {f !== 'alle' && <input type="hidden" name="f" value={f} />}
        </form>
        <div className="a-chips" role="navigation" aria-label="Filter">
          {(Object.keys(FILTER) as Filter[]).map((key) => (
            <Link key={key} href={`/admin/kunden/${key === 'alle' ? '' : `?f=${key}`}`} className="a-chip" aria-current={f === key ? 'page' : undefined}>
              {FILTER[key]}
            </Link>
          ))}
        </div>
      </div>

      <div className="a-karte">
        {kunden.length === 0 ? (
          <div className="a-leer">
            <Icon name="kunde" />
            <h3>{q ? 'Nichts gefunden' : 'Noch keine Kunden'}</h3>
            <p>{q ? `Kein Kunde passt zu «${q}».` : 'Sobald ein Lead ein Angebot annimmt, erscheint er hier — oder legen Sie einen Kunden direkt an.'}</p>
          </div>
        ) : (
          <div className="a-tabelle" role="table">
            <div className="a-tabelle-kopf" role="row">
              <span>Kunde</span>
              <span>Aufträge</span>
              <span className="r">Umsatz</span>
              <span className="r">Offen</span>
              <span className="r">Zuletzt</span>
            </div>
            {kunden.map((k) => (
              <Link key={k.id} href={`/admin/kontakte/${k.id}/`} className="a-tabelle-zeile" role="row">
                <span className="a-tz-kunde">
                  <Avatar name={k.name || k.email || '?'} brandDomain={k.brand_domain} />
                  <span>
                    <b>
                      {k.name || k.email || 'Ohne Namen'}
                      {k.firma && <em> · {k.firma}</em>}
                    </b>
                    <small>
                      {[k.telefon ? telAnzeige(k.telefon) : null, k.email].filter(Boolean).join(' · ') || '–'}
                      {k.kunde_seit ? ` · Kunde seit ${tagDatum(new Date(k.kunde_seit))}` : ''}
                    </small>
                  </span>
                </span>
                <span className="zahl" data-label="Aufträge">
                  {k.laufend > 0 ? <span className="a-pill produktion ohne">{k.laufend} laufend</span> : k.auftraege ? `${k.auftraege} abgeschlossen` : '–'}
                </span>
                <span className="r zahl" data-label="Umsatz">
                  {k.umsatz ? chf(k.umsatz) : '–'}
                </span>
                <span className={`r zahl${k.offen ? ' warn' : ''}`} data-label="Offen">
                  {k.offen ? chf(k.offen) : '–'}
                </span>
                <span className="r" data-label="Zuletzt">
                  <time>{relativ(new Date(k.letzte))}</time>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
