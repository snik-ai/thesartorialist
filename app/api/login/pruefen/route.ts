// Login Schritt 2: Code prüfen → Sitzung (HttpOnly-Cookie).
import { NextResponse } from 'next/server';
import { dbBereit } from '@/lib/db';
import { codePruefen, mindestens } from '@/lib/admin/login';
import { sitzungAnlegen } from '@/lib/admin/sitzung';
import { clientIp, herkunftOk } from '@/lib/admin/sicherheit';
import { gedrosselt } from '@/lib/drossel';
import { jsonBody, txt } from '@/lib/admin/zugang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!dbBereit()) return NextResponse.json({ fehler: 'Datenbank nicht konfiguriert' }, { status: 503 });
  if (!herkunftOk(req)) return NextResponse.json({ fehler: 'Ungültige Herkunft' }, { status: 403 });
  if (gedrosselt('login.pruefen', clientIp(req), 30, 15 * 60_000)) return NextResponse.json({ fehler: 'Zu viele Versuche. Bitte warten Sie ein paar Minuten.' }, { status: 429 });
  const b = await jsonBody(req);
  const email = txt(b?.email, 200).toLowerCase();
  const code = txt(b?.code, 10).replace(/\s/g, '');
  if (!email || !/^\d{6}$/.test(code)) return NextResponse.json({ fehler: 'Der Code hat 6 Ziffern.' }, { status: 400 });
  const r = await mindestens(300, codePruefen(email, code));
  if (!r.ok) return NextResponse.json({ fehler: r.fehler }, { status: r.status });
  await sitzungAnlegen(r.adminUserId, 'code', req.headers.get('user-agent'));
  return NextResponse.json({ ok: true });
}
