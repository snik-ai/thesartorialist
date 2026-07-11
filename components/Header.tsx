'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BRANDS } from '@/lib/brands';
import { SITE } from '@/lib/site';
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

// Untermenüs für das mobile Fullscreen-Menü (seitlich slidend).
const SUB_KOLLEKTION = [
  { label: 'Alle Anzüge', href: '/kollektion/' },
  { label: 'Massanzug Zürich', href: '/massanzug-zuerich/' },
  { label: 'Hochzeitsanzug Zürich', href: '/hochzeitsanzug-zuerich/' },
  { label: 'Anzug blau', href: '/anzug-blau/' },
  { label: 'Anzug grün', href: '/anzug-gruen/' },
  { label: 'Anzug beige', href: '/anzug-beige/' },
];

const SUB_BRANDS = [
  ...BRANDS.map((b) => ({ label: b.name, href: `/${b.slug}/` })),
  { label: 'Alle Brands', href: '/category/brand/' },
];

function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8m0 0L7 3m4 4l-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconBack() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M11 7H3m0 0l4-4M3 7l4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<null | 'kollektion' | 'brands'>(null);
  const pathname = usePathname();

  // Menü bei Routenwechsel schliessen
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body-Scroll-Lock + ESC-Schliessen; Sub erst nach Schliess-Animation zurück
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    if (!open) {
      const t = setTimeout(() => setSub(null), 550);
      return () => {
        clearTimeout(t);
        document.removeEventListener('keydown', onKey);
      };
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  const navLink = (item: { label: string; href: string }) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={pathname === item.href ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );

  const subItems = sub === 'kollektion' ? SUB_KOLLEKTION : SUB_BRANDS;
  const subTitle = sub === 'kollektion' ? 'Kollektion' : 'Brands';

  return (
    <>
      <div className="announce">
        Besuchen Sie unseren Showroom an der Kuttelgasse 7, Zürich.
        <Link href="/termin/">Termin buchen</Link>
      </div>

      <header className="header">
        <div className="header-inner">
          <nav className="header-nav header-nav--left" aria-label="Hauptnavigation links">
            {NAV_LEFT.map(navLink)}
          </nav>

          <Link
            href="/"
            className="header-logo"
            aria-label="The Sartorialist Zürich — Startseite"
          >
            <Wordmark />
          </Link>

          <nav className="header-nav header-nav--right" aria-label="Hauptnavigation rechts">
            {NAV_RIGHT.map(navLink)}
            <Link href="/termin/" className="btn">
              Termin buchen
            </Link>
          </nav>

          <button
            className="menu-toggle"
            aria-label="Menü öffnen"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <span className="menu-toggle-bx">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {/* Fullscreen-Menü (mobil) — eigene Kopfzeile mit grossem Logo + Close */}
      <nav
        className={`fs-menu${open ? ' is-open' : ''}${sub ? ' show-sub' : ''}`}
        id="mobile-menu"
        aria-hidden={!open}
        aria-label="Mobile Navigation"
      >
        <div className="fs-top">
          <Link href="/" className="fs-logo" aria-label="The Sartorialist Zürich — Startseite" onClick={close}>
            <Wordmark light />
          </Link>
          <button className="fs-close" type="button" aria-label="Menü schliessen" onClick={close}>
            <span />
            <span />
          </button>
        </div>

        <div className="fs-track">
          {/* Hauptpanel */}
          <div className="fs-panel fs-panel--main">
            <span className="fs-kicker">Menü</span>
            <div className="fs-list">
              <button
                type="button"
                className="fs-row"
                aria-haspopup="true"
                onClick={() => setSub('kollektion')}
              >
                <span className="fs-num">01</span>
                <span className="fs-lbl">Kollektion</span>
                <span className="fs-arr"><IconArrow /></span>
              </button>
              <Link className="fs-row" href="/massanzug-zuerich/" onClick={close}>
                <span className="fs-num">02</span>
                <span className="fs-lbl">Massanzug</span>
              </Link>
              <Link className="fs-row" href="/hochzeitsanzug-zuerich/" onClick={close}>
                <span className="fs-num">03</span>
                <span className="fs-lbl">Hochzeitsanzug</span>
              </Link>
              <button
                type="button"
                className="fs-row"
                aria-haspopup="true"
                onClick={() => setSub('brands')}
              >
                <span className="fs-num">04</span>
                <span className="fs-lbl">Brands</span>
                <span className="fs-arr"><IconArrow /></span>
              </button>
              <Link className="fs-row" href="/ueber-uns/" onClick={close}>
                <span className="fs-num">05</span>
                <span className="fs-lbl">Über uns</span>
              </Link>
              <Link className="fs-row" href="/services/" onClick={close}>
                <span className="fs-num">06</span>
                <span className="fs-lbl">Services</span>
              </Link>
              <Link className="fs-row" href="/kontakt/" onClick={close}>
                <span className="fs-num">07</span>
                <span className="fs-lbl">Kontakt</span>
              </Link>
            </div>

            <div className="fs-foot">
              <Link href="/termin/" className="btn btn--light btn--wide" onClick={close}>
                Termin buchen
              </Link>
              <div className="fs-contact">
                <a href={SITE.phoneHref}>{SITE.phone}</a>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                <a href={SITE.socials.instagram} target="_blank" rel="noopener">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Unterpanel */}
          <div className="fs-panel fs-panel--sub">
            <button type="button" className="fs-back" onClick={() => setSub(null)}>
              <span className="fs-arr"><IconBack /></span>
              Zurück
            </button>
            <span className="fs-kicker">{subTitle}</span>
            <div className="fs-list">
              {subItems.map((item, i) => (
                <Link key={item.href} className="fs-row fs-row--sm" href={item.href} onClick={close}>
                  <span className="fs-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="fs-lbl">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
