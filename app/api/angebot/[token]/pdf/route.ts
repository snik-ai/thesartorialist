// Öffentlich: Angebot als PDF über den Annahme-Link (nur mit gültigem Token, gedrosselt, noindex)
import { dbBereit } from '@/lib/db';
import { clientIp } from '@/lib/admin/sicherheit';
import { angebotGedrosselt, angebotPerToken } from '@/lib/crm/angebot-oeffentlich';
import { angebotLink, angebotPdfFuer, basisUrl, pdfAntwort } from '@/lib/admin/belege';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!dbBereit()) return new Response('Nicht verfügbar', { status: 503 });
  if (angebotGedrosselt(clientIp(req))) return new Response('Zu viele Anfragen', { status: 429 });
  const { token } = await params;
  const t = await angebotPerToken(token);
  if (!t) return new Response('Nicht gefunden', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  const r = await angebotPdfFuer(t.a.id, t.a.status === 'gesendet' ? angebotLink(basisUrl(req), token) : null);
  if (!r) return new Response('Nicht gefunden', { status: 404 });
  return pdfAntwort(r.buf, r.datei);
}
