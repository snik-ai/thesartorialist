import { NextResponse } from 'next/server';
import { dbBereit } from '@/lib/db';
import { sitzungBeenden } from '@/lib/admin/sitzung';
import { herkunftOk } from '@/lib/admin/sicherheit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!herkunftOk(req)) return NextResponse.json({ fehler: 'Ungültige Herkunft' }, { status: 403 });
  if (dbBereit()) await sitzungBeenden();
  return NextResponse.json({ ok: true });
}
