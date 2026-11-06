// Neue Rechnung: aus einem Auftrag (Anzahlung in %, Schlussrechnung) oder als Einzelrechnung für einen Kontakt.
import { NextResponse } from 'next/server';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { AblaufFehler, rechnungErstellen } from '@/lib/crm/ablauf';
import type { RechnungArt } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const art = txt(b?.art, 20) as RechnungArt;
  if (!['rechnung', 'anzahlung', 'schluss'].includes(art)) return fehler('Art ungültig');
  const auftragId = txt(b?.auftragId, 40);
  const kontaktId = txt(b?.kontaktId, 40);
  if ((auftragId && !UUID.test(auftragId)) || (kontaktId && !UUID.test(kontaktId)) || (!auftragId && !kontaktId)) return fehler('Ungültig');
  const prozent = b?.prozent === undefined ? undefined : Number(b.prozent);
  if (prozent !== undefined && (!Number.isFinite(prozent) || prozent <= 0 || prozent > 100)) return fehler('Prozent ungültig');
  try {
    const r = await rechnungErstellen({ auftragId: auftragId || null, kontaktId: kontaktId || undefined, art, prozent, adminId: a.s.user.id });
    return NextResponse.json({ ok: true, ...r });
  } catch (err) {
    if (err instanceof AblaufFehler) return fehler(err.message, err.status);
    throw err;
  }
}
