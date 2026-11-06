// Datenbank-Schema (Drizzle, PostgreSQL). Migrationen: `npm run db:generate` erzeugt SQL in drizzle/,
// `npm run db:migrate` bzw. der Serverstart (instrumentation.ts) spielt sie idempotent ein.
import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  primaryKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer }>({ dataType: () => 'bytea' });
const zeit = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });
const id = () => uuid('id').primaryKey().default(sql`gen_random_uuid()`);
const erstellt = () => zeit('erstellt_am').notNull().defaultNow();

/* ---------- Zugang ---------- */

/** Admin-Personen. Wer sich anmelden darf, steht hier (aktiv = true); verwaltet unter /admin/einstellungen. */
export const adminUser = pgTable('admin_user', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  aktiv: boolean('aktiv').notNull().default(true),
  fehlversuche: integer('fehlversuche').notNull().default(0),
  gesperrtBis: zeit('gesperrt_bis'),
  letzteAnmeldung: zeit('letzte_anmeldung'),
  erstelltAm: erstellt(),
});

/** Login-Codes: nur HMAC(email:code), 10 Minuten gültig, einmalig, max. 5 Versuche. */
export const loginCode = pgTable(
  'login_code',
  {
    id: id(),
    email: text('email').notNull(),
    codeHash: text('code_hash').notNull(),
    gueltigBis: zeit('gueltig_bis').notNull(),
    versuche: integer('versuche').notNull().default(0),
    verbrauchtAm: zeit('verbraucht_am'),
    erstelltAm: erstellt(),
  },
  (t) => [index('login_code_email_idx').on(t.email, t.erstelltAm)],
);

export const passkey = pgTable('passkey', {
  id: id(),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUser.id, { onDelete: 'cascade' }),
  credentialId: text('credential_id').notNull().unique(),
  publicKey: bytea('public_key').notNull(),
  zaehler: bigint('zaehler', { mode: 'number' }).notNull().default(0),
  transports: jsonb('transports').$type<string[]>(),
  name: text('name'),
  erstelltAm: erstellt(),
  zuletztBenutzt: zeit('zuletzt_benutzt'),
});

export const passkeyChallenge = pgTable('passkey_challenge', {
  id: id(),
  challenge: text('challenge').notNull(),
  zweck: text('zweck').$type<'registrierung' | 'anmeldung'>().notNull(),
  adminUserId: uuid('admin_user_id').references(() => adminUser.id, { onDelete: 'cascade' }),
  gueltigBis: zeit('gueltig_bis').notNull(),
  verbrauchtAm: zeit('verbraucht_am'),
  erstelltAm: erstellt(),
});

/** Sitzungen: nur HMAC des Tokens gespeichert, Cookie HttpOnly. */
export const sitzung = pgTable('sitzung', {
  id: id(),
  tokenHash: text('token_hash').notNull().unique(),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUser.id, { onDelete: 'cascade' }),
  methode: text('methode').$type<'code' | 'passkey'>().notNull(),
  userAgent: text('user_agent'),
  gueltigBis: zeit('gueltig_bis').notNull(),
  zuletztAm: zeit('zuletzt_am').notNull().defaultNow(),
  erstelltAm: erstellt(),
});

/* ---------- CRM ---------- */

/**
 * Kontakt (Golden Record): eine Person, zusammengeführt über E-Mail ODER Telefon (letzte 9 Ziffern).
 * Zusammengeführte Datensätze bleiben mit `zusammengefuehrt_in` als Spur erhalten.
 */
