'use client';
// VoxCRM-Bausteine (components/ui) für den Verkauf: Icon (lucide), Knopf, Pill, Panel, Toast, Chips, Feld, Datum.
// Gleiche Klassen wie VoxCRM (components/vx/vx.css), Marke The Sartorialist.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { icons, type LucideProps } from 'lucide-react';
import './vx.css';

export function Icon({ name, size = 18, ...rest }: { name: string } & LucideProps) {
  const C = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? icons.Circle;
  return <C size={size} strokeWidth={1.7} aria-hidden="true" {...rest} />;
}

export type PillArt = 'ok' | 'warn' | 'bad' | 'acc' | 'neutral';
export const Pill = ({ art = 'neutral', children }: { art?: PillArt; children: ReactNode }) => <span className={`pill ${art === 'neutral' ? '' : art}`}>{children}</span>;

export function Knopf({ art = 'hell', icon, laedt, klein, children, ...rest }: { art?: 'hell' | 'dunkel' | 'akzent' | 'geist' | 'gefahr'; icon?: string; laedt?: boolean; klein?: boolean; children?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} disabled={rest.disabled || laedt} className={`knopf knopf-${art} ${klein ? 'knopf-klein' : ''} ${rest.className ?? ''}`}>
      {laedt ? <span className="spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}

export const Laden = ({ text }: { text?: string }) => (
  <div className="laden">
    <span className="spinner" />
    {text ?? 'Lädt …'}
  </div>
);
export const Fehlermeldung = ({ text }: { text: string }) => (
  <div className="fehlermeldung" role="alert">
    <Icon name="CircleAlert" size={16} />
    {text}
  </div>
);

export function Feld({ label, hinweis, fehler, ...rest }: { label: string; hinweis?: string; fehler?: string | null } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`feld ${fehler ? 'feld-fehler' : ''}`}>
      <span className="feld-label">{label}</span>
      <input className="feld-input" {...rest} />
      {fehler ? <span className="feld-meldung">{fehler}</span> : hinweis ? <span className="feld-hinweis">{hinweis}</span> : null}
    </label>
  );
}
export function Textfeld({ label, hinweis, ...rest }: { label: string; hinweis?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="feld">
      <span className="feld-label">{label}</span>
      <textarea className="feld-input feld-text" {...rest} />
      {hinweis && <span className="feld-hinweis">{hinweis}</span>}
    </label>
  );
}

