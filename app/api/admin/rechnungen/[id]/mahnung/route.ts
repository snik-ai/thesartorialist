// Mahnwesen einer Rechnung: GET Mahnungen + Vorschlag der nächsten Stufe, POST neue Mahnung (optional gleich per Mail).
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { AblaufFehler } from '@/lib/crm/ablauf';
import { mahnungErstellen, mahnungenVon, mahnungSenden, offenMitGebuehren, vorschlagFuer } from '@/lib/crm/mahnung';
import { stufeName } from '@/lib/beleg/mahnwesen';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };

async function laden(id: string) {
  if (!UUID.test(id)) return null;
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, id)).limit(1);
  return r ?? null;
}

export async function GET(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const r = await laden((await params).id);
  if (!r) return fehler('Rechnung nicht gefunden', 404);
  const [mahnungen, v] = await Promise.all([mahnungenVon([r.id]), vorschlagFuer(r)]);
  return NextResponse.json({
    ok: true,
    status: r.status,
    mahnstufe: r.mahnstufe,
    mahngebuehrenRp: r.mahngebuehrenRp,
    offenRp: offenMitGebuehren(r),
    mahnfristBis: r.mahnfristBis?.toISOString() ?? null,
    mahnungen: mahnungen.map(({ rechnungId, ...m }) => (void rechnungId, m)),
    vorschlag: v ? { ...v, ab: v.ab.toISOString() } : null,
  });
}

export async function POST(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const r = await laden((await params).id);
  if (!r) return fehler('Rechnung nicht gefunden', 404);
  const b = (await jsonBody(req)) ?? {};
  const stufe = b.stufe === undefined || b.stufe === null ? undefined : Number(b.stufe);
  if (stufe !== undefined && ![1, 2, 3].includes(stufe)) return fehler('Stufe ungültig');
  try {
    const m = await mahnungErstellen(r.id, { stufe, adminId: a.s.user.id });
    let meldung = `${stufeName(m.stufe)} ${m.nummer} erstellt.`;
    let mailFehler = false;
    if (b.mail === true) {
      try {
        const s = await mahnungSenden(m.id, { adminId: a.s.user.id, nachricht: txt(b.nachricht, 1500) || undefined });
        meldung = `${stufeName(m.stufe)} ${m.nummer} an ${s.an} gesendet.`;
      } catch (err) {
        mailFehler = true;
        meldung += ` ${(err as Error).message}`;
      }
    }
    return NextResponse.json({ ok: true, id: m.id, nummer: m.nummer, stufe: m.stufe, offenRp: m.offenRp, meldung, mailFehler });
  } catch (err) {
    if (err instanceof AblaufFehler) return fehler(err.message, err.status);
    throw err;
  }
}
