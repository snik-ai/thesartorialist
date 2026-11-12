// Gemeinsamer Seitenrahmen aller Root-Layouts der öffentlichen Website (Deutsch und
// Fremdsprachen): <html lang>, Header, Footer, schwebende Knöpfe, Warenkorb, Tracking.
// Jede Sprache hat ein eigenes Root-Layout (Routengruppe), damit <html lang> stimmt.
import type { Metadata } from 'next';
import Script from 'next/script';
import Header, { type MenueMarke } from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import CartProvider from '@/components/shop/CartProvider';
import CartDrawer from '@/components/shop/CartDrawer';
import StudioFab from '@/components/konfigurator/StudioFab';
import KontaktFab from '@/components/KontaktFab';
import RatgeberFenster from '@/components/ratgeber/RatgeberFenster';
import SprachKontext from '@/components/i18n/SprachKontext';
import { TRACKING_SKRIPT } from '@/lib/tracking/skript';
import { JsonLd, organizationSchema, websiteSchema } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { schriftKlassen } from '@/lib/fonts';
import { woerterbuch } from '@/lib/i18n';
import { markenFuer, markenPfad } from '@/lib/i18n/inhalte';
import { pfad } from '@/lib/i18n/routen';
import { SPRACH_INFO, type Sprache } from '@/lib/i18n/sprachen';
import { STANDARD_BILD } from '@/lib/i18n/seo';
import '@/app/globals.css';

/** Metadaten des Root-Layouts einer Sprache (Seiten überschreiben Titel, Canonical, OG). */
export function rahmenMeta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).allgemein.meta;
  const titel = lang === 'de' ? `${SITE.shortName} — Massanzug & Hochzeitsanzug Zürich` : t.titelStandard;
  return {
    metadataBase: new URL(SITE.url),
    title: { default: titel, template: t.titelVorlage },
    description: t.beschreibung,
    alternates: { canonical: pfad(lang, 'start') },
    openGraph: {
      type: 'website',
      locale: SPRACH_INFO[lang].og,
      siteName: SITE.name,
      url: `${SITE.url}${pfad(lang, 'start')}`,
      title: titel,
      description: t.beschreibung,
      images: [STANDARD_BILD],
    },
    twitter: { card: 'summary_large_image', title: titel, description: t.beschreibung },
    robots: { index: true, follow: true },
    manifest: '/manifest.webmanifest',
  };
}

export default function SprachRahmen({ lang, children }: { lang: Sprache; children: React.ReactNode }) {
  const t = woerterbuch(lang).allgemein;
  const marken: MenueMarke[] = markenFuer(lang).map((b) => ({
    href: markenPfad(lang, b.slug),
    name: b.name,
    claim: b.claim,
    origin: b.origin,
    hero: b.hero,
  }));
  return (
    <html lang={SPRACH_INFO[lang].html} className={schriftKlassen}>
      <body>
        <SprachKontext lang={lang} t={t.client}>
          <CartProvider>
            <Header marken={marken} />
            <main>{children}</main>
            <Footer lang={lang} />
            <CartDrawer />
            <StudioFab />
            <KontaktFab />
            <RatgeberFenster />
          </CartProvider>
        </SprachKontext>
        <Reveal />
        <JsonLd data={organizationSchema(t.meta.beschreibung)} />
        <JsonLd data={websiteSchema(lang)} />
        {/* DLM-Pixel: cookie-freie Reichweitenmessung durch DLM Digital (Vertrag v2). */}
        <Script src="https://dlm-digital.ch/px.js" data-site="the-sartorialist" strategy="afterInteractive" />
        {/* Eigene, cookielose Messung für das Backend (Besucher, Kontakt-Klicks) — /api/t/ */}
        <Script id="ts-t" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: TRACKING_SKRIPT }} />
      </body>
    </html>
  );
}