export function Chips<T extends string>({ optionen, wert, onWahl, label }: { optionen: { wert: T; label: string; icon?: string }[]; wert: T | null; onWahl: (w: T) => void; label: string }) {
  return (
    <div className="chips-reihe" role="radiogroup" aria-label={label}>
      {optionen.map((o) => (
        <button key={o.wert} type="button" role="radio" aria-checked={o.wert === wert} className={`chip-w ${o.wert === wert ? 'an' : ''}`} onClick={() => onWahl(o.wert)}>
          {o.icon && <Icon name={o.icon} size={14} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Seitenblatt von rechts (VoxCRM Panel): Escape schliesst, Fuss mit Knöpfen. */
export function Panel({ offen, onZu, titel, children, fuss }: { offen: boolean; onZu: () => void; titel: string; children: ReactNode; fuss?: ReactNode }) {
  useEffect(() => {
    if (!offen) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onZu();
    document.addEventListener('keydown', k);
    document.body.classList.add('panel-offen');
    return () => {
      document.removeEventListener('keydown', k);
      document.body.classList.remove('panel-offen');
    };
  }, [offen, onZu]);
  if (!offen || typeof document === 'undefined') return null;
  return createPortal(
    <div className="vx vx-panel-hg panel-hg" onMouseDown={(e) => e.target === e.currentTarget && onZu()}>
      <aside className="panel" role="dialog" aria-modal="true" aria-label={titel}>
        <header className="panel-kopf">
          <h2>{titel}</h2>
          <button type="button" className="panel-zu" onClick={onZu} aria-label="Schliessen">
            <Icon name="X" size={18} />
          </button>
        </header>
        <div className="panel-inhalt">{children}</div>
        {fuss && <footer className="panel-fuss">{fuss}</footer>}
      </aside>
    </div>,
    document.body,
  );
}

/* ---------- Toasts ---------- */
type Toast = { id: number; text: string; art: 'ok' | 'fehler'; aktion?: { label: string; fn: () => void } };
const ToastKontext = createContext<(text: string, art?: 'ok' | 'fehler', aktion?: { label: string; fn: () => void }) => void>(() => {});
export const useToast = () => useContext(ToastKontext);
export function ToastBereich({ children }: { children: ReactNode }) {
  const [liste, setListe] = useState<Toast[]>([]);
  const n = useRef(0);
  const zeige = useCallback((text: string, art: 'ok' | 'fehler' = 'ok', aktion?: { label: string; fn: () => void }) => {
    const id = ++n.current;
    setListe((l) => [...l.slice(-2), { id, text, art, aktion }]);
    setTimeout(() => setListe((l) => l.filter((t) => t.id !== id)), aktion ? 6000 : 3500);
  }, []);
  return (
    <ToastKontext.Provider value={zeige}>
      {children}
      <div className="vx vx-toasts" aria-live="polite">
        {liste.map((t) => (
          <div key={t.id} className={`toast toast-${t.art}`}>
            <Icon name={t.art === 'ok' ? 'CircleCheck' : 'CircleAlert'} size={16} />
            {t.text}
            {t.aktion && (
              <button
                type="button"
                onClick={() => {
                  t.aktion!.fn();
                  setListe((l) => l.filter((x) => x.id !== t.id));
                }}
              >
                {t.aktion.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastKontext.Provider>
  );
}

/* ---------- Datum (eigener Kalender statt input type=date) ---------- */
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const heuteIso = () => iso(new Date());
export const plusTage = (s: string, n: number) => {
  const d = new Date(`${s}T12:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const datumKurz = (s: string | null | undefined) => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}` : '');

export function Datum({ wert, onWahl, schnell, feld, disabled }: { wert: string | null; onWahl: (w: string) => void; schnell?: { label: string; wert: string }[]; feld?: boolean; disabled?: boolean }) {
  const [offen, setOffen] = useState(false);
  const basis = wert ? new Date(`${wert}T12:00:00`) : new Date();
  const [monat, setMonat] = useState({ j: basis.getFullYear(), m: basis.getMonth() });
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!offen) return;
    const zu = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOffen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOffen(false);
    document.addEventListener('mousedown', zu);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', zu);
      document.removeEventListener('keydown', esc);
    };
  }, [offen]);
  const erster = new Date(monat.j, monat.m, 1);
  const versatz = (erster.getDay() + 6) % 7;
  const tage = new Date(monat.j, monat.m + 1, 0).getDate();
  const heute = heuteIso();
  return (
    <div style={{ position: 'relative', display: feld ? 'block' : 'inline-block' }} ref={box}>
      <button
        type="button"
        className={`datum-k ${feld ? 'datum-feld' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={offen}
        disabled={disabled}
        onClick={() => {
          setMonat({ j: basis.getFullYear(), m: basis.getMonth() });
          setOffen(!offen);
        }}
      >
        <span className="num">{wert ? datumKurz(wert) : '—'}</span>
        {!disabled && <Icon name="CalendarDays" size={13} style={{ opacity: 0.45 }} />}
      </button>
      {offen && (
        <div className="datum-pop" role="dialog">
          <div className="kalender">
            <div className="kal-kopf">
              <button type="button" aria-label="Voriger Monat" onClick={() => setMonat((x) => (x.m ? { j: x.j, m: x.m - 1 } : { j: x.j - 1, m: 11 }))}>
                <Icon name="ChevronLeft" size={16} />
              </button>
              <span>
                {MONATE[monat.m]} {monat.j}
              </span>
              <button type="button" aria-label="Nächster Monat" onClick={() => setMonat((x) => (x.m < 11 ? { j: x.j, m: x.m + 1 } : { j: x.j + 1, m: 0 }))}>
                <Icon name="ChevronRight" size={16} />
              </button>
            </div>
            <div className="kal-raster">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((w) => (
                <span key={w} className="kal-wt">
                  {w}
                </span>
              ))}
              {Array.from({ length: versatz }, (_, i) => (
                <span key={`l${i}`} />
              ))}
              {Array.from({ length: tage }, (_, i) => {
                const t = iso(new Date(monat.j, monat.m, i + 1));
                return (
                  <button
                    key={t}
                    type="button"
                    className={`kal-tag num ${t === wert ? 'an' : ''} ${t === heute ? 'heute' : ''}`}
                    onClick={() => {
                      onWahl(t);
                      setOffen(false);
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            {schnell && (
              <div className="kal-schnell">
                {schnell.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="chip-w"
                    onClick={() => {
                      onWahl(s.wert);
                      setOffen(false);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Rappen → «2’190.00» */
export const geld = (rp: number, mitWaehrung = false) => {
  const neg = rp < 0;
  const a = Math.abs(Math.round(rp));
  const s = `${neg ? '−' : ''}${Math.floor(a / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${String(a % 100).padStart(2, '0')}`;
  return mitWaehrung ? `CHF ${s}` : s;
};

export async function api<T = Record<string, unknown>>(url: string, body?: unknown, methode: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = body === undefined ? 'GET' : 'POST'): Promise<T> {
  const r = await fetch(url, { method: methode, headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { fehler?: string }).fehler || 'Das hat nicht geklappt.');
  return j as T;
}
