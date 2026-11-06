'use client';
// Positionen direkt auf dem A4-Blatt bearbeiten – aus VoxCRM apps/web/components/verkauf/editor/Positionen.tsx übernommen:
// jede Zelle ist ein Feld, Tab springt weiter, Enter öffnet darunter eine neue Zeile mit Produktsuche und «/»-Befehlen,
// freier Text wird als individuelle Position übernommen, Zeilen lassen sich ziehen, duplizieren, mit Rückgängig entfernen
// und als Produkt im Katalog speichern. Spalten wie im PDF (Pos. · Beschreibung · Menge · Einheit · Preis · Total CHF).
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { Position } from '@/lib/db/schema';
import { positionBetrag } from '@/lib/crm/geld';
import { zwischentotale } from '@/lib/beleg/vorlage';
import { DOK } from '@/lib/beleg/texte';
import type { BelegSprache } from '@/lib/db/schema';
import { Icon, api, geld, useToast } from '@/components/vx/ui';

export type EPosition = Position & { schluessel: string };
export type Treffer = { produktId: string; varianteId: string | null; name: string; kategorie: string; einheit: string; mwstSatz: number; preisRp: number; beschreibung: string | null; bild?: string | null };

const neuerSchluessel = () => Math.random().toString(36).slice(2, 10);
const mod = (e: KeyboardEvent | globalThis.KeyboardEvent) => e.metaKey || e.ctrlKey;
export const EINHEITEN = ['Stk.', 'Paar', 'Set', 'Std.', 'Pauschal', 'm'];
const MWST: [number, string][] = [
  [8.1, 'Normalsatz'],
  [2.6, 'Reduziert'],
  [3.8, 'Beherbergung'],
  [0, 'Befreit'],
];
const mengeText = (m: number) => (Number.isInteger(m) ? String(m) : String(Math.round(m * 1000) / 1000));
const satzText = (s: number) => String(s);
const KATEGORIE_ICON: Record<string, string> = { massanzug: 'Shirt', sakko: 'Shirt', hose: 'Ruler', weste: 'Shirt', hemd: 'Shirt', smoking: 'Sparkles', mantel: 'Shirt', aenderung: 'Scissors', stoffzuschlag: 'Layers', accessoire: 'Gem', dienstleistung: 'Wrench' };

export const leerePosition = (art: Position['art'] = 'position', teil: Partial<EPosition> = {}, satz = 8.1): EPosition => ({
  id: neuerSchluessel(),
  schluessel: neuerSchluessel(),
  art,
  kategorie: 'sonstiges',
  bezeichnung: '',
  beschreibung: undefined,
  menge: art === 'position' ? 1 : 0,
  einheit: art === 'position' ? 'Stk.' : undefined,
  einzelpreisRp: 0,
  rabattProzent: 0,
  mwstSatz: satz,
  ...teil,
});
const ausTreffer = (t: Treffer, satz: number): EPosition =>
  leerePosition('position', { produktId: t.produktId, varianteId: t.varianteId, kategorie: t.kategorie, bezeichnung: t.name, einheit: t.einheit, einzelpreisRp: t.preisRp, mwstSatz: satz > 0 ? t.mwstSatz : 0, beschreibung: t.beschreibung?.trim() || undefined });

/** Position ohne Bezeichnung wird noch nicht gespeichert (die API verlangt eine). */
export const unvollstaendig = (p: Position) => (p.art === 'text' ? !p.bezeichnung.trim() && !p.beschreibung?.trim() : !p.bezeichnung.trim());
export const zumSpeichern = (l: EPosition[]): Position[] =>
  l.filter((p) => !unvollstaendig(p)).map(({ schluessel: _s, ...p }) => ({ ...p, bezeichnung: p.bezeichnung.trim(), beschreibung: p.beschreibung?.trim() || undefined }));

type Feld = 'text' | 'beschreibung' | 'menge' | 'einheit' | 'preis' | 'rabatt' | 'stoff';

/** Mehrzeiliges Feld, das mit dem Inhalt wächst. */
export function AutoText({ wert, onWert, className = '', einzeilig, feldRef, ...rest }: { wert: string; onWert: (s: string) => void; className?: string; einzeilig?: boolean; feldRef?: (el: HTMLTextAreaElement | null) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const passe = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  };
  useLayoutEffect(passe, [wert]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => passe());
    ro.observe(el.parentElement ?? el);
    return () => ro.disconnect();
  }, []);
  return (
    <textarea
      {...rest}
      ref={(el) => {
        ref.current = el;
        feldRef?.(el);
      }}
      rows={1}
      className={`dk-feld dk-auto ${className}`}
      value={wert}
      onChange={(e) => onWert(einzeilig ? e.target.value.replace(/\n/g, ' ') : e.target.value)}
    />
  );
}

