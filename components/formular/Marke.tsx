'use client';
// Firmenerkennung in den Lead-Formularen (Hausstandard, portiert aus VoxCRM components/formular/Marke.tsx).
// useMarke(email) fragt nach kurzer Tipp-Pause /api/marke/ (eigener Server, nie ein Drittdienst aus dem Browser) und
// liefert Name + Logo der Firma. Freemailer (gmail, bluewin …) und unvollständige Eingaben ergeben nichts, ohne Hinweis
// und ohne Abfrage. Fehler bleiben still: Das Formular funktioniert ohne Erkennung genauso.
import { useEffect, useState } from 'react';
import { firmenDomain, type Marke } from '@/lib/formular/firmen-domain';
import './formular.css';

const gemerkt = new Map<string, Marke | null>();

export interface MarkenSuche {
  /** Abgeleitete Domain (oder null, wenn die Eingabe nichts hergibt) */
  domain: string | null;
  marke: Marke | null;
  /** true, solange für eine gültige Domain noch keine Antwort da ist */
  sucht: boolean;
}

/** Erste brauchbare Domain aus den Eingaben (z. B. Website vor E-Mail). */
export function useMarke(...eingaben: (string | null | undefined)[]): MarkenSuche {
  const domain = eingaben.map(firmenDomain).find(Boolean) ?? null;
  const [stand, setStand] = useState<{ domain: string | null; marke: Marke | null; fertig: boolean }>({ domain: null, marke: null, fertig: true });

  useEffect(() => {
    if (!domain) { setStand({ domain: null, marke: null, fertig: true }); return; }
    if (gemerkt.has(domain)) { setStand({ domain, marke: gemerkt.get(domain) ?? null, fertig: true }); return; }
    setStand({ domain, marke: null, fertig: false });
    const abbruch = new AbortController();
    // Tipp-Pause: erst anfragen, wenn die Eingabe kurz ruht («firma.c» → «firma.ch»)
    const t = setTimeout(async () => {
      let m: Marke | null = null;
      try {
        const r = await fetch(`/api/marke/?d=${encodeURIComponent(domain)}`, { signal: abbruch.signal });
        if (r.ok) m = ((await r.json()) as { marke: Marke | null }).marke;
      } catch { if (abbruch.signal.aborted) return; }
      if (m && m.domain !== domain) m = null;
      gemerkt.set(domain, m);
      setStand({ domain, marke: m, fertig: true });
    }, 550);
    return () => { clearTimeout(t); abbruch.abort(); };
  }, [domain]);

  const aktuell = stand.domain === domain;
  return { domain, marke: aktuell ? stand.marke : null, sucht: Boolean(domain) && (!aktuell || !stand.fertig) };
}

/**
 * Firmenlogo, das seine Kachel ganz ausfüllt (Hausstandard): Die Farbe am Rand des Logos wird zur Kachelfarbe, so wirkt
 * das Logo wie eine App-Kachel statt wie ein kleines Bild in einem weissen Rahmen. Volle Logos (deckende Ecken) füllen die
 * Kachel randlos; Logos mit transparentem Rand sitzen gross auf ihrer eigenen, stark aufgehellten Farbe. Das Bild kommt vom
 * eigenen Server (gleiche Herkunft), daher darf es auf ein Canvas gelesen werden. Rückfall: Anfangsbuchstabe.
 */
export function MarkenLogo({ marke, groesse = 32 }: { marke: Marke; groesse?: number }) {
  const [kaputt, setKaputt] = useState(false);
  const [fuellung, setFuellung] = useState<{ farbe: string; voll: boolean } | null>(null);
  const buchstabe = (marke.name ?? marke.domain).trim().charAt(0).toUpperCase();
  const geladen = (img: HTMLImageElement) => {
    try {
      const n = 16, c = document.createElement('canvas'); c.width = n; c.height = n;
      const ctx = c.getContext('2d', { willReadFrequently: true }); if (!ctx) return;
      ctx.drawImage(img, 0, 0, n, n);
      const d = ctx.getImageData(0, 0, n, n).data;
      const px = (x: number, y: number) => { const i = (y * n + x) * 4; return [d[i]!, d[i + 1]!, d[i + 2]!, d[i + 3]!] as const; };
      const ecken = [px(0, 0), px(n - 1, 0), px(0, n - 1), px(n - 1, n - 1), px(n >> 1, 0), px(0, n >> 1)];
      const deckend = ecken.filter((p) => p[3] > 230);
      if (deckend.length >= 4) {
        const m = [0, 1, 2].map((k) => Math.round(deckend.reduce((s, p) => s + p[k]!, 0) / deckend.length));
        setFuellung({ farbe: `rgb(${m.join(',')})`, voll: true });
        return;
      }
      let r = 0, g = 0, b = 0, w = 0;
      for (let i = 0; i < d.length; i += 4) { const a = d[i + 3]! / 255; r += d[i]! * a; g += d[i + 1]! * a; b += d[i + 2]! * a; w += a; }
      if (w < 1) return;
      const hell = (v: number) => Math.round(v / w + (255 - v / w) * 0.86);
      setFuellung({ farbe: `rgb(${hell(r)},${hell(g)},${hell(b)})`, voll: false });
    } catch { /* Bild nicht lesbar: neutrale Kachel */ }
  };
  return (
    <span className={`marke-logo ${fuellung?.voll ? 'marke-logo--voll' : ''} ${fuellung && !fuellung.voll ? 'marke-logo--getoent' : ''}`}
      style={{ width: groesse, height: groesse, fontSize: groesse * 0.46, ...(fuellung ? { background: fuellung.farbe } : {}) }} aria-hidden="true">
      {marke.icon && !kaputt
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={marke.icon} alt="" width={groesse} height={groesse} decoding="async" onError={() => setKaputt(true)} onLoad={(e) => geladen(e.currentTarget)} />
        : buchstabe}
    </span>
  );
}

/**
 * «Erkannt: Firma · firma.ch» mit Logo und dezentem Gruss – blendet sich weich ein (Logo wird scharf, goldener Lichtstreif).
 * Während der Suche nur ein dezenter Platzhalter, damit nichts springt. Ohne Treffer: nichts.
 */
export type MarkenTexte = { erkannt: string; gruss: string; sucht: string };
export const MARKEN_TEXTE: MarkenTexte = {
  erkannt: 'Erkannt',
  gruss: 'Schön, dass Sie von {name} zu uns finden.',
  sucht: 'Firma wird erkannt …',
};

export function MarkenChip({ suche, t = MARKEN_TEXTE }: { suche: MarkenSuche; t?: MarkenTexte }) {
  const { marke } = suche;
  if (marke) {
    const name = marke.name ?? marke.domain;
    return (
      <div className="marke-chip" role="status" aria-live="polite" key={marke.domain}>
        <MarkenLogo marke={marke} groesse={44} />
        <span className="marke-chip__text">
          <span className="marke-chip__kicker">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            {t.erkannt}<span className="sr">:</span>
          </span>
          <span className="marke-chip__zeile">
            {marke.name && <b>{marke.name}</b>}
            <span className="marke-chip__domain">{marke.domain}</span>
          </span>
          <span className="marke-chip__gruss">{t.gruss.replace('{name}', name)}</span>
        </span>
      </div>
    );
  }
  if (suche.sucht) {
    return (
      <div className="marke-chip marke-chip--sucht" aria-hidden="true">
        <span className="marke-logo marke-logo--leer" />
        <span className="marke-chip__text"><span className="marke-chip__domain">{t.sucht}</span></span>
      </div>
    );
  }
  return null;
}
