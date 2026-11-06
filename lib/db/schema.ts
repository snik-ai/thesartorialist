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

/**
 * Einstellungen der App (Schlüssel/Wert), z. B. die VAPID-Schlüssel für Web-Push. Werden beim ersten Bedarf
 * automatisch erzeugt — keine Umgebungsvariable nötig. Inhalte nur serverseitig lesen (Privatschlüssel!).
 */
export const einstellung = pgTable('einstellung', {
  schluessel: text('schluessel').primaryKey(),
  wert: jsonb('wert').$type<Record<string, unknown>>().notNull(),
  aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
});

/** Web-Push-Abos der Admin-App (ein Eintrag je Gerät/Browser). 404/410 vom Push-Dienst → automatisch gelöscht. */
export const pushAbo = pgTable(
  'push_abo',
  {
    id: id(),
    adminUserId: uuid('admin_user_id')
      .notNull()
      .references(() => adminUser.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    geraet: text('geraet'),
    userAgent: text('user_agent'),
    erstelltAm: erstellt(),
    zuletztOk: zeit('zuletzt_ok'),
    fehler: text('fehler'),
  },
  (t) => [index('push_abo_admin_idx').on(t.adminUserId)],
);

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
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [index('kontakt_email_idx').on(t.email), index('kontakt_tel_idx').on(t.telefonNorm)],
);

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
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [index('termin_status_idx').on(t.status, t.erstelltAm), index('termin_kontakt_idx').on(t.kontaktId)],
);

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
    erstelltAm: erstellt(),
  },
  (t) => [index('aktivitaet_kontakt_idx').on(t.kontaktId, t.erstelltAm)],
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

/* ---------- Phase 2 (nur Datenmodell, Ausbau folgt) ---------- */

export const angebot = pgTable('angebot', {
  id: id(),
  kontaktId: uuid('kontakt_id').references(() => kontakt.id),
  terminId: uuid('termin_id').references(() => termin.id, { onDelete: 'set null' }),
  nummer: text('nummer').unique(),
  status: text('status').notNull().default('entwurf'),
  positionen: jsonb('positionen').$type<unknown[]>().notNull().default([]),
  totalRp: integer('total_rp').notNull().default(0),
  gueltigBis: zeit('gueltig_bis'),
  notiz: text('notiz'),
  erstelltAm: erstellt(),
  aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
});

export const auftrag = pgTable('auftrag', {
  id: id(),
  kontaktId: uuid('kontakt_id').references(() => kontakt.id),
  angebotId: uuid('angebot_id').references(() => angebot.id, { onDelete: 'set null' }),
  nummer: text('nummer').unique(),
  status: text('status').notNull().default('offen'),
  positionen: jsonb('positionen').$type<unknown[]>().notNull().default([]),
  totalRp: integer('total_rp').notNull().default(0),
  liefertermin: zeit('liefertermin'),
  notiz: text('notiz'),
  erstelltAm: erstellt(),
  aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
});

export const rechnung = pgTable('rechnung', {
  id: id(),
  kontaktId: uuid('kontakt_id').references(() => kontakt.id),
  auftragId: uuid('auftrag_id').references(() => auftrag.id, { onDelete: 'set null' }),
  nummer: text('nummer').unique(),
  status: text('status').notNull().default('entwurf'),
  positionen: jsonb('positionen').$type<unknown[]>().notNull().default([]),
  totalRp: integer('total_rp').notNull().default(0),
  faelligAm: zeit('faellig_am'),
  bezahltAm: zeit('bezahlt_am'),
  erstelltAm: erstellt(),
  aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
});

export const massblatt = pgTable(
  'massblatt',
  {
    id: id(),
    kontaktId: uuid('kontakt_id')
      .notNull()
      .references(() => kontakt.id),
    auftragId: uuid('auftrag_id').references(() => auftrag.id, { onDelete: 'set null' }),
    masse: jsonb('masse').$type<Record<string, number | string>>().notNull().default({}),
    aktiv: boolean('aktiv').notNull().default(true),
    notiz: text('notiz'),
    erstelltAm: erstellt(),
    aktualisiertAm: zeit('aktualisiert_am').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('massblatt_aktiv_idx').on(t.kontaktId).where(sql`aktiv`)],
);
