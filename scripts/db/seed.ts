// npm run db:seed — lokale Demo-Daten (Kontakte, Termine, Verlauf, 90 Tage Tracking).
// Läuft nie in Produktion und nur gegen localhost (sonst SEED_ERLAUBT=1). Demo-Kontakte: quelle = 'demo'.
// `npm run db:seed -- --leeren` entfernt die Demo-Daten wieder.
import './env';
import { createHash } from 'node:crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, eq, inArray, sql } from 'drizzle-orm';
import * as schema from '../../lib/db/schema';
import { migriere } from '../../lib/db/migrieren';
import { zuerich } from '../../lib/zeit';
import { telNorm } from '../../lib/crm/telefon';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL fehlt');
if (process.env.NODE_ENV === 'production') throw new Error('Seed läuft nie in Produktion');
if (!/@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url) && process.env.SEED_ERLAUBT !== '1') throw new Error('Seed nur gegen eine lokale Datenbank (oder SEED_ERLAUBT=1)');

const client = postgres(url, { max: 1, onnotice: () => {} });
const db = drizzle(client, { schema });

let zufall = 42;
const rnd = () => ((zufall = (zufall * 16807) % 2147483647) - 1) / 2147483646;
const wahl = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const pad = (n: number) => String(n).padStart(2, '0');

const NAMEN = [
  ['Lukas Meier', 'lukas.meier@bluewin.ch', '079 412 33 21', null, null],
  ['Sandro Bianchi', 'sandro@bianchi-partner.ch', '076 555 12 98', 'Bianchi & Partner AG', 'bianchi-partner.ch'],
  ['Marc Keller', 'marc.keller@gmail.com', '078 901 22 10', null, null],
  ['Daniel Frei', 'd.frei@ubs.com', '079 300 40 50', 'UBS', 'ubs.com'],
  ['Thomas Huber', null, '077 222 33 44', null, null],
  ['Patrick Schmid', 'patrick.schmid@outlook.com', '079 876 54 32', null, null],
  ['Nicola Rossi', 'nicola.rossi@rossi-law.ch', '+41 44 211 00 11', 'Rossi Law', 'rossi-law.ch'],
  ['Adrian Weber', 'adrian.weber@gmx.ch', '076 123 45 67', null, null],
  ['Simon Brunner', 'simon@brunner.swiss', '079 765 43 21', null, null],
  ['Fabio Moretti', 'fabio.moretti@icloud.com', '078 345 67 89', null, null],
  ['Jonas Baumann', 'jonas.baumann@sunrise.ch', '079 555 66 77', null, null],
  ['Reto Zürcher', 'reto.zuercher@zkb.ch', '076 999 88 77', 'Zürcher Kantonalbank', 'zkb.ch'],
  ['Michael Graf', 'michael.graf@gmail.com', '079 444 11 22', null, null],
  ['Luca Steiner', null, '078 111 22 33', null, null],
  ['David Fischer', 'david@fischer-architekten.ch', '079 654 32 10', 'Fischer Architekten', 'fischer-architekten.ch'],
] as const;

const STIL = [
  { kategorie: 'Sakko', untergruppe: 'Vorderteil — Einreiher', option: 'Zwei Knöpfe' },
  { kategorie: 'Sakko', untergruppe: 'Revers — Einreiher, fallend', option: 'Fallendes Revers 8 cm' },
  { kategorie: 'Sakko', untergruppe: 'Taschen', option: 'Pattentaschen schräg' },
  { kategorie: 'Sakko', untergruppe: 'Schlitz', option: 'Zwei Seitenschlitze' },
  { kategorie: 'Hose', untergruppe: 'Bund', option: 'Seitliche Riegel' },
  { kategorie: 'Hose', untergruppe: 'Falten', option: 'Eine Bundfalte' },
  { kategorie: 'Hose', untergruppe: 'Saum', option: 'Umschlag 4 cm' },
  { kategorie: 'Weste', untergruppe: 'Verschluss', option: 'Fünf Knöpfe' },
];
const STOFFE = ['HS1234', 'HS8812', 'HS4471', 'HS2290'];

