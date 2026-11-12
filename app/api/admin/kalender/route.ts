// Wochenplanung: belegte Zeiten abfragen (GET, für Kollisionen im Dialog) und private Einträge anlegen (POST).
import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody } from '@/lib/admin/zugang';
import { belegtBereiche } from '@/lib/crm/kalender';
import { privatDaten } from './daten';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const u = new URL(req.url).searchParams;
  const von = new Date(u.get('von') ?? '');
  const bis = new Date(u.get('bis') ?? '');
  if (Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime()) || bis <= von || bis.getTime() - von.getTime() > 40 * 86400_000) return fehler('Ungültiger Zeitraum');
  return NextResponse.json(await belegtBereiche(von, bis, { mitTitel: true, ohneTermin: u.get('ohneTermin') ?? undefined, ohnePrivat: u.get('ohnePrivat') ?? undefined }));
}

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const d = privatDaten(await jsonBody(req));
  if ('fehler' in d) return fehler(d.fehler);
  const [e] = await db()
    .insert(schema.kalenderEintrag)
    .values({ ...d, adminUserId: a.s.user.id })
    .returning({ id: schema.kalenderEintrag.id });
  return NextResponse.json({ ok: true, id: e.id, meldung: 'Eingetragen.' });
}
