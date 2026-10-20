import type { Metadata } from 'next';
import Script from 'next/script';
import { Playfair_Display, Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { JsonLd, organizationSchema, websiteSchema } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import './globals.css';

// Retro-Serif für Display & Wortmarke — passt zur Logotype.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

// Moderne, zeitlose Sans für UI und Fliesstext.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.shortName} — Massanzug & Hochzeitsanzug Zürich`,
    template: `%s — ${SITE.shortName} Zürich`,
  },
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.shortName} — Massanzug & Hochzeitsanzug Zürich`,
    description: SITE.description,
    images: [{ url: '/images/the-sartorialist-zuerich.webp', width: 1500, height: 1000 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.shortName} — Massanzug & Hochzeitsanzug Zürich`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Reveal />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        {/* DLM-Pixel: cookie-freie Reichweitenmessung durch DLM Digital (Vertrag v2). */}
        <Script src="https://dlm-digital.ch/px.js" data-site="the-sartorialist" strategy="afterInteractive" />
      </body>
    </html>
  );
}