/** «1’234.50», «1234,5» → Rappen */
const preisEingabe = (s: string) => {
  const t = s.replace(/CHF|\s|'|’/gi, '').replace(',', '.');
  if (!/^-?\d*(\.\d{0,2})?$/.test(t) || t === '' || t === '-' || t === '.') return null;
  return Math.round(parseFloat(t) * 100);
};
const mengeEingabe = (s: string) => {
  const t = s.replace(/\s|'/g, '').replace(',', '.');
  if (!/^-?\d*(\.\d{0,3})?$/.test(t) || t === '' || t === '-' || t === '.') return null;
  return parseFloat(t);
};

/** Zahlenfeld: behält beim Tippen den Text, formatiert beim Verlassen. */
function Zahl({ wert, onWert, art, label, className = '', disabled, feldRef, onKeyDown, platzhalter }: { wert: number; onWert: (n: number) => void; art: 'preis' | 'menge' | 'prozent'; label: string; className?: string; disabled?: boolean; feldRef?: (el: HTMLInputElement | null) => void; onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void; platzhalter?: string }) {
  const format = (n: number) => (art === 'preis' ? (n / 100).toFixed(2) : art === 'prozent' && n === 0 ? '' : mengeText(n));
  const [text, setText] = useState(format(wert));
  const [fokus, setFokus] = useState(false);
  const [fehler, setFehler] = useState(false);
  useEffect(() => {
    if (!fokus) setText(format(wert));
  }, [wert, fokus]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      ref={feldRef}
      className={`dk-feld dk-zahl num ${fehler ? 'fehler' : ''} ${className}`}
      inputMode="decimal"
      aria-label={label}
      value={text}
      disabled={disabled}
      placeholder={platzhalter}
      onKeyDown={onKeyDown}
      onFocus={(e) => {
        setFokus(true);
        e.currentTarget.select();
      }}
      onBlur={() => {
        setFokus(false);
        setFehler(false);
        setText(format(wert));
      }}
      onChange={(e) => {
        setText(e.target.value);
        if (art === 'prozent' && e.target.value.trim() === '') {
          setFehler(false);
          onWert(0);
          return;
        }
        const n = art === 'preis' ? preisEingabe(e.target.value) : mengeEingabe(e.target.value);
        const ok = n !== null && (art !== 'prozent' || (n >= 0 && n <= 100));
        setFehler(!ok);
        if (ok) onWert(n!);
      }}
    />
  );
}

/** Kleines Menü am Ort (statt <select>): schliesst bei Klick daneben und mit Escape. */
export function Popover({ knopf, children, className = '', titel, rechts, tabIndex }: { knopf: ReactNode; children: (zu: () => void) => ReactNode; className?: string; titel: string; rechts?: boolean; tabIndex?: number }) {
  const [offen, setOffen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!offen) return;
    const zu = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOffen(false);
    };
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOffen(false);
      }
    };
    document.addEventListener('mousedown', zu);
    document.addEventListener('keydown', esc, true);
    return () => {
      document.removeEventListener('mousedown', zu);
      document.removeEventListener('keydown', esc, true);
    };
  }, [offen]);
  return (
    <div className={`dk-pop ${className}`} ref={box}>
      <button
        type="button"
        className="dk-pop-k"
        aria-haspopup="menu"
        aria-expanded={offen}
        aria-label={titel}
        title={titel}
        tabIndex={tabIndex}
        onClick={() => setOffen(!offen)}
        onKeyDown={(e) => {
          if (!offen && (e.key === 'ArrowDown' || e.key === ' ')) {
            e.preventDefault();
            setOffen(true);
          }
        }}
      >
        {knopf}
      </button>
      {offen && (
        <div
          className={`dk-pop-p ${rechts ? 'rechts' : ''}`}
          role="menu"
          onKeyDown={(e) => {
            const knoepfe = [...(e.currentTarget.querySelectorAll('button:not(:disabled)') as NodeListOf<HTMLButtonElement>)];
            const i = knoepfe.indexOf(document.activeElement as HTMLButtonElement);
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              knoepfe[(i + 1) % knoepfe.length]?.focus();
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              knoepfe[(i - 1 + knoepfe.length) % knoepfe.length]?.focus();
            }
          }}
        >
          {children(() => setOffen(false))}
        </div>
      )}
    </div>
  );
}

/* ---------- Einfügen: Produktsuche, freie Eingabe und «/»-Befehle ---------- */

interface Befehl {
  id: string;
  label: string;
  text: string;
  icon: string;
  neu: () => EPosition;
  fokus: Feld;
}
type Eintrag = { art: 'produkt'; t: Treffer } | { art: 'befehl'; b: Befehl } | { art: 'freitext'; text: string };

function befehle(satz: number): Befehl[] {
  return [
    { id: 'position', label: 'Individuelle Position', text: 'Freie Zeile mit Menge und Preis', icon: 'Type', neu: () => leerePosition('position', {}, satz), fokus: 'text' },
    { id: 'titel', label: 'Zwischentitel', text: 'Gruppiert die folgenden Positionen, mit Zwischentotal', icon: 'Heading', neu: () => leerePosition('titel', {}, satz), fokus: 'text' },
    { id: 'text', label: 'Textblock', text: 'Hinweis ohne Preis, z. B. Lieferung oder Anprobe', icon: 'Pilcrow', neu: () => leerePosition('text', { beschreibung: '' }, satz), fokus: 'text' },
  ];
}

