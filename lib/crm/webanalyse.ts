// Webseitenanalyse fürs Backend (Informationsumfang wie Karo, eigenes cookieloses Tracking).
//
// Begriffe (Web und Doku meinen dasselbe):
//  - Besucher: verschiedene Tages-Prüfwerte. Über mehrere Tage zählt ein wiederkehrender Mensch je Tag einmal.
//  - Sitzung: vom Server gebildet — gleicher Tages-Besucher, bis 30 Minuten Ruhe. Alte Zeilen (vor 0006): je Tag eine.
//  - Engagiert: zwei oder mehr Seiten, eine Aktion oder ≥ 10 s sichtbare Zeit. Absprung = nicht engagiert.
//  - Kontakt (Conversion): Anruf-, WhatsApp-, E-Mail-Klick, gesendete Termin-/Rückruf-/Konfigurator-Anfrage.
//    Conversion-Rate = Sitzungen mit mindestens einem Kontakt ÷ Sitzungen.
//  - Im Verlauf und in der Bilanz stammen Terminanfragen, Rückrufe und Konfigurator-Anfragen aus dem Backend
//    (Tabelle termin, nur Website-Anfragen) — das ist die verbindliche Zahl. Trichter, Fluss und Kanäle brauchen
//    die Sitzung und rechnen darum mit den Tracking-Ereignissen (anfrage_*).
//  - Kanal: aus dem ersten Seitenaufruf der Sitzung (Referrer, UTM, Google-Klickkennung).
//  - Trichter: Besuche → Interaktion → Interesse (Termin-, Kontakt-, Konfigurator- oder Shopseite bzw.
//    Konfigurator-/Shop-Aktion) → Kontakt; jede Stufe ist Teilmenge der vorigen.
//
// Eine Auswertung läuft in einer Transaktion: das Zeitfenster wird einmal gelesen (Temp-Tabellen
// w_ev/w_s und v_ev/v_s für die Vorperiode), alle Aufteilungen lesen danach nur noch diese.
import { sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { TZ } from '@/lib/zeit';
import { ROUTEN } from '@/lib/i18n/routen';
import { KANAL_LABEL, type Kanal } from '@/lib/tracking/server';
import { KONTAKTARTEN, type KontaktKey } from '@/lib/crm/bahnen';

/* ---------- Zeitraum ---------- */

export const ZEITRAUM_ARTEN = ['heute', 'gestern', '7', '30', '90', 'frei'] as const;
export type ZeitraumArt = (typeof ZEITRAUM_ARTEN)[number];
export type Zeitraum = {
  art: ZeitraumArt;
  von: string;
  bis: string;
  tage: number;
  vorher: { von: string; bis: string };
  aufloesung: 'stunde' | 'tag';
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
export const tagPlus = (tag: string, n: number) => new Date(Date.parse(`${tag}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const gueltig = (t: unknown): t is string => typeof t === 'string' && ISO.test(t) && new Date(`${t}T00:00:00Z`).toISOString().slice(0, 10) === t;
export const heuteZuerich = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });

/** Liest zeitraum/von/bis aus der URL (auch das alte ?tage=7). Unbrauchbares → letzte 30 Tage. */
export function zeitraumAus(q: { zeitraum?: string; von?: string; bis?: string; tage?: string }, heute = heuteZuerich()): Zeitraum {
  let art: ZeitraumArt = (ZEITRAUM_ARTEN as readonly string[]).includes(q.zeitraum ?? '') ? (q.zeitraum as ZeitraumArt) : '30';
  if (!q.zeitraum && ['7', '30', '90'].includes(q.tage ?? '')) art = q.tage as ZeitraumArt;
  let von: string;
  let bis: string;
  if (art === 'frei' && gueltig(q.von) && gueltig(q.bis)) {
    [von, bis] = q.von <= q.bis ? [q.von, q.bis] : [q.bis, q.von];
    if (bis > heute) bis = heute;
    if (von > bis) von = bis;
    if ((Date.parse(bis) - Date.parse(von)) / 86_400_000 > 730) von = tagPlus(bis, -730);
  } else if (art === 'heute') von = bis = heute;
  else if (art === 'gestern') von = bis = tagPlus(heute, -1);
  else {
    if (art === 'frei') art = '30';
    bis = heute;
    von = tagPlus(heute, -(Number(art) - 1));
  }
  const tage = Math.round((Date.parse(bis) - Date.parse(von)) / 86_400_000) + 1;
  return { art, von, bis, tage, vorher: { von: tagPlus(von, -tage), bis: tagPlus(von, -1) }, aufloesung: tage === 1 ? 'stunde' : 'tag' };
}

/* ---------- SQL-Bausteine ---------- */

const tz = sql.raw(`'${TZ}'`);
/** Beginn eines Zürcher Tages als Zeitpunkt */
const tagesbeginn = (tag: string) => sql`(${tag}::date::timestamp at time zone ${tz})`;

/** Ereignistypen, die als Kontakt zählen, und ihre Kontaktart. */
export const KONTAKT_TYP: Record<string, KontaktKey> = {
  click_tel: 'tel',
  click_whatsapp: 'wa',
  click_mail: 'mail',
  anfrage_termin: 'termin',
  anfrage_rueckruf: 'rueckruf',
  anfrage_konfig: 'konfig',
};
const KONV = sql.raw(`(${Object.keys(KONTAKT_TYP).map((t) => `'${t}'`).join(',')})`);

export const EREIGNIS_LABEL: Record<string, string> = {
  pageview: 'Seitenaufruf',
  click_tel: 'Anruf-Klick',
  click_whatsapp: 'WhatsApp-Klick',
  click_mail: 'E-Mail-Klick',
  click_route: 'Route geöffnet',
  cta: 'Knopf geklickt',
  form_submit: 'Formular abgeschickt',
  konfig_start: 'Konfigurator begonnen',
  konfig_pdf: 'Konfiguration als PDF',
  konfig_termin: 'Konfigurator → Termin',
  shop_warenkorb: 'In den Warenkorb',
  shop_checkout: 'Zur Kasse',
  anfrage_termin: 'Terminanfrage gesendet',
  anfrage_rueckruf: 'Rückrufbitte gesendet',
  anfrage_konfig: 'Anfrage mit Konfiguration',
};

/** Seiten, auf denen jemand Termin, Kontakt, Konfiguration oder Kauf sucht — in allen Sprachen. */
function absichtsSeiten(): SQL {
  const pfade = new Set<string>();
  for (const key of ['termin', 'kontakt', 'konfigurator', 'shop'] as const) for (const p of Object.values(ROUTEN[key] ?? {})) if (p) pfade.add(p);
  return sql.join(
    [...pfade].map((p) => sql`pfad like ${`${p}%`}`),
    sql` or `,
  );
}

/** Das Fenster einmal lesen: Ereignisse mit Verweildauer (w_ev) und eine Zeile je Sitzung (w_s). */
function fensterSql(name: 'w' | 'v', von: SQL, bis: SQL): SQL[] {
  const ev = sql.raw(`${name}_ev`);
  const s = sql.raw(`${name}_s`);
  return [
    sql`create temp table ${ev} on commit drop as
      with roh as (
        select e.*, coalesce(e.sitzung, 'alt' || e.besucher || to_char(e.zeit at time zone ${tz}, 'YYYYMMDD')) as sid
        from ereignis e where e.zeit >= ${von} and e.zeit < ${bis}
      )
      select roh.*,
        -- Verweildauer je Seitenaufruf: gemeldete sichtbare Zeit, sonst Abstand zur nächsten Zeile der Sitzung (max. 30 Min.)
        case when typ = 'pageview' then coalesce(dauer_ms, least(1800000, (extract(epoch from (lead(zeit) over (partition by sid order by zeit) - zeit)) * 1000)::int)) end as dauer
      from roh`,
    sql`create temp table ${s} on commit drop as
      select x.*, (x.aufrufe >= 2 or x.aktionen > 0 or x.dauer >= 10000) as engagiert from (
        select sid,
          (array_agg(besucher order by zeit))[1] as besucher,
          coalesce((array_agg(kanal order by zeit) filter (where typ = 'pageview'))[1], (array_agg(kanal order by zeit))[1], 'direkt') as kanal,
          (array_agg(geraet order by zeit))[1] as geraet,
          (array_agg(browser order by zeit))[1] as browser,
          (array_agg(os order by zeit))[1] as os,
          (array_agg(land order by zeit))[1] as land,
          (array_agg(land_quelle order by zeit))[1] as land_quelle,
          (array_agg(bildschirm order by zeit))[1] as bildschirm,
          (array_agg(sprache order by zeit))[1] as sprache,
          (array_agg(seiten_sprache order by zeit) filter (where typ = 'pageview'))[1] as seiten_sprache,
          (array_agg(referrer order by zeit) filter (where typ = 'pageview'))[1] as referrer,
          (array_agg(utm_source order by zeit) filter (where typ = 'pageview'))[1] as utm_source,
          (array_agg(utm_medium order by zeit) filter (where typ = 'pageview'))[1] as utm_medium,
          (array_agg(utm_campaign order by zeit) filter (where typ = 'pageview'))[1] as utm_campaign,
          (array_agg(utm_term order by zeit) filter (where typ = 'pageview'))[1] as utm_term,
          (array_agg(utm_content order by zeit) filter (where typ = 'pageview'))[1] as utm_content,
          bool_or(gclid) as gclid,
          (array_agg(pfad order by zeit) filter (where typ = 'pageview'))[1] as einstieg,
          (array_agg(pfad order by zeit desc) filter (where typ = 'pageview'))[1] as ausstieg,
          count(*) filter (where typ = 'pageview')::int as aufrufe,
          count(*) filter (where typ <> 'pageview')::int as aktionen,
          count(*) filter (where typ in ${KONV})::int as kontakte,
          bool_or(typ like 'konfig\\_%' or typ like 'shop\\_%' or (typ = 'pageview' and (${absichtsSeiten()}))) as interesse,
          (array_agg(typ order by zeit) filter (where typ in ${KONV}))[1] as erster_kontakt,
          min(zeit) as beginn,
          coalesce(sum(dauer) filter (where typ = 'pageview'), 0)::bigint as dauer
        from ${ev} group by sid
      ) x`,
  ];
}

const n = (v: unknown) => {
  const z = Number(v);
  return Number.isFinite(z) ? z : 0;
};
const anteil = (teil: number, ganz: number) => (ganz > 0 ? teil / ganz : null);

/** Masse einer Sitzungsgruppe */
const MASSE = sql`count(*)::int as sitzungen, count(distinct besucher)::int as besucher,
  coalesce(sum(kontakte), 0)::int as kontakte, count(*) filter (where kontakte > 0)::int as mit_kontakt,
  count(*) filter (where not engagiert)::int as absprung, coalesce(sum(aufrufe), 0)::int as aufrufe,
  coalesce(sum(dauer), 0)::bigint as dauer`;

export type Masse = {
  sitzungen: number;
  besucher: number;
  kontakte: number;
  mitKontakt: number;
  conversionRate: number | null;
  absprungrate: number | null;
  aufrufe: number;
  verweildauerS: number | null;
};
function masse(r: Record<string, unknown>): Masse {
  const sitzungen = n(r.sitzungen);
  return {
    sitzungen,
    besucher: n(r.besucher),
    kontakte: n(r.kontakte),
    mitKontakt: n(r.mit_kontakt),
    conversionRate: anteil(n(r.mit_kontakt), sitzungen),
    absprungrate: anteil(n(r.absprung), sitzungen),
    aufrufe: n(r.aufrufe),
    verweildauerS: sitzungen ? Math.round(n(r.dauer) / sitzungen / 1000) : null,
  };
}

/* ---------- Typen der Antwort ---------- */

export type Kontaktzahlen = Record<KontaktKey, number>;
const LEER_KONTAKTE = (): Kontaktzahlen => Object.fromEntries(KONTAKTARTEN.map((k) => [k.key, 0])) as Kontaktzahlen;
export const kontakteSumme = (k: Kontaktzahlen) => KONTAKTARTEN.reduce((s, x) => s + k[x.key], 0);

export type Kennzahlen = {
  besucher: number;
  sitzungen: number;
  aufrufe: number;
  seitenJeSitzung: number | null;
  verweildauerS: number | null;
  engagiert: number;
  absprungrate: number | null;
  mitKontakt: number;
  conversionRate: number | null;
  /** Anrufe/WhatsApp/E-Mail aus dem Tracking, Anfragen aus dem Backend */
  kontakte: Kontaktzahlen;
  route: number;
};

export type Punkt = { schluessel: string; besucher: number; sitzungen: number; aufrufe: number } & Kontaktzahlen;
export type Stufe = { stufe: string; label: string; wert: number };
export type Aufteilung = Masse & { schluessel: string; label: string };

export type Uebersicht = {
  zeitraum: Zeitraum;
  kennzahlen: Kennzahlen;
  vorperiode: Kennzahlen;
  verlauf: (Punkt & { vorher: Punkt | null })[];
  kanaele: Aufteilung[];
  trichter: Stufe[];
  trichterVorher: Stufe[];
  trichterKanaele: { kanal: string; label: string; stufen: Stufe[] }[];
  fluss: { kanal: string; kanalLabel: string; kontakt: KontaktKey | 'keiner'; sitzungen: number }[];
  heatmap: { tag: number; stunde: number; sitzungen: number; kontakte: number }[];
  seiten: { pfad: string; titel: string | null; aufrufe: number; besucher: number; dauerS: number | null; ausstiege: number }[];
  einstiege: (Masse & { pfad: string })[];
  ausstiege: { pfad: string; sitzungen: number; aufrufe: number; quote: number | null }[];
  referrer: (Masse & { domain: string; kanal: string; kanalLabel: string })[];
  kampagnen: (Masse & { quelle: string | null; medium: string | null; kampagne: string | null; begriff: string | null; inhalt: string | null })[];
  googleAds: { sitzungen: number; mitKontakt: number; conversionRate: number | null };
  geraete: Aufteilung[];
  browser: Aufteilung[];
  os: Aufteilung[];
  laender: Aufteilung[];
  landQuelle: { proxy: number; sprache: number; unbekannt: number };
  bildschirme: Aufteilung[];
  seitenSprachen: Aufteilung[];
  browserSprachen: Aufteilung[];
  verweildauer: { label: string; sitzungen: number }[];
  aktionen: { typ: string; label: string; anzahl: number; sitzungen: number; kontakt: boolean }[];
  ziele: { typ: string; label: string; ziel: string; anzahl: number }[];
  backend: { termin: number; rueckruf: number; konfig: number };
};

const GERAET_LABEL: Record<string, string> = { mobil: 'Smartphone', tablet: 'Tablet', desktop: 'Computer' };
const BILDSCHIRM_LABEL: Record<string, string> = { s: 'Klein (< 576 px)', m: 'Mittel (576–991 px)', l: 'Gross (992–1439 px)', xl: 'Sehr gross (≥ 1440 px)' };
const SEITEN_SPRACHE_LABEL: Record<string, string> = {
  de: 'Deutsch',
  en: 'Englisch',
  fr: 'Französisch',
  it: 'Italienisch',
  es: 'Spanisch',
  'pt-pt': 'Portugiesisch',
  ru: 'Russisch',
  sr: 'Serbisch',
  sq: 'Albanisch',
};
const laender = new Intl.DisplayNames(['de-CH'], { type: 'region' });
const sprachen = new Intl.DisplayNames(['de-CH'], { type: 'language' });
const landLabel = (c: string) => {
  try {
    return laender.of(c) ?? c;
  } catch {
    return c;
  }
};
const spracheLabel = (c: string) => {
  try {
    return sprachen.of(c) ?? c;
  } catch {
    return c;
  }
};
export const kanalLabel = (k: string) => KANAL_LABEL[k as Kanal] ?? k;

const TRICHTER_SPALTEN = sql`count(*)::int as besuche,
  count(*) filter (where engagiert or kontakte > 0)::int as interaktion,
  count(*) filter (where (engagiert or kontakte > 0) and (interesse or kontakte > 0))::int as interesse,
  count(*) filter (where kontakte > 0)::int as kontakt`;
const STUFEN = [
  { stufe: 'besuche', label: 'Besuche' },
  { stufe: 'interaktion', label: 'Interaktion' },
  { stufe: 'interesse', label: 'Interesse an Termin, Konfigurator oder Shop' },
  { stufe: 'kontakt', label: 'Anruf, Nachricht oder Anfrage' },
] as const;
const trichterAus = (r: Record<string, unknown> | undefined): Stufe[] => STUFEN.map((s) => ({ ...s, wert: n(r?.[s.stufe]) }));

/* ---------- Übersicht ---------- */

type Tx = Parameters<Parameters<ReturnType<typeof db>['transaction']>[0]>[0];
async function zeilen<T = Record<string, unknown>>(tx: Tx, q: SQL): Promise<T[]> {
  return [...(await tx.execute(q))] as T[];
}

/** Website-Anfragen aus dem Backend (ohne im Atelier eingetragene Termine), je Eimer. */
function backendSql(von: SQL, bis: SQL, eimer: SQL) {
  return sql`select ${eimer} as schluessel,
      count(*) filter (where art = 'rueckruf')::int as rueckruf,
      count(*) filter (where art = 'termin' and jsonb_array_length(stil) = 0)::int as termin,
      count(*) filter (where art = 'termin' and jsonb_array_length(stil) > 0)::int as konfig
    from termin where erstellt_am >= ${von} and erstellt_am < ${bis}
      and coalesce(quelle, '') <> 'atelier' and auftrag_id is null
    group by 1`;
}

async function kennzahlen(tx: Tx, f: 'w' | 'v', von: SQL, bis: SQL): Promise<Kennzahlen> {
  const ev = sql.raw(`${f}_ev`);
  const s = sql.raw(`${f}_s`);
  const [k] = await zeilen(tx, sql`select count(distinct besucher)::int as besucher, count(*)::int as sitzungen,
      coalesce(sum(aufrufe), 0)::int as aufrufe, count(*) filter (where engagiert)::int as engagiert,
      count(*) filter (where kontakte > 0)::int as mit_kontakt, coalesce(sum(dauer), 0)::bigint as dauer from ${s}`);
  const typen = await zeilen<{ typ: string; n: number }>(tx, sql`select typ, count(*)::int as n from ${ev} where typ in ('click_tel','click_whatsapp','click_mail','click_route') group by 1`);
  const [b] = await zeilen(tx, backendSql(von, bis, sql`1`));
  const sitzungen = n(k?.sitzungen);
  const aufrufe = n(k?.aufrufe);
  const t = (x: string) => n(typen.find((r) => r.typ === x)?.n);
  return {
    besucher: n(k?.besucher),
    sitzungen,
    aufrufe,
    seitenJeSitzung: sitzungen ? aufrufe / sitzungen : null,
    verweildauerS: sitzungen ? Math.round(n(k?.dauer) / sitzungen / 1000) : null,
    engagiert: n(k?.engagiert),
    absprungrate: anteil(sitzungen - n(k?.engagiert), sitzungen),
    mitKontakt: n(k?.mit_kontakt),
    conversionRate: anteil(n(k?.mit_kontakt), sitzungen),
    kontakte: { tel: t('click_tel'), wa: t('click_whatsapp'), mail: t('click_mail'), termin: n(b?.termin), rueckruf: n(b?.rueckruf), konfig: n(b?.konfig) },
    route: t('click_route'),
  };
}

async function verlauf(tx: Tx, f: 'w' | 'v', vonTag: string, bisTag: string, aufl: 'stunde' | 'tag'): Promise<Punkt[]> {
  const ev = sql.raw(`${f}_ev`);
  const fmt = aufl === 'stunde' ? `'YYYY-MM-DD"T"HH24'` : `'YYYY-MM-DD'`;
  const eimer = sql`to_char(zeit at time zone ${tz}, ${sql.raw(fmt)})`;
  const roh = await zeilen(tx, sql`select ${eimer} as schluessel, count(distinct besucher)::int as besucher, count(distinct sid)::int as sitzungen,
      count(*) filter (where typ = 'pageview')::int as aufrufe,
      count(*) filter (where typ = 'click_tel')::int as tel,
      count(*) filter (where typ = 'click_whatsapp')::int as wa,
      count(*) filter (where typ = 'click_mail')::int as mail
    from ${ev} group by 1`);
  const back = await zeilen(
    tx,
    backendSql(tagesbeginn(vonTag), tagesbeginn(tagPlus(bisTag, 1)), sql`to_char(erstellt_am at time zone ${tz}, ${sql.raw(fmt)})`),
  );
  const a = new Map(roh.map((r) => [String(r.schluessel), r]));
  const bm = new Map(back.map((r) => [String(r.schluessel), r]));
  const schluessel: string[] = [];
  if (aufl === 'stunde') for (let h = 0; h < 24; h++) schluessel.push(`${vonTag}T${String(h).padStart(2, '0')}`);
  else for (let t = vonTag; t <= bisTag; t = tagPlus(t, 1)) schluessel.push(t);
  return schluessel.map((k) => {
    const r = a.get(k);
    const b = bm.get(k);
    return {
      schluessel: k,
      besucher: n(r?.besucher),
      sitzungen: n(r?.sitzungen),
      aufrufe: n(r?.aufrufe),
      tel: n(r?.tel),
      wa: n(r?.wa),
      mail: n(r?.mail),
      termin: n(b?.termin),
      rueckruf: n(b?.rueckruf),
      konfig: n(b?.konfig),
    };
  });
}

export async function uebersicht(z: Zeitraum): Promise<Uebersicht> {
  const von = tagesbeginn(z.von);
  const bis = tagesbeginn(tagPlus(z.bis, 1));
  const vVon = tagesbeginn(z.vorher.von);
  const vBis = tagesbeginn(tagPlus(z.vorher.bis, 1));

  return db().transaction(async (tx) => {
    for (const q of [...fensterSql('w', von, bis), ...fensterSql('v', vVon, vBis)]) await tx.execute(q);

    const jetzt = await kennzahlen(tx, 'w', von, bis);
    const vorher = await kennzahlen(tx, 'v', vVon, vBis);
    const reihe = await verlauf(tx, 'w', z.von, z.bis, z.aufloesung);
    const reiheVorher = await verlauf(tx, 'v', z.vorher.von, z.vorher.bis, z.aufloesung);

    const kanaele = (await zeilen(tx, sql`select kanal as schluessel, ${MASSE} from w_s group by 1 order by sitzungen desc`)).map((r) => ({
      schluessel: String(r.schluessel),
      label: kanalLabel(String(r.schluessel)),
      ...masse(r),
    }));

    const [tr] = await zeilen(tx, sql`select ${TRICHTER_SPALTEN} from w_s`);
    const [trv] = await zeilen(tx, sql`select ${TRICHTER_SPALTEN} from v_s`);
    const trichterKanaele = (await zeilen(tx, sql`select kanal, ${TRICHTER_SPALTEN} from w_s group by kanal order by besuche desc`)).map((r) => ({
      kanal: String(r.kanal),
      label: kanalLabel(String(r.kanal)),
      stufen: trichterAus(r),
    }));

    const fluss = (await zeilen(tx, sql`select kanal, erster_kontakt, count(*)::int as sitzungen from w_s group by 1, 2`)).map((r) => ({
      kanal: String(r.kanal),
      kanalLabel: kanalLabel(String(r.kanal)),
      kontakt: (KONTAKT_TYP[String(r.erster_kontakt)] ?? 'keiner') as KontaktKey | 'keiner',
      sitzungen: n(r.sitzungen),
    }));

    const heatmap = (
      await zeilen(tx, sql`select tag, stunde, sum(sitzungen)::int as sitzungen, sum(kontakte)::int as kontakte from (
          select extract(isodow from beginn at time zone ${tz})::int as tag, extract(hour from beginn at time zone ${tz})::int as stunde, count(*)::int as sitzungen, 0 as kontakte from w_s group by 1, 2
          union all
          select extract(isodow from zeit at time zone ${tz})::int, extract(hour from zeit at time zone ${tz})::int, 0, count(*)::int from w_ev where typ in ${KONV} group by 1, 2
        ) x group by 1, 2`)
    ).map((r) => ({ tag: n(r.tag), stunde: n(r.stunde), sitzungen: n(r.sitzungen), kontakte: n(r.kontakte) }));

    const ausstiegRoh = await zeilen(tx, sql`select ausstieg as pfad, count(*)::int as sitzungen from w_s where ausstieg is not null group by 1`);
    const ausstiegMap = new Map(ausstiegRoh.map((r) => [String(r.pfad), n(r.sitzungen)]));

    const seiten = (
      await zeilen(tx, sql`select pfad, (array_agg(titel order by zeit desc) filter (where titel is not null))[1] as titel,
          count(*)::int as aufrufe, count(distinct besucher)::int as besucher, round(avg(dauer) filter (where dauer is not null) / 1000)::int as dauer_s
        from w_ev where typ = 'pageview' group by pfad order by 3 desc, 1 limit 25`)
    ).map((r) => ({
      pfad: String(r.pfad),
      titel: (r.titel as string | null) ?? null,
      aufrufe: n(r.aufrufe),
      besucher: n(r.besucher),
      dauerS: r.dauer_s === null ? null : n(r.dauer_s),
      ausstiege: ausstiegMap.get(String(r.pfad)) ?? 0,
    }));

    const einstiege = (await zeilen(tx, sql`select einstieg as pfad, ${MASSE} from w_s where einstieg is not null group by 1 order by sitzungen desc, 1 limit 15`)).map((r) => ({
      pfad: String(r.pfad),
      ...masse(r),
    }));

    const aufrufeJe = await zeilen(tx, sql`select pfad, count(*)::int as n from w_ev where typ = 'pageview' and pfad in (select ausstieg from w_s) group by 1`);
    const aufrufeMap = new Map(aufrufeJe.map((r) => [String(r.pfad), n(r.n)]));
    const ausstiege = [...ausstiegMap.entries()]
      .map(([pfad, sitzungen]) => ({ pfad, sitzungen, aufrufe: aufrufeMap.get(pfad) ?? 0, quote: anteil(sitzungen, aufrufeMap.get(pfad) ?? 0) }))
      .sort((a, b) => b.sitzungen - a.sitzungen || a.pfad.localeCompare(b.pfad))
      .slice(0, 15);

    const referrer = (await zeilen(tx, sql`select referrer as domain, kanal, ${MASSE} from w_s where referrer is not null group by 1, 2 order by sitzungen desc, 1 limit 20`)).map((r) => ({
      domain: String(r.domain),
      kanal: String(r.kanal),
      kanalLabel: kanalLabel(String(r.kanal)),
      ...masse(r),
    }));

    const kampagnen = (
      await zeilen(tx, sql`select utm_source as quelle, utm_medium as medium, utm_campaign as kampagne, utm_term as begriff, utm_content as inhalt, ${MASSE}
        from w_s where utm_source is not null or utm_campaign is not null group by 1, 2, 3, 4, 5 order by sitzungen desc limit 20`)
    ).map((r) => ({
      quelle: (r.quelle as string | null) ?? null,
      medium: (r.medium as string | null) ?? null,
      kampagne: (r.kampagne as string | null) ?? null,
      begriff: (r.begriff as string | null) ?? null,
      inhalt: (r.inhalt as string | null) ?? null,
      ...masse(r),
    }));
    const [g] = await zeilen(tx, sql`select count(*)::int as sitzungen, count(*) filter (where kontakte > 0)::int as mit from w_s where gclid`);

    const aufteilung = async (ausdruck: SQL, label: (s: string) => string, limit = 12): Promise<Aufteilung[]> =>
      (await zeilen(tx, sql`select ${ausdruck} as schluessel, ${MASSE} from w_s group by 1 order by sitzungen desc limit ${limit}`)).map((r) => ({
        schluessel: (r.schluessel as string | null) ?? 'unbekannt',
        label: r.schluessel ? label(String(r.schluessel)) : 'Unbekannt',
        ...masse(r),
      }));

    const geraete = await aufteilung(sql`geraet`, (s) => GERAET_LABEL[s] ?? s);
    const browser = await aufteilung(sql`browser`, (s) => s);
    const os = await aufteilung(sql`os`, (s) => s);
    const laenderListe = await aufteilung(sql`land`, landLabel, 15);
    const [lq] = await zeilen(tx, sql`select count(*) filter (where land_quelle = 'proxy')::int as proxy, count(*) filter (where land_quelle = 'sprache')::int as sprache,
        count(*) filter (where land_quelle is null)::int as unbekannt from w_s`);
    const bildschirme = await aufteilung(sql`bildschirm`, (s) => BILDSCHIRM_LABEL[s] ?? s);
    const seitenSprachen = await aufteilung(sql`seiten_sprache`, (s) => SEITEN_SPRACHE_LABEL[s] ?? s);
    const browserSprachen = await aufteilung(sql`nullif(split_part(lower(sprache), '-', 1), '')`, spracheLabel, 12);

    const [vd] = await zeilen(tx, sql`select
        count(*) filter (where dauer < 10000)::int as a, count(*) filter (where dauer >= 10000 and dauer < 30000)::int as b,
        count(*) filter (where dauer >= 30000 and dauer < 60000)::int as c, count(*) filter (where dauer >= 60000 and dauer < 180000)::int as d,
        count(*) filter (where dauer >= 180000 and dauer < 600000)::int as e, count(*) filter (where dauer >= 600000)::int as f from w_s`);
    const verweildauer = [
      ['unter 10 s', 'a'],
      ['10–30 s', 'b'],
      ['30 s – 1 Min.', 'c'],
      ['1–3 Min.', 'd'],
      ['3–10 Min.', 'e'],
      ['über 10 Min.', 'f'],
    ].map(([label, k]) => ({ label, sitzungen: n(vd?.[k]) }));

    const aktionen = (await zeilen(tx, sql`select typ, count(*)::int as anzahl, count(distinct sid)::int as sitzungen from w_ev where typ <> 'pageview' group by 1 order by 2 desc`)).map(
      (r) => ({ typ: String(r.typ), label: EREIGNIS_LABEL[String(r.typ)] ?? String(r.typ), anzahl: n(r.anzahl), sitzungen: n(r.sitzungen), kontakt: String(r.typ) in KONTAKT_TYP }),
    );
    const ziele = (
      await zeilen(tx, sql`select typ, coalesce(label, '–') as ziel, count(*)::int as anzahl from w_ev where typ in ('click_tel','click_whatsapp','click_mail','click_route','cta','form_submit')
        group by 1, 2 order by 3 desc limit 20`)
    ).map((r) => ({ typ: String(r.typ), label: EREIGNIS_LABEL[String(r.typ)] ?? String(r.typ), ziel: String(r.ziel), anzahl: n(r.anzahl) }));

    return {
      zeitraum: z,
      kennzahlen: jetzt,
      vorperiode: vorher,
      verlauf: reihe.map((p, i) => ({ ...p, vorher: reiheVorher[i] ?? null })),
      kanaele,
      trichter: trichterAus(tr),
      trichterVorher: trichterAus(trv),
      trichterKanaele,
      fluss,
      heatmap,
      seiten,
      einstiege,
      ausstiege,
      referrer,
      kampagnen,
      googleAds: { sitzungen: n(g?.sitzungen), mitKontakt: n(g?.mit), conversionRate: anteil(n(g?.mit), n(g?.sitzungen)) },
      geraete,
      browser,
      os,
      laender: laenderListe,
      landQuelle: { proxy: n(lq?.proxy), sprache: n(lq?.sprache), unbekannt: n(lq?.unbekannt) },
      bildschirme,
      seitenSprachen,
      browserSprachen,
      verweildauer,
      aktionen,
      ziele,
      backend: { termin: jetzt.kontakte.termin, rueckruf: jetzt.kontakte.rueckruf, konfig: jetzt.kontakte.konfig },
    };
  });
}

/* ---------- Echtzeit (letzte 30 Minuten) ---------- */

export type Echtzeit = {
  aktiv: number;
  besucher: number;
  aufrufe: number;
  kontakte: number;
  minuten: number[];
  seiten: { pfad: string; besucher: number }[];
  kanaele: { kanal: string; label: string; sitzungen: number }[];
  letzte: { zeit: string; typ: string; label: string; ziel: string | null; pfad: string; kanal: string; geraet: string | null; land: string | null }[];
  stand: string;
};

export async function echtzeit(): Promise<Echtzeit> {
  return db().transaction(async (tx) => {
    for (const q of fensterSql('w', sql`now() - interval '30 minutes'`, sql`now() + interval '1 minute'`)) await tx.execute(q);
    const [aktiv] = await zeilen(tx, sql`select count(distinct besucher)::int as n from ereignis
        where zeit > now() - interval '5 minutes' or zuletzt > now() - interval '5 minutes'`);
    const [k] = await zeilen(tx, sql`select count(distinct besucher)::int as besucher, count(*) filter (where typ = 'pageview')::int as aufrufe,
        count(*) filter (where typ in ${KONV})::int as kontakte from w_ev`);
    const min = await zeilen(tx, sql`select floor(extract(epoch from (now() - zeit)) / 60)::int as vor, count(*)::int as n from w_ev where typ = 'pageview' group by 1`);
    const minuten = Array.from({ length: 30 }, (_, i) => n(min.find((m) => n(m.vor) === 29 - i)?.n));
    const seiten = (await zeilen(tx, sql`select pfad, count(distinct besucher)::int as besucher from w_ev where typ = 'pageview' group by 1 order by 2 desc, 1 limit 6`)).map((r) => ({
      pfad: String(r.pfad),
      besucher: n(r.besucher),
    }));
    const kanaele = (await zeilen(tx, sql`select kanal, count(*)::int as n from w_s group by 1 order by 2 desc`)).map((r) => ({
      kanal: String(r.kanal),
      label: kanalLabel(String(r.kanal)),
      sitzungen: n(r.n),
    }));
    const letzte = (
      await zeilen(tx, sql`select to_char(e.zeit at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as zeit, e.typ, e.label, e.pfad, s.kanal, s.geraet, s.land
        from w_ev e join w_s s using (sid) order by e.zeit desc limit 14`)
    ).map((r) => ({
      zeit: String(r.zeit),
      typ: String(r.typ),
      label: EREIGNIS_LABEL[String(r.typ)] ?? String(r.typ),
      ziel: (r.label as string | null) ?? null,
      pfad: String(r.pfad),
      kanal: kanalLabel(String(r.kanal)),
      geraet: (r.geraet as string | null) ?? null,
      land: r.land ? landLabel(String(r.land)) : null,
    }));
    return { aktiv: n(aktiv?.n), besucher: n(k?.besucher), aufrufe: n(k?.aufrufe), kontakte: n(k?.kontakte), minuten, seiten, kanaele, letzte, stand: new Date().toISOString() };
  });
}
