import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, UUID } from '@/lib/admin/zugang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ fehler: 'Ungültig' }, { status: 400 });
  const r = await db()
    .delete(schema.passkey)
    .where(and(eq(schema.passkey.id, id), eq(schema.passkey.adminUserId, a.s.user.id)))
    .returning({ id: schema.passkey.id });
  if (!r.length) return NextResponse.json({ fehler: 'Nicht gefunden' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
