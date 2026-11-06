// Passkey einrichten, Schritt 2: Antwort prüfen und speichern.
import { NextResponse } from 'next/server';
import { verifyRegistrationResponse, type RegistrationResponseJSON } from '@simplewebauthn/server';
import { db, schema } from '@/lib/db';
import { apiAdmin, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { sitzungAlsPasskey } from '@/lib/admin/sitzung';
import { challengeVerbrauchen, origins, rpId } from '@/lib/admin/passkey';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const vorgangId = typeof b?.vorgangId === 'string' ? b.vorgangId : '';
  const name = txt(b?.name, 60) || 'Passkey';
  if (!UUID.test(vorgangId) || !b?.antwort) return NextResponse.json({ fehler: 'Ungültige Anfrage' }, { status: 400 });
  const challenge = await challengeVerbrauchen(vorgangId, 'registrierung', a.s.user.id);
  if (!challenge) return NextResponse.json({ fehler: 'Die Anfrage ist abgelaufen. Bitte nochmals versuchen.' }, { status: 400 });
  let v;
  try {
    v = await verifyRegistrationResponse({
      response: b.antwort as RegistrationResponseJSON,
      expectedChallenge: challenge,
      expectedOrigin: origins(),
      expectedRPID: rpId(),
      requireUserVerification: true,
    });
  } catch (e) {
    console.warn('[passkey] Registrierung abgelehnt:', (e as Error).message);
    return NextResponse.json({ fehler: 'Der Passkey konnte nicht bestätigt werden.' }, { status: 400 });
  }
  if (!v.verified || !v.registrationInfo) return NextResponse.json({ fehler: 'Der Passkey konnte nicht bestätigt werden.' }, { status: 400 });
  const c = v.registrationInfo.credential;
  const r = await db()
    .insert(schema.passkey)
    .values({
      adminUserId: a.s.user.id,
      credentialId: c.id,
      publicKey: Buffer.from(c.publicKey),
      zaehler: c.counter,
      transports: c.transports ?? null,
      name,
    })
    .onConflictDoNothing()
    .returning({ id: schema.passkey.id });
  if (!r.length) return NextResponse.json({ fehler: 'Dieser Passkey ist schon registriert.' }, { status: 409 });
  await sitzungAlsPasskey(a.s.sitzungId);
  return NextResponse.json({ ok: true, id: r[0].id }, { status: 201 });
}
