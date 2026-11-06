// Kryptografie-Bausteine für Login und Sitzungen (Muster VoxCRM lib/sicherheit.ts).
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

const DEV_GEHEIMNIS = 'nur-lokal-entwicklung-nie-in-produktion-verwenden-0000';

function geheim() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET fehlt oder ist zu kurz (min. 32 Zeichen)');
  return DEV_GEHEIMNIS;
}

/** HMAC-SHA256 mit SESSION_SECRET — für Codes und Sitzungs-Tokens (nie im Klartext gespeichert). */
export const hmac = (wert: string) => createHmac('sha256', geheim()).update(wert).digest('hex');
export const sha256 = (wert: string) => createHash('sha256').update(wert).digest('hex');
export const zufallsToken = (bytes = 32) => randomBytes(bytes).toString('base64url');
export const sechsStellen = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

export function gleich(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const produktiv = () => process.env.NODE_ENV === 'production';

/** Sitzungs-Cookie: über https mit __Host-Präfix (Secure, Path=/, ohne Domain → keine Subdomain kann es setzen). */
export const SITZUNG_COOKIE = () => (produktiv() ? '__Host-ts_admin' : 'ts_admin');
export const SITZUNG_COOKIE_NAMEN = ['__Host-ts_admin', 'ts_admin'];

/** Login-Code in der API-Antwort nur lokal: nicht in Produktion und nur ohne Mailversand. */
export const devCodeErlaubt = () => !produktiv() && !process.env.RESEND_API_KEY;

/** Darf sich diese E-Mail anmelden? Nur aktive Einträge in admin_user (keine Umgebungsvariable). */
export async function istAdminEmail(email: string): Promise<boolean> {
  const { db, schema } = await import('@/lib/db');
  const { and, eq } = await import('drizzle-orm');
  const [u] = await db()
    .select({ id: schema.adminUser.id })
    .from(schema.adminUser)
    .where(and(eq(schema.adminUser.email, email.trim().toLowerCase()), eq(schema.adminUser.aktiv, true)))
    .limit(1);
  return Boolean(u);
}

/**
 * CSRF-Schutz für schreibende Admin-Anfragen (zusätzlich zu SameSite=Lax): Origin muss die eigene Seite sein.
 * Ohne Origin entscheidet Sec-Fetch-Site (nur same-origin oder fehlend, z. B. curl ohne Cookie der Person).
 */
export function herkunftOk(req: Request): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (origin) {
    try {
      const o = new URL(origin);
      const erlaubt = [process.env.WEBAUTHN_ORIGIN, process.env.APP_URL].filter(Boolean).map((u) => {
        try {
          return new URL(u!).host;
        } catch {
          return null;
        }
      });
      return o.host === host || erlaubt.includes(o.host);
    } catch {
      return false;
    }
  }
  const site = req.headers.get('sec-fetch-site');
  return !site || site === 'same-origin' || site === 'none';
}

/** Client-IP hinter dem Coolify-Proxy (nur für Drosselung, wird nie gespeichert). */
export const clientIp = (req: Request) =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unbekannt';
