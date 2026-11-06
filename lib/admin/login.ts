// Anmeldung per E-Mail-Code (Muster VoxCRM module/auth): 6 Stellen, 10 Minuten, einmalig, nur HMAC gespeichert.
// Sperre nach 5 Fehlversuchen für 15 Minuten (offene Codes werden ungültig). Gleiche Antwort für unbekannte E-Mails.
import { and, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { mailBereit, sendeMail } from '@/lib/mail';
import { mailLoginCode } from '@/lib/mail-vorlagen';
import { gleich, hmac, istAdminEmail, sechsStellen, zufallsToken, devCodeErlaubt } from './sicherheit';

export const FEHLVERSUCHE = 5;
const SPERRE_MS = 15 * 60_000;

/** Antwortet frühestens nach `ms` (gleiche Antwortzeit, egal ob es das Konto gibt). */
export async function mindestens<T>(ms: number, arbeit: Promise<T>): Promise<T> {
  const [r] = await Promise.all([arbeit, new Promise((ok) => setTimeout(ok, ms))]);
  return r;
}

async function adminZeile(email: string) {
  const [u] = await db().select().from(schema.adminUser).where(eq(schema.adminUser.email, email)).limit(1);
  if (!u) throw new Error('Admin nicht gefunden');
  return u;
}

export const gesperrt = (u: { gesperrtBis: Date | null }) => Boolean(u.gesperrtBis && u.gesperrtBis > new Date());

/** Legt einen Code an und verschickt ihn. Liefert den Code nur lokal (devCode) zurück. */
export async function codeAnfordern(email: string): Promise<{ devCode?: string; gesperrt?: boolean }> {
  const lc = schema.loginCode;
  await db().delete(lc).where(lt(lc.erstelltAm, new Date(Date.now() - 2 * 86400_000)));
  if (!(await istAdminEmail(email))) {
    // Platzhalter, der nie passt — gleiches Verhalten wie für echte Konten
    await db().insert(lc).values({ email, codeHash: hmac(`platzhalter:${zufallsToken()}`), gueltigBis: new Date(Date.now() + 10 * 60_000) });
    return {};
  }
  // Max. 5 Codes pro Stunde und E-Mail (gegen Mail-Bombing)
  const [{ n }] = await db()
    .select({ n: sql<number>`count(*)::int` })
    .from(lc)
    .where(and(eq(lc.email, email), gt(lc.erstelltAm, new Date(Date.now() - 3600_000))));
  if (n >= (devCodeErlaubt() ? 100 : 5)) return {};
  const u = await adminZeile(email);
  if (gesperrt(u)) return { gesperrt: true };
  const code = sechsStellen();
  await db().update(lc).set({ verbrauchtAm: new Date() }).where(and(eq(lc.email, email), isNull(lc.verbrauchtAm)));
  await db().insert(lc).values({ email, codeHash: hmac(`${email}:${code}`), gueltigBis: new Date(Date.now() + 10 * 60_000) });
  if (mailBereit()) {
    const m = mailLoginCode(code);
    sendeMail({ to: email, subject: m.subject, text: m.text, html: m.html }).catch((e) => console.error('[login] Code-Mail fehlgeschlagen:', (e as Error).message));
  } else if (devCodeErlaubt()) {
    console.log(`[login] Kein Resend konfiguriert — lokaler Code für ${email}: ${code}`);
  } else {
    console.error('[login] Kein Mailversand konfiguriert (RESEND_API_KEY/MAIL_FROM) — Code kann nicht zugestellt werden');
  }
  return devCodeErlaubt() ? { devCode: code } : {};
}

export type PruefErgebnis = { ok: true; adminUserId: string } | { ok: false; status: number; fehler: string };

export async function codePruefen(email: string, code: string): Promise<PruefErgebnis> {
  const lc = schema.loginCode;
  const falsch: PruefErgebnis = { ok: false, status: 400, fehler: 'Der Code stimmt nicht oder ist abgelaufen.' };
  if (!(await istAdminEmail(email))) return falsch;
  const u = await adminZeile(email);
  if (gesperrt(u)) return { ok: false, status: 429, fehler: 'Zu viele falsche Versuche. Warten Sie 15 Minuten und fordern Sie dann einen neuen Code an.' };
  const [c] = await db()
    .select()
    .from(lc)
    .where(and(eq(lc.email, email), isNull(lc.verbrauchtAm), gt(lc.gueltigBis, new Date())))
    .orderBy(desc(lc.erstelltAm))
    .limit(1);
  if (!c) return falsch;
  // Versuch atomar zählen, bevor verglichen wird
  const zug = await db()
    .update(lc)
    .set({ versuche: sql`${lc.versuche} + 1` })
    .where(and(eq(lc.id, c.id), lt(lc.versuche, FEHLVERSUCHE), isNull(lc.verbrauchtAm)))
    .returning({ versuche: lc.versuche });
  if (!zug.length) return falsch;
  if (gleich(c.codeHash, hmac(`${email}:${code}`))) {
    const eingeloest = await db().update(lc).set({ verbrauchtAm: new Date() }).where(and(eq(lc.id, c.id), isNull(lc.verbrauchtAm))).returning({ id: lc.id });
    if (!eingeloest.length) return falsch;
    return { ok: true, adminUserId: u.id };
  }
  const [neu] = await db()
    .update(schema.adminUser)
    .set({ fehlversuche: sql`${schema.adminUser.fehlversuche} + 1` })
    .where(eq(schema.adminUser.id, u.id))
    .returning({ fehlversuche: schema.adminUser.fehlversuche });
  if (neu.fehlversuche >= FEHLVERSUCHE) {
    await db().update(schema.adminUser).set({ gesperrtBis: new Date(Date.now() + SPERRE_MS), fehlversuche: 0 }).where(eq(schema.adminUser.id, u.id));
    await db().update(lc).set({ verbrauchtAm: new Date() }).where(and(eq(lc.email, email), isNull(lc.verbrauchtAm)));
    return { ok: false, status: 429, fehler: 'Zu viele falsche Versuche. Warten Sie 15 Minuten und fordern Sie dann einen neuen Code an.' };
  }
  return falsch;
}
