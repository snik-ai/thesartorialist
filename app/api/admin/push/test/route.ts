// Test-Benachrichtigung an dieses Gerät (endpoint) oder an alle Geräte der angemeldeten Person.
import { NextResponse } from 'next/server';
import { apiAdmin, jsonBody, txt } from '@/lib/admin/zugang';
import { abosVon, sendePush } from '@/lib/admin/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const endpoint = txt(b?.endpoint, 1000) || undefined;
  const abos = await abosVon(a.s.user.id, endpoint);
  if (!abos.length) return NextResponse.json({ fehler: 'Auf diesem Gerät sind keine Benachrichtigungen aktiv.' }, { status: 404 });
  const z = await sendePush(abos, {
    titel: 'Benachrichtigungen sind aktiv ✓',
    text: 'Sie erhalten jede Terminanfrage und jeden Rückruf sofort auf diesem Gerät.',
    url: '/admin/termine/',
    tag: 'test',
  });
  if (!z.ok) return NextResponse.json({ fehler: 'Der Push-Dienst hat die Nachricht nicht angenommen.', zugestellt: 0 }, { status: 502 });
  return NextResponse.json({ ok: true, zugestellt: z.ok, abgelaufen: z.weg });
}
