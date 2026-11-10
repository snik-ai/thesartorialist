'use client';
import { melde } from '@/lib/tracking/melden';
// Gratis-Ratgeber «Der passende Anzug»: 3D-Cover + Formular (nur Name + Telefon, Einwilligung WhatsApp/SMS optional).
// Nach dem Absenden: Lead an /api/anfrage/ (art «ratgeber»), PDF lädt sofort, das Cover klappt auf, Danke-Zustand
// mit «Beratungstermin buchen» und WhatsApp. Das PDF kommt auch dann, wenn der Server gerade nicht speichern kann —
// nur bei ungültigen Angaben (400) bleibt das Formular offen.
// Verwendet im Seitenblock (RatgeberBlock), im Fenster (RatgeberFenster) und überall gleich.
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { TelefonFeld } from '@/components/formular/TelefonFeld';
import { Einwilligung } from '@/components/formular/Einwilligung';
import { telefonGueltig } from '@/lib/formular/telefon';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';
import { RATGEBER } from '@/lib/ratgeber';
import { SITE } from '@/lib/site';
import type { ClientTexte } from '@/components/i18n/SprachKontext';
import './ratgeber.css';

export type RatgeberTexte = ClientTexte['ratgeber'];

/** PDF sofort herunterladen bzw. öffnen (gleiche Herkunft → download-Attribut greift). */
function ladeHerunter() {
  const a = document.createElement('a');
  a.href = RATGEBER.pdf;
  a.download = RATGEBER.dateiname;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function RatgeberCover({ t, offen = false, klein = false }: { t: RatgeberTexte; offen?: boolean; klein?: boolean }) {
  const buch = useRef<HTMLDivElement>(null);
  // Leichtes Mitneigen mit der Maus (nur Zeigegeräte mit Hover, nicht bei reduzierter Bewegung)
  useEffect(() => {
    const el = buch.current;
    if (!el || !window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
    const huelle = el.parentElement!;
    let raf = 0;
    const bewegen = (e: PointerEvent) => {
      const r = huelle.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--neig-x', `${(-y * 8).toFixed(2)}deg`);
        el.style.setProperty('--neig-y', `${(x * 14).toFixed(2)}deg`);
      });
    };
    const weg = () => {
      el.style.removeProperty('--neig-x');
      el.style.removeProperty('--neig-y');
    };
    huelle.addEventListener('pointermove', bewegen);
    huelle.addEventListener('pointerleave', weg);
    return () => {
      cancelAnimationFrame(raf);
      huelle.removeEventListener('pointermove', bewegen);
      huelle.removeEventListener('pointerleave', weg);
    };
  }, []);
  return (
    <div className={`rg-buehne${klein ? ' rg-buehne--klein' : ''}`}>
      <div ref={buch} className={`rg-buch${offen ? ' is-offen' : ''}`}>
        <div className="rg-seiten" aria-hidden="true" />
        <div className="rg-innen" aria-hidden="true">
          {offen && <img src={RATGEBER.innen} alt="" width={800} height={1131} decoding="async" />}
        </div>
        <div className="rg-deckel">
          <img src={RATGEBER.cover} alt={t.coverAlt} width={800} height={1131} loading="lazy" decoding="async" />
          <span className="rg-glanz" aria-hidden="true" />
          <span className="rg-ruecken" aria-hidden="true" />
        </div>
      </div>
      <span className="rg-boden" aria-hidden="true" />
    </div>
  );
}

