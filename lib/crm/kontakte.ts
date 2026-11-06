// Kontakte als Golden Record: Zusammenführen über E-Mail ODER Telefon (letzte 9 Ziffern, wie VoxCRM findeDuplikate).
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { telNorm } from './telefon';

type Tx = Parameters<Parameters<ReturnType<typeof db>['transaction']>[0]>[0];
type Exec = ReturnType<typeof db> | Tx;

export type KontaktEingang = {
  name: string;
  email?: string;
  telefon?: string;
  firma?: string;
  brandDomain?: string;
  sprache?: string;
  quelle: string;
  /** Einwilligung für WhatsApp/SMS aus dem Formular (Text, den die Person bestätigt hat) */
  einwilligung?: { text: string; pfad: string } | null;
};

/** Sucht den bestehenden Kontakt (E-Mail vor Telefon, ältester zuerst) oder legt einen an. Ergänzt nur leere Felder. */
export async function kontaktAufnehmen(x: Exec, d: KontaktEingang): Promise<{ id: string; neu: boolean; abweichend: string[] }> {
  const email = d.email?.trim().toLowerCase() || null;
  const tn = telNorm(d.telefon);
  const k = schema.kontakt;
  const bedingungen = [email ? eq(k.email, email) : undefined, tn ? eq(k.telefonNorm, tn) : undefined].filter(Boolean);
  const jetzt = new Date();
  const einw = d.einwilligung ? `${d.quelle} · ${d.einwilligung.pfad} · «${d.einwilligung.text.slice(0, 300)}»` : null;

  if (bedingungen.length) {
    const treffer = await x
      .select()
      .from(k)
      .where(and(isNull(k.zusammengefuehrtIn), or(...bedingungen)))
      .orderBy(sql`case when ${email ? sql`${k.email} = ${email}` : sql`false`} then 0 else 1 end`, k.erstelltAm)
      .limit(1);
    const t = treffer[0];
    if (t) {
      await x
        .update(k)
        .set({
          name: t.name || d.name,
          email: t.email ?? email,
          telefon: t.telefon ?? (d.telefon || null),
          telefonNorm: t.telefonNorm ?? tn,
          firma: t.firma ?? (d.firma || null),
          brandDomain: t.brandDomain ?? (d.brandDomain || null),
          ...(einw && !t.einwilligungWhatsapp ? { einwilligungWhatsapp: jetzt, einwilligungWhatsappQuelle: einw } : {}),
          ...(einw && !t.einwilligungSms ? { einwilligungSms: jetzt, einwilligungSmsQuelle: einw } : {}),
          aktualisiertAm: jetzt,
        })
        .where(eq(k.id, t.id));
      // Abweichende Angaben nicht überschreiben, aber im Verlauf festhalten
      const abweichend = [
        email && t.email && t.email !== email ? `E-Mail ${email}` : '',
        tn && t.telefonNorm && t.telefonNorm !== tn ? `Telefon ${d.telefon}` : '',
        d.name && t.name && t.name.toLowerCase() !== d.name.toLowerCase() ? `Name «${d.name}»` : '',
      ].filter(Boolean);
      return { id: t.id, neu: false, abweichend };
    }
  }
  const [neu] = await x
    .insert(k)
    .values({
      name: d.name,
      email,
      telefon: d.telefon || null,
      telefonNorm: tn,
      firma: d.firma || null,
      brandDomain: d.brandDomain || null,
      sprache: d.sprache || 'de',
      quelle: d.quelle,
      ...(einw ? { einwilligungWhatsapp: jetzt, einwilligungWhatsappQuelle: einw, einwilligungSms: jetzt, einwilligungSmsQuelle: einw } : {}),
    })
    .returning({ id: k.id });
  return { id: neu.id, neu: true, abweichend: [] };
}

export async function aktivitaetLoggen(
  x: Exec,
  a: {
    kontaktId: string;
    terminId?: string | null;
    kanal: schema.Kanal;
    richtung?: 'ein' | 'aus' | 'intern';
    titel: string;
    text?: string | null;
    daten?: Record<string, unknown>;
    adminUserId?: string | null;
    angebotId?: string | null;
    auftragId?: string | null;
    rechnungId?: string | null;
  },
) {
  await x.insert(schema.aktivitaet).values({
    kontaktId: a.kontaktId,
    terminId: a.terminId ?? null,
    kanal: a.kanal,
    richtung: a.richtung ?? 'intern',
    titel: a.titel,
    text: a.text ?? null,
    daten: a.daten,
    adminUserId: a.adminUserId ?? null,
    angebotId: a.angebotId ?? null,
    auftragId: a.auftragId ?? null,
    rechnungId: a.rechnungId ?? null,
  });
}

export type DuplikatGruppe = { grund: 'email' | 'telefon' | 'name'; wert: string; ids: string[] };

