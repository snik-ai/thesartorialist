// Gesamtprozess des Ateliers (serverseitig):
// Anfrage → Lead → Beratungstermin → Angebot (Online-Annahme) → Kunde + Auftrag (Planung, Tasks) → Rechnung(en) → Zahlung → abgeschlossen.
import { createHash } from 'node:crypto';
import { and, asc, desc, eq, inArray, isNotNull, ne, sql } from 'drizzle-orm';
import { calculateQRReferenceChecksum, calculateSCORReferenceChecksum } from 'swissqrbill/utils';
import { db, schema } from '@/lib/db';
import type { Abzug, AuftragStatus, BelegSprache, LeadPhase, Position, RechnungArt } from '@/lib/db/schema';
import { belegSprache } from '@/lib/beleg/texte';
import { aktivitaetLoggen } from './kontakte';
import { belegTexte, firma, mwstSatzVon, type Firma } from './firma';
import { naechsteNummer, type Exec } from './nummern';
import { rund5, summen } from './geld';
import { AUFTRAG_LABEL, schrittIndex } from './belege';
import { zufallsToken } from '@/lib/admin/sicherheit';

export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

const PHASE_ORDNUNG: LeadPhase[] = ['neu', 'termin', 'angebot', 'gewonnen'];

/** Pipeline nur vorwärts (verloren wird durch neue Aktivität wieder geöffnet). Kunden bleiben Kunden. */
export async function leadPhaseSetzen(x: Exec, kontaktId: string, phase: LeadPhase) {
  const [k] = await x.select({ status: schema.kontakt.status, phase: schema.kontakt.leadPhase }).from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
  if (!k || k.status !== 'lead') return;
  if (k.phase === 'verloren' || PHASE_ORDNUNG.indexOf(phase) > PHASE_ORDNUNG.indexOf(k.phase)) {
    await x.update(schema.kontakt).set({ leadPhase: phase, verlorenGrund: null, aktualisiertAm: new Date() }).where(eq(schema.kontakt.id, kontaktId));
  }
}

const tageSpaeter = (d: Date, tage: number) => new Date(d.getTime() + tage * 86400_000);
/** Arbeitstage (Mo–Fr) addieren */
function arbeitstage(d: Date, n: number) {
  const x = new Date(d);
  let rest = n;
  while (rest > 0) {
    x.setUTCDate(x.getUTCDate() + 1);
    const wt = x.getUTCDay();
    if (wt !== 0 && wt !== 6) rest--;
  }
  return x;
}

/* ---------- Angebot ---------- */

export async function angebotErstellen(o: { kontaktId: string; terminId?: string | null; adminId: string; titel?: string }) {
  const f = await firma();
  return db().transaction(async (tx) => {
    // Stil-Auswahl und Stoffe aus der Anfrage übernehmen (gewählte Anfrage, sonst die neueste mit Stil)
    const [t] = o.terminId
      ? await tx.select().from(schema.termin).where(and(eq(schema.termin.id, o.terminId), eq(schema.termin.kontaktId, o.kontaktId))).limit(1)
      : await tx
          .select()
          .from(schema.termin)
          .where(and(eq(schema.termin.kontaktId, o.kontaktId), sql`jsonb_array_length(${schema.termin.stil}) > 0`))
          .orderBy(desc(schema.termin.erstelltAm))
          .limit(1);
    const [kk] = await tx.select({ sprache: schema.kontakt.sprache }).from(schema.kontakt).where(eq(schema.kontakt.id, o.kontaktId)).limit(1);
    const sprache = belegSprache(kk?.sprache);
    const texte = belegTexte(f, sprache);
    const nummer = await naechsteNummer(tx, 'AN');
    const [a] = await tx
      .insert(schema.angebot)
      .values({
        kontaktId: o.kontaktId,
        terminId: t?.id ?? null,
        nummer,
        titel: o.titel || (t?.stil.length ? 'Massanfertigung nach Ihrer Stil-Auswahl' : 'Massanfertigung'),
        einleitung: texte.angebotEinleitung,
        schluss: texte.angebotSchluss,
        sprache,
        stil: t?.stil ?? [],
        stoffe: t?.stoffe ?? [],
        mwstSatz: mwstSatzVon(f),
        gueltigBis: tageSpaeter(new Date(), f.angebotGueltigTage),
        erstelltVon: o.adminId,
      })
      .returning({ id: schema.angebot.id });
    await aktivitaetLoggen(tx, { kontaktId: o.kontaktId, kanal: 'system', titel: `Angebot ${nummer} erstellt (Entwurf)`, angebotId: a.id, adminUserId: o.adminId });
    return { id: a.id, nummer };
  });
}

