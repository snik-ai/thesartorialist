// Testdaten für die Webseitenanalyse (nur lokal): 120 Tage Sitzungen mit Kanälen, Geräten, Browsern,
// Sprachen der Website, Verweildauer, Kontakt-Klicks, Konfigurator-/Shop-Aktionen und Anfragen — plus ein paar
// Besucher «jetzt gerade» für die Echtzeit. Ersetzt alle Tracking-Zeilen mit besucher like 'demo%'.
//   npx tsx scripts/webanalyse-testdaten.mts            anlegen
//   npx tsx scripts/webanalyse-testdaten.mts --leeren   nur entfernen
import './db/env';
import { createHash } from 'node:crypto';
import postgres from 'postgres';
import { browserVon, geraet, kanalVon, osVon, seitenSprache, bildschirmKlasse } from '../lib/tracking/server';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL fehlt');
if (process.env.NODE_ENV === 'production') throw new Error('Nie in Produktion');
if (!/@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) throw new Error('Nur gegen eine lokale Datenbank');
const sql = postgres(url, { max: 1, onnotice: () => {} });

let zufall = 7;
const rnd = () => ((zufall = (zufall * 16807) % 2147483647) - 1) / 2147483646;
const wahl = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const gewichtet = <T,>(a: readonly [T, number][]) => {
  const s = a.reduce((x, [, w]) => x + w, 0);
  let r = rnd() * s;
  for (const [v, w] of a) if ((r -= w) <= 0) return v;
  return a[a.length - 1][0];
};

const UA: [string, number, number][] = [
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1', 390, 34],
  ['Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36', 412, 14],
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0', 390, 6],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', 1512, 14],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 1920, 16],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', 1600, 6],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0', 1440, 3],
  ['Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', 820, 4],
];
// [referrer, utm_source, utm_medium, utm_campaign, gclid, gewicht]
const HERKUNFT: [string | null, string | null, string | null, string | null, boolean, number][] = [
  [null, null, null, null, false, 26],
  ['google.com', null, null, null, false, 22],
  ['google.ch', null, null, null, false, 12],
  ['google.ch', 'google', 'cpc', 'massanzug-zuerich', true, 8],
  ['instagram.com', null, null, null, false, 8],
  [null, 'instagram', 'social', 'herbst-kollektion', false, 4],
  ['chatgpt.com', 'chatgpt.com', null, null, false, 4],
  ['perplexity.ai', null, null, null, false, 1],
  ['bing.com', null, null, null, false, 3],
  ['duckduckgo.com', null, null, null, false, 1],
  [null, 'newsletter', 'email', 'herbst-2026', false, 4],
  ['facebook.com', null, null, null, false, 2],
  ['hochzeit.ch', null, null, null, false, 2],
  ['local.ch', null, null, null, false, 2],
  [null, 'flyer', 'print', 'qr-schaufenster', false, 1],
];
const SPRACHE: [string, string, number][] = [
  ['de', 'de-CH', 62],
  ['en', 'en-GB', 14],
  ['fr', 'fr-CH', 6],
  ['it', 'it-CH', 5],
  ['es', 'es-ES', 2],
  ['pt-pt', 'pt-PT', 2],
  ['ru', 'ru-RU', 3],
  ['sr', 'sr-RS', 3],
  ['sq', 'sq-AL', 3],
];
const SEITEN: Record<string, string[]> = {
  de: ['/', '/massanzug-zuerich/', '/hochzeitsanzug-zuerich/', '/massanzug-konfigurator/', '/termin/', '/kontakt/', '/shop/', '/ueber-uns/', '/anzug-blau/', '/glossar/', '/loro-piana/', '/services/'],
  en: ['/en/', '/en/made-to-measure-suit-zurich/', '/en/wedding-suit-zurich/', '/en/suit-configurator/', '/en/appointment/', '/en/contact/', '/en/shop/'],
  fr: ['/fr/', '/fr/costume-sur-mesure-zurich/', '/fr/rendez-vous/', '/fr/contact/'],
  it: ['/it/', '/it/abito-su-misura-zurigo/', '/it/appuntamento/', '/it/contatto/'],
  es: ['/es/', '/es/traje-a-medida-zurich/', '/es/cita/'],
  'pt-pt': ['/pt-pt/', '/pt-pt/fato-por-medida-zurique/', '/pt-pt/marcacao/'],
  ru: ['/ru/', '/ru/приталенный-костюм-цюрих/', '/ru/запись-на-консультацию/'],
  sr: ['/sr/', '/sr/одело-по-мери-цирих/', '/sr/термин/'],
  sq: ['/sq/', '/sq/kostum-me-porosi-cyrih/', '/sq/takim/'],
};
const TITEL: Record<string, string> = {
  '/': 'Massanzug Zürich — The Sartorialist',
  '/massanzug-zuerich/': 'Massanzug Zürich | The Sartorialist',
  '/hochzeitsanzug-zuerich/': 'Hochzeitsanzug Zürich | The Sartorialist',
  '/massanzug-konfigurator/': 'Massanzug-Konfigurator | The Sartorialist',
  '/termin/': 'Termin vereinbaren | The Sartorialist',
  '/kontakt/': 'Kontakt | The Sartorialist',
  '/shop/': 'Shop | The Sartorialist',
};

