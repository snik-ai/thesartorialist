'use client';

import { useRef, useState } from 'react';
import type { ShopImage } from '@/lib/shop/catalog';

function src(url: string, w: number) {
  const u = new URL(url);
  u.searchParams.set('width', String(w));
  return u.toString();
}

/** Produktbilder: Desktop gross mit Thumbnails, mobil wischbar (Scroll-Snap). */
export default function Gallery({ images, title }: { images: ShopImage[]; title: string }) {
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const go = (n: number) => {
    setI(n);
    const el = track.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="spdp-gallery">
      <div
        className="spdp-track"
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          const n = Math.round(el.scrollLeft / el.clientWidth);
          if (n !== i) setI(n);
        }}
      >
        {images.map((im, n) => (
          <div className="spdp-slide" key={im.url}>
            <img
              src={src(im.url, 1000)}
              srcSet={`${src(im.url, 480)} 480w, ${src(im.url, 720)} 720w, ${src(im.url, 1000)} 1000w, ${src(im.url, 1400)} 1400w`}
              sizes="(max-width: 900px) 100vw, 55vw"
              alt={n === 0 ? im.alt : `${title} — Ansicht ${n + 1}`}
              width={im.width}
              height={im.height}
              loading={n === 0 ? 'eager' : 'lazy'}
              fetchPriority={n === 0 ? 'high' : undefined}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="spdp-thumbs" role="tablist" aria-label="Bilder">
          {images.map((im, n) => (
            <button
              key={im.url}
              type="button"
              role="tab"
              aria-selected={i === n}
              aria-label={`Bild ${n + 1}`}
              className={i === n ? 'is-on' : ''}
              onClick={() => go(n)}
            >
              <img src={src(im.url, 160)} alt="" width={80} height={107} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
