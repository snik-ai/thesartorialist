// Mahnung: POST { aktion: 'senden', nachricht? } – per E-Mail mit PDF (QR-Zahlteil) in der Sprache der Rechnung.
import { NextResponse } from 'next/server';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { AblaufFehler } from '@/lib/crm/ablauf';
import { mahnungSenden } from '@/lib/crm/mahnung';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const b = await jsonBody(req);
  if (b?.aktion !== 'senden') return fehler('Unbekannte Aktion');
  try {
    const s = await mahnungSenden(id, { adminId: a.s.user.id, nachricht: txt(b.nachricht, 1500) || undefined });
    return NextResponse.json({ ok: true, meldung: `Per E-Mail an ${s.an} gesendet.` });
  } catch (err) {
    if (err instanceof AblaufFehler) return fehler(err.message, err.status);
    throw err;
  }
}
