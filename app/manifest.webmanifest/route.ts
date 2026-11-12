// PWA-Manifest der Website. Bewusst als Route statt app/manifest.ts: Die Datei-Konvention hängt
// ihren <link rel="manifest"> an JEDE Seite, auch ans Backend. Dort überdeckte sie das Backend-Manifest
// (/admin/manifest.webmanifest), und «Zum Home-Bildschirm» öffnete die Startseite statt /admin/.
// Verlinkt wird dieses Manifest nur von den Sprach-Layouts (rahmenMeta).
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  return new Response(
    JSON.stringify({
      name: SITE.name,
      short_name: SITE.shortName,
      description: SITE.description,
      id: '/',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#101010',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' } },
  );
}
