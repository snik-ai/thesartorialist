// Kontakt im Backend anlegen (z. B. Laufkundschaft im Atelier) — mit Golden Record: bestehende E-Mail/Telefon wird ergänzt.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt } from '@/lib/admin/zugang';
import { aktivitaetLoggen, kontaktAufnehmen } from '@/lib/crm/kontakte';
import { telNorm } from '@/lib/crm/telefon';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const name = txt(b?.name, 120);
  const email = txt(b?.email, 200).toLowerCase();
  const telefon = txt(b?.telefon, 40);
  if (!name) return fehler('Bitte einen Namen eingeben.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fehler('Ungültige E-Mail-Adresse');
  if (telefon && !telNorm(telefon)) return fehler('Ungültige Telefonnummer');
  const status = b?.status === 'kunde' ? 'kunde' : 'lead';
  const r = await kontaktAufnehmen(db(), { name, email: email || undefined, telefon: telefon || undefined, firma: txt(b?.firma, 160) || undefined, quelle: 'atelier' });
  if (r.neu && status === 'kunde') await db().update(schema.kontakt).set({ status: 'kunde', leadPhase: 'gewonnen', kundeSeit: new Date() }).where(eq(schema.kontakt.id, r.id));
  await aktivitaetLoggen(db(), { kontaktId: r.id, kanal: 'system', titel: r.neu ? `Im Backend angelegt (${status === 'kunde' ? 'Kunde' : 'Lead'})` : 'Erneut erfasst — bestehender Kontakt ergänzt', adminUserId: a.s.user.id });
  return NextResponse.json({ ok: true, id: r.id, neu: r.neu });
}
