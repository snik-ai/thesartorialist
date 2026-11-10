// Mitteilungen für die Mac-App (desktop/): WKWebView kann kein Web Push, darum fragt die App hier regelmässig nach
// (lib/admin/mac-app.ts). Liefert neue Terminanfragen/Rückrufbitten seit «seit» — mit denselben Texten wie der
// Web-Push (anfrageMitteilung) — und die Anzahl offener Anfragen fürs Dock-Badge. Nur mit Admin-Sitzung.
import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { apiAdmin } from '@/lib/admin/zugang';
import { anfrageMitteilung } from '@/lib/admin/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Platzhalter aus /api/anfrage (wunsch_text) gelten als «kein Wunsch» — dann greift der Standardtext wie beim Push. */
const LEER = new Set(['nach Absprache', 'egal']);

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const roh = new URL(req.url).searchParams.get('seit');
  const jetzt = new Date();
  let seit = roh ? new Date(roh) : jetzt;
  // Ungültig oder älter als 24 h: nicht alles Alte nachmelden
  if (Number.isNaN(seit.getTime()) || jetzt.getTime() - seit.getTime() > 24 * 3600_000) seit = new Date(jetzt.getTime() - 24 * 3600_000);

  const neue = await db().execute<{ id: string; art: 'termin' | 'rueckruf'; name: string; wunsch: string | null; mit_stil: boolean }>(sql`
    select t.id, t.art, coalesce(k.name, '') as name, t.wunsch_text as wunsch,
           (jsonb_array_length(t.stil) > 0 or jsonb_array_length(t.stoffe) > 0) as mit_stil
      from termin t join kontakt k on k.id = t.kontakt_id
     where t.status = 'angefragt' and t.zweck = 'beratung' and t.erstellt_am > ${seit.toISOString()}::timestamptz
     order by t.erstellt_am asc
     limit 10`);
  const [z] = await db().execute<{ offen: number }>(sql`select count(*)::int as offen from termin where status = 'angefragt'`);

  return NextResponse.json(
    {
      jetzt: jetzt.toISOString(),
      offen: z?.offen ?? 0,
      mitteilungen: neue.map((t) =>
        anfrageMitteilung({ terminId: t.id, art: t.art, name: t.name, wunsch: t.wunsch && !LEER.has(t.wunsch) ? t.wunsch : '', mitStil: t.mit_stil }),
      ),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
