'use client';
// Ratgeber als Fenster (Dialog), global im Seitenrahmen. Öffnet sich über das Event «ts-ratgeber»
// (RatgeberKnopf im CTA-Band, Kontakt-Knopf, Shop). Escape/Klick daneben schliesst, Fokus bleibt im Dialog,
// Seite dahinter scrollt nicht.
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import RatgeberKarte from './RatgeberKarte';
import { useSprache } from '@/components/i18n/SprachKontext';
import { RATGEBER_EVENT } from '@/lib/ratgeber';

export default function RatgeberFenster() {
  const { lang, t: alle } = useSprache();
  const t = alle.ratgeber;
  const [offen, setOffen] = useState(false);
  const [runde, setRunde] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const zuvor = useRef<HTMLElement | null>(null);
  const path = usePathname();

  useEffect(() => {
    const auf = () => {
      zuvor.current = document.activeElement as HTMLElement | null;
      setRunde((r) => r + 1);
      setOffen(true);
    };
    window.addEventListener(RATGEBER_EVENT, auf);
    return () => window.removeEventListener(RATGEBER_EVENT, auf);
  }, []);
  useEffect(() => setOffen(false), [path]);

  useEffect(() => {
    if (!offen) return;
    document.documentElement.classList.add('rg-gesperrt');
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Offene Länderauswahl im Telefon-Feld schliesst zuerst sich selbst
        if ((e.target as HTMLElement)?.closest?.('.tel-laender')) return;
        setOffen(false);
      } else if (e.key === 'Tab' && box.current) {
        const f = Array.from(box.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([tabindex="-1"]), [tabindex="0"]')).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const erst = f[0]!;
        const letzt = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === erst) {
          e.preventDefault();
          letzt.focus();
        } else if (!e.shiftKey && document.activeElement === letzt) {
          e.preventDefault();
          erst.focus();
        }
      }
    };
    document.addEventListener('keydown', taste);
    return () => {
      document.documentElement.classList.remove('rg-gesperrt');
      document.removeEventListener('keydown', taste);
      zuvor.current?.focus?.({ preventScroll: true });
    };
  }, [offen]);

  if (!offen) return null;
  return (
    <div className="rg-fenster" onPointerDown={(e) => e.target === e.currentTarget && setOffen(false)}>
      <div ref={box} className="rg-fenster-box" role="dialog" aria-modal="true" aria-labelledby="rg-fenster-titel">
        <button type="button" className="rg-zu" onClick={() => setOffen(false)} aria-label={t.schliessen}>
          <span aria-hidden="true" />
        </button>
        <RatgeberKarte key={runde} t={t} lang={lang} variante="fenster" autoFokus titelId="rg-fenster-titel" />
      </div>
    </div>
  );
}
