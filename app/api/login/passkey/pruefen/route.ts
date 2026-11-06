// Passkey-Anmeldung prüfen → Sitzung.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from '@simplewebauthn/server';
import { db, dbBereit, schema } from '@/lib/db';
import { challengeVerbrauchen, origins, rpId } from '@/lib/admin/passkey';
import { sitzungAnlegen } from '@/lib/admin/sitzung';
import { gesperrt } from '@/lib/admin/login';
import { clientIp, herkunftOk, istAdminEmail } from '@/lib/admin/sicherheit';
import { gedrosselt } from '@/lib/drossel';
import { jsonBody, UUID } from '@/lib/admin/zugang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const nein = (fehler = 'Anmeldung mit Passkey fehlgeschlagen.', status = 400) => NextResponse.json({ fehler }, { status });

export async function POST(req: Request) {
  if (!dbBereit()) return nein('Datenbank nicht konfiguriert', 503);
  if (!herkunftOk(req)) return nein('Ungültige Herkunft', 403);
  if (gedrosselt('passkey.pruefen', clientIp(req), 40, 15 * 60_000)) return nein('Zu viele Versuche.', 429);
  const b = await jsonBody(req);
  const vorgangId = typeof b?.vorgangId === 'string' ? b.vorgangId : '';
  const antwort = b?.antwort as AuthenticationResponseJSON | undefined;
  if (!UUID.test(vorgangId) || !antwort || typeof antwort.id !== 'string' || antwort.id.length > 1500) return nein();
  const challenge = await challengeVerbrauchen(vorgangId, 'anmeldung');
  if (!challenge) return nein('Die Anfrage ist abgelaufen. Bitte nochmals versuchen.');

  const [p] = await db()
    .select({
      id: schema.passkey.id,
      credentialId: schema.passkey.credentialId,
      publicKey: schema.passkey.publicKey,
      zaehler: schema.passkey.zaehler,
      transports: schema.passkey.transports,
      userId: schema.adminUser.id,
      email: schema.adminUser.email,
      gesperrtBis: schema.adminUser.gesperrtBis,
    })
    .from(schema.passkey)
    .innerJoin(schema.adminUser, eq(schema.adminUser.id, schema.passkey.adminUserId))
    .where(eq(schema.passkey.credentialId, antwort.id))
    .limit(1);
  if (!p) return nein('Dieser Passkey ist nicht (mehr) registriert.');
  if (!istAdminEmail(p.email)) return nein('Kein Zugang (mehr) für diese Person.', 403);
  if (gesperrt(p)) return nein('Zugang vorübergehend gesperrt.', 429);

  let v;
  try {
    v = await verifyAuthenticationResponse({
      response: antwort,
      expectedChallenge: challenge,
      expectedOrigin: origins(),
      expectedRPID: rpId(),
      credential: {
        id: p.credentialId,
        publicKey: new Uint8Array(p.publicKey),
        counter: Number(p.zaehler),
        transports: (p.transports ?? undefined) as never,
      },
      requireUserVerification: true,
    });
  } catch (e) {
    console.warn('[passkey] Anmeldung abgelehnt:', (e as Error).message);
    return nein();
  }
  if (!v.verified) return nein();
  await db().update(schema.passkey).set({ zaehler: v.authenticationInfo.newCounter, zuletztBenutzt: new Date() }).where(eq(schema.passkey.id, p.id));
  await sitzungAnlegen(p.userId, 'passkey', req.headers.get('user-agent'));
  return NextResponse.json({ ok: true, passkeyId: p.id });
}
