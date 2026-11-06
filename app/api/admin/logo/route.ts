// Firmenlogo eines Kontakts (über die eigene API geladen, nie direkt vom Browser zu Dritten).
import { apiAdmin } from '@/lib/admin/zugang';
import { clientIp } from '@/lib/admin/sicherheit';
import { gedrosselt } from '@/lib/drossel';
import { ladeLogo, monogramm } from '@/lib/admin/logo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SVG_CSP = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const domain = (new URL(req.url).searchParams.get('domain') ?? '').toLowerCase();
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain) || domain.length > 120) return new Response('Ungültig', { status: 400 });
  const kopf = { 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff' };
  const logo = gedrosselt('logo', clientIp(req), 60, 60_000) ? null : await ladeLogo(domain);
  if (!logo) return new Response(monogramm(domain), { headers: { ...kopf, 'Content-Type': 'image/svg+xml', 'Content-Security-Policy': SVG_CSP } });
  return new Response(new Uint8Array(logo.body), {
    headers: { ...kopf, 'Content-Type': logo.typ, ...(logo.typ === 'image/svg+xml' ? { 'Content-Security-Policy': SVG_CSP } : {}) },
  });
}
