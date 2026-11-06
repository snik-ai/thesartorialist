'use client';

// Stil-Konfigurator für den Massanzug: Sakko, Hose, Weste und Smoking Detail für
// Detail wählen. Klebende Leiste mit Fortschritt je Kategorie, Karten mit
// Illustration, Details im Dialog, Übersicht mit PDF, Kopieren und Termin.
// Die Auswahl bleibt im Browser gespeichert und geht mit der Terminanfrage mit.
// Texte kommen als Props (t) aus dem Wörterbuch; in Fremdsprachen zusätzlich die
// Überlagerung des Katalogs (uebersetzung) — Deutsch nutzt den Katalog unverändert.
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KONFIG_KATEGORIEN, type KonfigOption, type KonfigUntergruppe } from '@/lib/konfigurator/daten';
import { aufloesen, optionText, zeigeCode, type Gewaehlt } from '@/lib/konfigurator/auswahl';
import { setStoffe, useAuswahl, useStoffe } from '@/lib/konfigurator/useAuswahl';
import { STOFF_LINK } from '@/lib/konfigurator/konst';
import { uebersetzeKatalog } from '@/lib/konfigurator/uebersetzen';
import { fmt, mz } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';
import type { Woerterbuch } from '@/lib/i18n/de';
import type { KonfigUebersetzung } from '@/lib/i18n/de/konfigDaten';

export type KonfigTexte = { ui: Woerterbuch['konfigurator']['ui']; pdf: Woerterbuch['konfigurator']['pdf'] };
type UiTexte = KonfigTexte['ui'];