async function leeren() {
  const demo = await db.select({ id: schema.kontakt.id }).from(schema.kontakt).where(eq(schema.kontakt.quelle, 'demo'));
  const ids = demo.map((d) => d.id);
  if (ids.length) {
    await db.delete(schema.aktivitaet).where(inArray(schema.aktivitaet.kontaktId, ids));
    // Belege der Demo-Kontakte (Zahlungen und Aufgaben fallen per Kaskade weg)
    await db.delete(schema.rechnung).where(inArray(schema.rechnung.kontaktId, ids));
    await db.update(schema.auftrag).set({ massblattId: null }).where(inArray(schema.auftrag.kontaktId, ids));
    await db.delete(schema.massblatt).where(inArray(schema.massblatt.kontaktId, ids));
    await db.delete(schema.termin).where(inArray(schema.termin.kontaktId, ids));
    await db.delete(schema.auftrag).where(inArray(schema.auftrag.kontaktId, ids));
    await db.delete(schema.angebot).where(inArray(schema.angebot.kontaktId, ids));
    await db.delete(schema.termin).where(inArray(schema.termin.kontaktId, ids));
    await db.delete(schema.kontakt).where(inArray(schema.kontakt.id, ids));
  }
  await db.delete(schema.ereignis).where(eq(schema.ereignis.label, 'demo'));
  await db.execute(sql`delete from ereignis where besucher like 'demo%'`);
  console.log(`Demo-Daten entfernt (${ids.length} Kontakte).`);
}

