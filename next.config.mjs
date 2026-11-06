import { readFileSync } from 'node:fs';

// Alte Sprachversionen der WordPress-Seite (EN, FR, IT, ES, PT, RU, SR, SQ) → passende deutsche Seite.
// Erzeugt aus dem URL-Abgleich vom 06.11.2026 (live-crawl.py + redirect-check.py).
const SPRACHEN = JSON.parse(readFileSync(new URL('./lib/redirects-sprachen.json', import.meta.url), 'utf8'));
const LANG = ':lang(en|fr|it|es|pt-pt|ru|sr|sq)';
const SHOP_HOST = [{ type: 'host', value: 'shop.thesartorialist.ch' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Seit dem Shop (Shopify headless, Warenkorb über Server Actions) läuft die Site
  // als Node-Server: Marketing-Seiten bleiben statisch vorgerendert, Shop-Seiten
  // werden alle 15 Minuten aus Shopify erneuert (ISR). Gleicher Aufbau wie racher.ch.
  output: 'standalone',
  trailingSlash: true,
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
      ...SPRACHEN.map((r) => ({ ...r, permanent: true })),
      { source: `/${LANG}/`, destination: '/', permanent: true },
      { source: `/${LANG}/:path*`, destination: '/', permanent: true },
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
