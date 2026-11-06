// Eigene Passkeys auflisten (für Einstellungen und das «Face ID einrichten?»-Angebot).
import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin } from '@/lib/admin/zugang';
import { istFrisch } from '@/lib/admin/sitzung';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const liste = await db()
    .select({ id: schema.passkey.id, name: schema.passkey.name, erstelltAm: schema.passkey.erstelltAm, zuletztBenutzt: schema.passkey.zuletztBenutzt })
    .from(schema.passkey)
    .where(eq(schema.passkey.adminUserId, a.s.user.id))
    .orderBy(asc(schema.passkey.erstelltAm));
  return NextResponse.json({ liste, frisch: istFrisch(a.s), methode: a.s.methode });
}
