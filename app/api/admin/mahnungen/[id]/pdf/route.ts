// Mahnung (Zahlungserinnerung, 1. oder 2. Mahnung) als A4-PDF mit QR-Zahlteil; ?download=1 lädt herunter.
import { apiAdmin, fehler, UUID } from '@/lib/admin/zugang';
import { mahnungPdfFuer, pdfAntwort } from '@/lib/admin/belege';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const m = await mahnungPdfFuer(id);
  if (!m) return fehler('PDF nicht verfügbar (Mahnung fehlt oder kein Chrome auf dem Server).', 404);
  return pdfAntwort(m.buf, m.datei, new URL(req.url).searchParams.has('download'));
}
