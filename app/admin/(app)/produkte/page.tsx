// Produktkatalog (wie VoxCRM /produkte): Suche, Kategorie-Chips, aktiv/inaktiv, Trefferzahl; Kacheln mit Bild, Preis und Varianten.
import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { chf, chfKurz } from '@/lib/crm/geld';
import { KATEGORIEN, KATEGORIE_LABEL, istKategorie, preisSpanne } from '@/components/produkte/typen';
import { produktListe, produktZaehler } from '@/components/produkte/server';
import './produkte.css';

export const metadata: Metadata = { title: 'Produkte' };
export const dynamic = 'force-dynamic';

type SP = { q?: string; k?: string; s?: string };

export default async function ProduktePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 80);
  const k = istKategorie(sp.k) ? sp.k : null;
  const s = sp.s === 'inaktiv' ? 'inaktiv' : sp.s === 'alle' ? 'alle' : 'aktiv';
  const [liste, zaehler] = await Promise.all([produktListe({ q, kategorie: k, aktiv: s === 'alle' ? null : s === 'aktiv' }), produktZaehler()]);
  const imStatus = zaehler.filter((z) => s === 'alle' || z.aktiv === (s === 'aktiv'));
  const proKat = (key: string) => imStatus.filter((z) => z.kategorie === key).reduce((a, z) => a + z.n, 0);
  const total = zaehler.reduce((a, z) => a + z.n, 0);
  const inaktiv = zaehler.filter((z) => !z.aktiv).reduce((a, z) => a + z.n, 0);
  const url = (o: Partial<SP>) => {
    const p = new URLSearchParams();
    const w = { q, k: k ?? undefined, s: s === 'aktiv' ? undefined : s, ...o };
    for (const [key, v] of Object.entries(w)) if (v) p.set(key, v);
    const t = p.toString();
    return `/admin/produkte/${t ? `?${t}` : ''}`;
  };
  const aktiveFilter = [q && { label: `«${q}»`, weg: url({ q: '' }) }, k && { label: KATEGORIE_LABEL[k], weg: url({ k: '' }) }, s !== 'aktiv' && { label: s === 'alle' ? 'Aktiv und inaktiv' : 'Nur inaktive', weg: url({ s: '' }) }].filter(Boolean) as { label: string; weg: string }[];

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Atelier</span>
          <h1>Produkte</h1>
          <p className="a-sub">
            <span className="zahl">{total}</span> Produkte im Katalog{inaktiv ? <> · <span className="zahl">{inaktiv}</span> inaktiv</> : null} — erscheinen in der Positionssuche von Angebot und Rechnung
          </p>
        </div>
        <Link href="/admin/produkte/neu/" className="a-knopf gold">
          <Icon name="plus" /> Neues Produkt
        </Link>
      </div>

      <div className="pd-filter">
        <form className="a-suche pd-suche" role="search">
          <Icon name="suche" />
          <input className="a-input" type="search" name="q" defaultValue={q} placeholder="Name, Beschreibung oder Variante" aria-label="Produkte durchsuchen" />
          {k && <input type="hidden" name="k" value={k} />}
          {s !== 'aktiv' && <input type="hidden" name="s" value={s} />}
        </form>
        <div className="a-chips pd-status" role="navigation" aria-label="Status">
          {(['aktiv', 'inaktiv', 'alle'] as const).map((x) => (
            <Link key={x} href={url({ s: x === 'aktiv' ? '' : x })} className="a-chip" aria-current={s === x ? 'page' : undefined}>
              {x === 'aktiv' ? 'Aktiv' : x === 'inaktiv' ? 'Inaktiv' : 'Alle'}
            </Link>
          ))}
        </div>
      </div>
      <div className="a-chips pd-kats" role="navigation" aria-label="Kategorie">
        <Link href={url({ k: '' })} className="a-chip" aria-current={!k ? 'page' : undefined}>
          Alle Kategorien <span className="zahl">{imStatus.reduce((a, z) => a + z.n, 0)}</span>
        </Link>
        {KATEGORIEN.filter((x) => proKat(x.key) > 0 || x.key === k).map((x) => (
          <Link key={x.key} href={url({ k: x.key })} className="a-chip" aria-current={k === x.key ? 'page' : undefined}>
            {x.mehrzahl} <span className="zahl">{proKat(x.key)}</span>
          </Link>
        ))}
      </div>

      <div className="pd-treffer">
        <span>
          <b className="zahl">{liste.length}</b> Treffer
        </span>
        {aktiveFilter.map((f) => (
          <Link key={f.label} href={f.weg} className="pd-af">
            {f.label} <Icon name="x" />
          </Link>
        ))}
        {aktiveFilter.length > 1 && (
          <Link href="/admin/produkte/" className="pd-reset">
            Alle zurücksetzen
          </Link>
        )}
      </div>

      {liste.length === 0 ? (
        <div className="a-karte">
          <div className="a-leer">
            <Icon name="schere" />
            <h3>{q || k ? 'Nichts gefunden' : 'Noch keine Produkte'}</h3>
            <p>{q || k ? 'Kein Produkt passt zu diesen Filtern.' : 'Legen Sie Massanzug, Hemd, Änderungen usw. mit Preis an — sie erscheinen danach in der Positionssuche.'}</p>
          </div>
        </div>
      ) : (
        <div className="pd-raster">
          {liste.map((p) => {
            const sp = preisSpanne(p);
            const varianten = p.varianten.filter((v) => v.aktiv);
            return (
              <Link key={p.id} href={`/admin/produkte/${p.id}/`} className={`pd-kachel${p.aktiv ? '' : ' aus'}`}>
                <span className="pd-kachel-bild">
                  {p.bild ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.bild} alt="" loading="lazy" />
                  ) : (
                    <i>{p.name.slice(0, 1)}</i>
                  )}
                  {!p.aktiv && <em>Inaktiv</em>}
                </span>
                <span className="pd-kachel-text">
                  <small>{KATEGORIE_LABEL[p.kategorie]}</small>
                  <b>{p.name}</b>
                  {p.beschreibung && <span className="pd-kachel-besch">{p.beschreibung}</span>}
                  <span className="pd-kachel-fuss">
                    <span className="zahl pd-preis">{sp.von === 0 && sp.bis === 0 ? 'Preis offen' : sp.von === sp.bis ? chf(sp.von) : `${chfKurz(sp.von)} – ${chf(sp.bis, false)}`}</span>
                    <span className="pd-meta">
                      {varianten.length ? `${varianten.length} ${varianten.length === 1 ? 'Variante' : 'Varianten'}` : p.einheit}
                      {p.mwstSatz !== 8.1 ? ` · MWST ${p.mwstSatz} %` : ''}
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
