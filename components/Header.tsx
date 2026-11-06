'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BRANDS } from '@/lib/brands';
import { SITE } from '@/lib/site';
import Wordmark from './Wordmark';
import CartButton from './shop/CartButton';

// Reihenfolge laut Kunde: Styles & Options, Stoffe, Massanzug | Hochzeitsanzug, Shop, Brands, Kontakt
// «Stoffe» führt extern auf die Stoffkollektion von Holland & Sherry.
const STOFFE_URL = 'https://apparel.hollandandsherry.com/en/fabric';
const NAV_LEFT = [
  { label: 'Styles & Options', href: '/massanzug-konfigurator/' },
  { label: 'Stoffe', href: STOFFE_URL },
  { label: 'Massanzug', href: '/massanzug-zuerich/' },
];

const NAV_RIGHT = [
  { label: 'Hochzeitsanzug', href: '/hochzeitsanzug-zuerich/' },
  { label: 'Shop', href: '/shop/' },
  { label: 'Brands', href: '/category/brand/' },
  { label: 'Kontakt', href: '/kontakt/' },
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
  const [sub, setSub] = useState<null | 'brands'>(null);
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

  // Mega-Menü «Brands» (Desktop): öffnet beim Überfahren mit kurzer Verzögerung, schliesst
  // beim Verlassen, per Escape oder bei Navigation; per Tastatur über Fokus erreichbar.
  const [mega, setMega] = useState(false);
  const megaT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaOpen = () => {
    if (megaT.current) clearTimeout(megaT.current);
    megaT.current = setTimeout(() => setMega(true), 90);
  };
  const megaClose = () => {
    if (megaT.current) clearTimeout(megaT.current);
    megaT.current = setTimeout(() => setMega(false), 160);
  };
  useEffect(() => setMega(false), [pathname]);
  useEffect(() => {
    if (!mega) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setMega(false);
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [mega]);

  const navLink = (item: { label: string; href: string }) =>
    item.href.startsWith('http') ? (
      <a key={item.href} href={item.href} target="_blank" rel="noopener">
        {item.label}
      </a>
    ) : (
    <Link
      key={item.href}
      href={item.href}
      aria-current={pathname === item.href || (item.href === '/shop/' && pathname.startsWith('/shop')) ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );

  const subItems = SUB_BRANDS;
  const subTitle = 'Brands';

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
            {NAV_RIGHT.map((item) =>
              item.href === '/category/brand/' ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mega-trigger${mega ? ' is-open' : ''}`}
                  aria-expanded={mega}
                  aria-controls="mega-brands"
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onMouseEnter={megaOpen}
                  onMouseLeave={megaClose}
                  onFocus={() => setMega(true)}
                >
                  {item.label}
                </Link>
              ) : (
                navLink(item)
              ),
            )}
            <CartButton />
          </nav>

          <div className="header-cart-m">
            <CartButton />
          </div>

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

        <div
          id="mega-brands"
          className={`mega${mega ? ' is-open' : ''}`}
          onMouseEnter={megaOpen}
          onMouseLeave={megaClose}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setMega(false);
          }}
          aria-hidden={!mega}
        >
          <div className="mega-inner">
            <div className="mega-intro">
              <span className="eyebrow">Brands</span>
              <p className="mega-title">Familiengeführte Manufakturen, persönlich ausgewählt.</p>
              <p className="mega-text">
                Wir arbeiten nur mit Häusern, die wir persönlich kennen — von der neapolitanischen Schneiderei bis zur
                Weberei mit über 200 Jahren Tradition.
              </p>
              <Link href="/category/brand/" className="text-link" tabIndex={mega ? 0 : -1}>
                Alle Brands
              </Link>
              <div className="mega-shop">
                <span>Im Shop</span>
                <Link href="/shop/woolrich/" tabIndex={mega ? 0 : -1}>Woolrich</Link>
                <Link href="/shop/gran-sasso/" tabIndex={mega ? 0 : -1}>Gran Sasso</Link>
                <Link href="/shop/tramarossa/" tabIndex={mega ? 0 : -1}>Tramarossa</Link>
              </div>
            </div>
            <ul className="mega-grid">
              {BRANDS.map((b, i) => (
                <li key={b.slug} style={{ '--i': i } as React.CSSProperties}>
                  <Link href={`/${b.slug}/`} className="mega-card" tabIndex={mega ? 0 : -1}>
                    <span className="mega-img">
                      <img src={b.hero} alt="" width={320} height={200} loading="lazy" />
                    </span>
                    <span className="mega-name">{b.name}</span>
                    <span className="mega-claim">{b.claim}</span>
                    <span className="mega-origin">{b.origin}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
      <div className={`mega-scrim${mega ? ' is-open' : ''}`} aria-hidden="true" onMouseEnter={megaClose} />

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
              <Link className="fs-row" href="/massanzug-konfigurator/" onClick={close}>
                <span className="fs-lbl">Styles & Options</span>
              </Link>
              <a className="fs-row" href={STOFFE_URL} target="_blank" rel="noopener" onClick={close}>
                <span className="fs-lbl">Stoffe</span>
              </a>
              <Link className="fs-row" href="/massanzug-zuerich/" onClick={close}>
                <span className="fs-lbl">Massanzug</span>
              </Link>
              <Link className="fs-row" href="/hochzeitsanzug-zuerich/" onClick={close}>
                <span className="fs-lbl">Hochzeitsanzug</span>
              </Link>
              <Link className="fs-row" href="/shop/" onClick={close}>
                <span className="fs-lbl">Shop</span>
              </Link>
              <button
                type="button"
                className="fs-row"
                aria-haspopup="true"
                onClick={() => setSub('brands')}
              >
                <span className="fs-lbl">Brands</span>
                <span className="fs-arr"><IconArrow /></span>
              </button>
              <Link className="fs-row" href="/kontakt/" onClick={close}>
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
              {subItems.map((item) => (
                <Link key={item.href} className="fs-row fs-row--sm" href={item.href} onClick={close}>
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
