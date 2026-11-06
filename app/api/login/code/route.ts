// Login Schritt 1: Code per E-Mail anfordern. Gleiche Antwort für bekannte und unbekannte Adressen.
import { NextResponse } from 'next/server';
import { dbBereit } from '@/lib/db';
import { codeAnfordern, mindestens } from '@/lib/admin/login';
import { clientIp, herkunftOk } from '@/lib/admin/sicherheit';
import { gedrosselt } from '@/lib/drossel';
import { jsonBody, txt } from '@/lib/admin/zugang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!dbBereit()) return NextResponse.json({ fehler: 'Datenbank nicht konfiguriert' }, { status: 503 });
  if (!herkunftOk(req)) return NextResponse.json({ fehler: 'Ungültige Herkunft' }, { status: 403 });
  if (gedrosselt('login.code', clientIp(req), 20, 15 * 60_000)) return NextResponse.json({ fehler: 'Zu viele Versuche. Bitte warten Sie ein paar Minuten.' }, { status: 429 });
  const b = await jsonBody(req);
  const email = txt(b?.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ fehler: 'Bitte eine gültige E-Mail-Adresse eingeben.' }, { status: 400 });
  const r = await mindestens(400, codeAnfordern(email));
  return NextResponse.json({ ok: true, ...(r.devCode ? { devCode: r.devCode } : {}) });
}
