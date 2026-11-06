// Web-Push-Abos der Admin-App: Schlüssel + Geräteliste lesen, Gerät anmelden, Gerät abmelden.
// Nur mit Admin-Sitzung (apiAdmin: Sitzung + CSRF/Origin).
import { NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { geraetAusUa, kennung, vapidPublic } from '@/lib/admin/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Endpoint muss eine https-URL sein (Push-Dienst von Apple, Google, Mozilla, Microsoft …). */
function endpointOk(e: string) {
  if (!e || e.length > 1000) return false;
  try {
    const u = new URL(e);
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch {
    return false;
  }
}
const B64URL = /^[A-Za-z0-9_-]+={0,2}$/;

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const liste = await db()
    .select()
    .from(schema.pushAbo)
    .where(eq(schema.pushAbo.adminUserId, a.s.user.id))
    .orderBy(asc(schema.pushAbo.erstelltAm));
  return NextResponse.json({
    publicKey: await vapidPublic(),
    geraete: liste.map((x) => ({ id: x.id, kennung: kennung(x.endpoint), geraet: x.geraet, erstellt: x.erstelltAm, zuletztOk: x.zuletztOk, fehler: x.fehler })),
  });
}

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const sub = (b?.subscription ?? {}) as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  const endpoint = txt(sub.endpoint, 1000);
  const p256dh = txt(sub.keys?.p256dh, 200);
  const auth = txt(sub.keys?.auth, 100);
  if (!endpointOk(endpoint) || !B64URL.test(p256dh) || !B64URL.test(auth)) return fehler('Ungültiges Abo.');
  const ua = (req.headers.get('user-agent') ?? '').slice(0, 300);
  const geraet = txt(b?.geraet, 80) || geraetAusUa(ua, b?.standalone === true);
  // Ersetztes Abo (pushsubscriptionchange im Service-Worker): altes löschen, nur das eigene
  const alt = txt(b?.alt, 1000);
  if (alt && alt !== endpoint) await db().delete(schema.pushAbo).where(and(eq(schema.pushAbo.endpoint, alt), eq(schema.pushAbo.adminUserId, a.s.user.id)));
  // Gleiches Gerät, andere Person angemeldet → das Gerät gehört jetzt der angemeldeten Person
  await db()
    .insert(schema.pushAbo)
    .values({ adminUserId: a.s.user.id, endpoint, p256dh, auth, geraet, userAgent: ua || null })
    .onConflictDoUpdate({ target: schema.pushAbo.endpoint, set: { adminUserId: a.s.user.id, p256dh, auth, geraet, userAgent: ua || null, fehler: null } });
  return NextResponse.json({ ok: true, kennung: kennung(endpoint) });
}

export async function DELETE(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const id = txt(b?.id, 40);
  const endpoint = txt(b?.endpoint, 1000);
  if (id && UUID.test(id)) {
    await db().delete(schema.pushAbo).where(and(eq(schema.pushAbo.id, id), eq(schema.pushAbo.adminUserId, a.s.user.id)));
  } else if (endpoint) {
    await db().delete(schema.pushAbo).where(and(eq(schema.pushAbo.endpoint, endpoint), eq(schema.pushAbo.adminUserId, a.s.user.id)));
  } else return fehler('Ungültig');
  return NextResponse.json({ ok: true });
}
