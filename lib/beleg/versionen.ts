// Versionen von Angebot und Rechnung: Fassung sichern (beim Senden automatisch, sonst «Version sichern») und wiederherstellen.
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Exec } from '@/lib/crm/nummern';

const ANGEBOT_FELDER = ['titel', 'einleitung', 'schluss', 'positionen', 'stil', 'stoffe', 'rabattProzent', 'rabattRp', 'mwstSatz', 'mwstRp', 'totalRp', 'gueltigBis', 'datum', 'sprache', 'stilAnhang', 'kontaktId'] as const;
const RECHNUNG_FELDER = ['titel', 'einleitung', 'schluss', 'positionen', 'rabattProzent', 'rabattRp', 'mwstSatz', 'mwstRp', 'totalRp', 'betragRp', 'rechnungsdatum', 'faelligAm', 'sprache', 'kontaktId'] as const;

type Angebot = typeof schema.angebot.$inferSelect;
type Rechnung = typeof schema.rechnung.$inferSelect;

export async function versionSichern(x: Exec, art: 'angebot' | 'rechnung', b: Angebot | Rechnung, grund: string, adminId: string | null) {
  const felder = art === 'angebot' ? ANGEBOT_FELDER : RECHNUNG_FELDER;
  const daten = Object.fromEntries(felder.map((f) => [f, (b as Record<string, unknown>)[f] instanceof Date ? ((b as Record<string, unknown>)[f] as Date).toISOString() : (b as Record<string, unknown>)[f]]));
  await x.insert(schema.belegVersion).values({ art, belegId: b.id, version: b.version, grund, daten, totalRp: b.totalRp, erstelltVon: adminId });
  const t = art === 'angebot' ? schema.angebot : schema.rechnung;
  await x.update(t).set({ version: b.version + 1 }).where(eq(t.id, b.id));
  return b.version;
}

/** Felder einer gesicherten Fassung zurück in den Beleg (vorher wird der aktuelle Stand gesichert). */
export async function versionWiederherstellen(art: 'angebot' | 'rechnung', b: Angebot | Rechnung, versionId: string, adminId: string | null) {
  const [v] = await db()
    .select()
    .from(schema.belegVersion)
    .where(and(eq(schema.belegVersion.id, versionId), eq(schema.belegVersion.belegId, b.id)))
    .limit(1);
  if (!v) return null;
  await versionSichern(db(), art, b, 'vor-wiederherstellen', adminId);
  const datum = new Set(['gueltigBis', 'datum', 'rechnungsdatum', 'faelligAm']);
  const set: Record<string, unknown> = { aktualisiertAm: new Date() };
  for (const [k, w] of Object.entries(v.daten)) set[k] = datum.has(k) && typeof w === 'string' ? new Date(w) : w;
  const t = art === 'angebot' ? schema.angebot : schema.rechnung;
  await db().update(t).set(set).where(eq(t.id, b.id));
  return v.version;
}