/** Neuer Annahme-Link: 32 Byte Zufall, gespeichert wird nur der sha256-Hash. Alte Links werden ungültig. */
export async function angebotLinkNeu(x: Exec, angebotId: string) {
  const token = zufallsToken(32);
  await x.update(schema.angebot).set({ tokenHash: tokenHash(token), aktualisiertAm: new Date() }).where(eq(schema.angebot.id, angebotId));
  return token;
}

export class AblaufFehler extends Error {
  constructor(
    msg: string,
    public status = 400,
  ) {
    super(msg);
  }
}

/** Angebot annehmen (online über den Link oder im Atelier erfasst): Kontakt wird Kunde, Auftrag mit Planung entsteht. */
export async function angebotAnnehmen(angebotId: string, o: { name: string; weg: 'online' | 'atelier'; adminId?: string | null }) {
  const f = await firma();
  return db().transaction(async (tx) => {
    const [a] = await tx.select().from(schema.angebot).where(eq(schema.angebot.id, angebotId)).for('update');
    if (!a || !a.kontaktId) throw new AblaufFehler('Angebot nicht gefunden', 404);
    if (a.status === 'angenommen') {
      const [au] = await tx.select({ id: schema.auftrag.id, nummer: schema.auftrag.nummer }).from(schema.auftrag).where(eq(schema.auftrag.angebotId, a.id)).limit(1);
      return { auftragId: au?.id ?? null, nummer: au?.nummer ?? null, schon: true };
    }
    if (o.weg === 'online') {
      if (a.status !== 'gesendet') throw new AblaufFehler('Dieses Angebot kann nicht mehr online angenommen werden.', 409);
      if (a.gueltigBis && a.gueltigBis.getTime() < Date.now() - 86400_000) throw new AblaufFehler('Dieses Angebot ist abgelaufen. Bitte melden Sie sich bei uns.', 410);
    } else if (!['entwurf', 'gesendet', 'abgelehnt'].includes(a.status)) {
      throw new AblaufFehler('Angebot ist storniert.', 409);
    }
    const jetzt = new Date();
    await tx
      .update(schema.angebot)
      .set({ status: 'angenommen', angenommenAm: jetzt, angenommenName: o.name.slice(0, 120), angenommenWeg: o.weg, aktualisiertAm: jetzt })
      .where(eq(schema.angebot.id, a.id));

    const [k] = await tx.select().from(schema.kontakt).where(eq(schema.kontakt.id, a.kontaktId)).for('update');
    const wurdeKunde = k.status !== 'kunde';
    await tx
      .update(schema.kontakt)
      .set({ status: 'kunde', leadPhase: 'gewonnen', verlorenGrund: null, kundeSeit: k.kundeSeit ?? jetzt, aktualisiertAm: jetzt })
      .where(eq(schema.kontakt.id, k.id));

    const [mb] = await tx
      .select({ id: schema.massblatt.id })
      .from(schema.massblatt)
      .where(and(eq(schema.massblatt.kontaktId, k.id), eq(schema.massblatt.aktiv, true)))
      .limit(1);
    const nummer = await naechsteNummer(tx, 'AU');
    const [au] = await tx
      .insert(schema.auftrag)
      .values({
        kontaktId: k.id,
        angebotId: a.id,
        nummer,
        titel: a.titel,
        status: 'mass',
        positionen: a.positionen,
        stil: a.stil,
        stoffe: a.stoffe,
        rabattProzent: a.rabattProzent,
        rabattRp: a.rabattRp,
        mwstSatz: a.mwstSatz,
        mwstRp: a.mwstRp,
        totalRp: a.totalRp,
        massblattId: mb?.id ?? null,
        zustaendigId: o.adminId ?? a.erstelltVon ?? null,
        statusZeiten: { mass: jetzt.toISOString() },
      })
      .returning({ id: schema.auftrag.id });
    const tasks = standardTasks(f, jetzt, Boolean(mb));
    await tx.insert(schema.auftragTask).values(tasks.map((t, i) => ({ ...t, auftragId: au.id, reihenfolge: i, zustaendigId: o.adminId ?? a.erstelltVon ?? null })));
    if (mb) await tx.update(schema.massblatt).set({ auftragId: au.id }).where(and(eq(schema.massblatt.id, mb.id), sql`${schema.massblatt.auftragId} is null`));

    await aktivitaetLoggen(tx, {
      kontaktId: k.id,
      kanal: o.weg === 'online' ? 'formular' : 'system',
      richtung: o.weg === 'online' ? 'ein' : 'intern',
      titel: o.weg === 'online' ? `Angebot ${a.nummer} online angenommen` : `Angebot ${a.nummer} angenommen (im Atelier erfasst)`,
      text: `Angenommen von «${o.name}»`,
      angebotId: a.id,
      adminUserId: o.adminId ?? null,
    });
    if (wurdeKunde) await aktivitaetLoggen(tx, { kontaktId: k.id, kanal: 'system', titel: 'Vom Lead zum Kunden', angebotId: a.id, adminUserId: o.adminId ?? null });
    await aktivitaetLoggen(tx, { kontaktId: k.id, kanal: 'system', titel: `Auftrag ${nummer} eröffnet`, text: `${tasks.length} Aufgaben geplant`, auftragId: au.id, angebotId: a.id, adminUserId: o.adminId ?? null });
    return { auftragId: au.id, nummer, schon: false };
  });
}

