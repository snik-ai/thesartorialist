'use client';

// Stil-Konfigurator für den Massanzug: Sakko, Hose, Weste und Smoking Detail für
// Detail wählen. Klebende Leiste mit Fortschritt je Kategorie, Karten mit
// Illustration, Details im Dialog, Übersicht mit PDF, Kopieren und Termin.
// Die Auswahl bleibt im Browser gespeichert und geht mit der Terminanfrage mit.
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KONFIG_KATEGORIEN, type KonfigOption, type KonfigUntergruppe } from '@/lib/konfigurator/daten';
import { aufloesen, alsText, optionText, type Gewaehlt } from '@/lib/konfigurator/auswahl';
import { useAuswahl } from '@/lib/konfigurator/useAuswahl';

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

export default function Konfigurator() {
  const { auswahl, waehle: setze, entferne: weg, reset } = useAuswahl();
  const [aktiv, setAktiv] = useState(KONFIG_KATEGORIEN[0].id);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [ueberSicht, setUeberSicht] = useState(false);
  const [pop, setPop] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);


  // Aktive Kategorie in der Leiste mitführen; Übersicht sichtbar → Schwebeleiste aus
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting && e.target.id !== 'uebersicht') setAktiv(e.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    KONFIG_KATEGORIEN.forEach((k) => {
      const el = document.getElementById(k.id);
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

  // Aktiven Tab in der mobilen Leiste sichtbar halten
  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-k="${aktiv}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [aktiv]);

  const waehle = useCallback(
    (u: KonfigUntergruppe, o: KonfigOption) => {
      setze(u, o);
      setPop(o.id);
      setTimeout(() => setPop(null), 450);
    },
    [setze],
  );
  const istGewaehlt = (u: string, o: string) => (auswahl[u] ?? []).includes(o);
  const entferne = (g: Gewaehlt) => weg(g.untergruppeId, g.option.id);

  const items = useMemo(() => aufloesen(auswahl), [auswahl]);
  const fortschritt = (kid: string) => {
    const k = KONFIG_KATEGORIEN.find((x) => x.id === kid)!;
    const done = k.subCategories.filter((u) => (auswahl[u.id] ?? []).length > 0).length;
    return { done, total: k.subCategories.length };
  };

  const pdf = async () => {
    setStatus('PDF wird erstellt …');
    try {
      const { stilPdf } = await import('@/lib/konfigurator/pdf');
      await stilPdf(items);
      setStatus('PDF heruntergeladen');
    } catch {
      setStatus('PDF konnte nicht erstellt werden');
    }
    setTimeout(() => setStatus(null), 3000);
  };
  const kopieren = async () => {
    try {
      await navigator.clipboard.writeText(`Meine Stil-Auswahl — The Sartorialist Zürich\n\n${alsText(items)}\n`);
      setStatus('In die Zwischenablage kopiert');
    } catch {
      setStatus('Kopieren nicht möglich');
    }
    setTimeout(() => setStatus(null), 2500);
  };

  return (
    <>
      <div className="konf-bar" ref={bar}>
        <div className="container konf-bar-row">
          <nav className="konf-tabs" aria-label="Kategorien">
            {KONFIG_KATEGORIEN.map((k, i) => {
              const f = fortschritt(k.id);
              return (
                <a key={k.id} href={`#${k.id}`} data-k={k.id} className={`konf-tab${aktiv === k.id ? ' is-on' : ''}`} aria-current={aktiv === k.id ? 'true' : undefined}>
                  <span className="konf-tab-num num">0{i + 1}</span>
                  {k.title}
                  <span className="konf-tab-prog num" aria-label={`${f.done} von ${f.total} gewählt`}>
                    {f.done}/{f.total}
                  </span>
                  <span className="konf-tab-line" style={{ transform: `scaleX(${f.total ? f.done / f.total : 0})` }} />
                </a>
              );
            })}
          </nav>
          <a href="#uebersicht" className="konf-sum-link">
            <span className="konf-count num" key={items.length}>{items.length}</span>
            <span className="konf-sum-label">Meine Auswahl</span>
          </a>
        </div>
      </div>

      <div className="container konf-body">
        {KONFIG_KATEGORIEN.map((k, ki) => (
          <section key={k.id} id={k.id} className="konf-cat">
            <header className="konf-cat-head">
              <span className="konf-cat-num num">0{ki + 1}</span>
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
                    <div>
                      <h3 className="h3">{u.title}</h3>
                      {u.subtitle && <p className="konf-group-sub">{u.subtitle}</p>}
                    </div>
                    {sel.length > 0 && (
                      <span className="konf-chosen">
                        <Check /> {sel.map((o) => o.label).join(', ')}
                      </span>
                    )}
                  </div>
                  {u.note && <p className="konf-note">{u.note}</p>}
                  <div className="konf-grid">
                    {u.options.map((o) => {
                      const on = istGewaehlt(u.id, o.id);
                      return (
                        <div key={o.id} className={`konf-card${on ? ' is-on' : ''}${pop === o.id ? ' is-pop' : ''}`}>
                          <button type="button" className="konf-card-main" aria-pressed={on} onClick={() => waehle(u, o)}>
                            <span className="konf-card-img">
                              <img src={o.image} alt="" width={240} height={300} loading="lazy" />
                            </span>
                            <span className="konf-card-text">
                              {o.pocketSpec ? (
                                <>
                                  <span className="konf-code">Brust · Seite</span>
                                  <span className="konf-label">
                                    {o.pocketSpec.chest} · {o.pocketSpec.side}
                                  </span>
                                </>
                              ) : (
                                <>
                                  {o.code && <span className="konf-code">{o.code}</span>}
                                  <span className="konf-label">{o.label}</span>
                                </>
                              )}
                            </span>
                            {o.badge && <span className="konf-badge">{o.badge}</span>}
                            <span className="konf-tick" aria-hidden="true">
                              <Check />
                            </span>
                          </button>
                          <button type="button" className="konf-info" aria-label={`Details zu ${o.label}`} onClick={() => setDetail({ kategorieId: k.id, u, o })}>
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

        <section id="uebersicht" className="konf-summary">
          <div className="konf-summary-head">
            <div>
              <span className="eyebrow">Übersicht</span>
              <h2 className="h2">Ihr Massanzug in {items.length} Details</h2>
              <p className="muted">
                Gespeichert in diesem Browser. Stoff und Masse wählen wir gemeinsam im Atelier — dort verfeinern wir jedes Detail.
              </p>
            </div>
            {items.length > 0 && (
              <button type="button" className="linkbtn" onClick={reset}>
                Alles zurücksetzen
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="konf-empty">
              <p className="serif">Noch nichts gewählt.</p>
              <p className="muted">Tippen Sie oben auf Revers, Taschen, Knöpfe und Futter — Ihre Auswahl erscheint hier.</p>
              <a href={`#${KONFIG_KATEGORIEN[0].id}`} className="btn btn--ghost">
                Mit dem Sakko beginnen
              </a>
            </div>
          ) : (
            <>
              {KONFIG_KATEGORIEN.map((k) => {
                const gs = items.filter((g) => g.kategorieId === k.id);
                if (!gs.length) return null;
                return (
                  <div key={k.id} className="konf-sum-group">
                    <p className="konf-sum-cat">{k.title}</p>
                    <ul className="konf-sum-list">
                      {gs.map((g) => (
                        <li key={g.untergruppeId + g.option.id} className="konf-sum-item">
                          <button type="button" className="konf-sum-open" onClick={() => setDetail({ kategorieId: g.kategorieId, u: KONFIG_KATEGORIEN.find((x) => x.id === g.kategorieId)!.subCategories.find((x) => x.id === g.untergruppeId)!, o: g.option })}>
                            <span className="konf-sum-img">
                              <img src={g.option.image} alt="" width={56} height={70} loading="lazy" />
                            </span>
                            <span>
                              <span className="konf-sum-u">{g.untergruppe}</span>
                              <span className="konf-sum-o">{optionText(g)}</span>
                            </span>
                          </button>
                          <button type="button" className="konf-sum-x" aria-label={`${g.option.label} entfernen`} onClick={() => entferne(g)}>
                            <Close />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div className="konf-actions">
                <Link href="/termin/?stil=1" className="btn">
                  Termin mit dieser Auswahl buchen
                </Link>
                <button type="button" className="btn btn--ghost" onClick={pdf}>
                  Als PDF speichern
                </button>
                <button type="button" className="btn btn--ghost" onClick={kopieren}>
                  Text kopieren
                </button>
                <span className="konf-status" aria-live="polite">
                  {status}
                </span>
              </div>
            </>
          )}
        </section>
      </div>

      {items.length > 0 && (
        <a href="#uebersicht" className={`konf-float${ueberSicht ? ' is-hidden' : ''}`} tabIndex={ueberSicht ? -1 : 0}>
          <span className="konf-float-n num">{items.length}</span>
          {items.length === 1 ? 'Detail gewählt' : 'Details gewählt'}
          <span className="konf-float-sep" />
          Zur Übersicht
        </a>
      )}

      {detail && (
        <DetailDialog
          d={detail}
          on={istGewaehlt(detail.u.id, detail.o.id)}
          onToggle={() => waehle(detail.u, detail.o)}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}

function DetailDialog({ d, on, onToggle, onClose }: { d: Detail; on: boolean; onToggle: () => void; onClose: () => void }) {
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
        <button type="button" className="konf-modal-x" onClick={onClose} aria-label="Schliessen" ref={ref}>
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
          {o.code && <p className="konf-code">Code {o.code}</p>}
          {o.badge && <span className="konf-badge konf-badge--static">{o.badge}</span>}
          {o.subLabel && <p className="konf-modal-sub">{o.subLabel}</p>}
          {o.pocketSpec && (
            <p className="konf-modal-sub">
              Brusttasche: {o.pocketSpec.chest}
              <br />
              Seitentaschen: {o.pocketSpec.side}
            </p>
          )}
          {o.description && <p className="konf-modal-desc">{o.description}</p>}
          <button type="button" className={`btn btn--wide${on ? ' btn--ghost' : ''}`} onClick={onToggle}>
            {on ? 'Auswahl entfernen' : 'Dieses Detail wählen'}
          </button>
        </div>
      </div>
    </div>
  );
}
