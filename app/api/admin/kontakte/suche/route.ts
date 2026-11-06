// Kontaktsuche für den Empfänger im A4-Editor: Name, E-Mail, Telefon, Ort (max. 12, ohne zusammengeführte Datensätze).
import { NextResponse } from 'next/server';
import { and, desc, ilike, isNull, or, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin } from '@/lib/admin/zugang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim().slice(0, 80);
  const k = schema.kontakt;
  const muster = `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
  const ziffern = q.replace(/\D/g, '');
  const rows = await db()
    .select({ id: k.id, name: k.name, email: k.email, ort: k.ort, status: k.status })
    .from(k)
    .where(and(isNull(k.zusammengefuehrtIn), q ? or(ilike(k.name, muster), ilike(k.email, muster), ilike(k.ort, muster), ilike(k.firma, muster), ziffern.length >= 4 ? sql`${k.telefonNorm} like ${`%${ziffern.slice(-9)}%`}` : undefined) : undefined))
    .orderBy(desc(k.aktualisiertAm))
    .limit(12);
  return NextResponse.json(rows);
}
