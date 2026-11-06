// Passkey-Anmeldung: Optionen (discoverable credentials, ohne E-Mail).
import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { dbBereit } from '@/lib/db';
import { challengeSpeichern, rpId } from '@/lib/admin/passkey';
import { clientIp, herkunftOk } from '@/lib/admin/sicherheit';
import { gedrosselt } from '@/lib/drossel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!dbBereit()) return NextResponse.json({ fehler: 'Datenbank nicht konfiguriert' }, { status: 503 });
  if (!herkunftOk(req)) return NextResponse.json({ fehler: 'Ungültige Herkunft' }, { status: 403 });
  if (gedrosselt('passkey.optionen', clientIp(req), 300, 15 * 60_000)) return NextResponse.json({ fehler: 'Zu viele Versuche.' }, { status: 429 });
  const optionen = await generateAuthenticationOptions({ rpID: rpId(), userVerification: 'required' });
  const vorgangId = await challengeSpeichern(optionen.challenge, 'anmeldung');
  return NextResponse.json({ vorgangId, optionen });
}