/** Standard-Planung eines Massauftrags (Fälligkeiten ab Auftragseingang, Produktion nach Firmeneinstellung) */
export function standardTasks(f: Firma, start: Date, massblattDa: boolean) {
  const prod = arbeitstage(start, 2 + f.produktionTage);
  const t = (titel: string, schritt: AuftragStatus, faelligAm: Date | null) => ({ titel, schritt, faelligAm });
  return [
    t(massblattDa ? 'Massblatt prüfen und bestätigen' : 'Masse nehmen und Massblatt erfassen', 'mass', tageSpaeter(start, 1)),
    t('Stoff bei Holland & Sherry bestellen', 'bestellt', arbeitstage(start, 2)),
    t('Futter, Knöpfe und Details festlegen und bestellen', 'bestellt', arbeitstage(start, 2)),
    t('Auftrag an die Manufaktur senden, Liefertermin eintragen', 'produktion', arbeitstage(start, 3)),
    t('Wareneingang prüfen', 'eingang', prod),
    t('Anprobe-Termin mit dem Kunden vereinbaren', 'anprobe', prod),
    t('Änderungen nach der Anprobe erledigen', 'aenderung', arbeitstage(prod, 5)),
    t('Kunden informieren: abholbereit', 'fertig', arbeitstage(prod, 7)),
    t('Schlussrechnung stellen', 'abgeholt', arbeitstage(prod, 8)),
  ];
}

/* ---------- Auftrag ---------- */

/** Status setzen (Zeitstempel je Schritt). Beim Zurückgehen bleiben spätere Zeitstempel als Historie erhalten. */
export async function auftragStatusSetzen(auftragId: string, status: AuftragStatus, adminId: string | null, extra: { liefertermin?: Date | null } = {}) {
  return db().transaction(async (tx) => {
    const [au] = await tx.select().from(schema.auftrag).where(eq(schema.auftrag.id, auftragId)).for('update');
    if (!au) throw new AblaufFehler('Auftrag nicht gefunden', 404);
    if (au.status === status && extra.liefertermin === undefined) return au;
    const jetzt = new Date();
    const zeiten = { ...au.statusZeiten, [status]: au.statusZeiten[status] && schrittIndex(status) <= schrittIndex(au.status) ? au.statusZeiten[status] : jetzt.toISOString() };
    await tx
      .update(schema.auftrag)
      .set({
        status,
        statusZeiten: zeiten,
        ...(extra.liefertermin !== undefined ? { liefertermin: extra.liefertermin } : {}),
        abgeschlossenAm: status === 'abgeschlossen' ? jetzt : null,
        aktualisiertAm: jetzt,
      })
      .where(eq(schema.auftrag.id, auftragId));
    // Erledigte Schritte: offene Tasks früherer Schritte bleiben offen (bewusst sichtbar), keine Automatik.
    await aktivitaetLoggen(tx, { kontaktId: au.kontaktId!, kanal: 'system', titel: `${au.nummer}: ${AUFTRAG_LABEL[status]}`, auftragId, adminUserId: adminId });
    return { ...au, status };
  });
}

