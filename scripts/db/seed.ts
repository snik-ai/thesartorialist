// npm run db:seed — lokale Demo-Daten (Kontakte, Termine, Verlauf, 90 Tage Tracking).
// Läuft nie in Produktion und nur gegen localhost (sonst SEED_ERLAUBT=1). Demo-Kontakte: quelle = 'demo'.
// `npm run db:seed -- --leeren` entfernt die Demo-Daten wieder.
import './env';
import { createHash } from 'node:crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, inArray, sql } from 'drizzle-orm';
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
  }
  console.log(`Demo-Daten angelegt: ${NAMEN.length + 1} Kontakte mit Anfragen, ${zeilen.length} Tracking-Ereignisse.`);
}

main()
  .catch((e) => {
    console.error((e as Error).message);
    process.exitCode = 1;
  })
  .finally(() => client.end({ timeout: 5 }));
