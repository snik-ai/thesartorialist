// Positionssuche im A4-Editor: GET ?q= → Treffer[] (aktive Produkte, je aktive Variante ein Treffer; ohne q die ersten 8, sonst max. 12).
import { NextResponse } from 'next/server';
import { apiAdmin } from '@/lib/admin/zugang';
import { produktSuche } from '@/components/produkte/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const q = new URL(req.url).searchParams.get('q') ?? '';
  return NextResponse.json(await produktSuche(q), { headers: { 'Cache-Control': 'private, no-store' } });
}
