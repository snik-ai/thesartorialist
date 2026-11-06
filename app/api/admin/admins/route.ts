// Admins verwalten (in der Datenbank, keine Umgebungsvariable): hinzufügen, deaktivieren, reaktivieren.
import { NextResponse } from 'next/server';
import { and, eq, ne, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const email = txt(b?.email, 200).toLowerCase();
  const name = txt(b?.name, 120) || null;
  if (!EMAIL.test(email)) return fehler('Bitte eine gültige E-Mail-Adresse angeben.');
  await db()
    .insert(schema.adminUser)
    .values({ email, name })
    .onConflictDoUpdate({ target: schema.adminUser.email, set: { aktiv: true, ...(name ? { name } : {}) } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const id = txt(b?.id, 40);
  const aktiv = b?.aktiv === true;
  if (!UUID.test(id)) return fehler('Ungültig');
  if (id === a.s.user.id && !aktiv) return fehler('Sie können sich nicht selbst deaktivieren.');
  if (!aktiv) {
    const [{ n }] = await db()
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.adminUser)
      .where(and(eq(schema.adminUser.aktiv, true), ne(schema.adminUser.id, id)));
    if (n < 1) return fehler('Mindestens ein aktiver Admin muss bleiben.');
  }
  await db().update(schema.adminUser).set({ aktiv }).where(eq(schema.adminUser.id, id));
  // Deaktiviert: alle Sitzungen dieser Person beenden
  if (!aktiv) await db().delete(schema.sitzung).where(eq(schema.sitzung.adminUserId, id));
  return NextResponse.json({ ok: true });
}
