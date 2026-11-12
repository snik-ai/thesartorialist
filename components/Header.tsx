'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site';
import { pfad } from '@/lib/i18n/routen';
import { useSprache } from './i18n/SprachKontext';
import Sprachwahl from './i18n/Sprachwahl';
import Wordmark from './Wordmark';
import CartButton from './shop/CartButton';

// Reihenfolge laut Kunde: Styles & Options, Stoffe, Massanzug | Hochzeitsanzug, Shop, Brands, Kontakt
// «Stoffe» führt extern auf die Stoffkollektion von Holland & Sherry.
// Texte und Links kommen aus der Sprache des Layouts (SprachKontext), die Marken als Props
// (vom Server in die Seitensprache gebracht), damit keine Markentexte im Browser-Bundle landen.
const STOFFE_URL = 'https://apparel.hollandandsherry.com/en/fabric';

/** Marke im Mega-Menü, bereits in der Seitensprache */
export type MenueMarke = { href: string; name: string; claim: string; origin: string; hero: string };

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

export default function Header({ marken }: { marken: MenueMarke[] }) {
  const { lang, t } = useSprache();
  const nav = t.nav;
  const p = {
    start: pfad(lang, 'start'),
    konfigurator: pfad(lang, 'konfigurator'),
    massanzug: pfad(lang, 'massanzug'),
    hochzeitsanzug: pfad(lang, 'hochzeitsanzug'),
    shop: pfad(lang, 'shop'),
    brands: pfad(lang, 'brands'),
    kontakt: pfad(lang, 'kontakt'),
    termin: pfad(lang, 'termin'),
  };
  const NAV_LEFT = [
    { label: nav.stylesOptions, href: p.konfigurator },
    { label: nav.stoffe, href: STOFFE_URL },
    { label: nav.massanzug, href: p.massanzug },
  ];
  const NAV_RIGHT = [
    { label: nav.hochzeitsanzug, href: p.hochzeitsanzug },
    { label: nav.shop, href: p.shop },
    { label: nav.brands, href: p.brands },
    { label: nav.kontakt, href: p.kontakt },
  ];
  const SUB_BRANDS = [...marken.map((b) => ({ label: b.name, href: b.href })), { label: t.header.alleBrands, href: p.brands }];

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

  // Robust gegen Safari (iOS): Ein externer Link (Stoffe, Instagram) öffnet einen neuen Tab und friert
  // diese Seite mitten in der Schliess-Animation ein. Darum externe Links ohne Animation schliessen und
  // beim Zurückkehren (bfcache, Tab-Wechsel) Menü, Unterpanel und Scroll-Sperre hart zurücksetzen.
  const menuRef = useRef<HTMLElement>(null);
  const ohneAnimation = () => {
    const m = menuRef.current;
    if (!m) return;
    m.classList.add('is-instant');
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.remove('is-instant')));
  };
  const schliessenSofort = () => {
    ohneAnimation();
    setOpen(false);
    setSub(null);
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
  };
  const schliessenExtern = () => schliessenSofort();
  useEffect(() => {
    const zurueck = () => {
      if (document.visibilityState === 'hidden') return;
      schliessenSofort();
    };
    const sichtbar = () => document.visibilityState === 'visible' && zurueck();
    window.addEventListener('pageshow', zurueck);
    document.addEventListener('visibilitychange', sichtbar);
    return () => {
      window.removeEventListener('pageshow', zurueck);
      document.removeEventListener('visibilitychange', sichtbar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Öffnen erzwingen: Falls der Zustand nach einem eingefrorenen Tab noch «offen» meldet, die Anzeige
  // aber geschlossen ist, erst sauber schliessen und im nächsten Frame öffnen.
  const oeffnen = () => {
    if (open) {
      schliessenSofort();
      requestAnimationFrame(() => setOpen(true));
      return;
    }
    setOpen(true);
  };

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
      aria-current={pathname === item.href || (item.href === p.shop && pathname.startsWith(p.shop)) ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );

  const subItems = SUB_BRANDS;
  const subTitle = nav.brands;

  return (
    <>
      <div className="announce">
        {t.ankuendigung.text}
        <Link href={p.termin}>{t.ankuendigung.link}</Link>
        <Sprachwahl variante="leiste" />
      </div>

      <header className="header">
        <div className="header-inner">
          <nav className="header-nav header-nav--left" aria-label={t.header.navLinks}>
            {NAV_LEFT.map(navLink)}
          </nav>

          <Link
            href={p.start}
            className="header-logo"
            aria-label={t.startseiteAria}
          >
            <Wordmark alt={t.logoAlt} />
          </Link>

          <nav className="header-nav header-nav--right" aria-label={t.header.navRechts}>
            {NAV_RIGHT.map((item) =>
              item.href === p.brands ? (
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
            aria-label={t.header.menueOeffnen}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={oeffnen}
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
              <span className="eyebrow">{nav.brands}</span>
              <p className="mega-title">{t.header.megaTitel}</p>
              <p className="mega-text">{t.header.megaText}</p>
              <Link href={p.brands} className="text-link" tabIndex={mega ? 0 : -1}>
                {t.header.alleBrands}
              </Link>
              <div className="mega-shop">
                <span>{t.header.imShop}</span>
                <Link href={pfad(lang, 'shop', 'woolrich/')} tabIndex={mega ? 0 : -1}>Woolrich</Link>
                <Link href={pfad(lang, 'shop', 'gran-sasso/')} tabIndex={mega ? 0 : -1}>Gran Sasso</Link>
                <Link href={pfad(lang, 'shop', 'tramarossa/')} tabIndex={mega ? 0 : -1}>Tramarossa</Link>
              </div>
            </div>
            <ul className="mega-grid">
              {marken.map((b, i) => (
                <li key={b.href} style={{ '--i': i } as React.CSSProperties}>
                  <Link href={b.href} className="mega-card" tabIndex={mega ? 0 : -1}>
                    <span className="mega-img">
                      <img src={b.hero} alt={b.name} width={320} height={200} loading="lazy" />
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
        ref={menuRef}
        className={`fs-menu${open ? ' is-open' : ''}${sub ? ' show-sub' : ''}`}
        id="mobile-menu"
        aria-hidden={!open}
        inert={!open}
        aria-label={t.header.mobileNav}
      >
        <div className="fs-top">
          <Link href={p.start} className="fs-logo" aria-label={t.startseiteAria} onClick={close}>
            <Wordmark light alt={t.logoAlt} />
          </Link>
          <button className="fs-close" type="button" aria-label={t.header.menueSchliessen} onClick={close}>
            <span />
            <span />
          </button>
        </div>

        <div className="fs-track">
          {/* Hauptpanel */}
          <div className="fs-panel fs-panel--main">
            <span className="fs-kicker">{t.header.menue}</span>
            <div className="fs-list">
              <Link className="fs-row" href={p.konfigurator} onClick={close}>
                <span className="fs-lbl">{nav.stylesOptions}</span>
              </Link>
              <a className="fs-row" href={STOFFE_URL} target="_blank" rel="noopener" onClick={schliessenExtern}>
                <span className="fs-lbl">{nav.stoffe}</span>
              </a>
              <Link className="fs-row" href={p.massanzug} onClick={close}>
                <span className="fs-lbl">{nav.massanzug}</span>
              </Link>
              <Link className="fs-row" href={p.hochzeitsanzug} onClick={close}>
                <span className="fs-lbl">{nav.hochzeitsanzug}</span>
              </Link>
              <Link className="fs-row" href={p.shop} onClick={close}>
                <span className="fs-lbl">{nav.shop}</span>
              </Link>
              <button
                type="button"
                className="fs-row"
                aria-haspopup="true"
                onClick={() => setSub('brands')}
              >
                <span className="fs-lbl">{nav.brands}</span>
                <span className="fs-arr"><IconArrow /></span>
              </button>
              <Link className="fs-row" href={p.kontakt} onClick={close}>
                <span className="fs-lbl">{nav.kontakt}</span>
              </Link>
            </div>

            <div className="fs-foot">
              <Sprachwahl variante="menue" tabIndex={open ? 0 : -1} />
              <Link href={p.termin} className="btn btn--light btn--wide" onClick={close}>
                {t.header.terminBuchen}
              </Link>
              <div className="fs-contact">
                <a href={SITE.phoneHref}>{SITE.phone}</a>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                <a href={SITE.socials.instagram} target="_blank" rel="noopener" onClick={schliessenExtern}>
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Unterpanel */}
          <div className="fs-panel fs-panel--sub">
            <button type="button" className="fs-back" onClick={() => setSub(null)}>
              <span className="fs-arr"><IconBack /></span>
              {t.header.zurueck}
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