export const kontakt = pgTable(
  'kontakt',
  {
    id: id(),
    name: text('name').notNull().default(''),
    email: text('email'),
    telefon: text('telefon'),
    telefonNorm: text('telefon_norm'),
    firma: text('firma'),
    brandDomain: text('brand_domain'),
    sprache: text('sprache').notNull().default('de'),
    quelle: text('quelle'),
    notiz: text('notiz'),
    einwilligungWhatsapp: zeit('einwilligung_whatsapp'),
    einwilligungWhatsappQuelle: text('einwilligung_whatsapp_quelle'),
    einwilligungSms: zeit('einwilligung_sms'),
    einwilligungSmsQuelle: text('einwilligung_sms_quelle'),
    abgemeldet: zeit('abgemeldet'),
    zusammengefuehrtIn: uuid('zusammengefuehrt_in'),
    /** lead → kunde (automatisch bei angenommenem Angebot) → inaktiv */
    status: text('status').$type<KontaktStatus>().notNull().default('lead'),
    /** Pipeline der Leads: neu → termin → angebot → gewonnen | verloren */
    leadPhase: text('lead_phase').$type<LeadPhase>().notNull().default('neu'),
    verlorenGrund: text('verloren_grund'),
    /** Geschätztes Umsatzpotenzial (Rappen), sonst zählt das offene Angebot */
    potenzialRp: integer('potenzial_rp'),
    kundeSeit: zeit('kunde_seit'),
    anrede: text('anrede'),
    strasse: text('strasse'),
    plz: text('plz'),
    ort: text('ort'),
    land: text('land').notNull().default('CH'),
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [index('kontakt_email_idx').on(t.email), index('kontakt_tel_idx').on(t.telefonNorm), index('kontakt_status_idx').on(t.status, t.leadPhase)],
);

export type KontaktStatus = 'lead' | 'kunde' | 'inaktiv';
export type LeadPhase = 'neu' | 'termin' | 'angebot' | 'gewonnen' | 'verloren';

export type TerminStatus = 'angefragt' | 'bestaetigt' | 'vorgeschlagen' | 'abgesagt' | 'erledigt';
export type StilZeileDb = { kategorie: string; untergruppe: string; option: string };

/** Termin- und Rückrufanfragen (art). Zeiten als timestamptz, angezeigt in Europe/Zurich. */
export const termin = pgTable(
  'termin',
  {
    id: id(),
    kontaktId: uuid('kontakt_id')
      .notNull()
      .references(() => kontakt.id),
    art: text('art').$type<'termin' | 'rueckruf'>().notNull().default('termin'),
    status: text('status').$type<TerminStatus>().notNull().default('angefragt'),
    wunschStart: zeit('wunsch_start'),
    wunschText: text('wunsch_text'),
    bestaetigtStart: zeit('bestaetigt_start'),
    vorschlaege: jsonb('vorschlaege').$type<string[]>().notNull().default([]),
    stil: jsonb('stil').$type<StilZeileDb[]>().notNull().default([]),
    stoffe: jsonb('stoffe').$type<string[]>().notNull().default([]),
    quelle: text('quelle'),
    sprache: text('sprache').notNull().default('de'),
    /** Eingangsbestätigung an den Kunden verschickt (null = noch offen, z. B. ohne Resend) */
    eingangMailAm: zeit('eingang_mail_am'),
    /** Meldung ans Atelier verschickt */
    atelierMailAm: zeit('atelier_mail_am'),
    gelesenAm: zeit('gelesen_am'),
    /** Erinnerungs-Mail 2 h vor dem Termin verschickt (wird beim Verschieben zurückgesetzt) */
    erinnerungGesendetAm: zeit('erinnerung_gesendet_am'),
    /** beratung (Website) | massnehmen | anprobe | abholung (aus dem Auftrag geplant) */
    zweck: text('zweck').$type<TerminZweck>().notNull().default('beratung'),
    auftragId: uuid('auftrag_id'),
    dauerMin: integer('dauer_min').notNull().default(90),
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [index('termin_status_idx').on(t.status, t.erstelltAm), index('termin_kontakt_idx').on(t.kontaktId)],
);

export type TerminZweck = 'beratung' | 'massnehmen' | 'anprobe' | 'abholung';

export type Kanal = 'mail' | 'whatsapp' | 'sms' | 'anruf' | 'notiz' | 'formular' | 'system';

/** Verlauf je Kontakt: Mails, WhatsApp, SMS, Anrufe, Notizen, Systemereignisse. */
export const aktivitaet = pgTable(
  'aktivitaet',
  {
    id: id(),
    kontaktId: uuid('kontakt_id')
      .notNull()
      .references(() => kontakt.id),
    terminId: uuid('termin_id').references(() => termin.id, { onDelete: 'set null' }),
    kanal: text('kanal').$type<Kanal>().notNull(),
    richtung: text('richtung').$type<'ein' | 'aus' | 'intern'>().notNull().default('intern'),
    titel: text('titel').notNull(),
    text: text('text'),
    daten: jsonb('daten').$type<Record<string, unknown>>(),
    adminUserId: uuid('admin_user_id').references(() => adminUser.id, { onDelete: 'set null' }),
    angebotId: uuid('angebot_id'),
    auftragId: uuid('auftrag_id'),
    rechnungId: uuid('rechnung_id'),
    erstelltAm: erstellt(),
  },
  (t) => [index('aktivitaet_kontakt_idx').on(t.kontaktId, t.erstelltAm), index('aktivitaet_auftrag_idx').on(t.auftragId, t.erstelltAm)],
);

/**
 * Cookieloses Tracking. `besucher` = sha256(IP|UA|Tag|Secret) gekürzt — wechselt täglich, IP wird nie gespeichert.
 * typ: pageview, click_tel, click_whatsapp, click_mail, click_route, cta, form_submit
 */
export const ereignis = pgTable(
  'ereignis',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    zeit: zeit('zeit').notNull().defaultNow(),
    typ: text('typ').notNull(),
    pfad: text('pfad').notNull(),
    referrer: text('referrer'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    geraet: text('geraet').$type<'mobil' | 'tablet' | 'desktop'>(),
    sprache: text('sprache'),
    besucher: text('besucher').notNull(),
    label: text('label'),
  },
  (t) => [index('ereignis_zeit_idx').on(t.zeit), index('ereignis_typ_zeit_idx').on(t.typ, t.zeit)],
);

/* ---------- Atelier: Angebote, Aufträge, Rechnungen, Massblätter (Phase 2) ---------- */

/** Position auf Angebot, Auftrag und Rechnung. Preise in Rappen, inkl. MWST. */
export type Position = {
  id: string;
  kategorie: string;
  bezeichnung: string;
  beschreibung?: string;
  stoffnummer?: string;
  menge: number;
  einzelpreisRp: number;
  rabattProzent?: number;
};

const prozent = (name: string) => numeric(name, { precision: 5, scale: 2, mode: 'number' });
const satz = (name: string) => numeric(name, { precision: 4, scale: 2, mode: 'number' });

export type AngebotStatus = 'entwurf' | 'gesendet' | 'angenommen' | 'abgelehnt' | 'storniert';

export const angebot = pgTable(
  'angebot',
  {
    id: id(),
    kontaktId: uuid('kontakt_id').references(() => kontakt.id),
    terminId: uuid('termin_id').references(() => termin.id, { onDelete: 'set null' }),
    nummer: text('nummer').unique(),
    status: text('status').$type<AngebotStatus>().notNull().default('entwurf'),
    titel: text('titel').notNull().default(''),
    einleitung: text('einleitung'),
    schluss: text('schluss'),
    positionen: jsonb('positionen').$type<Position[]>().notNull().default([]),
    stil: jsonb('stil').$type<StilZeileDb[]>().notNull().default([]),
    stoffe: jsonb('stoffe').$type<string[]>().notNull().default([]),
    rabattProzent: prozent('rabatt_prozent').notNull().default(0),
    rabattRp: integer('rabatt_rp').notNull().default(0),
    mwstSatz: satz('mwst_satz').notNull().default(8.1),
    mwstRp: integer('mwst_rp').notNull().default(0),
    totalRp: integer('total_rp').notNull().default(0),
    gueltigBis: zeit('gueltig_bis'),
    notiz: text('notiz'),
    /** sha256 des Annahme-Links (32 Byte Zufall, nur im Mail-Link im Klartext) */
    tokenHash: text('token_hash'),
    gesendetAm: zeit('gesendet_am'),
    angesehenAm: zeit('angesehen_am'),
    angenommenAm: zeit('angenommen_am'),
    angenommenName: text('angenommen_name'),
    /** online | atelier (mündlich/unterschrieben, im Backend erfasst) */
    angenommenWeg: text('angenommen_weg'),
    abgelehntAm: zeit('abgelehnt_am'),
    abgelehntGrund: text('abgelehnt_grund'),
    erstelltVon: uuid('erstellt_von'),
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('angebot_token_idx').on(t.tokenHash), index('angebot_kontakt_idx').on(t.kontaktId, t.erstelltAm)],
);

export type AuftragStatus = 'mass' | 'bestellt' | 'produktion' | 'eingang' | 'anprobe' | 'aenderung' | 'fertig' | 'abgeholt' | 'abgeschlossen' | 'storniert';

export const auftrag = pgTable(
  'auftrag',
  {
    id: id(),
    kontaktId: uuid('kontakt_id').references(() => kontakt.id),
    angebotId: uuid('angebot_id').references(() => angebot.id, { onDelete: 'set null' }),
    nummer: text('nummer').unique(),
    status: text('status').$type<AuftragStatus>().notNull().default('mass'),
    titel: text('titel').notNull().default(''),
    positionen: jsonb('positionen').$type<Position[]>().notNull().default([]),
    stil: jsonb('stil').$type<StilZeileDb[]>().notNull().default([]),
    stoffe: jsonb('stoffe').$type<string[]>().notNull().default([]),
    rabattProzent: prozent('rabatt_prozent').notNull().default(0),
    rabattRp: integer('rabatt_rp').notNull().default(0),
    mwstSatz: satz('mwst_satz').notNull().default(8.1),
    mwstRp: integer('mwst_rp').notNull().default(0),
    totalRp: integer('total_rp').notNull().default(0),
    /** Liefertermin der Produktion (Eingang im Atelier erwartet) */
    liefertermin: zeit('liefertermin'),
    /** Anlass des Kunden (z. B. Hochzeit) — davor muss alles fertig sein */
    anlass: text('anlass'),
    anlassDatum: zeit('anlass_datum'),
    abholungGeplant: zeit('abholung_geplant'),
    bestellnotiz: text('bestellnotiz'),
    massblattId: uuid('massblatt_id'),
    zustaendigId: uuid('zustaendig_id'),
    /** Zeitpunkt je erreichtem Status: { bestellt: ISO, … } */
    statusZeiten: jsonb('status_zeiten').$type<Partial<Record<AuftragStatus, string>>>().notNull().default({}),
    abgeschlossenAm: zeit('abgeschlossen_am'),
    notiz: text('notiz'),
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [index('auftrag_status_idx').on(t.status, t.liefertermin), index('auftrag_kontakt_idx').on(t.kontaktId)],
);

export const auftragTask = pgTable(
  'auftrag_task',
  {
    id: id(),
    auftragId: uuid('auftrag_id')
      .notNull()
      .references(() => auftrag.id, { onDelete: 'cascade' }),
    titel: text('titel').notNull(),
    schritt: text('schritt').$type<AuftragStatus>(),
    faelligAm: zeit('faellig_am'),
    erledigtAm: zeit('erledigt_am'),
    erledigtVon: uuid('erledigt_von').references(() => adminUser.id, { onDelete: 'set null' }),
    zustaendigId: uuid('zustaendig_id').references(() => adminUser.id, { onDelete: 'set null' }),
    reihenfolge: integer('reihenfolge').notNull().default(0),
    erstelltAm: erstellt(),
  },
  (t) => [index('auftrag_task_auftrag_idx').on(t.auftragId, t.reihenfolge)],
);

export type RechnungStatus = 'entwurf' | 'offen' | 'teilbezahlt' | 'bezahlt' | 'storniert';
export type RechnungArt = 'rechnung' | 'anzahlung' | 'schluss';
/** Abzug auf der Schlussrechnung: bereits verrechnete Anzahlungen */
export type Abzug = { rechnungId: string; nummer: string; datum: string; betragRp: number };

export const rechnung = pgTable(
  'rechnung',
  {
    id: id(),
    kontaktId: uuid('kontakt_id').references(() => kontakt.id),
    auftragId: uuid('auftrag_id').references(() => auftrag.id, { onDelete: 'set null' }),
    nummer: text('nummer').unique(),
    art: text('art').$type<RechnungArt>().notNull().default('rechnung'),
    status: text('status').$type<RechnungStatus>().notNull().default('entwurf'),
    titel: text('titel').notNull().default(''),
    einleitung: text('einleitung'),
    schluss: text('schluss'),
    positionen: jsonb('positionen').$type<Position[]>().notNull().default([]),
    rabattProzent: prozent('rabatt_prozent').notNull().default(0),
    rabattRp: integer('rabatt_rp').notNull().default(0),
    mwstSatz: satz('mwst_satz').notNull().default(8.1),
    mwstRp: integer('mwst_rp').notNull().default(0),
    /** Total der Positionen (inkl. MWST) */
    totalRp: integer('total_rp').notNull().default(0),
    abzug: jsonb('abzug').$type<Abzug[]>().notNull().default([]),
    /** Zu zahlen = Total − Abzüge */
    betragRp: integer('betrag_rp').notNull().default(0),
    bezahltRp: integer('bezahlt_rp').notNull().default(0),
    rechnungsdatum: zeit('rechnungsdatum'),
    faelligAm: zeit('faellig_am'),
    bezahltAm: zeit('bezahlt_am'),
    gesendetAm: zeit('gesendet_am'),
    /** QR-Referenz (bei QR-IBAN) bzw. SCOR-Referenz (RF…) */
    referenz: text('referenz'),
    storniertAm: zeit('storniert_am'),
    erstelltVon: uuid('erstellt_von'),
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [index('rechnung_status_idx').on(t.status, t.faelligAm), index('rechnung_auftrag_idx').on(t.auftragId)],
);

export type ZahlungArt = 'bank' | 'twint' | 'karte' | 'bar';

export const zahlung = pgTable(
  'zahlung',
  {
    id: id(),
    rechnungId: uuid('rechnung_id')
      .notNull()
      .references(() => rechnung.id, { onDelete: 'cascade' }),
    betragRp: integer('betrag_rp').notNull(),
    datum: zeit('datum').notNull(),
    art: text('art').$type<ZahlungArt>().notNull().default('bank'),
    notiz: text('notiz'),
    adminUserId: uuid('admin_user_id').references(() => adminUser.id, { onDelete: 'set null' }),
    erstelltAm: erstellt(),
  },
  (t) => [index('zahlung_rechnung_idx').on(t.rechnungId), index('zahlung_datum_idx').on(t.datum)],
);

/** Masse in cm je Feld («sakko.brust»), Körperhaltung als Chips. Jede Messung = neue Version, die neueste ist aktiv. */
export const massblatt = pgTable(
  'massblatt',
  {
    id: id(),
    kontaktId: uuid('kontakt_id')
      .notNull()
      .references(() => kontakt.id),
    auftragId: uuid('auftrag_id').references(() => auftrag.id, { onDelete: 'set null' }),
    version: integer('version').notNull().default(1),
    masse: jsonb('masse').$type<Record<string, number | string>>().notNull().default({}),
    koerper: jsonb('koerper').$type<string[]>().notNull().default([]),
    aktiv: boolean('aktiv').notNull().default(true),
    notiz: text('notiz'),
    gemessenAm: zeit('gemessen_am').notNull().defaultNow(),
    gemessenVon: uuid('gemessen_von'),
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('massblatt_aktiv_idx').on(t.kontaktId).where(sql`aktiv`), index('massblatt_kontakt_idx').on(t.kontaktId, t.version)],
);

/** Firmeneinstellungen (Schlüssel/Wert), z. B. «firma» (Adresse, MWST, IBAN, Texte), «katalog», «logo». */
export const firmaEinstellung = pgTable('firma_einstellung', {
  schluessel: text('schluessel').primaryKey(),
  wert: jsonb('wert').$type<unknown>().notNull(),
  aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
});

/** Nummernkreise je Präfix und Jahr: AN-2026-0001, AU-…, RE-… */
export const nummernkreis = pgTable(
  'nummernkreis',
  {
    praefix: text('praefix').notNull(),
    jahr: integer('jahr').notNull(),
    zaehler: integer('zaehler').notNull().default(0),
  },
  (t) => [primaryKey({ name: 'nummernkreis_pk', columns: [t.praefix, t.jahr] })],
);
