// Massblatt (Version) als PDF, mit Vergleich zur Vorversion
import { apiAdmin, fehler, UUID } from '@/lib/admin/zugang';
import { massblattPdfFuer, pdfAntwort } from '@/lib/admin/belege';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const r = await massblattPdfFuer(id);
  if (!r) return fehler('Nicht gefunden', 404);
  return pdfAntwort(r.buf, r.datei, new URL(req.url).searchParams.has('download'));
}
