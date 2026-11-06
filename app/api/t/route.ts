// Eigenes, cookieloses Tracking (sendBeacon). Keine IP, keine Cookies, kein Fingerprint über den Tag hinaus.
import { db, dbBereit, schema } from '@/lib/db';
import { clientIp } from '@/lib/admin/sicherheit';
import { gedrosselt } from '@/lib/drossel';
import { besucherId, geraet, istBot, kurz, pfadOk, referrerHost, TYPEN, type EreignisTyp } from '@/lib/tracking/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const leer = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  if (!dbBereit()) return leer();
  const ua = req.headers.get('user-agent') ?? '';
  if (istBot(ua)) return leer();
  // Angemeldete Admins (Cookie vorhanden) nicht mitzählen
  const cookie = req.headers.get('cookie') ?? '';
  if (/(^|;\s*)(__Host-)?ts_admin=/.test(cookie)) return leer();
  const ip = clientIp(req);
  if (gedrosselt('t', ip, 120, 60_000)) return leer();

  let b: Record<string, unknown>;
  try {
    const roh = await req.text();
    if (roh.length > 4000) return leer();
    b = JSON.parse(roh);
  } catch {
    return leer();
  }
  const typ = b.t as EreignisTyp;
  if (!TYPEN.includes(typ)) return leer();
  const pfad = pfadOk(b.p);
  if (!pfad) return leer();

  try {
    await db()
      .insert(schema.ereignis)
      .values({
        typ,
        pfad,
        referrer: typ === 'pageview' ? referrerHost(b.r, req.headers.get('x-forwarded-host') ?? req.headers.get('host')) : null,
        utmSource: typ === 'pageview' ? kurz(b.us)?.toLowerCase() ?? null : null,
        utmMedium: typ === 'pageview' ? kurz(b.um)?.toLowerCase() ?? null : null,
        utmCampaign: typ === 'pageview' ? kurz(b.uc) : null,
        geraet: geraet(ua, typeof b.w === 'number' ? b.w : undefined),
        sprache: kurz(b.l, 12),
        besucher: besucherId(ip, ua),
        label: kurz(b.z, 80),
      });
  } catch (err) {
    console.warn('[t] Speichern fehlgeschlagen', (err as Error).message);
  }
  return leer();
}
