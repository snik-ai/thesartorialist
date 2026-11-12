'use client';

// Film «Create your own Style!» (Vimeo, von thesartorialist.ch) als Hintergrund im Hero:
// ohne Ton, Endlosschleife, ohne Bedienelemente und mit «dnt» (keine Vimeo-Cookies).
// Kein Standbild davor (das alte Uhr-Foto wirkte wie ein Overlay): Der Hero ist dunkel,
// der Film lädt direkt nach dem Seitenaufbau und blendet voll deckend ein.
// Bei «Bewegung reduzieren» oder Datensparmodus bleibt der Hero dunkel.
// «Film ansehen» öffnet ihn mit Ton im Vollbild.
import { useEffect, useRef, useState } from 'react';

const ID = '459093662';
const BG = `https://player.vimeo.com/video/${ID}?background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1&quality=1080p`;
const FULL = `https://player.vimeo.com/video/${ID}?autoplay=1&dnt=1&title=0&byline=0&portrait=0&color=ffffff`;

export type FilmTexte = { bildAlt: string; hintergrund: string; ansehen: string; dialog: string; schliessen: string };

export default function HeroVideo({ t }: { t: FilmTexte }) {
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // Erst einblenden, wenn Vimeo meldet, dass der Film wirklich läuft (sonst bleibt das
  // Standbild — z. B. wenn Vimeo blockiert ist oder eine Fehlerseite zeigt)
  useEffect(() => {
    if (!load) return;
    const on = (e: MessageEvent) => {
      if (!/^https:\/\/player\.vimeo\.com$/.test(e.origin)) return;
      let d: { event?: string; data?: { seconds?: number } } = {};
      try {
        d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (d.event === 'ready') {
        for (const ev of ['timeupdate', 'play']) {
          frame.current?.contentWindow?.postMessage(JSON.stringify({ method: 'addEventListener', value: ev }), 'https://player.vimeo.com');
        }
      }
      if (d.event === 'play' || (d.event === 'timeupdate' && (d.data?.seconds ?? 0) > 0.2)) setReady(true);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [load]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const save = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || save) return;
    // Direkt nach dem Seitenaufbau laden (nicht erst bei der ersten Interaktion),
    // damit der Film sofort läuft; kurz verzögert, damit Text und CSS zuerst stehen.
    let t: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      t = setTimeout(() => setLoad(true), 150);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.removeEventListener('load', go);
      if (t) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!full) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', k);
    document.body.classList.add('sheet-open');
    return () => {
      window.removeEventListener('keydown', k);
      document.body.classList.remove('sheet-open');
    };
  }, [full]);

  return (
    <>
      {load && (
        <div className={`hero-video${ready ? ' is-ready' : ''}`} aria-hidden="true">
          <iframe
            src={BG}
            title={t.hintergrund}
            allow="autoplay; fullscreen; picture-in-picture"
            tabIndex={-1}
            ref={frame}
          />
        </div>
      )}
      <button type="button" className="hero-film-btn" onClick={() => setFull(true)}>
        <span className="hero-film-play" aria-hidden="true">
          <svg width="12" height="14" viewBox="0 0 12 14">
            <path d="M1 1l10 6-10 6z" fill="currentColor" />
          </svg>
        </span>
        {t.ansehen} <span className="hero-film-len">2:15</span>
      </button>
      {full && (
        <div className="film-modal" role="dialog" aria-modal="true" aria-label={t.dialog} onClick={() => setFull(false)}>
          <button type="button" className="film-close" onClick={() => setFull(false)} aria-label={t.schliessen}>
            <span />
            <span />
          </button>
          <div className="film-frame" onClick={(e) => e.stopPropagation()}>
            <iframe src={FULL} title="Create your own Style! — The Sartorialist Zürich" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          </div>
        </div>
      )}
    </>
  );
}
