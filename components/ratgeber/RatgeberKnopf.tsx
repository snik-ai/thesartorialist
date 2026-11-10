'use client';
// Knopf, der das Ratgeber-Fenster öffnet (CTA-Band, Shop, Kontakt-Knopf). Tracking: cta «ratgeber».
import { RATGEBER_EVENT } from '@/lib/ratgeber';
import './ratgeber.css';

export default function RatgeberKnopf({
  className = 'rg-knopf',
  children,
  track = 'ratgeber',
  tabIndex,
}: {
  className?: string;
  children: React.ReactNode;
  track?: string;
  tabIndex?: number;
}) {
  return (
    <button type="button" data-ratgeber data-track={track} className={className} tabIndex={tabIndex} onClick={() => window.dispatchEvent(new Event(RATGEBER_EVENT))}>
      {children}
    </button>
  );
}

/** Kleines Buch-Symbol für Ratgeber-Knöpfe */
export function RatgeberIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z" />
      <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H18" />
      <path d="M9 8.5h5.5" strokeLinecap="round" />
    </svg>
  );
}
