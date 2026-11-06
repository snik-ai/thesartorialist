import { NextResponse } from 'next/server';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { zusammenfuehren } from '@/lib/crm/kontakte';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const zielId = txt(b?.zielId, 40);
  const quellen = (Array.isArray(b?.quellen) ? b.quellen : [b?.quelleId]).map((x) => txt(x, 40)).filter((x) => UUID.test(x) && x !== zielId).slice(0, 20);
  if (!UUID.test(zielId) || !quellen.length) return fehler('Ungültig');
  try {
    for (const q of quellen) await zusammenfuehren(zielId, q, a.s.user.id);
  } catch (e) {
    return fehler((e as Error).message, 409);
  }
  return NextResponse.json({ ok: true, zielId });
}
