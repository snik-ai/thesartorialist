// Echtzeit der Webseitenanalyse (letzte 30 Minuten) — nur mit Admin-Sitzung. Die Seite fragt alle 30 s nach.
import { NextResponse } from 'next/server';
import { apiAdmin } from '@/lib/admin/zugang';
import { echtzeit } from '@/lib/crm/webanalyse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  try {
    return NextResponse.json(await echtzeit(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[webanalyse] Echtzeit fehlgeschlagen', (e as Error).message);
    return NextResponse.json({ fehler: 'Auswertung fehlgeschlagen' }, { status: 500 });
  }
}
