import { readFileSync } from 'node:fs';

const json = (pfad) => JSON.parse(readFileSync(new URL(pfad, import.meta.url), 'utf8'));

// Alte Sprachversionen der WordPress-Seite (EN, FR, IT, ES, PT, RU, SR, SQ) → passende Seite.
// Erzeugt aus dem URL-Abgleich vom 06.11.2026 (live-crawl.py + redirect-check.py).
// Freigeschaltete Sprachen (lib/i18n/aktive-sprachen.json) haben eigene Seiten mit den alten
// Slugs (lib/i18n/routen.json): Diese URLs liefern 200, übrige Altlasten der Sprache gehen per
// 308 auf die passende Seite derselben Sprache. Nicht freigeschaltete Sprachen → deutsche Seite.
const SPRACHEN = json('./lib/redirects-sprachen.json');
const { _hinweis, ...ROUTEN } = json('./lib/i18n/routen.json');
const AKTIV = json('./lib/i18n/aktive-sprachen.json');
const ALLE = ['en', 'fr', 'it', 'es', 'pt-pt', 'ru', 'sr', 'sq'];
const INAKTIV = ALLE.filter((l) => !AKTIV.includes(l));
const dek = (p) => {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
};
const sprachVon = (p) => p.split('/')[1];
/** Existierende Seiten einer freigeschalteten Sprache (dekodiert) */
const SEITEN = new Set(Object.values(ROUTEN).flatMap((r) => AKTIV.map((l) => r[l]).filter(Boolean)));
const keyVonDe = (de) => Object.keys(ROUTEN).find((k) => ROUTEN[k].de === de);
const zielIn = (l, de) => ROUTEN[keyVonDe(de)]?.[l] ?? de;

const sprachRedirects = [
  ...SPRACHEN.filter((r) => !(AKTIV.includes(sprachVon(r.source)) && SEITEN.has(dek(r.source)))).map((r) => {
    const l = sprachVon(r.source);
    return { source: r.source, destination: AKTIV.includes(l) ? encodeURI(zielIn(l, r.destination)) : r.destination, permanent: true };
  }),
  // WordPress-Technikpfade der freigeschalteten Sprachen → Seiten derselben Sprache
  ...AKTIV.flatMap((l) => [
    { source: `/${l}/author/:path*`, destination: encodeURI(ROUTEN.ueberUns[l]), permanent: true },
    { source: `/${l}/feed/`, destination: `/${l}/`, permanent: true },
    { source: `/${l}/comments/feed/`, destination: `/${l}/`, permanent: true },
    { source: `/${l}/wp-json/:path*`, destination: `/${l}/`, permanent: true },
    { source: `/${l}/category/:kat/page/:n/`, destination: encodeURI(ROUTEN.brands[l]), permanent: true },
  ]),
  // Nicht freigeschaltete Sprachen: alles auf Deutsch
  ...(INAKTIV.length
    ? [
        { source: `/:lang(${INAKTIV.join('|')})/`, destination: '/', permanent: true },
        { source: `/:lang(${INAKTIV.join('|')})/:path*`, destination: '/', permanent: true },
      ]
    : []),
];
const SHOP_HOST = [{ type: 'host', value: 'shop.thesartorialist.ch' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Seit dem Shop (Shopify headless, Warenkorb über Server Actions) läuft die Site
  // als Node-Server: Marketing-Seiten bleiben statisch vorgerendert, Shop-Seiten
  // werden alle 15 Minuten aus Shopify erneuert (ISR). Gleicher Aufbau wie racher.ch.
  output: 'standalone',
  // Projektordner als Wurzel (sonst landet server.js in Worktrees verschachtelt in .next/standalone/…)
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  trailingSlash: true,
  // Mehrere Root-Layouts (je Sprache): unbekannte URLs rendert app/global-not-found.tsx
  experimental: { globalNotFound: true },
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Alte Shop-Subdomain (zeigt nach der DNS-Umstellung auf diese App): alles in den neuen /shop
      { source: '/products/:handle/', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/products/:handle/', permanent: true },
      { source: '/collections/test/', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/woolrich/', permanent: true },
      { source: '/collections/pullover/', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/gran-sasso/', permanent: true },
      { source: '/collections/tramarossa/', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/tramarossa/', permanent: true },
      { source: '/collections/men/', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/herren/', permanent: true },
      { source: '/collections/woman/', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/damen/', permanent: true },
      { source: '/collections/:c/products/:handle/', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/products/:handle/', permanent: true },
      { source: '/:path*', has: SHOP_HOST, destination: 'https://thesartorialist.ch/shop/', permanent: true },

      // Ausgelistete Marken (vorher über public/serve.json beim statischen Export)
      { source: '/jacob-cohen/', destination: '/', permanent: true },
      { source: '/paul-and-shark/', destination: '/', permanent: true },
      // Kollektion entfernt (kein Content): auf die Massanzug-Seite
      { source: '/kollektion/', destination: '/massanzug-zuerich/', permanent: true },
      { source: '/kollektion/:slug/', destination: '/massanzug-zuerich/', permanent: true },
      // Shopify-Pfade unter /shop, falls jemand die Theme-Struktur aufruft
      { source: '/shop/collections/', destination: '/shop/', permanent: true },
      { source: '/shop/collections/all/', destination: '/shop/', permanent: true },
      { source: '/shop/collections/test/', destination: '/shop/woolrich/', permanent: true },
      { source: '/shop/collections/pullover/', destination: '/shop/gran-sasso/', permanent: true },
      { source: '/shop/collections/tramarossa/', destination: '/shop/tramarossa/', permanent: true },
      { source: '/shop/collections/men/', destination: '/shop/herren/', permanent: true },
      { source: '/shop/collections/woman/', destination: '/shop/damen/', permanent: true },
      { source: '/shop/products/', destination: '/shop/', permanent: true },
      { source: '/products/:handle/', destination: '/shop/products/:handle/', permanent: true },

      // Alte WordPress-Seite: Sprachversionen, Feeds, Autoren, Technikpfade
      ...sprachRedirects,
      { source: '/feed/', destination: '/', permanent: true },
      { source: '/comments/feed/', destination: '/', permanent: true },
      { source: '/:path*/feed/', destination: '/:path*/', permanent: true },
      { source: '/author/:path*', destination: '/ueber-uns/', permanent: true },
      { source: '/category/brand/page/:n/', destination: '/category/brand/', permanent: true },
      { source: '/brands/', destination: '/category/brand/', permanent: true },
      { source: '/gimos/', destination: '/category/brand/', permanent: true },
      { source: '/paul-shark/', destination: '/', permanent: true },
      { source: '/home/', destination: '/', permanent: true },
      { source: '/tailoring/', destination: '/massanzug-zuerich/', permanent: true },
      { source: '/wp-json/:path*', destination: '/', permanent: true },
      { source: '/xmlrpc.php', destination: '/', permanent: true },
      { source: '/main-sitemap.xsl', destination: '/sitemap.xml', permanent: true },
      { source: '/locations.kml', destination: '/kontakt/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