async function main() {
  const r = await migriere();
  if (r !== 'ok') throw new Error(`Migration: ${r}`);
  await leeren();
  if (process.argv.includes('--leeren')) return;

  const jetzt = Date.now();
  // Kontakte + Anfragen
  let nr = 0;
  for (const [name, email, tel, firma, domain] of NAMEN) {
    nr++;
    const erst = new Date(jetzt - rnd() * 40 * 86400_000);
    const einw = rnd() > 0.45;
    const [k] = await db
      .insert(schema.kontakt)
      .values({
        name,
        email,
        telefon: tel,
        telefonNorm: telNorm(tel),
        firma,
        brandDomain: domain,
        quelle: 'demo',
        erstelltAm: erst,
        aktualisiertAm: erst,
        ...(einw ? { einwilligungWhatsapp: erst, einwilligungWhatsappQuelle: 'demo · formular:termin · «Ich bin einverstanden, per WhatsApp/SMS kontaktiert zu werden.»', einwilligungSms: erst, einwilligungSmsQuelle: 'demo' } : {}),
      })
      .returning();
    const art = nr % 5 === 0 ? 'rueckruf' : 'termin';
    const tageVor = Math.floor(rnd() * 20) - 4;
    const tag = new Date(jetzt + (tageVor + 3) * 86400_000);
    while (tag.getDay() === 0) tag.setDate(tag.getDate() + 1);
    const datum = `${tag.getFullYear()}-${pad(tag.getMonth() + 1)}-${pad(tag.getDate())}`;
    const zeit = wahl(['10:00', '11:30', '14:00', '15:30', '16:30']);
    const wunsch = zuerich(datum, zeit)!;
    const status = nr <= 5 ? 'angefragt' : nr <= 7 ? 'vorgeschlagen' : nr <= 11 ? 'bestaetigt' : nr <= 13 ? 'erledigt' : 'abgesagt';
    const stil = art === 'termin' && rnd() > 0.35 ? STIL.filter(() => rnd() > 0.3) : [];
    const [t] = await db
      .insert(schema.termin)
      .values({
        kontaktId: k.id,
        art,
        status: art === 'rueckruf' ? (nr % 2 ? 'angefragt' : 'erledigt') : status,
        wunschStart: art === 'termin' ? wunsch : null,
        wunschText: art === 'termin' ? wunsch.toLocaleString('de-CH', { timeZone: 'Europe/Zurich', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + `, ${zeit} Uhr` : wahl(['vormittags', 'nachmittags', 'egal']),
        bestaetigtStart: status === 'bestaetigt' && art === 'termin' ? wunsch : null,
        vorschlaege: status === 'vorgeschlagen' ? [new Date(wunsch.getTime() + 86400_000).toISOString(), new Date(wunsch.getTime() + 2 * 86400_000 + 3600_000).toISOString()] : [],
        stil,
        stoffe: stil.length && rnd() > 0.4 ? [wahl(STOFFE)] : [],
        quelle: art === 'termin' ? '/termin/' : wahl(['/', '/massanzug-zuerich/', '/hochzeitsanzug-zuerich/']),
        erstelltAm: erst,
        eingangMailAm: email ? erst : null,
        gelesenAm: status === 'angefragt' && nr % 2 ? null : erst,
      })
      .returning();
    await db.insert(schema.aktivitaet).values({ kontaktId: k.id, terminId: t.id, kanal: 'formular', richtung: 'ein', titel: art === 'termin' ? `Terminanfrage: ${t.wunschText}` : `Rückrufbitte (${t.wunschText})`, erstelltAm: erst });
    if (t.status === 'bestaetigt') await db.insert(schema.aktivitaet).values({ kontaktId: k.id, terminId: t.id, kanal: 'mail', richtung: 'aus', titel: 'Bestätigung per E-Mail', erstelltAm: new Date(erst.getTime() + 3600_000) });
  }
  // Ein Duplikat (gleiche Telefonnummer, andere Schreibweise) zum Testen von «Zusammenführen»
  await db.insert(schema.kontakt).values({ name: 'L. Meier', telefon: '+41 79 412 33 21', telefonNorm: telNorm('+41 79 412 33 21'), quelle: 'demo' });

  // Tracking: 90 Tage, Wochenmuster + leichter Aufwärtstrend
  const seiten = ['/', '/', '/', '/massanzug-zuerich/', '/massanzug-zuerich/', '/hochzeitsanzug-zuerich/', '/massanzug-konfigurator/', '/termin/', '/kontakt/', '/shop/', '/glossar/', '/anzug-blau/'];
  const refs: [string | null, string | null][] = [[null, null], [null, null], ['google.com', null], ['google.com', null], ['google.ch', null], ['instagram.com', null], [null, 'instagram'], ['chatgpt.com', null], ['bing.com', null], [null, 'newsletter']];
  const zeilen: (typeof schema.ereignis.$inferInsert)[] = [];
  for (let d = 89; d >= 0; d--) {
    const tag = new Date(jetzt - d * 86400_000);
    const wt = tag.getDay();
    const basis = (wt === 0 ? 22 : wt === 6 ? 48 : 38) * (1 + (89 - d) / 180);
    const besucher = Math.round(basis * (0.75 + rnd() * 0.5));
    for (let b = 0; b < besucher; b++) {
      const id = `demo${createHash('sha256').update(`${d}-${b}`).digest('hex').slice(0, 12)}`;
      const geraet = rnd() < 0.68 ? 'mobil' : rnd() < 0.9 ? 'desktop' : 'tablet';
      const [ref, utm] = wahl(refs);
      const zeit = new Date(tag.getTime() - rnd() * 10 * 3600_000);
      const aufrufe = 1 + Math.floor(rnd() * 3.2);
      for (let a = 0; a < aufrufe; a++) {
        zeilen.push({ zeit: new Date(zeit.getTime() + a * 60_000), typ: 'pageview', pfad: a === 0 ? wahl(seiten) : wahl(seiten), referrer: a === 0 ? ref : null, utmSource: a === 0 ? utm : null, utmCampaign: a === 0 && utm === 'newsletter' ? 'herbst-2026' : null, geraet, sprache: 'de-CH', besucher: id });
      }
      const p = rnd();
      const klick = p < 0.025 ? 'click_tel' : p < 0.05 ? 'click_whatsapp' : p < 0.062 ? 'click_mail' : p < 0.075 ? 'click_route' : null;
      if (klick) zeilen.push({ zeit: new Date(zeit.getTime() + aufrufe * 60_000), typ: klick, pfad: '/kontakt/', geraet, besucher: id });
    }
  }
  for (let i = 0; i < zeilen.length; i += 2000) await db.insert(schema.ereignis).values(zeilen.slice(i, i + 2000));
  // Anfragen über 90 Tage verteilt (für die Bahnen im Dashboard)
  for (let d = 89; d >= 0; d -= 1) {
    if (rnd() > 0.32) continue;
    const name = wahl(NAMEN);
    const erst = new Date(jetzt - d * 86400_000 - rnd() * 8 * 3600_000);
    const [k] = await db.insert(schema.kontakt).values({ name: `${name[0].split(' ')[0]} ${String.fromCharCode(65 + Math.floor(rnd() * 26))}.`, quelle: 'demo', erstelltAm: erst }).returning();
    await db.insert(schema.termin).values({ kontaktId: k.id, art: rnd() < 0.3 ? 'rueckruf' : 'termin', status: 'erledigt', wunschText: 'nach Absprache', erstelltAm: erst, gelesenAm: erst });
    // Historische Anfragen nicht in der Pipeline zeigen
    await db.update(schema.kontakt).set({ status: 'inaktiv' }).where(eq(schema.kontakt.id, k.id));
  }
  const belege = await atelierDemo();
  console.log(`Demo-Daten angelegt: ${NAMEN.length + 1} Kontakte mit Anfragen, ${zeilen.length} Tracking-Ereignisse, ${belege}.`);
}

/** Atelier-Demo über den echten Ablauf (lib/crm/ablauf): Angebote → Annahme → Aufträge mit Planung → Rechnungen → Zahlungen. */
async function atelierDemo() {
  const ablauf = await import('../../lib/crm/ablauf');
  const { speichern, FIRMA_STANDARD } = await import('../../lib/crm/firma');
  const { summen } = await import('../../lib/crm/geld');
  const { sqlClient } = await import('../../lib/db');
  const [admin] = await db.select().from(schema.adminUser).where(eq(schema.adminUser.aktiv, true)).limit(1);
  if (!admin) return 'keine Belege (kein Admin)';
  // Lokale Firmendaten mit Beispiel-IBAN (offizielle Testnummer von SIX), damit der QR-Zahlteil erscheint
  await speichern('firma', { ...FIRMA_STANDARD, iban: 'CH93 0076 2011 6238 5295 7', bank: 'Beispielbank (Demo)', mwstNr: 'CHE-000.000.000 MWST (Demo)' });

  const kontakt = async (name: string) => (await db.select().from(schema.kontakt).where(and(eq(schema.kontakt.name, name), eq(schema.kontakt.quelle, 'demo'))).limit(1))[0];
  const tag = (n: number) => new Date(jetzt + n * 86400_000);
  const jetzt = Date.now();
  const P = (bezeichnung: string, kategorie: string, preisRp: number, beschreibung?: string, stoffnummer?: string, menge = 1) => ({ id: `${kategorie}-${Math.round(rnd() * 1e9)}`, kategorie, bezeichnung, beschreibung, stoffnummer, menge, einzelpreisRp: preisRp });
  // Demo-Preise (nur lokal, keine echten Preise des Ateliers ausser dem veröffentlichten Ab-Preis)
  const ANZUG = P('Massanzug zweiteilig', 'massanzug', 169000, 'Sakko und Hose, Full-Canvas, Made in Italy', 'HS8812');
  const DREI = P('Massanzug dreiteilig', 'massanzug', 219000, 'Sakko, Hose und Weste, Full-Canvas', 'HS4471');
  const HEMD = P('Hemd nach Mass', 'hemd', 24000, 'Haifischkragen, Doppelmanschette', undefined, 2);
  const SMOKING = P('Smoking nach Mass', 'smoking', 249000, 'Satin-Revers, Paspel-Taschen', 'HS2290');
  const ZUSCHLAG = P('Stoffzuschlag Super 150s', 'stoffzuschlag', 30000);

  async function angebot(name: string, titel: string, pos: ReturnType<typeof P>[], o: { rabatt?: number; vorTagen: number; senden?: boolean; angesehen?: boolean }) {
    const k = await kontakt(name);
    const { id, nummer } = await ablauf.angebotErstellen({ kontaktId: k.id, adminId: admin.id, titel });
    const s = summen(pos, { rabattProzent: o.rabatt ?? 0, mwstSatz: 8.1 });
    const erst = tag(-o.vorTagen);
    await db
      .update(schema.angebot)
      .set({ positionen: pos, rabattProzent: o.rabatt ?? 0, totalRp: s.totalRp, mwstRp: s.mwstRp, erstelltAm: erst, gueltigBis: new Date(erst.getTime() + 30 * 86400_000), ...(o.senden ? { status: 'gesendet', gesendetAm: erst, tokenHash: ablauf.tokenHash(`demo-${nummer}`) } : {}), ...(o.angesehen ? { angesehenAm: new Date(erst.getTime() + 3 * 3600_000) } : {}) })
      .where(eq(schema.angebot.id, id));
    if (o.senden) await ablauf.leadPhaseSetzen(ablauf_db(), k.id, 'angebot');
    return { id, nummer, k };
  }
  const ablauf_db = () => db as unknown as Parameters<typeof ablauf.leadPhaseSetzen>[0];

  async function auftrag(name: string, titel: string, pos: ReturnType<typeof P>[], o: { vorTagen: number; status: schema.AuftragStatus; anlass?: [string, number]; liefertermin?: number; erledigtBis?: number; anzahlung?: 'bezahlt' | 'offen' | 'ueberfaellig'; schluss?: 'offen' | 'bezahlt'; rabatt?: number }) {
    const an = await angebot(name, titel, pos, { vorTagen: o.vorTagen + 4, senden: true, angesehen: true, rabatt: o.rabatt });
    const r = await ablauf.angebotAnnehmen(an.id, { name, weg: o.vorTagen % 2 ? 'online' : 'atelier', adminId: admin.id });
    const auId = r.auftragId!;
    const start = tag(-o.vorTagen);
    await db.update(schema.auftrag).set({ erstelltAm: start, anlass: o.anlass?.[0] ?? null, anlassDatum: o.anlass ? tag(o.anlass[1]) : null, statusZeiten: { mass: start.toISOString() } }).where(eq(schema.auftrag.id, auId));
    await db.update(schema.angebot).set({ angenommenAm: tag(-o.vorTagen) }).where(eq(schema.angebot.id, an.id));
    // Statuskette bis zum Ziel durchlaufen (mit Zeitstempeln über die Laufzeit verteilt)
    const { AUFTRAG_SCHRITTE, schrittIndex } = await import('../../lib/crm/belege');
    const ziel = schrittIndex(o.status);
    const zeiten: Record<string, string> = {};
    for (let i = 0; i <= ziel; i++) zeiten[AUFTRAG_SCHRITTE[i].key] = new Date(start.getTime() + (i / Math.max(1, ziel)) * (o.vorTagen - 0.5) * 86400_000).toISOString();
    await db.update(schema.auftrag).set({ status: o.status, statusZeiten: zeiten, liefertermin: o.liefertermin !== undefined ? tag(o.liefertermin) : null, abgeschlossenAm: o.status === 'abgeschlossen' ? tag(-2) : null, bestellnotiz: ziel >= 1 ? 'H&S Bestellung 48211 · Futter Bemberg bordeaux · Hornknöpfe' : null }).where(eq(schema.auftrag.id, auId));
    // Aufgaben: Fälligkeiten relativ zum Start, frühere Schritte erledigt
    const tasks = await db.select().from(schema.auftragTask).where(eq(schema.auftragTask.auftragId, auId));
    for (const t of tasks) {
      const i = schrittIndex(t.schritt!);
      const faellig = new Date(start.getTime() + (t.faelligAm!.getTime() - Date.now()));
      await db.update(schema.auftragTask).set({ faelligAm: faellig, erledigtAm: i < ziel || (i === ziel && o.status === 'abgeschlossen') ? new Date(Math.min(Date.now(), faellig.getTime())) : null, erledigtVon: i < ziel ? admin.id : null }).where(eq(schema.auftragTask.id, t.id));
    }
    if (o.anzahlung) {
      const rz = await ablauf.rechnungErstellen({ auftragId: auId, art: 'anzahlung', prozent: 50, adminId: admin.id });
      const datum = tag(-o.vorTagen + 1);
      await db.update(schema.rechnung).set({ status: 'offen', rechnungsdatum: datum, erstelltAm: datum, gesendetAm: datum, faelligAm: o.anzahlung === 'ueberfaellig' ? tag(-6) : new Date(datum.getTime() + 30 * 86400_000) }).where(eq(schema.rechnung.id, rz.id));
      if (o.anzahlung === 'bezahlt') {
        const [re] = await db.select().from(schema.rechnung).where(eq(schema.rechnung.id, rz.id));
        await db.insert(schema.zahlung).values({ rechnungId: rz.id, betragRp: re.betragRp, datum: tag(-o.vorTagen + 4), art: 'bank', adminUserId: admin.id });
      }
      await ablauf.rechnungNachrechnen(ablauf_db(), rz.id);
    }
    if (o.schluss) {
      const rs = await ablauf.rechnungErstellen({ auftragId: auId, art: 'schluss', adminId: admin.id });
      await db.update(schema.rechnung).set({ status: 'offen', rechnungsdatum: tag(-3), gesendetAm: tag(-3), faelligAm: tag(27) }).where(eq(schema.rechnung.id, rs.id));
      if (o.schluss === 'bezahlt') {
        const [re] = await db.select().from(schema.rechnung).where(eq(schema.rechnung.id, rs.id));
        await db.insert(schema.zahlung).values({ rechnungId: rs.id, betragRp: re.betragRp, datum: tag(-2), art: 'karte', adminUserId: admin.id });
      }
      await ablauf.rechnungNachrechnen(ablauf_db(), rs.id);
    }
    return auId;
  }

  async function massblatt(name: string, versionen: Record<string, number | string>[], koerper: string[]) {
    const k = await kontakt(name);
    let v = 0;
    for (const masse of versionen) {
      v++;
      await db.update(schema.massblatt).set({ aktiv: false }).where(eq(schema.massblatt.kontaktId, k.id));
      await db.insert(schema.massblatt).values({ kontaktId: k.id, version: v, masse, koerper, aktiv: true, gemessenAm: tag(-(versionen.length - v) * 320 - 30), gemessenVon: admin.id, notiz: v === versionen.length ? 'Bevorzugt leicht taillierten Schnitt, Hose ohne Bruch.' : null });
    }
  }

  const BASIS = { 'allgemein.koerpergroesse': 182, 'allgemein.gewicht': 81, 'allgemein.konfektion': '50', 'sakko.brust': 102, 'sakko.taille': 90, 'sakko.huefte': 101, 'sakko.schulter': 47.5, 'sakko.ruecken_laenge': 45, 'sakko.laenge': 76, 'sakko.aermel_li': 63.5, 'sakko.aermel_re': 64, 'hose.bund': 88, 'hose.huefte': 102, 'hose.schritt': 81, 'hose.seite': 106, 'hose.oberschenkel': 60, 'hose.knie': 44, 'hose.saum': 20, 'hemd.hals': 41, 'hemd.manschette_li': 25, 'hemd.manschette_re': 25.5 } as Record<string, number | string>;
  await massblatt('Sandro Bianchi', [{ ...BASIS, 'sakko.brust': 101, 'sakko.taille': 92, 'hose.bund': 89 }, BASIS], ['Hängende Schulter rechts', 'Bauch', 'Uhr links']);
  await massblatt('Daniel Frei', [{ ...BASIS, 'sakko.brust': 106, 'sakko.taille': 96, 'hose.bund': 94, 'allgemein.koerpergroesse': 178 }], ['Rundrücken', 'Kräftige Oberschenkel']);
  await massblatt('Nicola Rossi', [{ ...BASIS, 'sakko.brust': 98, 'sakko.taille': 84, 'hose.bund': 82 }], ['Aufrecht', 'Taillierter Schnitt']);

  for (const [name, adr] of [
    ['Sandro Bianchi', ['Herr', 'Bahnhofstrasse 12', '8001', 'Zürich']],
    ['Daniel Frei', ['Herr', 'Seestrasse 88', '8002', 'Zürich']],
    ['Nicola Rossi', ['Herr', 'Talacker 41', '8001', 'Zürich']],
    ['Reto Zürcher', ['Herr', 'Forchstrasse 220', '8032', 'Zürich']],
    ['David Fischer', ['Herr', 'Dorfstrasse 5', '8700', 'Küsnacht']],
  ] as const) {
    const k = await kontakt(name);
    await db.update(schema.kontakt).set({ anrede: adr[0], strasse: adr[1], plz: adr[2], ort: adr[3] }).where(eq(schema.kontakt.id, k.id));
  }

  await auftrag('Sandro Bianchi', 'Hochzeitsanzug dreiteilig', [DREI, HEMD], { vorTagen: 12, status: 'produktion', anlass: ['Hochzeit', 38], liefertermin: 14, anzahlung: 'bezahlt' });
  const freiAuftrag = await auftrag('Daniel Frei', 'Business-Anzug Navy', [ANZUG, ZUSCHLAG], { vorTagen: 26, status: 'anprobe', liefertermin: -3, anzahlung: 'bezahlt' });
  await auftrag('Nicola Rossi', 'Smoking für die Gala', [SMOKING], { vorTagen: 34, status: 'fertig', anlass: ['Gala Opernhaus', 9], liefertermin: -10, anzahlung: 'bezahlt', schluss: 'offen' });
  await auftrag('Reto Zürcher', 'Massanzug Flanell grau', [ANZUG, HEMD], { vorTagen: 80, status: 'abgeschlossen', liefertermin: -50, anzahlung: 'bezahlt', schluss: 'bezahlt', rabatt: 5 });
  await auftrag('David Fischer', 'Zwei Anzüge Büro', [ANZUG, { ...ANZUG, id: 'zweiter', stoffnummer: 'HS1234', bezeichnung: 'Massanzug zweiteilig (zweiter Anzug)' }], { vorTagen: 6, status: 'bestellt', anzahlung: 'ueberfaellig', rabatt: 10 });

  // Anprobe-Termin zum Auftrag (übermorgen) und ein Testtermin in knapp 2 Stunden (für die Erinnerung)
  const frei = await kontakt('Daniel Frei');
  const anprobe = new Date(jetzt + 2 * 86400_000);
  anprobe.setUTCHours(13, 30, 0, 0);
  await db.insert(schema.termin).values({ kontaktId: frei.id, auftragId: freiAuftrag, art: 'termin', zweck: 'anprobe', status: 'bestaetigt', bestaetigtStart: anprobe, wunschStart: anprobe, wunschText: 'Anprobe', quelle: 'atelier', gelesenAm: new Date(), dauerMin: 60 });
  const fabio = await kontakt('Fabio Moretti');
  const bald = new Date(Math.ceil((jetzt + 110 * 60_000) / 300_000) * 300_000);
  await db.insert(schema.termin).values({ kontaktId: fabio.id, art: 'termin', zweck: 'beratung', status: 'angefragt', wunschStart: bald, wunschText: 'Testtermin für die Erinnerung', quelle: '/termin/', sprache: 'it', gelesenAm: null });

  // Leads mit Angeboten
  await angebot('Patrick Schmid', 'Massanzug für den Geschäftsalltag', [ANZUG, HEMD], { vorTagen: 3, senden: true, angesehen: true });
  await angebot('Adrian Weber', 'Hochzeitsanzug mit Weste', [DREI], { vorTagen: 1 });
  const verloren = await angebot('Simon Brunner', 'Sakko und zwei Hosen', [P('Sakko nach Mass', 'sakko', 120000), P('Hose nach Mass', 'hose', 42000, undefined, undefined, 2)], { vorTagen: 21, senden: true });
  await db.update(schema.angebot).set({ status: 'abgelehnt', abgelehntAm: tag(-10), abgelehntGrund: 'Budget', tokenHash: null }).where(eq(schema.angebot.id, verloren.id));
  await db.update(schema.kontakt).set({ leadPhase: 'verloren', verlorenGrund: 'Budget' }).where(eq(schema.kontakt.id, verloren.k.id));
  for (const n of ['Marc Keller', 'Michael Graf']) await db.update(schema.kontakt).set({ leadPhase: 'termin', potenzialRp: 180000 }).where(eq(schema.kontakt.id, (await kontakt(n)).id));

  await sqlClient().end({ timeout: 5 });
  return '5 Aufträge, 8 Angebote, Rechnungen mit Zahlungen, 3 Massblätter';
}

main()
  .catch((e) => {
    console.error((e as Error).message);
    process.exitCode = 1;
  })
  .finally(() => client.end({ timeout: 5 }));
