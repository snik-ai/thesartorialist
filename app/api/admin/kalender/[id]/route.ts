// Privater Kalendereintrag: ändern (PATCH, auch Verschieben/Verlängern per Drag & Drop) und löschen (DELETE).
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, UUID } from '@/lib/admin/zugang';
import { privatDaten } from '../daten';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const e = schema.kalenderEintrag;
  const [alt] = await db().select().from(e).where(eq(e.id, id)).limit(1);
  if (!alt) return fehler('Eintrag nicht gefunden', 404);
  const b = await jsonBody(req);
  // Teil-Änderung (Drag & Drop schickt nur start/ende): fehlende Felder vom bestehenden Eintrag
  const d = privatDaten({
    titel: alt.titel,
    notiz: alt.notiz ?? '',
    ganztaegig: alt.ganztaegig,
    wiederholung: alt.wiederholung,
    start: alt.start.toISOString(),
    ende: alt.ende.toISOString(),
    ...(b ?? {}),
  });
  if ('fehler' in d) return fehler(d.fehler);
  await db().update(e).set({ ...d, aktualisiertAm: new Date() }).where(eq(e.id, id));
  return NextResponse.json({ ok: true, meldung: 'Gespeichert.' });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const e = schema.kalenderEintrag;
  const [weg] = await db().delete(e).where(eq(e.id, id)).returning();
  if (!weg) return fehler('Eintrag nicht gefunden', 404);
  // Für «Rückgängig»: der Browser legt den Eintrag mit diesen Daten neu an
  return NextResponse.json({ ok: true, meldung: 'Gelöscht.', eintrag: { titel: weg.titel, start: weg.start, ende: weg.ende, ganztaegig: weg.ganztaegig, notiz: weg.notiz, wiederholung: weg.wiederholung } });
}
