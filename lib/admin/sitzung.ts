// Sitzungen in der DB (nur HMAC des Tokens), HttpOnly-Cookie, absolut 14 Tage, Leerlauf 7 Tage.
import { cookies } from 'next/headers';
import { and, eq, gt, lt } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { hmac, produktiv, SITZUNG_COOKIE, zufallsToken, istAdminEmail } from './sicherheit';

const ABSOLUT_S = 14 * 86400;
const LEERLAUF_MS = 7 * 86400_000;
/** Passkey einrichten nur in frischer Sitzung (Anmeldung vor < 10 Minuten) */
export const FRISCH_MS = 10 * 60_000;

export type AdminSitzung = {
  sitzungId: string;
  methode: 'code' | 'passkey';
  erstelltAm: Date;
  user: { id: string; email: string; name: string | null };
};

export async function sitzungAnlegen(adminUserId: string, methode: 'code' | 'passkey', userAgent: string | null) {
  const jar = await cookies();
  // Rotation: eine bestehende Sitzung dieses Browsers wird beendet
  const alt = jar.get(SITZUNG_COOKIE())?.value;
  if (alt) await db().delete(schema.sitzung).where(eq(schema.sitzung.tokenHash, hmac(alt)));
  // Abgelaufene aufräumen
  await db().delete(schema.sitzung).where(lt(schema.sitzung.gueltigBis, new Date()));
  const token = zufallsToken();
  await db()
    .insert(schema.sitzung)
    .values({
      tokenHash: hmac(token),
      adminUserId,
      methode,
      userAgent: userAgent?.slice(0, 300) ?? null,
      gueltigBis: new Date(Date.now() + ABSOLUT_S * 1000),
    });
  await db().update(schema.adminUser).set({ letzteAnmeldung: new Date(), fehlversuche: 0, gesperrtBis: null }).where(eq(schema.adminUser.id, adminUserId));
  jar.set(SITZUNG_COOKIE(), token, { httpOnly: true, sameSite: 'lax', secure: produktiv(), path: '/', maxAge: ABSOLUT_S });
}

/** Aktuelle Sitzung aus dem Cookie — null, wenn keine, abgelaufen, im Leerlauf oder E-Mail nicht mehr erlaubt. */
export async function aktuelleSitzung(): Promise<AdminSitzung | null> {
  const token = (await cookies()).get(SITZUNG_COOKIE())?.value;
  if (!token || token.length > 100) return null;
  const jetzt = new Date();
  const [z] = await db()
    .select({
      sitzungId: schema.sitzung.id,
      methode: schema.sitzung.methode,
      erstelltAm: schema.sitzung.erstelltAm,
      zuletztAm: schema.sitzung.zuletztAm,
      userId: schema.adminUser.id,
      email: schema.adminUser.email,
      name: schema.adminUser.name,
    })
    .from(schema.sitzung)
    .innerJoin(schema.adminUser, eq(schema.adminUser.id, schema.sitzung.adminUserId))
    .where(and(eq(schema.sitzung.tokenHash, hmac(token)), gt(schema.sitzung.gueltigBis, jetzt)))
    .limit(1);
  if (!z) return null;
  if (jetzt.getTime() - z.zuletztAm.getTime() > LEERLAUF_MS || !(await istAdminEmail(z.email))) {
    await db().delete(schema.sitzung).where(eq(schema.sitzung.id, z.sitzungId));
    return null;
  }
  // Leerlauf-Zeitstempel höchstens alle 5 Minuten schreiben
  if (jetzt.getTime() - z.zuletztAm.getTime() > 5 * 60_000) {
    await db().update(schema.sitzung).set({ zuletztAm: jetzt }).where(eq(schema.sitzung.id, z.sitzungId));
  }
  return { sitzungId: z.sitzungId, methode: z.methode, erstelltAm: z.erstelltAm, user: { id: z.userId, email: z.email, name: z.name } };
}

export async function sitzungBeenden() {
  const jar = await cookies();
  const token = jar.get(SITZUNG_COOKIE())?.value;
  if (token) await db().delete(schema.sitzung).where(eq(schema.sitzung.tokenHash, hmac(token)));
  jar.delete(SITZUNG_COOKIE());
}

/** Nach Passkey-Einrichtung: Sitzung gilt als Passkey-Sitzung. */
export async function sitzungAlsPasskey(sitzungId: string) {
  await db().update(schema.sitzung).set({ methode: 'passkey' }).where(eq(schema.sitzung.id, sitzungId));
}

export const istFrisch = (s: AdminSitzung) => Date.now() - s.erstelltAm.getTime() < FRISCH_MS;
