'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Sanfte Scroll-Einblendungen: beobachtet Schlüssel-Elemente und setzt .reveal/.in.
// Respektiert prefers-reduced-motion und läuft bei jedem Routenwechsel neu.
const SELECTOR = [
  '.section-head',
  '.product-card',
  '.split-media',
  '.split-body',
  '.brand-row',
  '.gallery-grid img',
  '.pdp-info',
  '.wizard',
  '.cta-band .container',
].join(', ');

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    for (const el of els) {
      // Bereits sichtbare Elemente nicht doppelt animieren
      if (!el.classList.contains('in')) el.classList.add('reveal');
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
