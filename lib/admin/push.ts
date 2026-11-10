// Web-Push (VAPID) für die Admin-App. Nur serverseitig.
// Die VAPID-Schlüssel werden beim ersten Bedarf erzeugt und in der Tabelle `einstellung` abgelegt
// (keine Umgebungsvariable). Der Privatschlüssel verlässt den Server nie.
import webpush, { type PushSubscription, WebPushError } from 'web-push';
import { and, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { sha256 } from './sicherheit';

const SUBJECT = 'mailto:store@thesartorialist.ch';
const SCHLUESSEL = 'vapid';
const TIMEOUT_MS = 8000;

type Vapid = { publicKey: string; privateKey: string };
const g = globalThis as unknown as { __tsVapid?: Vapid };

/** VAPID-Schlüssel aus der DB, beim ersten Aufruf erzeugt (rennsicher: ON CONFLICT DO NOTHING, dann lesen). */
export async function vapid(): Promise<Vapid> {
  if (g.__tsVapid) return g.__tsVapid;
  const lesen = async () => {
    const [z] = await db().select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, SCHLUESSEL)).limit(1);
    const w = z?.wert as Partial<Vapid> | undefined;
    return w?.publicKey && w?.privateKey ? { publicKey: w.publicKey, privateKey: w.privateKey } : null;
  };
  let v = await lesen();
  if (!v) {
    const neu = webpush.generateVAPIDKeys();
    await db()
      .insert(schema.einstellung)
      .values({ schluessel: SCHLUESSEL, wert: { ...neu, erstelltAm: new Date().toISOString() } })
      .onConflictDoNothing();
    v = await lesen();
    if (!v) throw new Error('VAPID-Schlüssel konnten nicht gespeichert werden');
    console.info('[push] VAPID-Schlüssel erzeugt');
  }
  g.__tsVapid = v;
  return v;
}

export const vapidPublic = async () => (await vapid()).publicKey;

export type PushNachricht = {
  titel: string;
  text: string;
  /** Ziel beim Antippen (nur /admin/…) */
  url: string;
  /** gleiche tag-Werte ersetzen sich (z. B. pro Termin) */
  tag?: string;
};

type Abo = typeof schema.pushAbo.$inferSelect;

async function sendeAn(abo: Abo, n: PushNachricht, v: Vapid): Promise<'ok' | 'weg' | 'fehler'> {
  const sub: PushSubscription = { endpoint: abo.endpoint, keys: { p256dh: abo.p256dh, auth: abo.auth } };
  const host = (() => {
    try {
      return new URL(abo.endpoint).host;
    } catch {
      return '?';
    }
  })();
  try {
    const r = await webpush.sendNotification(sub, JSON.stringify(n), {
      vapidDetails: { subject: SUBJECT, publicKey: v.publicKey, privateKey: v.privateKey },
      TTL: 24 * 3600,
      urgency: 'high',
      timeout: TIMEOUT_MS,
    });
    console.info(`[push] ${r.statusCode} → ${host}`);
    await db().update(schema.pushAbo).set({ zuletztOk: new Date(), fehler: null }).where(eq(schema.pushAbo.id, abo.id));
    return 'ok';
  } catch (e) {
    const status = e instanceof WebPushError ? e.statusCode : 0;
    if (status === 404 || status === 410) {
      console.info(`[push] ${status} → ${host}: Abo abgelaufen, gelöscht`);
      await db().delete(schema.pushAbo).where(eq(schema.pushAbo.id, abo.id));
      return 'weg';
    }
    const text = `${status || ''} ${(e as Error).message}`.trim().slice(0, 300);
    console.warn(`[push] Fehler → ${host}: ${text}`);
    await db().update(schema.pushAbo).set({ fehler: text }).where(eq(schema.pushAbo.id, abo.id)).catch(() => {});
    return 'fehler';
  }
}

