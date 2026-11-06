'use client';

// Produktliste nach dem Versaloro-Muster: Hauptkategorien als Pills, darunter
// Unterkategorien als Bild-Kacheln und Modelle als feine Pills (drei Ebenen).
// Klebende Filterleiste mit aufklappenden Panels (Marke, Grösse nach System,
// Farbe, Preis mit Histogramm), «Alle Filter» als Seitenpanel bzw. Vollbild auf
// dem Handy, aktive Filter als Chips, Trefferzahl live, Ansicht gross/kompakt.
// Gefiltert wird im Browser (kleines Sortiment); der Zustand steht in der URL,
// Filter-Links sind teilbar. Texte kommen in der Seitensprache als Prop «t»;
// Filterwerte und URL-Parameter bleiben deutsch, angezeigt wird über t.werte.
import { useEffect, useMemo, useRef, useState } from 'react';
import ShopCard, { type CardData } from './ShopCard';
import PriceRange from './PriceRange';
import { chf } from '@/lib/shop/format';
import { SWATCH, sizeSort } from '@/lib/shop/taxonomy';
import { fmt, mz } from '@/lib/i18n/fmt';
import type { Sprache } from '@/lib/i18n/sprachen';
import type { Woerterbuch } from '@/lib/i18n/de';

/** Alle Texte, die die Produktliste im Browser braucht (nur die Seitensprache). */
export type ShopGridTexte = Pick<Woerterbuch['shop'], 'grid' | 'karte' | 'preis' | 'werte' | 'groessenSysteme'>;

type Facet = 'group' | 'sub' | 'type' | 'brand' | 'size' | 'color';
type State = Record<Facet, string[]> & { gender: string; price: [number, number] | null; sort: string };
type Panel = 'brand' | 'size' | 'color' | 'price' | 'sort';

const FACETS: Facet[] = ['group', 'sub', 'type', 'brand', 'size', 'color'];
const SORT_KEYS = ['neu', 'preis-auf', 'preis-ab', 'marke'] as const;
const EMPTY: Omit<State, 'sort'> = { group: [], sub: [], type: [], brand: [], size: [], color: [], gender: '', price: null };
const PARAM: Record<Facet, string> = { group: 'kategorie', sub: 'art', type: 'modell', brand: 'marke', size: 'groesse', color: 'farbe' };

function valuesOf(p: CardData, f: Facet): string[] {
  switch (f) {
    case 'group': return [p.group];
    case 'sub': return [p.category];
    case 'type': return p.type ? [p.type] : [];
    case 'brand': return [p.brand];
    case 'size': return p.sizeKeys;
    case 'color': return p.color ? [p.color] : [];
  }
}

// Die Kategorie-Ebenen hängen voneinander ab: Wer «Kategorie» zählt, ignoriert Art und Modell darunter
const BELOW: Partial<Record<Facet, Facet[]>> = { group: ['sub', 'type'], sub: ['type'] };

function matches(p: CardData, s: State, skip?: Facet | 'price' | 'gender') {
  const skipped = skip ? [skip, ...(BELOW[skip as Facet] ?? [])] : [];
  for (const f of FACETS) {
    if (skipped.includes(f) || !s[f].length) continue;
    if (!valuesOf(p, f).some((v) => s[f].includes(v))) return false;
  }
  if (skip !== 'gender' && s.gender && p.gender !== s.gender) return false;
  if (skip !== 'price' && s.price && (p.price < s.price[0] || p.price > s.price[1])) return false;
  return true;
}

function readUrl(): Partial<State> {
  const sp = new URLSearchParams(window.location.search);
  const out: Partial<State> = {};
  for (const f of FACETS) if (sp.getAll(PARAM[f]).length) out[f] = sp.getAll(PARAM[f]);
  if (sp.get('fuer')) out.gender = sp.get('fuer')!;
  const pr = sp.get('preis')?.split('-').map(Number);
  if (pr?.length === 2 && pr.every(Number.isFinite)) out.price = [pr[0], pr[1]];
  if (sp.get('sort')) out.sort = sp.get('sort')!;
  return out;
}
function writeUrl(s: State) {
  const sp = new URLSearchParams();
  for (const f of FACETS) s[f].forEach((v) => sp.append(PARAM[f], v));
  if (s.gender) sp.set('fuer', s.gender);
  if (s.price) sp.set('preis', `${s.price[0]}-${s.price[1]}`);
  if (s.sort !== 'neu') sp.set('sort', s.sort);
  const qs = sp.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  // Next-State behalten, damit Zurück-Navigation im App Router funktioniert
  window.history.replaceState(window.history.state, '', url);
}

