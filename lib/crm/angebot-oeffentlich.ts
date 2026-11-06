// Öffentliche Angebotsseite /angebot/<token>/: nur mit gültigem Token (32 Byte, sha256 in der DB), gedrosselt.
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { gedrosselt } from '@/lib/drossel';
import { aktivitaetLoggen } from './kontakte';
import { tokenHash } from './ablauf';

export const TOKEN_FORM = /^[A-Za-z0-9_-]{43,64}$/;

/** Drosselung je IP: 40 Aufrufe / 10 Minuten (Seite, PDF und Annahme gemeinsam) */
export const angebotGedrosselt = (ip: string) => gedrosselt('angebot', ip, 40, 10 * 60_000);

export async function angebotPerToken(token: string, o: { ansehen?: boolean } = {}) {
  if (!TOKEN_FORM.test(token)) return null;
  const [a] = await db().select().from(schema.angebot).where(eq(schema.angebot.tokenHash, tokenHash(token))).limit(1);
  if (!a || !a.kontaktId || a.status === 'entwurf' || a.status === 'storniert') return null;
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, a.kontaktId)).limit(1);
  if (!k) return null;
  if (o.ansehen) await db().update(schema.angebot).set({ angesehenAm: new Date(), angesehenAnzahl: sql`${schema.angebot.angesehenAnzahl} + 1` }).where(eq(schema.angebot.id, a.id));
  if (o.ansehen && !a.angesehenAm) {
    await aktivitaetLoggen(db(), { kontaktId: k.id, kanal: 'system', richtung: 'ein', titel: `Angebot ${a.nummer} online angesehen`, angebotId: a.id });
  }
  return { a, k };
}