/** Sendet an die angegebenen Abos (parallel). Gibt die Anzahl erfolgreicher Zustellungen zurück. */
export async function sendePush(abos: Abo[], n: PushNachricht): Promise<{ ok: number; weg: number; fehler: number }> {
  const z = { ok: 0, weg: 0, fehler: 0 };
  if (!abos.length) return z;
  const v = await vapid();
  const r = await Promise.all(abos.map((a) => sendeAn(a, n, v)));
  for (const x of r) z[x]++;
  return z;
}

/** Alle Geräte aller aktiven Admins. */
export async function pushAnAlleAdmins(n: PushNachricht) {
  const aktive = db().select({ id: schema.adminUser.id }).from(schema.adminUser).where(eq(schema.adminUser.aktiv, true));
  const abos = await db().select().from(schema.pushAbo).where(inArray(schema.pushAbo.adminUserId, aktive));
  return sendePush(abos, n);
}

/** Abos einer Person, optional nur ein bestimmtes Gerät (Endpoint). */
export async function abosVon(adminUserId: string, endpoint?: string) {
  return db()
    .select()
    .from(schema.pushAbo)
    .where(endpoint ? and(eq(schema.pushAbo.adminUserId, adminUserId), eq(schema.pushAbo.endpoint, endpoint)) : eq(schema.pushAbo.adminUserId, adminUserId));
}

/** Text der Mitteilung zu einer neuen Anfrage — gemeinsam für Web-Push und die Mac-App (/api/admin/mitteilungen). */
export function anfrageMitteilung(a: { terminId: string; art: 'termin' | 'rueckruf'; name: string; wunsch: string; mitStil: boolean }): PushNachricht {
  const name = a.name.trim().slice(0, 60);
  const titel = a.art === 'termin' ? `Neue Terminanfrage${name ? ` — ${name}` : ''}` : `Neue Rückrufbitte${name ? ` — ${name}` : ''}`;
  const text =
    a.art === 'termin'
      ? `${a.wunsch || 'Termin nach Absprache'}${a.mitStil ? ' · mit Stil-Auswahl' : ''}`
      : `Zeitfenster: ${a.wunsch || 'egal'}`;
  return { titel, text, url: `/admin/termine/${a.terminId}/`, tag: `termin-${a.terminId}` };
}

/**
 * Neue Anfrage aus dem Formular → Push an alle aktiven Admins. Wirft nie (Fehler nur im Log),
 * damit der Anfrage-Versand nie blockiert. Personendaten minimal: Name + Art.
 */
export async function pushNeueAnfrage(a: { terminId: string; art: 'termin' | 'rueckruf'; name: string; wunsch: string; mitStil: boolean }) {
  try {
    const z = await Promise.race([
      pushAnAlleAdmins(anfrageMitteilung(a)),
      new Promise<null>((r) => setTimeout(() => r(null), TIMEOUT_MS + 2000)),
    ]);
    if (z === null) console.warn('[push] Anfrage-Push: Zeitüberschreitung');
    else console.info(`[push] Anfrage-Push: ${z.ok} zugestellt, ${z.weg} abgelaufen, ${z.fehler} Fehler`);
  } catch (e) {
    console.error('[push] Anfrage-Push fehlgeschlagen', (e as Error).message);
  }
}

/** Kurze Kennung je Gerät (sha256 des Endpoints) — der Browser vergleicht sie mit seinem eigenen Abo. */
export const kennung = (endpoint: string) => sha256(endpoint).slice(0, 24);

/** Gerätename aus dem User-Agent (Anzeige in den Einstellungen). */
export function geraetAusUa(ua: string, standalone: boolean): string {
  const ipad = /iPad/.test(ua);
  const os = /iPhone|iPod/.test(ua) ? 'iPhone' : ipad ? 'iPad' : /Android/.test(ua) ? 'Android' : /Macintosh|Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows-PC' : /Linux/.test(ua) ? 'Linux' : 'Gerät';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return standalone ? `${os} · App` : `${os} · ${browser}`;
}
