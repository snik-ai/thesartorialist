// Eigenes, cookieloses Tracking (sendBeacon). Keine IP, keine Cookies, kein Fingerprint über den Tag hinaus.
// Die Sitzung bildet der Server: gleicher Tages-Besucher, höchstens 30 Minuten Ruhe → gleiche Sitzung.
// «ende» trägt die sichtbare Verweildauer eines Seitenaufrufs nach (nur nach oben, max. 30 Min.).
import { randomBytes } from 'node:crypto';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { db, dbBereit, schema } from '@/lib/db';
import { clientIp } from '@/lib/admin/sicherheit';
import { gedrosselt } from '@/lib/drossel';
import {
  besucherId,
  bildschirmKlasse,
  browserVon,
  geraet,
  istBot,
  kanalVon,
  kennung,
  kurz,
  landVon,
  osVon,
  pfadOk,
  referrerHost,
  seitenSprache,
  TYPEN,
  type EreignisTyp,
} from '@/lib/tracking/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const leer = () => new Response(null, { status: 204 });
const MAX_DAUER = 30 * 60_000;

/** Sitzung des Besuchers: letzte Zeile der letzten 30 Minuten, sonst eine neue Kennung. */
async function sitzungFuer(besucher: string): Promise<string> {
  const [z] = await db()
    .select({ sitzung: schema.ereignis.sitzung })
    .from(schema.ereignis)
    .where(and(eq(schema.ereignis.besucher, besucher), gt(schema.ereignis.zeit, sql`now() - interval '30 minutes'`)))
    .orderBy(desc(schema.ereignis.zeit))
    .limit(1);
  return z?.sitzung ?? randomBytes(9).toString('base64url');
}

export async function POST(req: Request) {
  if (!dbBereit()) return leer();
  const ua = req.headers.get('user-agent') ?? '';
  if (istBot(ua)) return leer();
  // Wille des Besuchers respektieren
  if (req.headers.get('dnt') === '1' || req.headers.get('sec-gpc') === '1') return leer();
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
  const pfad = pfadOk(b.p);
  if (!pfad) return leer();
  const besucher = besucherId(ip, ua);

  try {
    if (b.t === 'ende') {
      const aufruf = kennung(b.a);
      const d = typeof b.d === 'number' && Number.isFinite(b.d) ? Math.max(0, Math.min(MAX_DAUER, Math.round(b.d))) : 0;
      if (!aufruf) return leer();
      await db()
        .update(schema.ereignis)
        .set({ dauerMs: sql`greatest(coalesce(${schema.ereignis.dauerMs}, 0), ${d})`, zuletzt: sql`now()` })
        .where(
          and(
            eq(schema.ereignis.aufruf, aufruf),
            eq(schema.ereignis.besucher, besucher),
            eq(schema.ereignis.typ, 'pageview'),
            gt(schema.ereignis.zeit, sql`now() - interval '1 day'`),
          ),
        );
      return leer();
    }

    const typ = b.t as EreignisTyp;
    if (!TYPEN.includes(typ)) return leer();
    const istAufruf = typ === 'pageview';
    const touch = b.tp === true;
    const ref = istAufruf ? referrerHost(b.r, req.headers.get('x-forwarded-host') ?? req.headers.get('host')) : null;
    const utmSource = istAufruf ? kurz(b.us)?.toLowerCase() ?? null : null;
    const utmMedium = istAufruf ? kurz(b.um)?.toLowerCase() ?? null : null;
    const gclid = istAufruf && b.g === true;
    const { land, quelle } = landVon(req.headers);

    await db()
      .insert(schema.ereignis)
      .values({
        typ,
        pfad,
        referrer: ref,
        utmSource,
        utmMedium,
        utmCampaign: istAufruf ? kurz(b.uc, 150) : null,
        utmTerm: istAufruf ? kurz(b.ut, 150) : null,
        utmContent: istAufruf ? kurz(b.uco, 150) : null,
        gclid,
        kanal: kanalVon({ referrer: ref, utmSource, utmMedium, gclid }),
        geraet: geraet(ua, typeof b.w === 'number' ? b.w : undefined, touch),
        browser: browserVon(ua),
        os: osVon(ua, touch),
        bildschirm: bildschirmKlasse(b.w),
        land,
        landQuelle: quelle,
        sprache: kurz(b.l, 12),
        seitenSprache: seitenSprache(pfad),
        titel: istAufruf ? kurz(b.ti, 160) : null,
        besucher,
        sitzung: await sitzungFuer(besucher),
        aufruf: istAufruf ? kennung(b.a) : null,
        label: kurz(b.z, 80),
      });
  } catch (err) {
    console.warn('[t] Speichern fehlgeschlagen', (err as Error).message);
  }
  return leer();
}