type Detail = { kategorieId: string; u: KonfigUntergruppe; o: KonfigOption };

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.5l2.6 2.5L11 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const Close = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2.5 2.5l7 7m0-7l-7 7" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);
const Info = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 7v4.2M8 4.6v.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function Konfigurator({
  lang,
  t,
  uebersetzung,
}: {
  lang: Sprache;
  t: KonfigTexte;
  /** Nur in Fremdsprachen: übersetzte Texte je Kategorie/Untergruppe/Option */
  uebersetzung?: KonfigUebersetzung;
}) {
  const ui = t.ui;
  const kats = useMemo(() => uebersetzeKatalog(KONFIG_KATEGORIEN, uebersetzung), [uebersetzung]);
  const { auswahl, waehle: setze, entferne: weg, reset } = useAuswahl();
  const [aktiv, setAktiv] = useState(KONFIG_KATEGORIEN[0].id);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [ueberSicht, setUeberSicht] = useState(false);
  const [pop, setPop] = useState<string | null>(null);
  const [glow, setGlow] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const stoffe = useStoffe();
  const [stoffEingabe, setStoffEingabe] = useState('');
  const stoffDazu = () => {
    // mehrere Nummern auf einmal möglich (Komma, Leerzeichen); Doppelte ignorieren
    const neu = stoffEingabe.split(/[\s,;]+/).map((x) => x.trim().toUpperCase()).filter((x) => /^[A-Z0-9-]{3,14}$/.test(x));
    if (!neu.length) return;
    setStoffe([...new Set([...stoffe, ...neu])].slice(0, 12));
    setStoffEingabe('');
  };


  // Aktive Kategorie in der Leiste mitführen; Übersicht sichtbar → Schwebeleiste aus
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting && e.target.id !== 'uebersicht') setAktiv(e.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    [...KONFIG_KATEGORIEN.map((k) => k.id), 'stoff'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const sum = document.getElementById('uebersicht');
    const io2 = new IntersectionObserver(([e]) => setUeberSicht(e.isIntersecting || e.boundingClientRect.top < 0), { threshold: 0 });
    if (sum) io2.observe(sum);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);


  const waehle = useCallback(
    (u: KonfigUntergruppe, o: KonfigOption) => {
      setze(u, o);
      setPop(o.id);
      setTimeout(() => setPop(null), 450);
      setGlow(false);
      requestAnimationFrame(() => setGlow(true));
      setTimeout(() => setGlow(false), 1300);
    },
    [setze],
  );
  const istGewaehlt = (u: string, o: string) => (auswahl[u] ?? []).includes(o);
  const entferne = (g: Gewaehlt) => weg(g.untergruppeId, g.option.id);

  const items = useMemo(() => aufloesen(auswahl, kats), [auswahl, kats]);
  const fortschritt = (kid: string) => {
    const k = kats.find((x) => x.id === kid)!;
    const done = k.subCategories.filter((u) => (auswahl[u.id] ?? []).length > 0).length;
    return { done, total: k.subCategories.length };
  };

  const pdf = async () => {
    setStatus(ui.pdfLaeuft);
    try {
      const { stilPdf } = await import('@/lib/konfigurator/pdf');
      await stilPdf(items, stoffe, t.pdf, ui.auswahl);
      setStatus(ui.pdfFertig);
    } catch {
      setStatus(ui.pdfFehler);
    }
    setTimeout(() => setStatus(null), 3000);
  };
  const springe = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const off = (document.querySelector('.header')?.getBoundingClientRect().height ?? 0) + (bar.current?.getBoundingClientRect().height ?? 0) + 16;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? 'auto' : 'smooth' });
    setAktiv(id);
    history.replaceState(history.state, '', `#${id}`);
  };
  return (
    <>
      <div className="konf-bar" ref={bar}>
        <div className="container konf-bar-row">
          <nav className="konf-tabs" aria-label={ui.kategorienAria}>
            {kats.map((k) => {
              const f = fortschritt(k.id);
              return (
                <a
                  key={k.id}
                  href={`#${k.id}`}
                  data-k={k.id}
                  className={`konf-tab${aktiv === k.id ? ' is-on' : ''}`}
                  aria-current={aktiv === k.id ? 'true' : undefined}
                  onClick={(e) => {
                    // sofort zur Kategorie, mit Abstand unter Header und Leiste
                    e.preventDefault();
                    springe(k.id);
                  }}
                >
                  <span className="konf-tab-img" aria-hidden="true">
                    <img src={k.subCategories[0].options[0].image} alt="" width={40} height={50} />
                  </span>
                  <span className="konf-tab-label">
                    {k.title}
                  </span>
                  {f.done > 0 && (
                    <span className="konf-tab-prog num" aria-label={fmt(ui.gewaehltAria, { n: f.done })}>
                      {f.done}
                    </span>
                  )}
                </a>
              );
            })}
            <a
              href="#stoff"
              data-k="stoff"
              className={`konf-tab${aktiv === 'stoff' ? ' is-on' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                springe('stoff');
              }}
            >
              <span className="konf-tab-img konf-tab-img--stoff" aria-hidden="true">
                <img src="/images/Holland-Sherry-8-scaled.webp" alt="" width={40} height={48} />
              </span>
              <span className="konf-tab-label">{ui.stoff}</span>
              {stoffe.length > 0 && <span className="konf-tab-prog num">{stoffe.length}</span>}
            </a>
          </nav>
          <a href="#uebersicht" className="konf-sum-link">
            <span className="konf-count num" key={items.length}>{items.length}</span>
            <span className="konf-sum-label">{ui.meineAuswahl}</span>
          </a>
        </div>
      </div>

      <div className="container konf-body">
        {kats.map((k) => (
          <section key={k.id} id={k.id} className="konf-cat">
            <header className="konf-cat-head">
              <div>
                <h2 className="h2">{k.title}</h2>
                <p className="konf-cat-sub">{k.subtitle}</p>
                {k.description && <p className="konf-cat-desc">{k.description}</p>}
              </div>
            </header>

            {k.subCategories.map((u) => {
              const sel = u.options.filter((o) => istGewaehlt(u.id, o.id));
              return (
                <div key={u.id} className="konf-group">
                  <div className="konf-group-head">
                    <h3 className="h3">{u.title}</h3>
                    {u.subtitle && <p className="konf-group-sub">{u.subtitle}</p>}
                  </div>
                  {u.note && <p className="konf-note">{u.note}</p>}
                  <div className={`konf-grid${u.options.length === 5 ? ' konf-grid--5' : ''}`}>
                    {u.options.map((o) => {
                      const on = istGewaehlt(u.id, o.id);
                      return (
                        <div key={o.id} className={`konf-card${on ? ' is-on' : ''}${pop === o.id ? ' is-pop' : ''}`}>
                          <button type="button" className="konf-card-main" aria-pressed={on} onClick={() => waehle(u, o)}>
                            <span className="konf-card-img">
                              <img src={o.image} alt={`${u.title}: ${o.label}`} width={240} height={300} loading="lazy" />
                            </span>
                            <span className="konf-card-text">
                              {o.pocketSpec ? (
                                <>
                                  <span className="konf-code">{ui.brustSeite}</span>
                                  <span className="konf-label">
                                    {o.pocketSpec.chest} · {o.pocketSpec.side}
                                  </span>
                                </>
                              ) : (
                                <>
                                  {zeigeCode(o.code, o.label) && <span className="konf-code">{o.code}</span>}
                                  <span className="konf-label">{o.label}</span>
                                </>
                              )}
                            </span>
                            <span className="konf-tick" aria-hidden="true">
                              <Check />
                            </span>
                          </button>
                          <button type="button" className="konf-info" aria-label={fmt(ui.detailsZu, { label: o.label })} onClick={() => setDetail({ kategorieId: k.id, u, o })}>
                            <Info />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        ))}

        <section id="stoff" className="konf-cat konf-stoff">
          <header className="konf-cat-head">
            <div>
              <h2 className="h2">{ui.stoff}</h2>
              <p className="konf-cat-sub">{ui.stoffSub}</p>
              <p className="konf-cat-desc">{ui.stoffText}</p>
            </div>
          </header>
          <div className="konf-stoff-box">
            <a href={STOFF_LINK} target="_blank" rel="noopener" className="konf-stoff-link">
              <span className="konf-stoff-img">
                <img src="/images/Holland-Sherry-8-scaled.webp" alt={ui.stoffBildAlt} width={480} height={320} loading="lazy" />
              </span>
              <span className="konf-stoff-cta">
                <span className="konf-code">apparel.hollandandsherry.com</span>
                <span className="konf-stoff-title">{ui.stoffAnsehen}</span>
                <span className="konf-stoff-go">
                  {ui.neuesFenster}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 3h6v6M11 3L3 11" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
              </span>
            </a>
            <div className="konf-stoff-form">
              <label className="konf-stoff-field">
                <span className="konf-stoff-kicker">{ui.stoffKicker}</span>
                <span className="konf-stoff-row">
                  <input
                    value={stoffEingabe}
                    onChange={(e) => setStoffEingabe(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        stoffDazu();
                      }
                    }}
                    placeholder={ui.stoffPlatzhalter}
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    aria-label={ui.stoffAria}
                  />
                  <button type="button" className="btn" onClick={stoffDazu} disabled={!stoffEingabe.trim()}>
                    {ui.hinzufuegen}
                  </button>
                </span>
              </label>
              <p className="konf-stoff-hint">{ui.stoffHinweis}</p>
              {stoffe.length > 0 && (
                <ul className="konf-stoff-chips">
                  {stoffe.map((n) => (
                    <li key={n}>
                      <span className="num">{n}</span>
                      <button type="button" aria-label={fmt(ui.stoffEntfernen, { n })} onClick={() => setStoffe(stoffe.filter((x) => x !== n))}>
                        <Close />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section id="uebersicht" className="konf-summary">
          <div className="konf-summary-head">
            <div>
              <span className="eyebrow">{ui.uebersicht}</span>
              <h2 className="h2">{mz(items.length, ui.summaryTitelEins, ui.summaryTitelMehr)}</h2>
              <p className="muted">{ui.summaryText}</p>
            </div>
            {items.length > 0 && (
              <button type="button" className="linkbtn" onClick={reset}>
                {ui.reset}
              </button>
            )}
          </div>

          {stoffe.length > 0 && (
            <div className="konf-sum-group">
              <p className="konf-sum-cat">{ui.stoffGruppe}</p>
              <ul className="konf-sum-list">
                {stoffe.map((n) => (
                  <li key={n} className="konf-sum-item">
                    <a className="konf-sum-open" href={STOFF_LINK} target="_blank" rel="noopener">
                      <span className="konf-sum-img konf-sum-img--stoff">
                        <img src="/images/Holland-Sherry-8-scaled.webp" alt="" width={56} height={70} loading="lazy" />
                      </span>
                      <span>
                        <span className="konf-sum-u">{ui.stoffnummer}</span>
                        <span className="konf-sum-o num">{n}</span>
                      </span>
                    </a>
                    <button type="button" className="konf-sum-x" aria-label={fmt(ui.stoffEntfernen, { n })} onClick={() => setStoffe(stoffe.filter((x) => x !== n))}>
                      <Close />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {items.length === 0 ? (
            <div className="konf-empty">
              <p className="serif">{ui.leerTitel}</p>
              <p className="muted">{ui.leerText}</p>
              <a href={`#${kats[0].id}`} className="btn btn--ghost">
                {ui.leerKnopf}
              </a>
            </div>
          ) : (
            <>
              {kats.map((k) => {
                const gs = items.filter((g) => g.kategorieId === k.id);
                if (!gs.length) return null;
                return (
                  <div key={k.id} className="konf-sum-group">
                    <p className="konf-sum-cat">{k.title}</p>
                    <ul className="konf-sum-list">
                      {gs.map((g) => (
                        <li key={g.untergruppeId + g.option.id} className="konf-sum-item">
                          <button type="button" className="konf-sum-open" onClick={() => setDetail({ kategorieId: g.kategorieId, u: kats.find((x) => x.id === g.kategorieId)!.subCategories.find((x) => x.id === g.untergruppeId)!, o: g.option })}>
                            <span className="konf-sum-img">
                              <img src={g.option.image} alt="" width={56} height={70} loading="lazy" />
                            </span>
                            <span>
                              <span className="konf-sum-u">{g.untergruppe}</span>
                              <span className="konf-sum-o">{optionText(g, ui.auswahl)}</span>
                            </span>
                          </button>
                          <button type="button" className="konf-sum-x" aria-label={fmt(ui.entfernen, { label: g.option.label })} onClick={() => entferne(g)}>
                            <Close />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div className="konf-actions">
                <Link href={`${pfad(lang, 'termin')}?stil=1`} className="btn">
                  {ui.terminKnopf}
                </Link>
                <button type="button" className="btn btn--ghost" onClick={pdf}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  {ui.pdfKnopf}
                </button>
                <span className="konf-status" aria-live="polite">
                  {status}
                </span>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Übersicht immer im Blick: leuchtet bei jeder Wahl auf und führt nach unten */}
      <a href="#uebersicht" className={`konf-dock${ueberSicht ? ' is-hidden' : ''}${glow ? ' is-glow' : ''}`} tabIndex={ueberSicht ? -1 : 0}>
        <span className="konf-dock-n num" key={items.length}>
          {items.length}
        </span>
        <span className="konf-dock-thumbs" aria-hidden="true">
          {items.slice(-4).map((g) => (
            <img key={g.untergruppeId + g.option.id} src={g.option.image} alt="" width={30} height={38} />
          ))}
        </span>
        <span className="konf-dock-text">
          <strong>{items.length === 0 ? ui.dockLeer : mz(items.length, ui.dockEins, ui.dockMehr)}</strong>
          <span>{ui.dockText}</span>
        </span>
        <span className="konf-dock-go">
          {ui.dockGo}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
      </a>

      {detail && (
        <DetailDialog
          d={detail}
          ui={ui}
          on={istGewaehlt(detail.u.id, detail.o.id)}
          onToggle={() => waehle(detail.u, detail.o)}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}

function DetailDialog({ d, ui, on, onToggle, onClose }: { d: Detail; ui: UiTexte; on: boolean; onToggle: () => void; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.classList.add('sheet-open');
    return () => {
      window.removeEventListener('keydown', k);
      document.body.classList.remove('sheet-open');
    };
  }, [onClose]);
  const { u, o } = d;
  return (
    <div className="konf-modal" role="dialog" aria-modal="true" aria-labelledby="konf-modal-title" onClick={onClose}>
      <div className="konf-modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="konf-modal-x" onClick={onClose} aria-label={ui.schliessen} ref={ref}>
          <Close />
        </button>
        <div className="konf-modal-img">
          <img src={o.image} alt={o.label} />
        </div>
        <div className="konf-modal-text">
          <span className="eyebrow">{u.title}</span>
          <h3 id="konf-modal-title" className="serif">
            {o.label}
          </h3>
          {zeigeCode(o.code, o.label) && <p className="konf-code">{fmt(ui.code, { code: o.code ?? '' })}</p>}
          {o.subLabel && <p className="konf-modal-sub">{o.subLabel}</p>}
          {o.pocketSpec && (
            <p className="konf-modal-sub">
              {ui.brusttasche} {o.pocketSpec.chest}
              <br />
              {ui.seitentaschen} {o.pocketSpec.side}
            </p>
          )}
          {o.description && <p className="konf-modal-desc">{o.description}</p>}
          <button type="button" className={`btn btn--wide${on ? ' btn--ghost' : ''}`} onClick={onToggle}>
            {on ? ui.abwaehlen : ui.waehlen}
          </button>
        </div>
      </div>
    </div>
  );
}
