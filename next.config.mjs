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