const sizeLabel = (k: string) => {
  const [sys, v] = k.split('-');
  return sys === 'w' ? `W${v}` : v;
};
const tileSrc = (p: CardData) => {
  if (p.cutout) return p.cutout;
  const u = new URL(p.image);
  u.searchParams.set('width', '240');
  return u.toString();
};

/* ---------- Icons ---------- */
const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);
const Check = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.5l2.6 2.5L11 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
const Close = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2.5 2.5l7 7m0-7l-7 7" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2 4h12M4 8h8M6 12h4" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export default function ShopGrid({
  items,
  lang,
  t: texte,
  hide = [],
}: {
  items: CardData[];
  lang: Sprache;
  t: ShopGridTexte;
  hide?: ('brand' | 'gender')[];
}) {
  const t = texte.grid;
  const LABEL = t.facetten;
  const SORTS = SORT_KEYS.map((key) => ({ key, label: t.sort[key] }));
  /** Anzeigename eines Filterwerts (Kategorie, Farbe, Für) */
  const w = (k: string) => texte.werte[k] ?? k;
  const [s, setS] = useState<State>({ ...EMPTY, sort: 'neu' });
  const [panel, setPanel] = useState<Panel | null>(null);
  const [sheet, setSheet] = useState(false);
  const [acc, setAcc] = useState<string[]>(['group', 'size']);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'kompakt' | 'gross'>('kompakt');
  const [pulse, setPulse] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const ready = useRef(false);

  useEffect(() => {
    setS((cur) => ({ ...cur, ...readUrl() }));
    try {
      const v = localStorage.getItem('ts-ansicht');
      if (v === 'gross' || v === 'kompakt') setView(v);
    } catch {}
    ready.current = true;
  }, []);
  useEffect(() => {
    if (ready.current) writeUrl(s);
  }, [s]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanel(null);
        setSheet(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  useEffect(() => {
    document.body.classList.toggle('sheet-open', sheet);
    return () => document.body.classList.remove('sheet-open');
  }, [sheet]);
  useEffect(() => setQ(''), [panel, sheet]);

  const set = (patch: Partial<State>) => {
    setS((cur) => ({ ...cur, ...patch }));
    setPulse((n) => n + 1);
  };
  // Wechselt die Kategorie, gelten Art und Modell nicht mehr
  const toggle = (f: Facet, v: string) =>
    set({
      [f]: s[f].includes(v) ? s[f].filter((x) => x !== v) : [...s[f], v],
      ...(f === 'group' ? { sub: [], type: [] } : f === 'sub' ? { type: [] } : {}),
    });
  const pickGroup = (v: string | null) => set({ group: v && !s.group.includes(v) ? [v] : [], sub: [], type: [] });
  const pickSub = (v: string | null) => set({ sub: v && !s.sub.includes(v) ? [v] : [], type: [] });
  const clearAll = () => set({ ...EMPTY });

  const list = useMemo(() => {
    const r = items.filter((p) => matches(p, s));
    if (s.sort === 'preis-auf') r.sort((a, b) => a.price - b.price);
    if (s.sort === 'preis-ab') r.sort((a, b) => b.price - a.price);
    if (s.sort === 'marke') r.sort((a, b) => a.brand.localeCompare(b.brand, 'de') || a.price - b.price);
    return r;
  }, [items, s]);

  /** Optionen einer Facette mit Trefferzahl unter allen anderen aktiven Filtern. */
  const opts = (f: Facet, base = items) => {
    const m = new Map<string, number>();
    for (const p of base) for (const v of valuesOf(p, f)) m.set(v, (m.get(v) ?? 0) + (matches(p, s, f) ? 1 : 0));
    const arr = [...m].map(([k, n]) => ({ k, n }));
    if (f === 'size') return arr.sort((a, b) => sizeSort(a.k, b.k));
    if (f === 'group' || f === 'sub') return arr.sort((a, b) => [...m.keys()].indexOf(a.k) - [...m.keys()].indexOf(b.k));
    // Alphabetisch nach dem angezeigten Namen (Deutsch: unverändert)
    return arr.sort((a, b) => (lang === 'de' ? a.k.localeCompare(b.k, 'de') : w(a.k).localeCompare(w(b.k), lang)));
  };

  // Drei Ebenen: Kategorie-Pills → Unterkategorie-Kacheln → Modell-Pills
  const groups = opts('group');
  const inGroup = items.filter((p) => (groups.length > 1 ? s.group.length === 1 && p.group === s.group[0] : true));
  const showSubs = groups.length <= 1 || s.group.length === 1;
  const subs = showSubs ? opts('sub', inGroup) : [];
  const inSub = inGroup.filter((p) => (subs.length > 1 ? s.sub.length === 1 && p.category === s.sub[0] : true));
  const showTypes = showSubs && (subs.length <= 1 || s.sub.length === 1);
  const types = showTypes ? opts('type', inSub) : [];
  const groupName = s.group.length === 1 ? s.group[0] : '';
  const subName = s.sub.length === 1 ? s.sub[0] : subs.length === 1 ? subs[0].k : '';
  const subImg = (k: string) => {
    const cand = inGroup.filter((p) => p.category === k);
    return tileSrc(cand.find((p) => p.cutout) ?? cand[0]);
  };

  const genders = [...new Set(items.map((p) => p.gender))];
  const prices = items.filter((p) => matches(p, s, 'price')).map((p) => p.price);
  const bounds: [number, number] = [Math.min(...items.map((p) => p.price)), Math.max(...items.map((p) => p.price))];

  const activeIn = (f: Facet | 'price' | 'gender') => (f === 'price' ? (s.price ? 1 : 0) : f === 'gender' ? (s.gender ? 1 : 0) : s[f].length);
  const visible = (f: Facet | 'price') =>
    activeIn(f) > 0 || (f === 'price' ? bounds[1] - bounds[0] > 50 : f === 'brand' && hide.includes('brand') ? false : opts(f).length > 1);
  const BAR: ('brand' | 'size' | 'color' | 'price')[] = (['brand', 'size', 'color', 'price'] as const).filter(visible);
  const SHEET: (Facet | 'price')[] = (['group', 'sub', 'type', 'brand', 'size', 'color', 'price'] as const).filter((f) =>
    f === 'sub' ? subs.length > 1 : f === 'type' ? types.length > 1 : visible(f),
  );
  const activeTotal = (['group', 'sub', 'type', 'brand', 'size', 'color', 'price', 'gender'] as const).reduce((a, f) => a + activeIn(f), 0);
  const count = (n: number) => mz(n, t.anzahlEins, t.anzahlMehr);

  const chips = [
    ...FACETS.flatMap((f) =>
      s[f].map((k) => ({ id: f + k, label: f === 'size' ? sizeLabel(k) : w(k), swatch: f === 'color' ? SWATCH[k] : undefined, clear: () => toggle(f, k) })),
    ),
    ...(s.gender ? [{ id: 'g', label: w(s.gender), swatch: undefined, clear: () => set({ gender: '' }) }] : []),
    ...(s.price ? [{ id: 'p', label: `${chf(s.price[0])} – ${chf(s.price[1])}`, swatch: undefined, clear: () => set({ price: null }) }] : []),
  ];
  const summary = (f: Facet | 'price') =>
    f === 'price' ? (s.price ? `${chf(s.price[0])} – ${chf(s.price[1])}` : '') : s[f].map((k) => (f === 'size' ? sizeLabel(k) : w(k))).join(', ');

  /* ---------- Inhalte der Facetten (Panel und Seitenpanel nutzen dieselben) ---------- */
  const Row = ({ f, o }: { f: Facet; o: { k: string; n: number } }) => {
    const on = s[f].includes(o.k);
    return (
      <button type="button" className={`frow${on ? ' is-on' : ''}`} aria-pressed={on} disabled={o.n === 0 && !on} onClick={() => toggle(f, o.k)}>
        <span className="frow-box">{on && <Check />}</span>
        <span className="frow-label">{w(o.k)}</span>
        <span className="frow-n num">{o.n}</span>
      </button>
    );
  };

  const body = (f: Facet | 'price') => {
    if (f === 'price') return <PriceRange t={texte.preis} bounds={bounds} prices={prices} value={s.price} onChange={(price) => set({ price })} />;
    const list = f === 'sub' ? subs : f === 'type' ? types : opts(f);
    if (f === 'size') {
      const sys = new Map<string, { k: string; n: number }[]>();
      list.forEach((o) => {
        const g = o.k.split('-')[0];
        sys.set(g, [...(sys.get(g) ?? []), o]);
      });
      return (
        <div className="fsizes">
          {[...sys].filter(([g, os]) => os.some((o) => o.n > 0 || s.size.includes(o.k))).map(([g, os]) => (
            <div key={g} className="fgroup">
              <p className="fgroup-title">{texte.groessenSysteme[g]}</p>
              <div className="ftiles">
                {os.map((o) => {
                  const on = s.size.includes(o.k);
                  return (
                    <button key={o.k} type="button" className={`ftile${on ? ' is-on' : ''}`} aria-pressed={on} disabled={o.n === 0 && !on} aria-label={fmt(t.groesseAria, { groesse: sizeLabel(o.k), anzahl: count(o.n) })} onClick={() => toggle('size', o.k)}>
                      {sizeLabel(o.k)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="fhint">{t.nurAnLager}</p>
        </div>
      );
    }
    if (f === 'color') {
      return (
        <div className="fswatches">
          {list.map((o) => {
            const on = s.color.includes(o.k);
            return (
              <button key={o.k} type="button" className={`fswatch${on ? ' is-on' : ''}`} aria-pressed={on} disabled={o.n === 0 && !on} onClick={() => toggle('color', o.k)}>
                <span className="fswatch-dot" style={{ background: SWATCH[o.k] ?? '#ccc' }}>{on && <Check />}</span>
                <span className="frow-label">{w(o.k)}</span>
                <span className="frow-n num">{o.n}</span>
              </button>
            );
          })}
        </div>
      );
    }
    if (f === 'brand') {
      const term = q.trim().toLowerCase();
      const shown = list.filter((o) => !term || o.k.toLowerCase().includes(term));
      return (
        <div className="fbrands">
          {list.length > 6 && (
            <label className="fsearch">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={fmt(t.markenSuchen, { n: list.length })} aria-label={t.markenSuchenAria} />
            </label>
          )}
          <div className="frows">
            {shown.map((o) => (
              <Row key={o.k} f="brand" o={o} />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="frows">
        {list.map((o) => (
          <Row key={o.k} f={f} o={o} />
        ))}
      </div>
    );
  };

  const genderSeg = genders.length > 1 && !hide.includes('gender') && (
    <div className="fseg" role="radiogroup" aria-label={LABEL.gender}>
      {['', ...genders].map((g) => (
        <button key={g || 'alle'} type="button" role="radio" aria-checked={s.gender === g} className={s.gender === g ? 'is-on' : ''} onClick={() => set({ gender: g })}>
          {g ? w(g) : t.alle}
        </button>
      ))}
    </div>
  );

  return (
    <div className="plp" ref={top}>
      {groups.length > 1 && (
        <nav className="cats" aria-label={t.kategorienAria}>
          <button type="button" className={`cat${s.group.length === 0 ? ' is-on' : ''}`} onClick={() => pickGroup(null)}>
            {t.alle}<span className="num">{items.filter((p) => matches(p, s, 'group')).length}</span>
          </button>
          {groups.map((o) => (
            <button key={o.k} type="button" className={`cat${s.group.includes(o.k) ? ' is-on' : ''}`} aria-pressed={s.group.includes(o.k)} disabled={o.n === 0 && !s.group.includes(o.k)} onClick={() => pickGroup(o.k)}>
              {w(o.k)}
              <span className="num">{o.n}</span>
            </button>
          ))}
        </nav>
      )}

      {subs.length > 1 && (
        <nav className="subcats" key={groupName || 'alle'} aria-label={fmt(t.nachArtAria, { name: groupName ? w(groupName) : t.sortiment })}>
          <button type="button" className={`subcat subcat--all${s.sub.length === 0 ? ' is-on' : ''}`} aria-pressed={s.sub.length === 0} onClick={() => pickSub(null)}>
            <span className="subcat-img subcat-mosaic">
              {subs.slice(0, 4).map((o) => (
                <span key={o.k}>
                  <img src={subImg(o.k)} alt="" loading="lazy" />
                </span>
              ))}
            </span>
            <span className="subcat-label">{fmt(t.alleName, { name: groupName ? w(groupName) : '' })}</span>
          </button>
          {subs.map((o, i) => {
            const on = s.sub.includes(o.k);
            return (
              <button key={o.k} type="button" className={`subcat${on ? ' is-on' : ''}`} aria-pressed={on} disabled={o.n === 0 && !on} style={{ '--i': i } as React.CSSProperties} onClick={() => pickSub(o.k)}>
                <span className="subcat-img">
                  <img src={subImg(o.k)} alt="" loading="lazy" />
                </span>
                <span className="subcat-label">{w(o.k)}</span>
                <span className="subcat-n num">{o.n}</span>
              </button>
            );
          })}
        </nav>
      )}

      {types.length > 1 && (
        <nav className="types" key={subName} aria-label={fmt(t.nachModellAria, { name: w(subName) })}>
          <button type="button" className={`type${s.type.length === 0 ? ' is-on' : ''}`} aria-pressed={s.type.length === 0} onClick={() => set({ type: [] })}>
            {fmt(t.alleName, { name: w(subName) })}
          </button>
          {types.map((o) => {
            const on = s.type.includes(o.k);
            return (
              <button key={o.k} type="button" className={`type${on ? ' is-on' : ''}`} aria-pressed={on} disabled={o.n === 0 && !on} onClick={() => toggle('type', o.k)}>
                {w(o.k)}
                <span className="num">{o.n}</span>
              </button>
            );
          })}
        </nav>
      )}

      <div className="fbar" ref={bar}>
        <div className="fbar-row">
          <button type="button" className="fbtn fbtn--all" onClick={() => { setPanel(null); setSheet(true); }} aria-haspopup="dialog">
            <FilterIcon />
            <span className="fbtn-long">{t.alleFilter}</span>
            <span className="fbtn-short">{t.filter}</span>
            {activeTotal > 0 && <span className="fbtn-n num">{activeTotal}</span>}
          </button>

          <div className="fbar-facets">
            {genderSeg}
            {BAR.map((f) => {
              const isOpen = panel === f;
              const n = activeIn(f);
              return (
                <div key={f} className={`fitem${isOpen ? ' is-open' : ''}`}>
                  <button type="button" className={`fbtn${n ? ' is-active' : ''}`} aria-expanded={isOpen} onClick={() => setPanel(isOpen ? null : f)}>
                    {LABEL[f]}
                    {n > 0 && f !== 'price' && <span className="fbtn-n num">{n}</span>}
                    {f === 'price' && n > 0 && <span className="fbtn-dot" />}
                    <Chevron />
                  </button>
                  {isOpen && (
                    <div className={`fdrop fdrop--${f}`} role="dialog" aria-label={fmt(t.nachFiltern, { label: LABEL[f] })}>
                      <div className="fdrop-body">{body(f)}</div>
                      <div className="fdrop-foot">
                        <button type="button" className="linkbtn" disabled={!n} onClick={() => set(f === 'price' ? { price: null } : { [f]: [] })}>
                          {t.zuruecksetzen}
                        </button>
                        <button type="button" className="btn fdrop-go" onClick={() => setPanel(null)}>
                          {fmt(t.zeigen, { anzahl: count(list.length) })}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <span className={`fbar-count num${pulse ? ' is-pulse' : ''}`} key={pulse} aria-live="polite">
            {count(list.length)}
          </span>

          <div className="fview" role="group" aria-label={t.ansicht}>
            <button type="button" className={view === 'kompakt' ? 'is-on' : ''} aria-pressed={view === 'kompakt'} aria-label={t.kompakt} onClick={() => { setView('kompakt'); try { localStorage.setItem('ts-ansicht', 'kompakt'); } catch {} }}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            </button>
            <button type="button" className={view === 'gross' ? 'is-on' : ''} aria-pressed={view === 'gross'} aria-label={t.gross} onClick={() => { setView('gross'); try { localStorage.setItem('ts-ansicht', 'gross'); } catch {} }}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h12v12H2z" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            </button>
          </div>

          <div className={`fitem fitem--sort${panel === 'sort' ? ' is-open' : ''}`}>
            <button type="button" className="fbtn fbtn--sort" aria-expanded={panel === 'sort'} onClick={() => setPanel(panel === 'sort' ? null : 'sort')}>
              <span className="fbtn-long">{SORTS.find((o) => o.key === s.sort)?.label}</span>
              <span className="fbtn-short">{t.sortieren}</span>
              <Chevron />
            </button>
            {panel === 'sort' && (
              <div className="fdrop fdrop--sort" role="dialog" aria-label={t.sortieren}>
                <div className="fdrop-body frows">
                  {SORTS.map((o) => (
                    <button key={o.key} type="button" className={`frow frow--radio${s.sort === o.key ? ' is-on' : ''}`} aria-pressed={s.sort === o.key} onClick={() => { set({ sort: o.key }); setPanel(null); }}>
                      <span className="frow-radio" />
                      <span className="frow-label">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {chips.length > 0 && (
          <div className="fchips">
            {chips.map((c) => (
              <button key={c.id} type="button" className="chip chip--active" onClick={c.clear} aria-label={fmt(t.filterEntfernen, { label: c.label })}>
                {c.swatch && <span className="chip-dot" style={{ background: c.swatch }} />}
                {c.label}
                <Close />
              </button>
            ))}
            <button type="button" className="linkbtn" onClick={clearAll}>
              {t.alleZuruecksetzen}
            </button>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="plp-empty">
          <p className="serif">{t.leer}</p>
          <button type="button" className="btn" onClick={clearAll}>
            {t.alleFilterZuruecksetzen}
          </button>
        </div>
      ) : (
        <div className={`shop-grid shop-grid--${view}`} key={pulse}>
          {list.map((p, i) => (
            <div className="shop-cell" key={p.handle} style={{ '--i': Math.min(i, 12) } as React.CSSProperties}>
              <ShopCard p={p} lang={lang} t={texte.karte} eager={i < 4} />
            </div>
          ))}
        </div>
      )}

      {/* «Alle Filter»: Seitenpanel auf Desktop, Vollbild auf dem Handy */}
      <div className={`scrim${sheet ? ' is-open' : ''}`} onClick={() => setSheet(false)} aria-hidden="true" />
      <aside className={`fsheet${sheet ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label={t.alleFilter} aria-hidden={!sheet} inert={!sheet}>
        <div className="fsheet-head">
          <h2 className="serif">{t.sheetTitel}</h2>
          <button type="button" className="fsheet-close" onClick={() => setSheet(false)} aria-label={t.filterSchliessen}>
            <Close />
          </button>
        </div>
        <div className="fsheet-body">
          <section className="facc is-open">
            <p className="facc-title">{t.sortieren}</p>
            <div className="pills">
              {SORTS.map((o) => (
                <button key={o.key} type="button" className={`pill${s.sort === o.key ? ' is-on' : ''}`} aria-pressed={s.sort === o.key} onClick={() => set({ sort: o.key })}>
                  {o.label}
                </button>
              ))}
            </div>
          </section>
          {genders.length > 1 && !hide.includes('gender') && (
            <section className="facc is-open">
              <p className="facc-title">{LABEL.gender}</p>
              {genderSeg}
            </section>
          )}
          {SHEET.map((f) => {
            const isOpen = acc.includes(f);
            const sum = summary(f);
            return (
              <section key={f} className={`facc${isOpen ? ' is-open' : ''}`}>
                <button type="button" className="facc-head" aria-expanded={isOpen} onClick={() => setAcc(isOpen ? acc.filter((x) => x !== f) : [...acc, f])}>
                  <span className="facc-title">{LABEL[f]}</span>
                  {sum && <span className="facc-sum">{sum}</span>}
                  <Chevron />
                </button>
                {isOpen && <div className="facc-body">{body(f)}</div>}
              </section>
            );
          })}
        </div>
        <div className="fsheet-foot">
          <button type="button" className="btn btn--ghost" onClick={clearAll} disabled={activeTotal === 0}>
            {t.zuruecksetzen}
          </button>
          <button type="button" className="btn" onClick={() => { setSheet(false); top.current?.scrollIntoView({ behavior: 'smooth' }); }}>
            {fmt(t.zeigen, { anzahl: count(list.length) })}
          </button>
        </div>
      </aside>
    </div>
  );
}
