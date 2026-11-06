// Kennzahlen für «Reichweite & Anfragen»: Tagesreihen (Zürcher Tage), Vorperiode, Top-Seiten, Herkunft, Geräte.
// Besucher = pro Tag eindeutige Besucher-IDs (die ID wechselt täglich), summiert über den Zeitraum.
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { TZ } from '@/lib/zeit';

export type Tag = { tag: string; besucher: number; aufrufe: number; tel: number; wa: number; mail: number; route: number; rueckruf: number; termin: number };
export type Summen = Omit<Tag, 'tag'>;

// Zeitzone als Literal (gleicher Ausdruck in SELECT/ORDER BY nötig für DISTINCT ON)
const tz = sql.raw(`'${TZ}'`);

const LEER: Summen = { besucher: 0, aufrufe: 0, tel: 0, wa: 0, mail: 0, route: 0, rueckruf: 0, termin: 0 };

function tagListe(von: string, anzahl: number) {
  const out: string[] = [];
  const d = new Date(`${von}T12:00:00Z`);
  for (let i = 0; i < anzahl; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const summe = (tage: Tag[]): Summen =>
  tage.reduce((s, t) => {
    const o = { ...s };
    for (const k of Object.keys(LEER) as (keyof Summen)[]) o[k] += t[k];
    return o;
  }, LEER);

export const kontakte = (s: Summen) => s.tel + s.wa + s.mail + s.rueckruf + s.termin;

/** Referrer/UTM → lesbare Herkunft */
export function herkunftLabel(utm: string | null, ref: string | null): string {
  const q = (utm || ref || '').toLowerCase();
  if (!q) return 'Direkt / unbekannt';
  if (/google/.test(q)) return 'Google';
  if (/bing|duckduckgo|ecosia|yahoo|qwant|startpage|search\.ch|brave/.test(q)) return 'Andere Suchmaschinen';
  if (/chatgpt|openai|perplexity|claude|gemini|copilot/.test(q)) return 'KI-Assistenten';
  if (/instagram/.test(q)) return 'Instagram';
  if (/facebook|fb\.|meta/.test(q)) return 'Facebook';
  if (/linkedin|lnkd/.test(q)) return 'LinkedIn';
  if (/tiktok/.test(q)) return 'TikTok';
  if (/maps|gmb|business/.test(q)) return 'Google Maps / Unternehmensprofil';
  return utm ? `Kampagne «${utm}»` : q;
}

export async function reichweite(tageAnzahl: number) {
  const heute = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  const start = new Date(`${heute}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (2 * tageAnzahl - 1));
  const vorVon = start.toISOString().slice(0, 10);
  const alle = tagListe(vorVon, 2 * tageAnzahl);
  const ab = sql`(${vorVon}::date::timestamp at time zone ${tz})`;
  const periodeAb = sql`(${alle[tageAnzahl]}::date::timestamp at time zone ${tz})`;

  const [ereignisse, anfragen, seiten, herkunft, geraete, kampagnen] = await Promise.all([
    db().execute<{ tag: string; typ: string; n: number; b: number }>(sql`
      select to_char(zeit at time zone ${tz}, 'YYYY-MM-DD') as tag, typ, count(*)::int as n, count(distinct besucher)::int as b
      from ereignis where zeit >= ${ab} group by 1, 2`),
    db().execute<{ tag: string; art: string; n: number }>(sql`
      select to_char(erstellt_am at time zone ${tz}, 'YYYY-MM-DD') as tag, art, count(*)::int as n
      from termin where erstellt_am >= ${ab} group by 1, 2`),
    db().execute<{ pfad: string; aufrufe: number; besucher: number }>(sql`
      select pfad, count(*)::int as aufrufe, count(distinct besucher)::int as besucher
      from ereignis where typ = 'pageview' and zeit >= ${periodeAb} group by pfad order by 2 desc limit 8`),
    db().execute<{ utm: string | null; ref: string | null; n: number }>(sql`
      select utm, ref, count(*)::int as n from (
        select distinct on (besucher, (zeit at time zone ${tz})::date) utm_source as utm, referrer as ref
        from ereignis where typ = 'pageview' and zeit >= ${periodeAb}
        order by besucher, (zeit at time zone ${tz})::date, zeit
      ) x group by 1, 2`),
    db().execute<{ geraet: string | null; n: number }>(sql`
      select geraet, count(distinct besucher || to_char(zeit at time zone ${tz}, 'YYYYMMDD'))::int as n
      from ereignis where typ = 'pageview' and zeit >= ${periodeAb} group by 1`),
    db().execute<{ kampagne: string; quelle: string | null; n: number }>(sql`
      select utm_campaign as kampagne, max(utm_source) as quelle, count(distinct besucher)::int as n
      from ereignis where typ = 'pageview' and utm_campaign is not null and zeit >= ${periodeAb} group by 1 order by 3 desc limit 6`),
  ]);

  const map = new Map<string, Tag>(alle.map((t) => [t, { tag: t, ...LEER }]));
  for (const e of ereignisse) {
    const t = map.get(e.tag);
    if (!t) continue;
    if (e.typ === 'pageview') {
      t.besucher += e.b;
      t.aufrufe += e.n;
    } else if (e.typ === 'click_tel') t.tel += e.n;
    else if (e.typ === 'click_whatsapp') t.wa += e.n;
    else if (e.typ === 'click_mail') t.mail += e.n;
    else if (e.typ === 'click_route') t.route += e.n;
  }
  for (const a of anfragen) {
    const t = map.get(a.tag);
    if (!t) continue;
    if (a.art === 'rueckruf') t.rueckruf += a.n;
    else t.termin += a.n;
  }
  const reihe = alle.map((t) => map.get(t)!);
  const vor = reihe.slice(0, tageAnzahl);
  const akt = reihe.slice(tageAnzahl);

  const herkunftSumme = new Map<string, number>();
  for (const h of herkunft) {
    const l = herkunftLabel(h.utm, h.ref);
    herkunftSumme.set(l, (herkunftSumme.get(l) ?? 0) + h.n);
  }

  return {
    tage: akt,
    vorTage: vor,
    summe: summe(akt),
    vorSumme: summe(vor),
    seiten: [...seiten],
    herkunft: [...herkunftSumme.entries()].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 8),
    geraete: ['mobil', 'desktop', 'tablet'].map((g) => ({ geraet: g, n: geraete.find((x) => x.geraet === g)?.n ?? 0 })),
    kampagnen: [...kampagnen],
  };
}
