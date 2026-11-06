// Passkey einrichten, Schritt 1. Nur in frischer Sitzung (Anmeldung < 10 Min.) oder per Passkey angemeldet:
// ein altes, gestohlenes Cookie allein reicht nicht für einen dauerhaften Zugang.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { db, schema } from '@/lib/db';
import { apiAdmin } from '@/lib/admin/zugang';
import { istFrisch } from '@/lib/admin/sitzung';
import { challengeSpeichern, RP_NAME, rpId } from '@/lib/admin/passkey';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const vorhanden = await db()
    .select({ credentialId: schema.passkey.credentialId, transports: schema.passkey.transports })
    .from(schema.passkey)
    .where(eq(schema.passkey.adminUserId, a.s.user.id));
  if (!istFrisch(a.s) && !(a.s.methode === 'passkey' && vorhanden.length)) {
    return NextResponse.json({ fehler: 'Bitte melden Sie sich neu an, um Face ID einzurichten (Sicherheit).', code: 'bestaetigung_noetig' }, { status: 403 });
  }
  if (vorhanden.length >= 10) return NextResponse.json({ fehler: 'Höchstens 10 Passkeys. Entfernen Sie zuerst einen.' }, { status: 400 });
  const optionen = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rpId(),
    userName: a.s.user.email,
    userDisplayName: a.s.user.name || a.s.user.email,
    userID: new TextEncoder().encode(a.s.user.id),
    attestationType: 'none',
    excludeCredentials: vorhanden.map((p) => ({ id: p.credentialId, transports: (p.transports ?? undefined) as never })),
    authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
  });
  const vorgangId = await challengeSpeichern(optionen.challenge, 'registrierung', a.s.user.id);
  return NextResponse.json({ vorgangId, optionen });
}