type Zeile = Record<string, unknown>;

async function main() {
  await sql`delete from ereignis where besucher like 'demo%'`;
  if (process.argv.includes('--leeren')) {
    console.log('Tracking-Testdaten entfernt.');
    return;
  }
  const zeilen: Zeile[] = [];
  const jetzt = Date.now();
  let sitzungen = 0;

  const sitzung = (beginn: number, live = false) => {
    sitzungen++;
    const [ua, breite] = gewichtet(UA.map(([u, b, w]) => [[u, b] as const, w]));
    const touch = /iPad/.test(ua);
    const [referrer, us, um, uc, gclid] = gewichtet(HERKUNFT.map((h) => [h, h[5]] as [typeof h, number]));
    const [lang, browserSprache] = gewichtet(SPRACHE.map(([l, b, w]) => [[l, b] as const, w]));
    const seiten = SEITEN[lang];
    const besucher = `demo${createHash('sha256').update(`${beginn}-${sitzungen}`).digest('hex').slice(0, 12)}`;
    const sid = `demo${sitzungen.toString(36)}${Math.floor(rnd() * 1e9).toString(36)}`;
    const land = rnd() < 0.85 ? (browserSprache.split('-')[1] ?? 'CH') : wahl(['DE', 'AT', 'IT', 'US', 'GB']);
    const basis = {
      besucher,
      sitzung: sid,
      geraet: geraet(ua, breite, touch),
      browser: browserVon(ua),
      os: osVon(ua, touch),
      bildschirm: bildschirmKlasse(breite),
      land: lang === 'de' && rnd() < 0.9 ? 'CH' : land,
      land_quelle: 'sprache',
      sprache: browserSprache,
    };
    // Engagement: Google Ads und KI bringen eher Interessierte, Social eher kurze Besuche
    const interesse = gclid ? 1.6 : referrer?.includes('chatgpt') || referrer?.includes('perplexity') ? 1.5 : referrer?.includes('instagram') ? 0.7 : 1;
    const aufrufe = rnd() < 0.42 / interesse ? 1 : 1 + Math.ceil(rnd() * 4 * interesse);
    let t = beginn;
    let pfad = rnd() < 0.45 ? seiten[0] : wahl(seiten);
    for (let a = 0; a < aufrufe; a++) {
      const sichtbar = Math.round((aufrufe === 1 ? 3000 + rnd() * 40_000 : 8000 + rnd() * 120_000) * (rnd() < 0.1 ? 3 : 1));
      zeilen.push({
        ...basis,
        zeit: new Date(t),
        typ: 'pageview',
        pfad,
        titel: TITEL[pfad] ?? `${pfad.split('/').filter(Boolean).pop() ?? 'Start'} | The Sartorialist`,
        seiten_sprache: seitenSprache(pfad),
        referrer: a === 0 ? referrer : null,
        utm_source: a === 0 ? us : null,
        utm_medium: a === 0 ? um : null,
        utm_campaign: a === 0 ? uc : null,
        utm_term: a === 0 && gclid ? wahl(['massanzug zürich', 'massschneider zürich', 'hochzeitsanzug']) : null,
        gclid: a === 0 && gclid,
        kanal: a === 0 ? kanalVon({ referrer, utmSource: us, utmMedium: um, gclid }) : 'direkt',
        aufruf: `a${Math.floor(rnd() * 1e12).toString(36)}`,
        dauer_ms: live && a === aufrufe - 1 ? null : Math.min(1_800_000, sichtbar),
        zuletzt: live && a === aufrufe - 1 ? new Date(jetzt - rnd() * 90_000) : null,
      });
      t += sichtbar + 2000;
      if (live && t > jetzt) break;
      pfad = wahl(seiten);
    }
    const ev = (typ: string, p: number, label: string | null = null, pf = pfad) => {
      if (rnd() < p * interesse) {
        t += 4000 + rnd() * 20000;
        if (!live || t < jetzt) zeilen.push({ ...basis, zeit: new Date(t), typ, pfad: pf, label, seiten_sprache: seitenSprache(pf), kanal: 'direkt', gclid: false });
        return true;
      }
      return false;
    };
    const konfig = ev('konfig_start', 0.09, null, lang === 'de' ? '/massanzug-konfigurator/' : SEITEN[lang][0]);
    if (konfig) {
      ev('konfig_pdf', 0.25);
      if (ev('konfig_termin', 0.35)) ev('anfrage_konfig', 0.55, null, lang === 'de' ? '/termin/' : SEITEN[lang][0]);
    }
    if (ev('shop_warenkorb', 0.03, null, '/shop/')) ev('shop_checkout', 0.5, null, '/shop/');
    ev('click_route', 0.012, 'Route');
    ev('click_tel', 0.018, '+41444000000');
    ev('click_whatsapp', 0.02, 'WhatsApp');
    ev('click_mail', 0.008, 'store@thesartorialist.ch');
    ev('anfrage_termin', 0.012, null, lang === 'de' ? '/termin/' : SEITEN[lang][0]);
    ev('anfrage_rueckruf', 0.006);
    ev('cta', 0.03, wahl(['hero-termin', 'konfigurator-teaser', 'shop-teaser']));
  };

  for (let d = 119; d >= 0; d--) {
    const tag = new Date(jetzt - d * 86_400_000);
    const wt = tag.getDay();
    const anzahl = Math.round((wt === 0 ? 20 : wt === 6 ? 44 : 34) * (1 + (119 - d) / 220) * (0.75 + rnd() * 0.5));
    const mitternacht = new Date(tag.toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' }) + 'T00:00:00+01:00').getTime();
    for (let i = 0; i < anzahl; i++) {
      // Tagesverlauf: Mittag und Abend stärker
      const stunde = gewichtet<number>(Array.from({ length: 24 }, (_, h) => [h, h < 6 ? 0.3 : h < 9 ? 2 : h < 12 ? 5 : h < 14 ? 7 : h < 18 ? 5 : h < 22 ? 8 : 2]));
      const beginn = mitternacht + stunde * 3_600_000 + rnd() * 3_600_000;
      if (beginn > jetzt - 35 * 60_000) continue;
      sitzung(beginn);
    }
  }
  // Echtzeit: ein paar Besucher in den letzten 30 Minuten
  for (let i = 0; i < 9; i++) sitzung(jetzt - rnd() * 28 * 60_000, true);

  const spalten = ['zeit', 'typ', 'pfad', 'titel', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid', 'kanal', 'geraet', 'browser', 'os', 'bildschirm', 'land', 'land_quelle', 'sprache', 'seiten_sprache', 'besucher', 'sitzung', 'aufruf', 'dauer_ms', 'zuletzt', 'label'];
  const voll = zeilen.map((z) => Object.fromEntries(spalten.map((s) => [s, z[s] ?? (s === 'gclid' ? false : null)])));
  for (let i = 0; i < voll.length; i += 2000) await sql`insert into ereignis ${sql(voll.slice(i, i + 2000), spalten)}`;
  console.log(`Tracking-Testdaten: ${sitzungen} Sitzungen, ${zeilen.length} Ereignisse (120 Tage + 9 Besucher jetzt).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
