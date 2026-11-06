'use client';

// Kurzfilm zum Konfigurator (stumm, Endlosschleife). Lädt erst, wenn er in Sichtweite
// kommt, spielt nur sichtbar und bleibt bei «Bewegung reduzieren» beim Standbild.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function KonfiguratorFilm({ href = '/massanzug-konfigurator/', label = 'Konfigurator öffnen' }: { href?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLaden(true);
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: '200px 0px', threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="konf-film">
      <Link href={href} className="konf-film-link" aria-label={label}>
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster="/videos/konfigurator-poster.webp"
          width={1600}
          height={900}
          aria-label="Kurzfilm: Massanzug im Konfigurator Styles & Options gestalten"
        >
          {laden && <source src="/videos/konfigurator-16x9.webm" type="video/webm" />}
          {laden && <source src="/videos/konfigurator-16x9.mp4" type="video/mp4" />}
        </video>
        <span className="konf-film-cta">{label} →</span>
      </Link>
    </figure>
  );
}