/** Abgeholt + alle Rechnungen bezahlt (mindestens eine) → automatisch abgeschlossen */
export async function auftragAbschliessenWennBezahlt(auftragId: string, adminId: string | null) {
  const [au] = await db().select({ status: schema.auftrag.status }).from(schema.auftrag).where(eq(schema.auftrag.id, auftragId)).limit(1);
  if (!au || au.status !== 'abgeholt') return false;
  const rs = await db()
    .select({ status: schema.rechnung.status, art: schema.rechnung.art })
    .from(schema.rechnung)
    .where(and(eq(schema.rechnung.auftragId, auftragId), ne(schema.rechnung.status, 'storniert'), ne(schema.rechnung.status, 'entwurf')));
  if (!rs.length || rs.some((r) => r.status !== 'bezahlt') || !rs.some((r) => r.art !== 'anzahlung')) return false;
  await auftragStatusSetzen(auftragId, 'abgeschlossen', adminId);
  return true;
}

/* ---------- Rechnung ---------- */

/** Zahlungsreferenz: QR-Referenz (27 Ziffern) bei QR-IBAN, sonst Creditor Reference (RF…) */
export function referenzFuer(f: Firma, nummer: string): string | null {
  const ziffern = nummer.replace(/\D/g, '');
  if (f.qrIban.trim()) {
    const basis = ziffern.padStart(26, '0').slice(-26);
    return basis + calculateQRReferenceChecksum(basis);
  }
  if (f.iban.trim()) {
    const basis = ziffern || '1';
    return `RF${calculateSCORReferenceChecksum(basis)}${basis}`;
  }
  return null;
}

const AUF_AUFTRAG: Record<BelegSprache, { anzahlung: string; auf: string; total: string }> = {
  de: { anzahlung: 'Anzahlung', auf: 'auf Auftrag', total: 'Total' },
  en: { anzahlung: 'Deposit', auf: 'on order', total: 'total' },
  fr: { anzahlung: 'Acompte', auf: 'sur la commande', total: 'total' },
  it: { anzahlung: 'Acconto', auf: "sull'ordine", total: 'totale' },
};

/**
 * Rechnung zu einem Auftrag: Anzahlung/Rate (Prozent ODER fester Betrag), Schlussrechnung (alles minus bisherige
 * Anzahlungen bzw. Raten) oder Einzelrechnung. Sprache und Standardtexte nach der Sprache des Kunden.
 */