export default function RatgeberKarte({
  t,
  lang,
  variante = 'block',
  autoFokus = false,
  kicker,
  titelId,
}: {
  t: RatgeberTexte;
  lang: Sprache;
  /** block = Seitenblock (Cover links, Formular rechts) · fenster = im Dialog · kompakt = schmale Alternative */
  variante?: 'block' | 'fenster' | 'kompakt';
  autoFokus?: boolean;
  /** anderer Kicker, z. B. «Noch nicht bereit für einen Termin?» */
  kicker?: string;
  /** id der Überschrift (aria-labelledby im Fenster) */
  titelId?: string;
}) {
  const id = useId().replace(/:/g, '');
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [einw, setEinw] = useState(false);
  const [honig, setHonig] = useState('');
  const [busy, setBusy] = useState(false);
  const [fehlerFeld, setFehlerFeld] = useState<'' | 'name' | 'tel'>('');
  const [fehler, setFehler] = useState('');
  const [fertig, setFertig] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const wurzel = useRef<HTMLDivElement>(null);
  const [sichtbar, setSichtbar] = useState(variante === 'fenster');

  // Einblenden, sobald der Block ins Bild kommt (Cover dreht ein, Nutzenpunkte gestaffelt)
  useEffect(() => {
    const el = wurzel.current;
    if (sichtbar || !el) return;
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSichtbar(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setSichtbar(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sichtbar]);

  useEffect(() => {
    if (autoFokus) requestAnimationFrame(() => nameRef.current?.focus({ preventScroll: true }));
  }, [autoFokus]);

  const senden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFehler('');
    if (name.trim().length < 2) {
      setFehlerFeld('name');
      nameRef.current?.focus();
      return;
    }
    if (!telefonGueltig(tel)) {
      setFehlerFeld('tel');
      return;
    }
    setBusy(true);
    let ok = true;
    try {
      const res = await fetch('/api/anfrage/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          art: 'ratgeber',
          name: name.trim(),
          telefon: tel,
          einwilligung: einw,
          einwilligungText: einw ? t.einwilligung : undefined,
          website: honig,
          pfad: window.location.pathname,
          sprache: lang === 'pt-pt' ? 'pt' : lang,
          _dlmsid: (window as Window & { dlmPx?: { sid?: () => string } }).dlmPx?.sid?.(),
        }),
      });
      // Nur ungültige Angaben halten auf; Server-/Netzfehler hindern niemanden am Ratgeber
      if (res.ok) melde('anfrage_ratgeber');
      if (res.status === 400) {
        ok = false;
        const j = (await res.json().catch(() => ({}))) as { fehler?: string };
        setFehler(j.fehler || t.telefon.fehler);
      }
    } catch {
      /* offline o. ä. — Ratgeber trotzdem geben */
    }
    setBusy(false);
    if (!ok) return;
    ladeHerunter();
    setFertig(true);
  };

  // Nach dem Absenden den Danke-Zustand ins Bild holen (der Block wird kürzer)
  useEffect(() => {
    if (!fertig) return;
    if (variante === 'fenster') {
      wurzel.current?.closest('.rg-fenster-box')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = wurzel.current?.querySelector<HTMLElement>('.rg-danke');
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 100 || r.bottom > window.innerHeight) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [fertig, variante]);

  const vorname = name.trim().split(/\s+/)[0] ?? '';
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(t.waText)}`;

  const formular = fertig ? (
    <div className="rg-danke" role="status" aria-live="polite">
      <span className="rg-haken" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="rg-danke-titel">{fmt(t.dankeTitel, { name: vorname })}</p>
      <p className="rg-danke-text">
        {t.dankeText}{' '}
        <a href={RATGEBER.pdf} download={RATGEBER.dateiname} className="rg-link" data-track="ratgeber-pdf">
          {t.dankeLink}
        </a>
      </p>
      <div className="rg-weiter">
        <p className="rg-weiter-titel">{t.weiterTitel}</p>
        <p className="rg-weiter-text">{t.weiterText}</p>
        <div className="rg-weiter-knoepfe">
          <Link href={pfad(lang, 'termin')} className="btn" data-track="ratgeber-termin">
            {t.termin} <span className="arr" aria-hidden="true">→</span>
          </Link>
          <a href={wa} target="_blank" rel="noopener" className="btn btn--ghost rg-wa">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
            </svg>
            {t.whatsapp}
          </a>
        </div>
      </div>
    </div>
  ) : (
    <form className="form-grid rg-form" onSubmit={senden} noValidate data-track="ratgeber" aria-label={t.formTitel}>
      <div className="rg-form-kopf">
        <p className="rg-form-titel">{t.formTitel}</p>
        <p className="rg-form-text">{t.formText}</p>
      </div>
      <div className="feld">
        <label className="feld__label" htmlFor={`${id}-name`}>
          {t.name}
        </label>
        <div className={`feld__huelle${name.trim().length >= 2 ? ' feld__huelle--ok' : ''}`}>
          <input
            ref={nameRef}
            id={`${id}-name`}
            className="feld__eingabe"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            placeholder={t.namePlatzhalter}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fehlerFeld === 'name') setFehlerFeld('');
            }}
            aria-invalid={fehlerFeld === 'name'}
            aria-describedby={fehlerFeld === 'name' ? `${id}-name-f` : undefined}
          />
          <span className="feld__ok" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        </div>
        {fehlerFeld === 'name' && (
          <span className="feld__fehler" id={`${id}-name-f`}>
            {t.fehlerName}
          </span>
        )}
      </div>
      <TelefonFeld
        id={`${id}-tel`}
        t={t.telefon}
        wert={tel}
        setWert={(v) => {
          setTel(v);
          if (fehlerFeld === 'tel') setFehlerFeld('');
        }}
        fehlerAktiv={fehlerFeld === 'tel'}
      />
      <Einwilligung id={`${id}-einw`} an={einw} setAn={setEinw} text={t.einwilligung} hinweis={t.einwilligungHinweis} />
      {/* Honeypot gegen Bots (unsichtbar) */}
      <input
        type="text"
        name="website"
        value={honig}
        onChange={(e) => setHonig(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
      />
      {fehler && <p className="buybox-error">{fehler}</p>}
      <button type="submit" className="btn btn--wide rg-senden" disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
        </svg>
        {busy ? t.sendet : t.senden}
      </button>
      <p className="rg-klein">
        {t.datenschutz}{' '}
        <Link href={pfad(lang, 'datenschutz')} className="rg-link">
          {t.datenschutzLink}
        </Link>
      </p>
    </form>
  );

  return (
    <div ref={wurzel} className={`rg rg--${variante}${sichtbar ? ' is-sichtbar' : ''}${fertig ? ' is-fertig' : ''}`}>
      <div className="rg-medien">
        <RatgeberCover t={t} offen={fertig} klein={variante !== 'block'} />
      </div>
      <div className="rg-inhalt">
        <span className="eyebrow rg-kicker">{kicker ?? t.kicker}</span>
        <h2 className="rg-titel" id={titelId}>
          {t.titel}
        </h2>
        {variante !== 'kompakt' && <p className="rg-unter">{t.untertitel}</p>}
        {variante !== 'kompakt' && (
          <ul className="rg-nutzen">
            {t.nutzen.map((n, i) => (
              <li key={n} style={{ '--i': i } as React.CSSProperties}>
                <span className="rg-nr" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {n}
              </li>
            ))}
          </ul>
        )}
        <p className="rg-umfang">
          {t.umfang}
          {t.sprachHinweis && <span className="rg-sprache"> · {t.sprachHinweis}</span>}
        </p>
        {formular}
      </div>
    </div>
  );
}
