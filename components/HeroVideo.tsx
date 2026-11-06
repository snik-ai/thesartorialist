'use client';

// Film «Create your own Style!» (Vimeo, von thesartorialist.ch) als ruhiger
// Hintergrund im Hero: ohne Ton, Endlosschleife, ohne Bedienelemente und mit
// «dnt» (keine Vimeo-Cookies, kein Tracking). Zuerst steht das Standbild (LCP),
// der Film lädt erst nach dem Seitenaufbau und blendet weich ein. Bei
// «Bewegung reduzieren» oder Datensparmodus bleibt es beim Standbild.
// «Film ansehen» öffnet ihn mit Ton im Vollbild.
import { useEffect, useRef, useState } from 'react';

const ID = '459093662';
const BG = `https://player.vimeo.com/video/${ID}?background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1&quality=1080p`;
const FULL = `https://player.vimeo.com/video/${ID}?autoplay=1&dnt=1&title=0&byline=0&portrait=0&color=ffffff`;

export default function HeroVideo() {
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
    const go = () => setLoad(true);
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (document.readyState === 'complete') {
      ric ? ric(go, { timeout: 2000 }) : setTimeout(go, 800);
    } else {
      const on = () => (ric ? ric(go, { timeout: 2000 }) : setTimeout(go, 800));
      window.addEventListener('load', on, { once: true });
      return () => window.removeEventListener('load', on);
    }
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
      <img
        src="/images/hero-film.webp"
        alt="Uhr als Sinnbild für zeitlosen Stil — aus dem Film von The Sartorialist Zürich"
        className="hero-img hero-img--film"
        width={1920}
        height={1080}
        fetchPriority="high"
      />
      {load && (
        <div className={`hero-video${ready ? ' is-ready' : ''}`} aria-hidden="true">
          <iframe
            src={BG}
            title="Hintergrundfilm The Sartorialist"
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
        Film ansehen <span className="hero-film-len">2:15</span>
      </button>
      {full && (
        <div className="film-modal" role="dialog" aria-modal="true" aria-label="Film «Create your own Style!»" onClick={() => setFull(false)}>
          <button type="button" className="film-close" onClick={() => setFull(false)} aria-label="Film schliessen">
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
