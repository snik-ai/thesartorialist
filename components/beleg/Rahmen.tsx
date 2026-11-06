'use client';
// Rahmen des Dokument-Editors – aus VoxCRM apps/web/components/verkauf/editor/Rahmen.tsx übernommen: schlanke Leiste oben
// (Speicherstand, Status, Aktionen), ruhige Fläche mit dem A4-Papier, Werkzeug (Rückgängig, Ansicht, Zoom), rechte
// Seitenleiste (einklappbar; mittel = Schublade, schmal = Bottom-Sheet), Aktionsleiste unten auf Tablet und Handy.
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Icon, Laden, Fehlermeldung } from '@/components/vx/ui';
import { Popover } from './Positionen';
import { useBreite, useJetzt, vorZeit, type SpeicherStatus } from './zustand';

export type Modus = 'bearbeiten' | 'kunde' | 'pdf';
const ZOOMS = [0.75, 0.9, 1, 1.1, 1.25, 1.5];
const PAPIER = 794; // 210 mm bei 96 dpi

function lies(k: string) {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
}
function schreib(k: string, v: string) {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    /* egal */
  }
}

export function SpeicherAnzeige({ status, onErneut, hinweisOhne }: { status: SpeicherStatus; onErneut: () => void; hinweisOhne?: string }) {
  const jetzt = useJetzt(status.art === 'gespeichert' ? 1000 : 5000);
  const s = status;
  if (s.art === 'aus') return null;
  if (s.art === 'wartet')
    return (
      <span className="dk-gesp wartet" title={hinweisOhne}>
        <Icon name="CircleDashed" size={14} />
        <span className="lang">{hinweisOhne ?? 'Noch nicht gespeichert'}</span>
      </span>
    );
  if (s.art === 'fehler')
    return (
      <span className="dk-gesp fehler" role="alert" title={s.fehler ?? undefined}>
        <Icon name="CloudAlert" size={14} />
        <span className="lang">Nicht gespeichert: {s.fehler}</span>
        <button type="button" onClick={onErneut}>
          Erneut
        </button>
      </span>
    );
  if (s.art === 'speichert' || s.art === 'ungespeichert')
    return (
      <span className="dk-gesp laeuft" aria-live="polite">
        <span className="dk-puls" />
        <span className="lang">Speichert …</span>
      </span>
    );
  return (
    <span className="dk-gesp ok" aria-live="polite">
      <Icon name="Cloud" size={14} />
      <span className="lang">{s.zeit ? `Gespeichert ${vorZeit(s.zeit, jetzt)}` : 'Gespeichert'}</span>
    </span>
  );
}

export interface Aktion {
  label: string;
  icon: string;
  onClick: () => void;
  kbd?: string;
  gefahr?: boolean;
  disabled?: boolean;
  text?: string;
  laedt?: boolean;
  element?: ReactNode;
}

function Aktionen({ primaer, sekundaer, mehr, unten }: { primaer?: Aktion | null; sekundaer?: Aktion[]; mehr?: Aktion[]; unten?: boolean }) {
  return (
    <div className={`dk-akt-leiste ${unten ? 'unten' : ''}`}>
      {sekundaer?.map((a) =>
        a.element ? (
          <Fragment key={a.label}>{a.element}</Fragment>
        ) : (
          <button key={a.label} type="button" className="dk-sek" onClick={a.onClick} disabled={a.disabled || a.laedt} title={a.text ?? a.label} aria-label={a.label}>
            {a.laedt ? <span className="spinner" /> : <Icon name={a.icon} size={16} />}
            <span>{a.label}</span>
          </button>
        ),
      )}
      {!!mehr?.length && (
        <Popover
          className="dk-mehr"
          titel="Weitere Aktionen"
          rechts
          knopf={
            <span className="dk-mehr-k">
              <Icon name="Ellipsis" size={17} />
              <span>Mehr</span>
            </span>
          }
        >
          {(zu) =>
            mehr.map((a, i) => (
              <Fragment key={a.label}>
                {a.gefahr && i > 0 && !mehr[i - 1]!.gefahr && <div className="dk-pop-trenn" />}
                <button
                  type="button"
                  role="menuitem"
                  className={a.gefahr ? 'gefahr' : ''}
                  disabled={a.disabled}
                  onClick={() => {
                    zu();
                    a.onClick();
                  }}
                >
                  <Icon name={a.icon} size={15} />
                  <span className="dk-mehr-t">
                    {a.label}
                    {a.text && <small>{a.text}</small>}
                  </span>
                  {a.kbd && <kbd>{a.kbd}</kbd>}
                </button>
              </Fragment>
            ))
          }
        </Popover>
      )}
      {primaer && (
        <button type="button" className="knopf knopf-dunkel dk-prim" onClick={primaer.onClick} disabled={primaer.disabled || primaer.laedt} title={primaer.kbd ? `${primaer.label} (${primaer.kbd})` : primaer.label}>
          {primaer.laedt ? <span className="spinner" aria-hidden="true" /> : <Icon name={primaer.icon} size={16} />}
          <span>{primaer.label}</span>
          {primaer.kbd && <kbd>{primaer.kbd}</kbd>}
        </button>
      )}
    </div>
  );
}

