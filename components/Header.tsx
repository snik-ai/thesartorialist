'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Wordmark from './Wordmark';

const NAV_LEFT = [
  { label: 'Kollektion', href: '/kollektion/' },
  { label: 'Massanzug', href: '/massanzug-zuerich/' },
  { label: 'Hochzeitsanzug', href: '/hochzeitsanzug-zuerich/' },
];

const NAV_RIGHT = [
  { label: 'Brands', href: '/category/brand/' },
  { label: 'Über uns', href: '/ueber-uns/' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLink = (item: { label: string; href: string }) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={pathname === item.href ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );

  return (
    <>
      <div className="announce">
        Besuchen Sie unseren Showroom an der Kuttelgasse 7, Zürich.
        <Link href="/termin/">Termin buchen</Link>
      </div>
      <header className={`header${open ? ' open' : ''}`}>
        <div className="header-inner">
          <button
            className="menu-toggle"
            aria-label={open ? 'Menü schliessen' : 'Menü öffnen'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className="header-nav header-nav--left" aria-label="Hauptnavigation links">
            {NAV_LEFT.map(navLink)}
          </nav>
          <Link href="/" className="header-logo" aria-label="The Sartorialist Zürich — Startseite">
            <Wordmark />
          </Link>
          <nav className="header-nav header-nav--right" aria-label="Hauptnavigation rechts">
            {NAV_RIGHT.map(navLink)}
            <Link href="/termin/" className="btn">
              Termin buchen
            </Link>
          </nav>
        </div>
        <nav className="mobile-nav" aria-label="Mobile Navigation">
          {[...NAV_LEFT, ...NAV_RIGHT].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/kontakt/" onClick={() => setOpen(false)}>
            Kontakt
          </Link>
          <Link href="/termin/" className="btn btn--wide" onClick={() => setOpen(false)}>
            Termin buchen
          </Link>
        </nav>
      </header>
    </>
  );
}
