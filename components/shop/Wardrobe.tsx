'use client';

// Startseite des Shops: 3D-Kleiderschrank als Hero. Die Szene (three.js) lädt
// erst im Browser nach; bis dahin und ohne WebGL steht ein ruhiges Standbild
// mit denselben Texten. Bedienung: ziehen/wischen, Pfeile, Pfeiltasten, Klick.
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { chf } from '@/lib/shop/format';
import type { Control, Piece } from './WardrobeScene';

const Scene = dynamic(() => import('./WardrobeScene'), { ssr: false });

function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Wardrobe({ pieces, count }: { pieces: Piece[]; count: number }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const ctl = useRef<Control>({ target: 0, pos: 0, touched: 0, dragging: false });
  const drag = useRef<{ x: number; pos: number; moved: number; last: number; t: number; v: number } | null>(null);
  const [can, setCan] = useState(false);
  const [ready, setReady] = useState(false);
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [center, setCenter] = useState(0);

  useEffect(() => {
    setCan(webgl());
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    ctl.current.touched = performance.now();
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '80px' });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  const step = (d: number) => {
    const c = ctl.current;
    c.target = Math.round(c.target) + d;
    c.touched = performance.now();
  };

  const pick = (i: number) => {
    if (drag.current && drag.current.moved > 6) return;
    const n = pieces.length;
    const c = ctl.current;
    const cur = ((Math.round(c.pos) % n) + n) % n;
    if (i === cur) {
      router.push(`/shop/products/${pieces[i].handle}/`);
      return;
    }
    let d = i - cur;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    step(d);
  };

  // Ziehen/Wischen: 1 Stück pro ~ 18 % der Breite, mit Schwung beim Loslassen
  const onDown = (e: React.PointerEvent) => {
    if (!opened) return;
    drag.current = { x: e.clientX, pos: ctl.current.target, moved: 0, last: e.clientX, t: performance.now(), v: 0 };
    ctl.current.touched = performance.now();
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const w = box.current?.clientWidth ?? 1000;
    const per = Math.max(w * 0.18, 120);
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x));
    if (d.moved > 6) {
      ctl.current.dragging = false;
      ctl.current.target = d.pos - (e.clientX - d.x) / per;
      const now = performance.now();
      d.v = (-(e.clientX - d.last) / per / Math.max(now - d.t, 1)) * 1000;
      d.last = e.clientX;
      d.t = now;
    }
    ctl.current.touched = performance.now();
  };
  const onUp = () => {
    const d = drag.current;
    if (d && d.moved > 6) ctl.current.target = Math.round(ctl.current.target + clampV(d.v) * 0.25);
    setTimeout(() => (drag.current = null), 0);
    ctl.current.touched = performance.now();
  };

  const p = pieces[center];

  return (
    <section
      className={`wardrobe${ready ? ' is-ready' : ''}${opened ? ' is-open' : ''}`}
      ref={box}
      aria-roledescription="Karussell"
      aria-label="Der Kleiderschrank — ausgewählte Stücke"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      }}
    >
      <div className="wardrobe-stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
        {can && (
          <Scene
            pieces={pieces}
            ctl={ctl}
            active={active}
            reduced={reduced}
            onCenter={setCenter}
            onPick={pick}
            onOpened={() => setOpened(true)}
            onReady={() => setReady(true)}
          />
        )}
      </div>

      <div className="wardrobe-copy">
        <span className="eyebrow">Shop · The Sartorialist Zürich</span>
        <h1 className="display">Der Kleiderschrank</h1>
        <p>
          {count} ausgewählte Stücke von Woolrich, Gran Sasso und Tramarossa — online bestellen oder im Showroom anprobieren.
        </p>
      </div>

      {p && (
        <div className="wardrobe-card" aria-live="polite">
          <button type="button" className="wardrobe-arrow" onClick={() => step(-1)} aria-label="Vorheriges Stück">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11 7H3m0 0l4-4M3 7l4 4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <Link href={`/shop/products/${p.handle}/`} className="wardrobe-info">
            <span className="wardrobe-brand">{p.brand}</span>
            <span className="wardrobe-title">{p.title}</span>
            <span className="wardrobe-price num">{chf(p.price)} · Ansehen →</span>
          </Link>
          <button type="button" className="wardrobe-arrow" onClick={() => step(1)} aria-label="Nächstes Stück">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      )}
      <a href="#sortiment" className="wardrobe-down">
        Alle {count} Artikel
      </a>
    </section>
  );
}

function clampV(v: number) {
  return Math.max(-6, Math.min(6, v));
}
