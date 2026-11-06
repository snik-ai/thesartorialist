// Passkeys (Face ID / Touch ID / Windows Hello) mit @simplewebauthn/server — Muster VoxCRM module/passkey.
// Anmeldung über discoverable credentials (ohne E-Mail), Challenges in der DB (5 Min., einmalig).
import { and, eq, gt, isNull, lt } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

export const RP_NAME = 'The Sartorialist Backend';

/** RP-ID: WEBAUTHN_RP_ID (Produktion thesartorialist.ch), lokal «localhost». */
export const rpId = () => process.env.WEBAUTHN_RP_ID?.trim().toLowerCase() || 'localhost';

/** Erlaubte Herkünfte: WEBAUTHN_ORIGIN (kommagetrennt), sonst https://<rpId> bzw. lokal http://localhost:3000. */
export function origins(): string[] {
  const roh = process.env.WEBAUTHN_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  if (roh?.length) return roh;
  return rpId() === 'localhost' ? ['http://localhost:3000'] : [`https://${rpId()}`, `https://www.${rpId()}`];
}

export async function challengeSpeichern(challenge: string, zweck: 'registrierung' | 'anmeldung', adminUserId?: string) {
  const c = schema.passkeyChallenge;
  await db().delete(c).where(lt(c.gueltigBis, new Date(Date.now() - 3600_000)));
  const [r] = await db()
    .insert(c)
    .values({ challenge, zweck, adminUserId: adminUserId ?? null, gueltigBis: new Date(Date.now() + 5 * 60_000) })
    .returning({ id: c.id });
  return r.id;
}

/** Holt eine gültige Challenge und markiert sie als verbraucht. */
export async function challengeVerbrauchen(id: string, zweck: 'registrierung' | 'anmeldung', adminUserId?: string): Promise<string | null> {
  const c = schema.passkeyChallenge;
  const r = await db()
    .update(c)
    .set({ verbrauchtAm: new Date() })
    .where(
      and(eq(c.id, id), eq(c.zweck, zweck), isNull(c.verbrauchtAm), gt(c.gueltigBis, new Date()), adminUserId ? eq(c.adminUserId, adminUserId) : undefined),
    )
    .returning({ challenge: c.challenge });
  return r[0]?.challenge ?? null;
}