function Einfueger({ onEinfuegen, onAbbruch, autoFocus, inline, satz }: { onEinfuegen: (p: EPosition, fokus: Feld) => void; onAbbruch?: () => void; autoFocus?: boolean; inline?: boolean; satz: number }) {
  const [q, setQ] = useState('');
  const [offen, setOffen] = useState(false);
  const [treffer, setTreffer] = useState<Treffer[] | null>(null);
  const [fokus, setFokus] = useState(0);
  const [fuer, setFuer] = useState<string | null>(null);
  const wartet = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const eingabe = useRef<HTMLInputElement>(null);
  const befehlsModus = q.startsWith('/');
  const suchText = befehlsModus ? '' : q.trim();

  useEffect(() => {
    if (autoFocus) eingabe.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    if (!offen || befehlsModus) return;
    const ctl = new AbortController();
    const t = setTimeout(
      () =>
        fetch(`/api/admin/produkte/suche/?q=${encodeURIComponent(suchText)}`, { signal: ctl.signal })
          .then((r) => (r.ok ? r.json() : []))
          .then((r: Treffer[]) => {
            setTreffer(Array.isArray(r) ? r : []);
            setFuer(suchText);
          })
          .catch(() => {}),
      suchText ? 120 : 0,
    );
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [suchText, offen, befehlsModus]);
  useEffect(() => {
    if (!offen) return;
    const zu = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setOffen(false);
        if (inline && !q) onAbbruch?.();
      }
    };
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
  }, [offen, inline, q, onAbbruch]);

  const alle = befehle(satz);
  const bf = q.slice(1).trim().toLowerCase();
  const passendeBefehle = befehlsModus ? alle.filter((b) => !bf || b.label.toLowerCase().includes(bf) || b.id.includes(bf)) : suchText ? [] : alle;
  const produkte = befehlsModus ? [] : (treffer ?? []).slice(0, suchText ? 8 : 6);
  const eintraege: Eintrag[] = [...produkte.map((t) => ({ art: 'produkt' as const, t })), ...(suchText ? [{ art: 'freitext' as const, text: suchText }] : []), ...passendeBefehle.map((b) => ({ art: 'befehl' as const, b }))];
  const f = Math.min(fokus, Math.max(eintraege.length - 1, 0));

  const waehle = (x: Eintrag) => {
    if (x.art === 'produkt') onEinfuegen(ausTreffer(x.t, satz), 'menge');
    else if (x.art === 'freitext') onEinfuegen(leerePosition('position', { bezeichnung: x.text.slice(0, 300) }, satz), 'preis');
    else onEinfuegen(x.b.neu(), x.b.fokus);
    setQ('');
    setFokus(0);
    setOffen(false);
  };
  // Enter vor dem Eintreffen der Suchtreffer: auf die Treffer warten und dann den besten nehmen
  useEffect(() => {
    if (!wartet.current || fuer !== suchText) return;
    wartet.current = false;
    const x = eintraege[0];
    if (x) waehle(x);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`dk-einf ${inline ? 'inline' : ''} ${offen ? 'offen' : ''}`} ref={box}>
      <span className="dk-einf-plus">
        <Icon name="Plus" size={15} />
      </span>
      <input
        ref={eingabe}
        className="dk-einf-in"
        value={q}
        aria-label="Position hinzufügen: Produkt suchen oder frei eingeben"
        placeholder={inline ? 'Produkt suchen oder frei eingeben …' : 'Position hinzufügen – Produkt suchen oder frei eingeben, «/» für Bausteine'}
        role="combobox"
        aria-expanded={offen}
        aria-autocomplete="list"
        onFocus={() => setOffen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setFokus(0);
          setOffen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOffen(true);
            setFokus(Math.min(f + 1, eintraege.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFokus(Math.max(f - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (suchText && fuer !== suchText) {
              wartet.current = true;
              return;
            }
            const x = eintraege[f];
            if (x) waehle(x);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            if (q) setQ('');
            else {
              setOffen(false);
              onAbbruch?.();
              eingabe.current?.blur();
            }
          } else if (e.key === 'Backspace' && !q && inline) {
            e.preventDefault();
            onAbbruch?.();
          }
        }}
      />
      {offen && (
        <div className="dk-einf-p" role="listbox">
          {produkte.length > 0 && <div className="dk-einf-g">{suchText ? 'Aus dem Katalog' : 'Häufig verwendet'}</div>}
          {eintraege.map((x, i) => {
            const an = i === f;
            if (x.art === 'produkt')
              return (
                <button type="button" key={`${x.t.produktId}:${x.t.varianteId ?? ''}`} role="option" aria-selected={an} className={`dk-einf-o ${an ? 'an' : ''}`} onMouseEnter={() => setFokus(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => waehle(x)}>
                  <span className="dk-einf-i">
                    {x.t.bild ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={x.t.bild} alt="" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 9 }} />
                    ) : (
                      <Icon name={KATEGORIE_ICON[x.t.kategorie] ?? 'Package'} size={15} />
                    )}
                  </span>
                  <span className="t">
                    <b>{x.t.name}</b>
                    <small>{[x.t.beschreibung, x.t.mwstSatz !== 8.1 ? `MWST ${satzText(x.t.mwstSatz)} %` : null].filter(Boolean).join(' · ') || x.t.kategorie}</small>
                  </span>
                  <span className="dk-einf-preis num">
                    {x.t.preisRp ? geld(x.t.preisRp, true) : 'Preis offen'}
                    <small> / {x.t.einheit}</small>
                  </span>
                </button>
              );
            if (x.art === 'freitext')
              return (
                <Fragment key="freitext">
                  {produkte.length > 0 && <div className="dk-einf-g">Individuell</div>}
                  <button type="button" role="option" aria-selected={an} className={`dk-einf-o ${an ? 'an' : ''}`} onMouseEnter={() => setFokus(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => waehle(x)}>
                    <span className="dk-einf-i">
                      <Icon name="Type" size={15} />
                    </span>
                    <span className="t">
                      <b>«{x.text}» als individuelle Position übernehmen</b>
                      <small>Ohne Katalog – Preis danach direkt im Blatt eintragen</small>
                    </span>
                    <kbd>↵</kbd>
                  </button>
                </Fragment>
              );
            return (
              <Fragment key={x.b.id}>
                {(i === 0 || eintraege[i - 1]!.art !== 'befehl') && (
                  <div className="dk-einf-g">
                    Bausteine{!befehlsModus && <span>Tippen filtert</span>}
                  </div>
                )}
                <button type="button" role="option" aria-selected={an} className={`dk-einf-o ${an ? 'an' : ''}`} onMouseEnter={() => setFokus(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => waehle(x)}>
                  <span className="dk-einf-i">
                    <Icon name={x.b.icon} size={15} />
                  </span>
                  <span className="t">
                    <b>{x.b.label}</b>
                    <small>{x.b.text}</small>
                  </span>
                </button>
              </Fragment>
            );
          })}
          {treffer === null && !befehlsModus && <div className="dk-einf-leer">Sucht …</div>}
          {treffer !== null && suchText && produkte.length === 0 && <div className="dk-einf-leer">Kein Produkt gefunden – Enter übernimmt die Eingabe als individuelle Position.</div>}
          <div className="dk-einf-fuss">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> wählen
            </span>
            <span>
              <kbd>↵</kbd> einfügen
            </span>
            <span>
              <kbd>/</kbd> Bausteine
            </span>
            <span>
              <kbd>Esc</kbd> schliessen
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Tabelle ---------- */

export function Positionen({ positionen, setze, gesperrt, satz, sprache, hinweisGesperrt }: { positionen: EPosition[]; setze: (f: (p: EPosition[]) => EPosition[], gruppe?: string) => void; gesperrt: boolean; satz: number; sprache: BelegSprache; hinweisGesperrt?: string | null }) {
  const toast = useToast();
  const D = DOK[sprache];
  const mwstPflichtig = satz > 0;
  const felder = useRef(new Map<string, HTMLElement>());
  const [fokusZiel, setFokusZiel] = useState<{ k: string; feld: Feld } | null>(null);
  const [einfuegenBei, setEinfuegenBei] = useState<number | null>(null);
  const [zieht, setZieht] = useState<string | null>(null);
  const [ziel, setZiel] = useState<{ i: number; nach: boolean } | null>(null);

  const reg = (k: string, feld: Feld) => (el: HTMLElement | null) => {
    if (el) felder.current.set(`${k}:${feld}`, el);
    else felder.current.delete(`${k}:${feld}`);
  };
  useEffect(() => {
    if (!fokusZiel) return;
    const el = felder.current.get(`${fokusZiel.k}:${fokusZiel.feld}`) ?? felder.current.get(`${fokusZiel.k}:text`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const l = el.value.length;
        try {
          el.setSelectionRange(fokusZiel.feld === 'text' ? l : 0, l);
        } catch {
          /* egal */
        }
      }
    }
    setFokusZiel(null);
  }, [fokusZiel, positionen]);

  const aendere = (k: string, teil: Partial<EPosition>, feld?: string) => setze((l) => l.map((p) => (p.schluessel === k ? { ...p, ...teil } : p)), feld ? `${k}:${feld}` : undefined);
  const fuegeEin = (bei: number, p: EPosition, feld: Feld) => {
    setze((l) => [...l.slice(0, bei), p, ...l.slice(bei)]);
    setEinfuegenBei(null);
    setFokusZiel({ k: p.schluessel, feld });
  };
  const entferne = (i: number, still = false) => {
    const p = positionen[i];
    if (!p) return;
    setze((l) => l.filter((_, j) => j !== i));
    const vorher = positionen[i - 1] ?? positionen[i + 1];
    if (vorher) setFokusZiel({ k: vorher.schluessel, feld: 'text' });
    if (!still)
      toast(p.bezeichnung ? `«${p.bezeichnung.slice(0, 40)}» entfernt` : 'Zeile entfernt', 'ok', {
        label: 'Rückgängig',
        fn: () => setze((l) => (l.some((x) => x.schluessel === p.schluessel) ? l : [...l.slice(0, i), p, ...l.slice(i)])),
      });
  };
  const verschiebe = (i: number, nach: number) => {
    if (nach < 0 || nach >= positionen.length || nach === i) return;
    setze((l) => {
      const n = [...l];
      const [x] = n.splice(i, 1);
      n.splice(nach, 0, x!);
      return n;
    });
  };
  const dupliziere = (i: number) => {
    const p = positionen[i]!;
    const kopie = { ...p, id: neuerSchluessel(), schluessel: neuerSchluessel() };
    setze((l) => [...l.slice(0, i + 1), kopie, ...l.slice(i + 1)]);
    setFokusZiel({ k: kopie.schluessel, feld: 'text' });
  };
  const alsProdukt = async (p: EPosition) => {
    try {
      const r = await api<{ produkt: { id: string } }>('/api/admin/produkte/', {
        name: p.bezeichnung.trim(),
        kategorie: ['massanzug', 'sakko', 'hose', 'weste', 'hemd', 'smoking', 'mantel', 'aenderung', 'stoffzuschlag', 'accessoire', 'dienstleistung'].includes(p.kategorie) ? p.kategorie : 'dienstleistung',
        beschreibung: p.beschreibung?.trim() || null,
        preisRp: p.einzelpreisRp,
        mwstSatz: p.mwstSatz ?? satz,
        einheit: p.einheit || 'Stk.',
        aktiv: true,
        varianten: [],
      });
      aendere(p.schluessel, { produktId: r.produkt.id, varianteId: null });
      toast(`«${p.bezeichnung}» ist jetzt im Produktkatalog`);
    } catch (e) {
      toast((e as Error).message, 'fehler');
    }
  };

  /** Gemeinsame Tastatur der Zeilenfelder. */
  const tasten = (i: number, feld: Feld) => (e: KeyboardEvent<HTMLElement>) => {
    const p = positionen[i]!;
    const k = p.schluessel;
    if (e.key === 'Enter' && !e.shiftKey && !mod(e) && feld !== 'beschreibung' && !(p.art === 'text' && feld !== 'text')) {
      e.preventDefault();
      setEinfuegenBei(i + 1);
      return;
    }
    if (e.key === 'Enter' && e.shiftKey && feld === 'text' && (p.art ?? 'position') === 'position') {
      e.preventDefault();
      if (p.beschreibung === undefined) aendere(k, { beschreibung: '' });
      setFokusZiel({ k, feld: 'beschreibung' });
      return;
    }
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      verschiebe(i, i + (e.key === 'ArrowUp' ? -1 : 1));
      setFokusZiel({ k, feld });
      return;
    }
    if (mod(e) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      dupliziere(i);
      return;
    }
    if (mod(e) && e.key === 'Backspace') {
      e.preventDefault();
      entferne(i);
      return;
    }
    if (e.key === 'Backspace' && feld === 'text' && !p.bezeichnung && !p.produktId && !p.einzelpreisRp && !p.beschreibung?.trim()) {
      e.preventDefault();
      entferne(i, true);
      return;
    }
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && feld !== 'beschreibung' && !(p.art === 'text' && feld !== 'text')) {
      const r = e.key === 'ArrowUp' ? -1 : 1;
      for (let j = i + r; j >= 0 && j < positionen.length; j += r) {
        const q = positionen[j]!;
        const z = (q.art ?? 'position') === 'position' ? feld : 'text';
        if (felder.current.get(`${q.schluessel}:${z}`)) {
          e.preventDefault();
          setFokusZiel({ k: q.schluessel, feld: z });
          return;
        }
      }
    }
  };

  const ablegen = () => {
    if (zieht === null || !ziel) return;
    const von = positionen.findIndex((p) => p.schluessel === zieht);
    let nach = ziel.i + (ziel.nach ? 1 : 0);
    if (von < nach) nach--;
    if (von >= 0) verschiebe(von, nach);
  };

  const einf = (bei: number, inline: boolean) => (
    <Einfueger
      key={inline ? `einf-${bei}` : 'einf-ende'}
      inline={inline}
      autoFocus={inline}
      satz={satz}
      onEinfuegen={(p, feld) => fuegeEin(bei, p, feld)}
      onAbbruch={
        inline
          ? () => {
              setEinfuegenBei(null);
              const v = positionen[bei - 1];
              if (v) setFokusZiel({ k: v.schluessel, feld: 'text' });
            }
          : undefined
      }
    />
  );

  const zwischen = zwischentotale(positionen);
  let nr = 0;
  return (
    <div className={`dk-pos ${gesperrt ? 'gesperrt' : ''} ${mwstPflichtig ? '' : 'ohne-mwst'}`} onDragOver={(e) => zieht && e.preventDefault()}>
      <div className="dk-pos-kopf" aria-hidden="true">
        <span>{D.pos}</span>
        <span>{D.beschreibung}</span>
        <span className="r dk-k-menge">{D.menge}</span>
        <span className="r">{D.preis}</span>
        <span className="r">{D.totalChf}</span>
      </div>
      {positionen.length === 0 && gesperrt && <div className="dk-pos-leer">Keine Positionen.</div>}
      {positionen.length === 0 && !gesperrt && (
        <div className="dk-pos-leer">
          <Icon name="MousePointerClick" size={16} />
          <span>
            Noch keine Positionen. Unten tippen: Produkt suchen oder frei eingeben – Enter übernimmt. Mit <kbd>/</kbd> fügen Sie Zwischentitel und Textblöcke ein.
          </span>
        </div>
      )}
      {positionen.map((p, i) => {
        const k = p.schluessel;
        const art = p.art ?? 'position';
        if (art === 'position') nr++;
        const b = positionBetrag(p);
        const fehlt = !gesperrt && unvollstaendig(p) && (p.einzelpreisRp !== 0 || !!p.beschreibung?.trim());
        const dropKlasse = ziel && ziel.i === i && zieht !== k ? (ziel.nach ? 'drop-nach' : 'drop-vor') : '';
        const zeilenProps = {
          'data-k': k,
          draggable: !gesperrt && zieht === k,
          onDragStart: (e: React.DragEvent) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', k);
          },
          onDragOver: (e: React.DragEvent) => {
            if (!zieht) return;
            e.preventDefault();
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setZiel({ i, nach: e.clientY > r.top + r.height / 2 });
          },
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            ablegen();
            setZieht(null);
            setZiel(null);
          },
          onDragEnd: () => {
            setZieht(null);
            setZiel(null);
          },
        };
        const griff = !gesperrt && (
          <span className="dk-griff" title="Ziehen zum Sortieren" aria-hidden="true" onPointerDown={() => setZieht(k)} onPointerUp={() => !ziel && setZieht(null)}>
            <Icon name="GripVertical" size={15} />
          </span>
        );
        const menue = !gesperrt && (
          <Popover className="dk-menue" titel="Zeile" rechts tabIndex={-1} knopf={<Icon name="EllipsisVertical" size={16} />}>
            {(zu) => (
              <>
                {art === 'position' && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      const leer = p.beschreibung === undefined;
                      aendere(k, { beschreibung: leer ? '' : undefined });
                      if (leer) setFokusZiel({ k, feld: 'beschreibung' });
                      zu();
                    }}
                  >
                    <Icon name="AlignLeft" size={15} />
                    {p.beschreibung !== undefined ? 'Beschreibung entfernen' : 'Beschreibung hinzufügen'}
                    <kbd>⇧↵</kbd>
                  </button>
                )}
                {art === 'position' && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      aendere(k, { stoffnummer: p.stoffnummer === undefined ? '' : undefined });
                      if (p.stoffnummer === undefined) setTimeout(() => setFokusZiel({ k, feld: 'stoff' }), 0);
                      zu();
                    }}
                  >
                    <Icon name="SwatchBook" size={15} />
                    {p.stoffnummer !== undefined ? 'Stoffnummer entfernen' : 'Stoffnummer erfassen'}
                  </button>
                )}
                {art === 'position' && !p.produktId && p.bezeichnung.trim() && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      zu();
                      alsProdukt(p);
                    }}
                  >
                    <Icon name="PackagePlus" size={15} />
                    Als Produkt speichern
                  </button>
                )}
                <div className="dk-pop-trenn" />
                <button
                  type="button"
                  role="menuitem"
                  disabled={i === 0}
                  onClick={() => {
                    verschiebe(i, i - 1);
                    zu();
                  }}
                >
                  <Icon name="ArrowUp" size={15} />
                  Nach oben<kbd>⌥↑</kbd>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={i === positionen.length - 1}
                  onClick={() => {
                    verschiebe(i, i + 1);
                    zu();
                  }}
                >
                  <Icon name="ArrowDown" size={15} />
                  Nach unten<kbd>⌥↓</kbd>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setEinfuegenBei(i + 1);
                    zu();
                  }}
                >
                  <Icon name="ListPlus" size={15} />
                  Zeile darunter<kbd>↵</kbd>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    dupliziere(i);
                    zu();
                  }}
                >
                  <Icon name="Copy" size={15} />
                  Duplizieren<kbd>⌘D</kbd>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="gefahr"
                  onClick={() => {
                    entferne(i);
                    zu();
                  }}
                >
                  <Icon name="Trash2" size={15} />
                  Entfernen<kbd>⌘⌫</kbd>
                </button>
              </>
            )}
          </Popover>
        );

        let zeile: ReactNode;
        if (art === 'titel') {
          zeile = (
            <div className={`dk-z titel ${dropKlasse}`} {...zeilenProps}>
              {griff}
              <span className="dk-nr" />
              <AutoText einzeilig className="dk-titel-in" wert={p.bezeichnung} disabled={gesperrt} placeholder="Zwischentitel" aria-label="Zwischentitel" feldRef={reg(k, 'text')} onWert={(s) => aendere(k, { bezeichnung: s.slice(0, 300) }, 'text')} onKeyDown={tasten(i, 'text')} />
              {menue}
            </div>
          );
        } else if (art === 'text') {
          zeile = (
            <div className={`dk-z textblock ${dropKlasse}`} {...zeilenProps}>
              {griff}
              <span className="dk-nr" />
              <div className="dk-zelle-text">
                <AutoText einzeilig className="dk-fett" wert={p.bezeichnung} disabled={gesperrt} placeholder={gesperrt ? '' : 'Überschrift (optional)'} aria-label="Überschrift des Textblocks" feldRef={reg(k, 'text')} onWert={(s) => aendere(k, { bezeichnung: s.slice(0, 300) }, 'text')} onKeyDown={tasten(i, 'text')} />
                <AutoText className="dk-besch" wert={p.beschreibung ?? ''} disabled={gesperrt} placeholder="Text, z. B. Lieferung, Anprobe, Hinweise" aria-label="Textblock" feldRef={reg(k, 'beschreibung')} onWert={(s) => aendere(k, { beschreibung: s.slice(0, 4000) }, 'beschreibung')} onKeyDown={tasten(i, 'beschreibung')} />
              </div>
              {menue}
            </div>
          );
        } else {
          const besch = p.beschreibung !== undefined;
          const stoff = p.stoffnummer !== undefined;
          const satzP = p.mwstSatz ?? satz;
          zeile = (
            <div className={`dk-z ${fehlt ? 'fehlt' : ''} mit-detail ${dropKlasse}`} {...zeilenProps}>
              {griff}
              <span className="dk-nr num">{nr}</span>
              <div className="dk-zelle-text">
                <AutoText einzeilig className="dk-text" wert={p.bezeichnung} disabled={gesperrt} placeholder="Bezeichnung" aria-label={`Bezeichnung Position ${nr}`} feldRef={reg(k, 'text')} onWert={(s) => aendere(k, { bezeichnung: s.slice(0, 300) }, 'text')} onKeyDown={tasten(i, 'text')} />
                {besch && (
                  <AutoText
                    className="dk-besch"
                    wert={p.beschreibung ?? ''}
                    disabled={gesperrt}
                    placeholder="Beschreibung, z. B. Schnitt, Futter, Knöpfe"
                    aria-label={`Beschreibung Position ${nr}`}
                    feldRef={reg(k, 'beschreibung')}
                    onWert={(s) => aendere(k, { beschreibung: s.slice(0, 4000) }, 'beschreibung')}
                    onKeyDown={tasten(i, 'beschreibung')}
                    onBlur={() => {
                      if (!p.beschreibung?.trim()) aendere(k, { beschreibung: undefined });
                    }}
                  />
                )}
                {fehlt && <span className="dk-fehlt">Bezeichnung fehlt – die Zeile wird erst damit gespeichert.</span>}
              </div>
              <label className="dk-zelle dk-menge">
                <small>Menge</small>
                <Zahl art="menge" label={`Menge Position ${nr}`} wert={p.menge} disabled={gesperrt} feldRef={reg(k, 'menge')} onKeyDown={tasten(i, 'menge')} onWert={(n) => aendere(k, { menge: n }, 'menge')} />
              </label>
              <div className="dk-zelle dk-einheit">
                <small>Einheit</small>
                {gesperrt ? (
                  <span className="dk-feld">{p.einheit ?? 'Stk.'}</span>
                ) : (
                  <Popover className="dk-einheit-wahl" titel="Einheit" knopf={<span className="dk-feld" style={{ paddingLeft: 0 }}>{p.einheit ?? 'Stk.'}</span>} tabIndex={-1}>
                    {(zu) =>
                      EINHEITEN.map((e) => (
                        <button
                          key={e}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            aendere(k, { einheit: e });
                            zu();
                          }}
                        >
                          {(p.einheit ?? 'Stk.') === e ? <Icon name="Check" size={15} /> : <span className="dk-pop-leer" />}
                          {e}
                        </button>
                      ))
                    }
                  </Popover>
                )}
              </div>
              <label className="dk-zelle dk-preis">
                <small>Preis</small>
                <Zahl art="preis" label={`Preis Position ${nr}`} wert={p.einzelpreisRp} disabled={gesperrt} feldRef={reg(k, 'preis')} onKeyDown={tasten(i, 'preis')} onWert={(n) => aendere(k, { einzelpreisRp: n }, 'preis')} />
              </label>
              <span className="dk-zelle dk-total num">
                <small>Total</small>
                {geld(b)}
              </span>
              <div className="dk-detail">
                {gesperrt ? (
                  <>
                    {stoff && p.stoffnummer && (
                      <span>
                        {D.stoff} {p.stoffnummer}
                      </span>
                    )}
                    {!!p.rabattProzent && <span>{D.rabatt.replace('{p}', mengeText(p.rabattProzent))}</span>}
                    {mwstPflichtig && satzP !== satz && <span>MWST {satzText(satzP)} %</span>}
                  </>
                ) : (
                  <>
                    {stoff && (
                      <label className="dk-mini">
                        <span>{D.stoff}</span>
                        <input
                          ref={reg(k, 'stoff')}
                          className="dk-feld"
                          style={{ width: 84, textAlign: 'left', textTransform: 'uppercase' }}
                          value={p.stoffnummer ?? ''}
                          placeholder="HS4471"
                          aria-label={`Stoffnummer Position ${nr}`}
                          onChange={(e) => aendere(k, { stoffnummer: e.target.value.toUpperCase().slice(0, 40) }, 'stoff')}
                          onKeyDown={tasten(i, 'stoff')}
                        />
                      </label>
                    )}
                    <label className={`dk-mini ${p.rabattProzent ? '' : 'ohne'}`}>
                      <span>Rabatt</span>
                      <Zahl art="prozent" label={`Rabatt Position ${nr}`} wert={p.rabattProzent ?? 0} platzhalter="0" feldRef={reg(k, 'rabatt')} onKeyDown={tasten(i, 'rabatt')} onWert={(n) => aendere(k, { rabattProzent: n }, 'rabatt')} />
                      <span>%</span>
                    </label>
                    {!besch && (
                      <button
                        type="button"
                        className="dk-besch-dazu"
                        onClick={() => {
                          aendere(k, { beschreibung: '' });
                          setFokusZiel({ k, feld: 'beschreibung' });
                        }}
                      >
                        <Icon name="List" size={12} />
                        Beschreibung
                      </button>
                    )}
                    {!stoff && (
                      <button
                        type="button"
                        className="dk-besch-dazu"
                        onClick={() => {
                          aendere(k, { stoffnummer: '' });
                          setTimeout(() => setFokusZiel({ k, feld: 'stoff' }), 0);
                        }}
                      >
                        <Icon name="SwatchBook" size={12} />
                        Stoffnummer
                      </button>
                    )}
                    {mwstPflichtig && (
                      <Popover className={`dk-mini ${satzP === satz ? 'std' : ''}`} titel="MWST-Satz" knopf={<span className="dk-mwst num">MWST {satzText(satzP)} %<Icon name="ChevronDown" size={12} /></span>}>
                        {(zu) =>
                          MWST.map(([m, l]) => (
                            <button
                              type="button"
                              role="menuitem"
                              key={m}
                              onClick={() => {
                                aendere(k, { mwstSatz: m });
                                zu();
                              }}
                            >
                              {satzP === m ? <Icon name="Check" size={15} /> : <span className="dk-pop-leer" />}
                              <span className="num">{satzText(m)} %</span>
                              <small>{l}</small>
                            </button>
                          ))
                        }
                      </Popover>
                    )}
                    {p.produktId && (
                      <span className="dk-marke an" title="Aus dem Produktkatalog">
                        <Icon name="Package" size={13} />
                        Katalog
                      </span>
                    )}
                  </>
                )}
              </div>
              {menue}
            </div>
          );
        }
        return (
          <Fragment key={k}>
            {zeile}
            {zwischen.has(i) && (
              <div className="dk-z zt" aria-label="Zwischentotal">
                <span className="dk-zt-l">{D.zwischentotal}</span>
                <span className="dk-total num">{geld(zwischen.get(i)!)}</span>
              </div>
            )}
            {einfuegenBei === i + 1 && !gesperrt && i + 1 < positionen.length && einf(i + 1, true)}
          </Fragment>
        );
      })}
      {!gesperrt && einfuegenBei === positionen.length && positionen.length > 0 ? einf(positionen.length, true) : null}
      {!gesperrt && (einfuegenBei !== positionen.length || positionen.length === 0) && einf(positionen.length, false)}
      {!gesperrt && (
        <div className="dk-schnell" role="group" aria-label="Schnell einfügen">
          <button type="button" onClick={() => fuegeEin(positionen.length, leerePosition('position', {}, satz), 'text')}>
            <Icon name="Type" size={13} />
            Individuelle Position
          </button>
          <button type="button" onClick={() => fuegeEin(positionen.length, leerePosition('titel', {}, satz), 'text')}>
            <Icon name="Heading" size={13} />
            Zwischentitel
          </button>
          <button type="button" onClick={() => fuegeEin(positionen.length, leerePosition('text', { beschreibung: '' }, satz), 'beschreibung')}>
            <Icon name="Pilcrow" size={13} />
            Textblock
          </button>
        </div>
      )}
      {gesperrt && hinweisGesperrt && (
        <div className="dk-pos-gesperrt">
          <Icon name="Lock" size={13} />
          {hinweisGesperrt}
        </div>
      )}
    </div>
  );
}

export const mitSchluessel = (l: Position[]): EPosition[] => l.map((p) => ({ ...p, schluessel: p.id || neuerSchluessel() }));
