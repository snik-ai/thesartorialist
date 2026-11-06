// PWA-Manifest des Backends (eigener Scope /admin/, getrennt vom Manifest der Website).
export const dynamic = 'force-static';

export function GET() {
  return new Response(
    JSON.stringify({
      name: 'The Sartorialist — Backend',
      short_name: 'Sartorialist',
      description: 'Termine, Kontakte und Reichweite',
      id: '/admin/',
      start_url: '/admin/',
      scope: '/admin/',
      display: 'standalone',
      background_color: '#101010',
      theme_color: '#101010',
      lang: 'de-CH',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' } },
  );
}