/** Gruppen möglicher Duplikate: gleiche E-Mail, gleiche Telefonnummer oder gleicher Name (aktive Kontakte). */
export async function duplikatGruppen(): Promise<DuplikatGruppe[]> {
  const rows = await db().execute<{ grund: DuplikatGruppe['grund']; wert: string; ids: string[] }>(sql`
    select 'email' as grund, email as wert, array_agg(id::text order by erstellt_am) as ids
      from kontakt where zusammengefuehrt_in is null and email is not null group by email having count(*) > 1
    union all
    select 'telefon', telefon_norm, array_agg(id::text order by erstellt_am)
      from kontakt where zusammengefuehrt_in is null and telefon_norm is not null group by telefon_norm having count(*) > 1
    union all
    select 'name', lower(name), array_agg(id::text order by erstellt_am)
      from kontakt where zusammengefuehrt_in is null and length(name) > 3 group by lower(name) having count(*) > 1
  `);
  // Gleiche Kontaktmenge nur einmal zeigen (E-Mail vor Telefon vor Name)
  const gesehen = new Set<string>();
  return [...rows].filter((g) => {
    const key = [...g.ids].sort().join(',');
    if (gesehen.has(key)) return false;
    gesehen.add(key);
    return true;
  });
}

/** Führt `quelleId` in `zielId` zusammen: Verlauf, Termine und Belege wandern mit, leere Felder werden ergänzt. */
export async function zusammenfuehren(zielId: string, quelleId: string, adminUserId: string) {
  if (zielId === quelleId) throw new Error('Gleicher Kontakt');
  await db().transaction(async (tx) => {
    const k = schema.kontakt;
    const [ziel] = await tx.select().from(k).where(and(eq(k.id, zielId), isNull(k.zusammengefuehrtIn))).for('update');
    const [quelle] = await tx.select().from(k).where(and(eq(k.id, quelleId), isNull(k.zusammengefuehrtIn))).for('update');
    if (!ziel || !quelle) throw new Error('Kontakt nicht gefunden oder schon zusammengeführt');
    // Nur ein aktives Massblatt je Kontakt: das ältere wird beim Zusammenführen archiviert
    const aktive = await tx
      .select({ id: schema.massblatt.id, kontaktId: schema.massblatt.kontaktId, gemessenAm: schema.massblatt.gemessenAm })
      .from(schema.massblatt)
      .where(and(or(eq(schema.massblatt.kontaktId, zielId), eq(schema.massblatt.kontaktId, quelleId)), eq(schema.massblatt.aktiv, true)));
    if (aktive.length > 1) {
      const aelter = [...aktive].sort((a, b) => a.gemessenAm.getTime() - b.gemessenAm.getTime())[0];
      await tx.update(schema.massblatt).set({ aktiv: false }).where(eq(schema.massblatt.id, aelter.id));
    }
    for (const t of [schema.termin, schema.aktivitaet, schema.angebot, schema.auftrag, schema.rechnung, schema.massblatt]) {
      await tx.update(t).set({ kontaktId: zielId }).where(eq(t.kontaktId, quelleId));
    }
    const frueher = (a: Date | null, b: Date | null) => (a && b ? (a < b ? a : b) : a ?? b);
    await tx
      .update(k)
      .set({
        name: ziel.name || quelle.name,
        email: ziel.email ?? quelle.email,
        telefon: ziel.telefon ?? quelle.telefon,
        telefonNorm: ziel.telefonNorm ?? quelle.telefonNorm,
        firma: ziel.firma ?? quelle.firma,
        brandDomain: ziel.brandDomain ?? quelle.brandDomain,
        notiz: [ziel.notiz, quelle.notiz].filter(Boolean).join('\n\n') || null,
        einwilligungWhatsapp: frueher(ziel.einwilligungWhatsapp, quelle.einwilligungWhatsapp),
        einwilligungWhatsappQuelle: ziel.einwilligungWhatsappQuelle ?? quelle.einwilligungWhatsappQuelle,
        einwilligungSms: frueher(ziel.einwilligungSms, quelle.einwilligungSms),
        einwilligungSmsQuelle: ziel.einwilligungSmsQuelle ?? quelle.einwilligungSmsQuelle,
        abgemeldet: frueher(ziel.abgemeldet, quelle.abgemeldet),
        // Kunde schlägt Lead; Adresse ergänzen
        status: ziel.status === 'kunde' || quelle.status === 'kunde' ? 'kunde' : ziel.status,
        leadPhase: ziel.status === 'kunde' || quelle.status === 'kunde' ? 'gewonnen' : ziel.leadPhase,
        kundeSeit: frueher(ziel.kundeSeit, quelle.kundeSeit),
        anrede: ziel.anrede ?? quelle.anrede,
        strasse: ziel.strasse ?? quelle.strasse,
        plz: ziel.plz ?? quelle.plz,
        ort: ziel.ort ?? quelle.ort,
        erstelltAm: frueher(ziel.erstelltAm, quelle.erstelltAm)!,
        aktualisiertAm: new Date(),
      })
      .where(eq(k.id, zielId));
    await tx.update(k).set({ zusammengefuehrtIn: zielId, aktualisiertAm: new Date() }).where(eq(k.id, quelleId));
    await aktivitaetLoggen(tx, {
      kontaktId: zielId,
      kanal: 'system',
      titel: 'Kontakte zusammengeführt',
      text: `«${quelle.name || quelle.email || quelle.telefon}» wurde in diesen Kontakt übernommen.`,
      daten: { quelleId },
      adminUserId,
    });
  });
}
