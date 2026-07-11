'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Sanfte Scroll-Einblendungen für Editorial-Blöcke. Kritische Inhalte
// (Produkt-Info, Buchungs-Wizard, Formulare) sind bewusst NICHT dabei —
// sie müssen immer sofort sichtbar sein, unabhängig von JS/Animation.
const SELECTOR = [
  '.section-head',
  '.product-card',
  '.split-media',
  '.split-body',
  '.brand-row',
  '.gallery-grid img',
  '.cta-band .container',
].join(', ');

export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));

    // Reduced motion oder fehlender Observer: nichts verstecken.
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    for (const el of els) {
      if (!el.classList.contains('in')) el.classList.add('reveal');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    for (const el of els) observer.observe(el);

    // Failsafe: sollte der Observer je hängen, nach 1,5 s alles einblenden.
    const failsafe = window.setTimeout(() => {
      for (const el of els) el.classList.add('in');
    }, 1500);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, [pathname]);

  return null;
}
