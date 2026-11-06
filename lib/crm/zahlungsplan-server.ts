// Zahlungsplan serverseitig: Plan setzen (verschickte Raten bleiben gesperrt) und Rechnung zu einer Rate erstellen.
import { eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Zahlungsplan } from '@/lib/db/schema';
import { tagAus } from '@/lib/admin/belege';
import { aktivitaetLoggen } from './kontakte';
import { AblaufFehler, rechnungErstellen } from './ablauf';
import { chf } from './geld';
import { planPruefen, ratenBetraege } from './zahlungsplan';

const offenOderMehr = (s: string) => s !== 'entwurf' && s !== 'storniert';

export async function zahlungsplanSetzen(auftragId: string, plan: Zahlungsplan, adminId: string | null) {
  const [au] = await db().select().from(schema.auftrag).where(eq(schema.auftrag.id, auftragId)).limit(1);
  if (!au || !au.kontaktId) throw new AblaufFehler('Auftrag nicht gefunden', 404);
  const p = planPruefen(plan, au.totalRp);
  if (!p.ok) throw new AblaufFehler(p.fehler ?? 'Zahlungsplan ungültig');
  const alt = au.zahlungsplan?.raten ?? [];
  const ids = alt.map((r) => r.rechnungId).filter((x): x is string => Boolean(x));
  const rs = ids.length ? await db().select({ id: schema.rechnung.id, status: schema.rechnung.status, bezahltRp: schema.rechnung.bezahltRp, faelligAm: schema.rechnung.faelligAm }).from(schema.rechnung).where(inArray(schema.rechnung.id, ids)) : [];
  const rech = new Map(rs.map((r) => [r.id, r]));
  const loeschen: string[] = [];
  for (const a of alt) {
    const r = a.rechnungId ? rech.get(a.rechnungId) : undefined;
    if (!r || r.status === 'storniert') continue;
    const neu = plan.raten.find((x) => x.id === a.id);
    const gleich = neu && neu.art === a.art && Math.abs(neu.wert - a.wert) < 0.001;
    if (offenOderMehr(r.status)) {
      if (!gleich) throw new AblaufFehler(`«${a.bezeichnung}» ist bereits verschickt und kann nicht mehr geändert oder entfernt werden.`, 409);
      neu!.rechnungId = a.rechnungId;
    } else if (gleich && neu!.faelligAm === a.faelligAm) neu!.rechnungId = a.rechnungId;
    else loeschen.push(a.rechnungId!);
  }
  await db().transaction(async (tx) => {
    for (const id of loeschen) {
      await tx.update(schema.aktivitaet).set({ rechnungId: null }).where(eq(schema.aktivitaet.rechnungId, id));
      await tx.delete(schema.rechnung).where(eq(schema.rechnung.id, id));
    }
    await tx.update(schema.auftrag).set({ zahlungsplan: plan, aktualisiertAm: new Date() }).where(eq(schema.auftrag.id, au.id));
    await aktivitaetLoggen(tx, {
      kontaktId: au.kontaktId!,
      kanal: 'system',
      titel: `${au.nummer}: Zahlungsplan ${plan.modus === 'ganz' ? 'ganz (eine Rechnung)' : `in ${plan.raten.length} Raten`}`,
      text: plan.raten.map((r, i) => `${r.bezeichnung}: ${r.art === 'prozent' ? `${r.wert} % = ` : ''}${chf(p.betraege[i])}${r.faelligAm ? ` · fällig ${r.faelligAm.split('-').reverse().join('.')}` : ''}${r.anlass ? ` · ${r.anlass}` : ''}`).join('\n') + (loeschen.length ? `\n${loeschen.length} Rechnungsentwurf/-entwürfe verworfen` : ''),
      auftragId: au.id,
      adminUserId: adminId,
    });
  });
  return { plan, pruefung: p, verworfen: loeschen.length };
}

/** Rechnung zur Rate: vor der letzten eine Anzahlungs-/Teilrechnung über den Ratenbetrag, die letzte als Schlussrechnung. */
export async function rateRechnung(auftragId: string, rateId: string, adminId: string) {
  const [au] = await db().select().from(schema.auftrag).where(eq(schema.auftrag.id, auftragId)).limit(1);
  if (!au || !au.kontaktId) throw new AblaufFehler('Auftrag nicht gefunden', 404);
  const plan = au.zahlungsplan;
  if (!plan) throw new AblaufFehler('Bitte zuerst den Zahlungsplan festlegen.');
  const i = plan.raten.findIndex((r) => r.id === rateId);
  if (i < 0) throw new AblaufFehler('Rate nicht gefunden', 404);
  const rate = plan.raten[i];
  if (rate.rechnungId) {
    const [r] = await db().select({ id: schema.rechnung.id, nummer: schema.rechnung.nummer, status: schema.rechnung.status }).from(schema.rechnung).where(eq(schema.rechnung.id, rate.rechnungId)).limit(1);
    if (r && r.status !== 'storniert') return { id: r.id, nummer: r.nummer, schon: true };
  }
  const letzte = i === plan.raten.length - 1;
  if (letzte && i > 0) {
    const vorher = plan.raten.slice(0, i).map((r) => r.rechnungId).filter((x): x is string => Boolean(x));
    const st = vorher.length ? await db().select({ status: schema.rechnung.status }).from(schema.rechnung).where(inArray(schema.rechnung.id, vorher)) : [];
    if (vorher.length < i || st.filter((x) => offenOderMehr(x.status)).length < i) throw new AblaufFehler('Zuerst die vorherigen Raten verrechnen und festschreiben – die Schlussrechnung zieht sie ab.', 409);
  }
  const faellig = rate.faelligAm ? tagAus(rate.faelligAm) : null;
  const betrag = ratenBetraege(plan, au.totalRp)[i];
  const art = plan.raten.length === 1 ? 'rechnung' : letzte ? 'schluss' : 'anzahlung';
  const r = await rechnungErstellen({ auftragId: au.id, art, betragRp: art === 'anzahlung' ? betrag : undefined, bezeichnung: art === 'anzahlung' ? rate.bezeichnung : undefined, faelligAm: faellig ?? undefined, adminId });
  const neu: Zahlungsplan = { ...plan, raten: plan.raten.map((x) => (x.id === rate.id ? { ...x, rechnungId: r.id } : x)) };
  await db().update(schema.auftrag).set({ zahlungsplan: neu, aktualisiertAm: new Date() }).where(eq(schema.auftrag.id, au.id));
  return { id: r.id, nummer: r.nummer, schon: false };
}