export function DokumentRahmen({
  zurueck,
  titel,
  status,
  speicher,
  modus,
  onModus,
  modi,
  rueck,
  primaer,
  sekundaer,
  mehr,
  papier,
  vorschau,
  seitenleiste,
  seitenTitel,
  laedt,
  fehler,
  hinweis,
}: {
  zurueck: { href: string; label: string };
  titel: ReactNode;
  status?: ReactNode;
  speicher?: ReactNode;
  modus: Modus;
  onModus: (m: Modus) => void;
  modi: { wert: Modus; label: string }[];
  rueck?: { zurueck: () => void; vor: () => void; kannZurueck: boolean; kannVor: boolean } | null;
  primaer?: Aktion | null;
  sekundaer?: Aktion[];
  mehr?: Aktion[];
  papier: ReactNode;
  vorschau?: ReactNode;
  seitenleiste: ReactNode;
  seitenTitel: string;
  laedt?: boolean;
  fehler?: string | null;
  hinweis?: ReactNode;
}) {
  const breite = useBreite();
  const flaeche = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | 'passend'>('passend');
  const [passend, setPassend] = useState(1);
  const [seiteOffen, setSeiteOffen] = useState(true);
  const [schublade, setSchublade] = useState(false);

  useEffect(() => {
    const z = lies('ts-dok-zoom');
    if (z && z !== 'passend' && ZOOMS.includes(Number(z))) setZoom(Number(z));
    if (lies('ts-dok-seite') === 'zu') setSeiteOffen(false);
  }, []);
  useEffect(() => {
    const el = flaeche.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => {
      const w = e!.contentRect.width - 64;
      setPassend(Math.max(0.55, Math.min(1.2, w / PAPIER)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [breite, seiteOffen, modus]);
  useEffect(() => {
    if (!schublade) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('.panel-hg')) setSchublade(false);
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [schublade]);

  const primRef = useRef(primaer);
  primRef.current = primaer;
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey) || document.querySelector('.panel-hg')) return;
      const p = primRef.current;
      if (p && !p.disabled && !p.laedt) {
        e.preventDefault();
        p.onClick();
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);

  const z = breite === 'schmal' ? 1 : zoom === 'passend' ? passend : zoom;
  const setzeZoom = (n: number | 'passend') => {
    setZoom(n);
    schreib('ts-dok-zoom', String(n));
  };
  const seiteSichtbar = breite === 'breit' ? seiteOffen : schublade;
  const seiteUmschalten = () => {
    if (breite === 'breit') {
      setSeiteOffen(!seiteOffen);
      schreib('ts-dok-seite', seiteOffen ? 'zu' : 'auf');
    } else setSchublade(!schublade);
  };

  return (
    <div className={`vx dk dk-${breite} ${seiteSichtbar && breite === 'breit' ? 'mit-seite' : ''}`}>
      <header className="dk-leiste">
        <div className="dk-leiste-l">
          <Link href={zurueck.href} className="dk-zurueck" aria-label={`Zurück zu ${zurueck.label}`} title={`Zurück zu ${zurueck.label}`}>
            <Icon name="ArrowLeft" size={17} />
          </Link>
          <div className="dk-titel">{titel}</div>
          {status}
          {speicher}
        </div>
        <div className="dk-leiste-r">
          <Aktionen primaer={primaer} sekundaer={sekundaer} mehr={mehr} />
          <button type="button" className={`dk-seite-k ${seiteSichtbar ? 'an' : ''}`} onClick={seiteUmschalten} aria-expanded={seiteSichtbar} title={seiteSichtbar ? 'Details ausblenden' : 'Details einblenden'}>
            <Icon name={breite === 'breit' ? 'PanelRight' : 'SlidersHorizontal'} size={17} />
            <span className="dk-nur-schmal">Details</span>
          </button>
        </div>
      </header>
      {hinweis}
      <div className="dk-koerper">
        <div className={`dk-flaeche modus-${modus}`} ref={flaeche}>
          <div className="dk-werkzeug" role="toolbar" aria-label="Werkzeuge">
            {rueck && modus === 'bearbeiten' && (
              <div className="dk-rueck" role="group" aria-label="Rückgängig und Wiederherstellen">
                <button type="button" onClick={rueck.zurueck} disabled={!rueck.kannZurueck} title="Rückgängig (⌘Z)" aria-label="Rückgängig">
                  <Icon name="Undo2" size={16} />
                </button>
                <button type="button" onClick={rueck.vor} disabled={!rueck.kannVor} title="Wiederherstellen (⌘⇧Z)" aria-label="Wiederherstellen">
                  <Icon name="Redo2" size={16} />
                </button>
              </div>
            )}
            {modi.length > 1 && (
              <div className="dk-modus" role="radiogroup" aria-label="Ansicht">
                {modi.map((m) => (
                  <button key={m.wert} type="button" role="radio" aria-checked={modus === m.wert} className={modus === m.wert ? 'an' : ''} onClick={() => onModus(m.wert)}>
                    <Icon name={m.wert === 'bearbeiten' ? 'PencilLine' : m.wert === 'pdf' ? 'FileText' : 'Eye'} size={15} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            )}
            {breite !== 'schmal' && modus !== 'kunde' && (
              <Popover
                className="dk-zoom"
                titel="Zoom"
                rechts
                knopf={
                  <span className="num dk-zoom-w">
                    {Math.round(z * 100)} %<Icon name="ChevronDown" size={13} />
                  </span>
                }
              >
                {(zu) => (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setzeZoom('passend');
                        zu();
                      }}
                    >
                      {zoom === 'passend' ? <Icon name="Check" size={15} /> : <span className="dk-pop-leer" />}
                      Passend
                    </button>
                    <div className="dk-pop-trenn" />
                    {ZOOMS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setzeZoom(n);
                          zu();
                        }}
                      >
                        {zoom === n ? <Icon name="Check" size={15} /> : <span className="dk-pop-leer" />}
                        <span className="num">{Math.round(n * 100)} %</span>
                      </button>
                    ))}
                  </>
                )}
              </Popover>
            )}
          </div>
          {fehler ? (
            <div className="dk-meldung">
              <Fehlermeldung text={fehler} />
            </div>
          ) : laedt ? (
            <div className="dk-meldung">
              <Laden text="Dokument lädt …" />
            </div>
          ) : modus === 'bearbeiten' ? (
            <div className="dk-papier-wrap" style={{ ['--z' as string]: z }}>
              {papier}
            </div>
          ) : (
            <div className="dk-vorschau-wrap" style={{ ['--z' as string]: z }}>
              {vorschau}
            </div>
          )}
        </div>
        {breite === 'breit' && seiteOffen && (
          <aside className="dk-seite" aria-label={seitenTitel}>
            {seitenleiste}
          </aside>
        )}
      </div>
      {(primaer || !!mehr?.length) && (
        <div className="dk-unten-wrap">
          <Aktionen primaer={primaer} sekundaer={sekundaer?.slice(0, 1)} mehr={[...(sekundaer?.slice(1) ?? []), ...(mehr ?? [])]} unten />
        </div>
      )}
      {breite !== 'breit' && schublade && (
        <div className="vx dk-schublade-hg" onMouseDown={(e) => e.target === e.currentTarget && setSchublade(false)}>
          <aside className="dk-schublade" role="dialog" aria-modal="true" aria-label={seitenTitel}>
            <header>
              <b>{seitenTitel}</b>
              <button type="button" onClick={() => setSchublade(false)} aria-label="Schliessen">
                <Icon name="X" size={18} />
              </button>
            </header>
            <div className="dk-schublade-inhalt">{seitenleiste}</div>
          </aside>
        </div>
      )}
    </div>
  );
}

export function Abschnitt({ titel, mehr, children, className = '' }: { titel?: string; mehr?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`dk-ab ${className}`}>
      {titel && (
        <h3>
          {titel}
          {mehr && <span>{mehr}</span>}
        </h3>
      )}
      {children}
    </section>
  );
}

/** PDF-Ansicht: dieselbe HTML-Vorlage wie das PDF, isoliert im iframe (Schriften aus /fonts/pdf). */
export function PdfVorschau({ html }: { html: string }) {
  const [hoehe, setHoehe] = useState(1123);
  const rahmen = useRef<HTMLIFrameElement>(null);
  return (
    <div className="dk-papier dk-vorschau-blatt" style={{ height: `calc(${hoehe}px * var(--z, 1))` }}>
      <iframe
        ref={rahmen}
        title="PDF-Vorschau"
        srcDoc={html}
        sandbox="allow-same-origin"
        style={{ height: hoehe }}
        onLoad={() => {
          const d = rahmen.current?.contentDocument;
          if (d) setHoehe(Math.max(1123, d.documentElement.scrollHeight));
        }}
      />
    </div>
  );
}