export async function rechnungErstellen(o: { auftragId?: string | null; kontaktId?: string; art: RechnungArt; prozent?: number; betragRp?: number; bezeichnung?: string; faelligAm?: Date | null; adminId: string }) {
  const f = await firma();
  return db().transaction(async (tx) => {
    const [au] = o.auftragId ? await tx.select().from(schema.auftrag).where(eq(schema.auftrag.id, o.auftragId)).for('update') : [];
    const kontaktId = au?.kontaktId ?? o.kontaktId;
    if (!kontaktId) throw new AblaufFehler('Kunde fehlt');
    const [k] = await tx.select({ sprache: schema.kontakt.sprache }).from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
    const sprache = belegSprache(k?.sprache);
    const texte = belegTexte(f, sprache);
    const W = AUF_AUFTRAG[sprache];
    const jetzt = new Date();
    const nummer = await naechsteNummer(tx, 'RE');
    let positionen: Position[] = au?.positionen ?? [];
    let rabattProzent = au?.rabattProzent ?? 0;
    let rabattRp = au?.rabattRp ?? 0;
    let abzug: Abzug[] = [];
    let titel = au ? au.titel : 'Rechnung';
    let einleitung = texte.rechnungEinleitung;
    const mwstSatz = au?.mwstSatz ?? mwstSatzVon(f);
    if (o.art === 'anzahlung') {
      if (!au) throw new AblaufFehler('Anzahlung nur zu einem Auftrag');
      const fest = o.betragRp !== undefined && Number.isFinite(o.betragRp) && o.betragRp > 0;
      const p = Math.min(100, Math.max(1, Math.round(o.prozent ?? f.anzahlungProzent)));
      const betrag = fest ? Math.round(o.betragRp!) : rund5((au.totalRp * p) / 100);
      if (betrag > au.totalRp) throw new AblaufFehler('Der Betrag ist höher als das Total des Auftrags.');
      const bezeichnung = o.bezeichnung?.trim() || (fest ? W.anzahlung : `${W.anzahlung} ${p} %`);
      positionen = [{ id: 'anzahlung', art: 'position', kategorie: 'sonstiges', bezeichnung, beschreibung: `${W.auf} ${au.nummer}${au.titel ? ` · ${au.titel}` : ''} (${W.total} CHF ${(au.totalRp / 100).toFixed(2)})`, menge: 1, einheit: 'Stk.', einzelpreisRp: betrag, mwstSatz }];
      rabattProzent = 0;
      rabattRp = 0;
      titel = `${bezeichnung} · ${au.titel || au.nummer}`;
      einleitung = texte.anzahlungEinleitung;
    } else if (o.art === 'schluss' && au) {
      const anz = await tx
        .select()
        .from(schema.rechnung)
        .where(and(eq(schema.rechnung.auftragId, au.id), eq(schema.rechnung.art, 'anzahlung'), inArray(schema.rechnung.status, ['offen', 'teilbezahlt', 'bezahlt'])))
        .orderBy(asc(schema.rechnung.erstelltAm));
      abzug = anz.map((r) => ({ rechnungId: r.id, nummer: r.nummer ?? '', datum: (r.rechnungsdatum ?? r.erstelltAm).toISOString(), betragRp: r.totalRp }));
      titel = au.titel || 'Schlussrechnung';
    }
    const s = summen(positionen, { rabattProzent, rabattRp, mwstSatz });
    const betragRp = Math.max(0, s.totalRp - abzug.reduce((x, a) => x + a.betragRp, 0));
    const [r] = await tx
      .insert(schema.rechnung)
      .values({
        kontaktId,
        auftragId: au?.id ?? null,
        nummer,
        art: o.art,
        status: 'entwurf',
        titel,
        einleitung,
        schluss: texte.rechnungSchluss,
        positionen,
        rabattProzent,
        rabattRp,
        mwstSatz,
        mwstRp: s.mwstRp,
        totalRp: s.totalRp,
        abzug,
        betragRp,
        rechnungsdatum: jetzt,
        faelligAm: o.faelligAm ?? tageSpaeter(jetzt, f.zahlungsfristTage),
        referenz: referenzFuer(f, nummer),
        sprache,
        erstelltVon: o.adminId,
      })
      .returning({ id: schema.rechnung.id });
    await aktivitaetLoggen(tx, { kontaktId, kanal: 'system', titel: `${o.art === 'anzahlung' ? 'Anzahlungsrechnung' : o.art === 'schluss' ? 'Schlussrechnung' : 'Rechnung'} ${nummer} erstellt (Entwurf)`, rechnungId: r.id, auftragId: au?.id ?? null, adminUserId: o.adminId });
    return { id: r.id, nummer };
  });
}

/** Bezahlt-Summe aus den Zahlungen, Status neu (offen → teilbezahlt → bezahlt). */
export async function rechnungNachrechnen(x: Exec, rechnungId: string) {
  const [r] = await x.select().from(schema.rechnung).where(eq(schema.rechnung.id, rechnungId)).limit(1);
  if (!r) return null;
  const [{ summe }] = await x.select({ summe: sql<number>`coalesce(sum(${schema.zahlung.betragRp}), 0)::int` }).from(schema.zahlung).where(eq(schema.zahlung.rechnungId, rechnungId));
  const [{ letzte }] = await x.select({ letzte: sql<Date | null>`max(${schema.zahlung.datum})` }).from(schema.zahlung).where(eq(schema.zahlung.rechnungId, rechnungId));
  let status = r.status;
  // Bezahlt erst, wenn auch die Mahngebühren beglichen sind
  const soll = r.betragRp + (r.mahngebuehrenRp ?? 0);
  if (r.status !== 'storniert' && r.status !== 'entwurf') status = summe >= soll && soll > 0 ? 'bezahlt' : summe > 0 ? 'teilbezahlt' : 'offen';
  if (r.status !== 'storniert' && r.status !== 'entwurf' && r.betragRp === 0) status = 'bezahlt';
  await x
    .update(schema.rechnung)
    .set({ bezahltRp: summe, status, bezahltAm: status === 'bezahlt' ? (letzte ? new Date(letzte) : new Date()) : null, aktualisiertAm: new Date() })
    .where(eq(schema.rechnung.id, rechnungId));
  return { ...r, bezahltRp: summe, status };
}

/** Offene Anzahlungen eines Auftrags (für die Schlussrechnung) */
export async function auftragRechnungen(auftragId: string) {
  return db().select().from(schema.rechnung).where(and(eq(schema.rechnung.auftragId, auftragId), isNotNull(schema.rechnung.nummer))).orderBy(asc(schema.rechnung.erstelltAm));
}
