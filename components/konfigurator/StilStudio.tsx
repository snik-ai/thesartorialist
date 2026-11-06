'use client';

// Stil-Studio: der Massanzug Entscheidung für Entscheidung. Links die grosse
// Illustration der Option, rechts die Auswahl. Antippen wählt und springt zum
// nächsten Schritt; Zurück, Überspringen und die Fortschrittspunkte führen frei
// durch alle Schritte. Läuft eingebettet (Startseite) und im Vollbild (Knopf).
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KONFIG_KATEGORIEN, type KonfigOption } from '@/lib/konfigurator/daten';
import { alsText, aufloesen, optionText } from '@/lib/konfigurator/auswahl';
import { useAuswahl } from '@/lib/konfigurator/useAuswahl';
import { ausgeblendet } from '@/lib/konfigurator/regeln';

type Props = {
  mode: 'inline' | 'full';
  startKategorie?: string;
  startUntergruppe?: string;
  onClose?: () => void;
};

const Pfeil = ({ dir = 1 }: { dir?: 1 | -1 }) => (
  <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={dir < 0 ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.5l2.6 2.5L11 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default function StilStudio({ mode, startKategorie, startUntergruppe, onClose }: Props) {
  const { auswahl, waehle, entferne, reset } = useAuswahl();
  const [ki, setKi] = useState(() => Math.max(0, KONFIG_KATEGORIEN.findIndex((k) => k.id === startKategorie)));
  const kat = KONFIG_KATEGORIEN[ki];
  // Schritte, die zur bisherigen Wahl passen (z. B. kein Zweireiher-Revers beim Einreiher)
  const hidden = useMemo(() => ausgeblendet(auswahl), [auswahl]);
  const gruppen = useMemo(() => kat.subCategories.filter((x) => !hidden.has(x.id)), [kat, hidden]);
  // Aktueller Schritt über die ID der Untergruppe ('sum' = Übersicht), damit er stabil
  // bleibt, wenn sich die sichtbaren Schritte nach einer Wahl ändern
  const [cur, setCur] = useState<string>(() => {
    const vis = kat.subCategories.filter((x) => !ausgeblendet(auswahl).has(x.id));
    if (startUntergruppe && vis.some((x) => x.id === startUntergruppe)) return startUntergruppe;
    return vis.find((x) => !(auswahl[x.id] ?? []).length)?.id ?? 'sum';
  });
  const gruppenRef = useRef(gruppen);
  gruppenRef.current = gruppen;
  const si = (() => {
    if (cur === 'sum') return gruppen.length;
    const i = gruppen.findIndex((x) => x.id === cur);
    if (i >= 0) return i;
    // ausgeblendet: nächster sichtbarer Schritt nach dieser Stelle
    const pos = kat.subCategories.findIndex((x) => x.id === cur);
    const next = kat.subCategories.slice(pos + 1).find((x) => !hidden.has(x.id));
    return next ? gruppen.findIndex((x) => x.id === next.id) : gruppen.length;
  })();
  const [hover, setHover] = useState<KonfigOption | null>(null);
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opts = useRef<HTMLDivElement>(null);

  const steps = gruppen.length;
  const uebersicht = si >= steps; // letzter Schritt: Übersicht
  const u = uebersicht ? null : gruppen[si];
  const items = useMemo(() => aufloesen(auswahl), [auswahl]);
  const gewaehlt = (uid: string, oid: string) => (auswahl[uid] ?? []).includes(oid);
  const fertig = (uid: string) => (auswahl[uid] ?? []).length > 0;
  const katDone = (kid: string) => KONFIG_KATEGORIEN.find((k) => k.id === kid)!.subCategories.filter((x) => !hidden.has(x.id) && fertig(x.id)).length;
  const katTotal = (kid: string) => KONFIG_KATEGORIEN.find((k) => k.id === kid)!.subCategories.filter((x) => !hidden.has(x.id)).length;

  // Vorschau: überfahrene Option, sonst die gewählte, sonst die erste
  const sel = u ? u.options.find((o) => gewaehlt(u.id, o.id)) ?? null : null;
  const preview = hover ?? sel ?? u?.options[0] ?? null;

  const geh = (n: number) => {
    if (timer.current) clearTimeout(timer.current);
    setDir(n >= si ? 1 : -1);
    setHover(null);
    const list = gruppenRef.current;
    const k = Math.max(0, Math.min(list.length, n));
    setCur(k >= list.length ? 'sum' : list[k].id);
    opts.current?.scrollTo({ left: 0, top: 0 });
  };
  const katWechsel = (n: number) => {
    if (timer.current) clearTimeout(timer.current);
    setDir(n >= ki ? 1 : -1);
    setKi(n);
    setCur(KONFIG_KATEGORIEN[n].subCategories.find((x) => !hidden.has(x.id))?.id ?? 'sum');
    setHover(null);
  };
  const tipp = (o: KonfigOption) => {
    if (!u) return;
    const war = gewaehlt(u.id, o.id);
    waehle(u, o);
    if (!war) {
      // kurz zeigen, dann zum Schritt nach dieser Gruppe (Liste kann sich geändert haben)
      if (timer.current) clearTimeout(timer.current);
      const uid = u.id;
      timer.current = setTimeout(() => geh(gruppenRef.current.findIndex((x) => x.id === uid) + 1), 520);
    }
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Tastatur im Vollbild: Pfeile blättern, Escape schliesst
  useEffect(() => {
    if (mode !== 'full') return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') geh(si + 1);
      if (e.key === 'ArrowLeft') geh(si - 1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const pdf = async () => {
    setStatus('PDF wird erstellt …');
    try {
      const { stilPdf } = await import('@/lib/konfigurator/pdf');
      await stilPdf(items);
      setStatus('PDF gespeichert');
    } catch {
      setStatus('PDF konnte nicht erstellt werden');
    }
    setTimeout(() => setStatus(null), 2800);
  };
  const kopieren = async () => {
    try {
      await navigator.clipboard.writeText(`Meine Stil-Auswahl — The Sartorialist Zürich\n\n${alsText(items)}\n`);
      setStatus('Kopiert');
    } catch {
      setStatus('Kopieren nicht möglich');
    }
    setTimeout(() => setStatus(null), 2200);
  };

  const naechsteKat = ki < KONFIG_KATEGORIEN.length - 1 ? KONFIG_KATEGORIEN[ki + 1] : null;

  return (
    <div className={`studio studio--${mode}`}>
      <div className="studio-top">
        <nav className="studio-kats" aria-label="Kleidungsstück">
          {KONFIG_KATEGORIEN.map((k, i) => (
            <button key={k.id} type="button" className={`studio-kat${i === ki ? ' is-on' : ''}`} aria-pressed={i === ki} onClick={() => katWechsel(i)}>
              {k.title}
              <span className="num">
                {katDone(k.id)}/{katTotal(k.id)}
              </span>
            </button>
          ))}
        </nav>
        {mode === 'full' && (
          <button type="button" className="studio-close" onClick={onClose} aria-label="Stil-Studio schliessen">
            <span />
            <span />
          </button>
        )}
      </div>

      <ol className="studio-dots" aria-label={`Schritte ${kat.title}`}>
        {gruppen.map((x, i) => (
          <li key={x.id}>
            <button
              type="button"
              className={`${i === si ? 'is-on' : ''}${fertig(x.id) ? ' is-done' : ''}`}
              aria-label={`${i + 1}. ${x.title}${fertig(x.id) ? ' (gewählt)' : ''}`}
              aria-current={i === si ? 'step' : undefined}
              onClick={() => geh(i)}
            />
          </li>
        ))}
        <li>
          <button type="button" className={`studio-dot-sum${uebersicht ? ' is-on' : ''}`} aria-label="Übersicht" onClick={() => geh(steps)}>
            <Check />
          </button>
        </li>
      </ol>

      {u && preview ? (
        <div className="studio-main" key={`${kat.id}-${u.id}`} data-dir={dir}>
          <div className="studio-stage">
            <div className="studio-stage-img">
              <img key={preview.image} src={preview.image} alt={preview.label} width={480} height={600} />
              {sel && preview.id === sel.id && (
                <span className="studio-stage-tick">
                  <Check /> Gewählt
                </span>
              )}
            </div>
            <div className="studio-stage-text">
              <p className="studio-stage-label">
                {preview.code && <span className="num">{preview.code}</span>}
                {preview.pocketSpec ? `${preview.pocketSpec.chest} · ${preview.pocketSpec.side}` : preview.label}
              </p>
              {preview.description && <p className="studio-stage-desc">{preview.description}</p>}
            </div>
          </div>

          <div className="studio-pick">
            <p className="studio-step num">
              {kat.title} · Schritt {si + 1} von {steps}
            </p>
            <h3 className="studio-q">{u.title}</h3>
            {u.subtitle && <p className="studio-q-sub">{u.subtitle}</p>}
            <div className="studio-opts" ref={opts} role="radiogroup" aria-label={u.title}>
              {u.options.map((o, i) => {
                const on = gewaehlt(u.id, o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`studio-opt${on ? ' is-on' : ''}`}
                    style={{ '--i': i } as React.CSSProperties}
                    onMouseEnter={() => setHover(o)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(o)}
                    onBlur={() => setHover(null)}
                    onClick={() => tipp(o)}
                  >
                    <span className="studio-opt-img">
                      <img src={o.image} alt="" width={120} height={150} loading="lazy" />
                    </span>
                    <span className="studio-opt-text">
                      {o.code && !o.pocketSpec && <span className="studio-opt-code num">{o.code}</span>}
                      <span className="studio-opt-label">{o.pocketSpec ? `${o.pocketSpec.chest} · ${o.pocketSpec.side}` : o.label}</span>
                      {o.badge && <span className="studio-opt-badge">{o.badge}</span>}
                    </span>
                    <span className="studio-opt-tick" aria-hidden="true">
                      <Check />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="studio-nav">
              <button type="button" className="studio-back" onClick={() => geh(si - 1)} disabled={si === 0}>
                <Pfeil dir={-1} /> Zurück
              </button>
              <button type="button" className="studio-skip" onClick={() => geh(si + 1)}>
                {fertig(u.id) ? 'Weiter' : 'Überspringen'} <Pfeil />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="studio-sum" key={`${kat.id}-sum`}>
          <div className="studio-sum-head">
            <div>
              <p className="studio-step">Übersicht</p>
              <h3 className="studio-q">Ihr Massanzug in {items.length} Details</h3>
              <p className="studio-q-sub">Gespeichert in diesem Browser. Stoff und Masse wählen wir gemeinsam im Atelier.</p>
            </div>
            {items.length > 0 && (
              <button type="button" className="linkbtn" onClick={reset}>
                Alles zurücksetzen
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="muted">Noch nichts gewählt — tippen Sie oben auf einen Punkt, um zu beginnen.</p>
          ) : (
            <ul className="studio-sum-list">
              {items.map((g) => (
                <li key={g.untergruppeId + g.option.id}>
                  <button
                    type="button"
                    className="studio-sum-item"
                    onClick={() => {
                      const k = KONFIG_KATEGORIEN.findIndex((x) => x.id === g.kategorieId);
                      setKi(k);
                      setCur(g.untergruppeId);
                    }}
                  >
                    <img src={g.option.image} alt="" width={40} height={50} loading="lazy" />
                    <span>
                      <span className="studio-sum-u">
                        {g.kategorie} · {g.untergruppe}
                      </span>
                      <span className="studio-sum-o">{optionText(g)}</span>
                    </span>
                  </button>
                  <button type="button" className="studio-sum-x" aria-label={`${g.option.label} entfernen`} onClick={() => entferne(g.untergruppeId, g.option.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="studio-sum-actions">
            <Link href="/termin/?stil=1" className="btn" onClick={onClose}>
              Termin mit Auswahl buchen
            </Link>
            {naechsteKat && (
              <button type="button" className="btn btn--ghost" onClick={() => katWechsel(ki + 1)}>
                Weiter mit {naechsteKat.title}
              </button>
            )}
            {items.length > 0 && (
              <>
                <button type="button" className="linkbtn" onClick={pdf}>
                  Als PDF speichern
                </button>
                <button type="button" className="linkbtn" onClick={kopieren}>
                  Text kopieren
                </button>
              </>
            )}
            <span className="studio-status" aria-live="polite">
              {status}
            </span>
          </div>
          <Link href="/massanzug-konfigurator/" className="studio-alllink" onClick={onClose}>
            Alle Details auf einen Blick
          </Link>
        </div>
      )}
    </div>
  );
}
