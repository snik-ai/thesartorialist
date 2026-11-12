// Konfigurator-Analyse fürs Backend (/admin/reichweite/konfigurator/): wie viele öffnen den Stil-Konfigurator,
// wie viele wählen, welche Schritte sie erreichen, wo sie aufhören, was gewählt wird und wie viele daraus eine
// Terminanfrage machen. Grundlage sind die cookielosen Tracking-Ereignisse (lib/tracking, Tabelle ereignis).
//
// Begriffe:
//  - Sitzung wie in der Webseitenanalyse (Server: gleicher Tages-Besucher, bis 30 Min. Ruhe).
//  - Geöffnet: konfig_offen oder (ältere Daten) ein Seitenaufruf der Konfigurator-Seite in einer der 9 Sprachen.
//  - Erste Auswahl: konfig_start oder konfig_wahl. Schritt erreicht: konfig_kategorie (Abschnitt ≥ 0,8 s im Blick)
//    oder eine Wahl in der Kategorie. Vollständig: konfig_fertig (lib/konfigurator/vollstaendig.ts).
//  - Die Stufen sind nicht zwingend Teilmengen: wer per Reiter springt, überspringt Schritte. Darum zeigt der
//    Trichter je Stufe die echte Zahl, den Anteil an «geöffnet» und den Übergang zur vorigen Stufe.
//  - Anfrage mit Stil: anfrage_konfig (Terminanfrage, die eine Stil-Auswahl mitsendet).
import { sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { TZ } from '@/lib/zeit';
import { ROUTEN } from '@/lib/i18n/routen';
import { KONFIG_KATEGORIEN } from '@/lib/konfigurator/daten';
import { OPTIONEN, SCHRITT_LABEL, UNTERGRUPPE_KAT, UNTERGRUPPE_TITEL } from '@/lib/konfigurator/bezeichnungen';
import { entscheidungen } from '@/lib/konfigurator/vollstaendig';
import { tagPlus, type Zeitraum } from '@/lib/crm/webanalyse';

const tz = sql.raw(`'${TZ}'`);
const tagesbeginn = (tag: string) => sql`(${tag}::date::timestamp at time zone ${tz})`;
const n = (v: unknown) => {
  const z = Number(v);
  return Number.isFinite(z) ? z : 0;
};
const nOderNull = (v: unknown) => (v === null || v === undefined ? null : n(v));
const anteil = (teil: number, ganz: number) => (ganz > 0 ? teil / ganz : null);

type Tx = Parameters<Parameters<ReturnType<typeof db>['transaction']>[0]>[0];
async function zeilen<T = Record<string, unknown>>(tx: Tx, q: SQL): Promise<T[]> {
  return [...(await tx.execute(q))] as T[];
}

/* ---------- Trichter ---------- */

export type KStufe = { stufe: string; label: string; wert: number };

const STUFEN: { stufe: string; label: string; wenn: SQL }[] = [
  { stufe: 'offen', label: 'Konfigurator geöffnet', wenn: sql`offen` },
  { stufe: 'start', label: 'Erste Auswahl getroffen', wenn: sql`start` },
  ...KONFIG_KATEGORIEN.map((k) => ({ stufe: `kat_${k.id}`, label: `${k.title} erreicht`, wenn: sql`${k.id} = any(kategorien)` })),
  { stufe: 'stoff', label: 'Stoff erreicht', wenn: sql`'stoff' = any(kategorien)` },
  { stufe: 'uebersicht', label: 'Übersicht erreicht', wenn: sql`'uebersicht' = any(kategorien)` },
  { stufe: 'anzug', label: 'Anzug vollständig (Sakko + Hose)', wenn: sql`fertig @> array['jacket','trousers']::text[]` },
  { stufe: 'pdf', label: 'PDF heruntergeladen', wenn: sql`pdf_zeit is not null` },
  { stufe: 'termin', label: 'Weiter zur Terminbuchung', wenn: sql`termin_zeit is not null` },
  { stufe: 'anfrage', label: 'Anfrage mit Stil gesendet', wenn: sql`anfrage` },
];
const STUFEN_SPALTEN = sql.join(
  STUFEN.map((s) => sql`count(*) filter (where ${s.wenn})::int as ${sql.identifier(s.stufe)}`),
  sql`, `,
);
const stufenAus = (r: Record<string, unknown> | undefined): KStufe[] => STUFEN.map((s) => ({ stufe: s.stufe, label: s.label, wert: n(r?.[s.stufe]) }));

/* ---------- Fenster ---------- */

function konfigPfade(): SQL {
  const pfade = Object.values(ROUTEN.konfigurator ?? {}).filter(Boolean) as string[];
  return sql.join(
    pfade.map((p) => sql`pfad like ${`${p}%`}`),
    sql` or `,
  );
}

function fensterSql(name: 'k' | 'kv', von: SQL, bis: SQL): SQL[] {
  const ev = sql.raw(`${name}_ev`);
  const s = sql.raw(`${name}_s`);
  return [
    sql`create temp table ${ev} on commit drop as
      select coalesce(sitzung, 'alt' || besucher || to_char(zeit at time zone ${tz}, 'YYYYMMDD')) as sid, besucher, typ, label, zeit, geraet, seiten_sprache
      from ereignis
      where zeit >= ${von} and zeit < ${bis}
        and (typ like 'konfig\\_%' or typ = 'anfrage_konfig' or (typ = 'pageview' and (${konfigPfade()})))`,
    sql`create temp table ${s} on commit drop as
      select sid,
        min(besucher) as besucher,
        coalesce((array_agg(geraet order by zeit))[1], 'unbekannt') as geraet,
        coalesce((array_agg(seiten_sprache order by zeit))[1], 'de') as sprache,
        bool_or(typ in ('konfig_offen', 'pageview')) as offen,
        min(zeit) filter (where typ in ('konfig_offen', 'pageview')) as offen_zeit,
        bool_or(typ in ('konfig_start', 'konfig_wahl')) as start,
        count(distinct label) filter (where typ = 'konfig_wahl')::int as wahlen,
        coalesce(array_agg(distinct label) filter (where typ = 'konfig_kategorie' and label is not null), '{}') as kategorien,
        coalesce(array_agg(distinct label) filter (where typ = 'konfig_fertig' and label is not null), '{}') as fertig,
        (array_agg(label order by zeit desc) filter (where typ = 'konfig_kategorie' and label is not null))[1] as letzter_schritt,
        min(zeit) filter (where typ = 'konfig_pdf') as pdf_zeit,
        min(zeit) filter (where typ = 'konfig_termin') as termin_zeit,
        bool_or(typ = 'anfrage_konfig') as anfrage,
        bool_or(typ = 'konfig_reset') as reset,
        bool_or(typ = 'konfig_stoff') as stoff
      from ${ev} group by sid`,
  ];
}

/* ---------- Antwort ---------- */

export type KKennzahlen = {
  geoeffnet: number;
  mitAuswahl: number;
  startquote: number | null;
  wahlenSchnitt: number | null;
  wahlenMedian: number | null;
  anzugVollstaendig: number;
  pdf: number;
  termin: number;
  anfrage: number;
  abschlussquote: number | null;
  /** Median Sekunden vom Öffnen bis zum PDF bzw. bis «weiter zum Termin» */
  bisPdfS: number | null;
  bisTerminS: number | null;
  stoffNotiert: number;
  geleert: number;
};

export type KKategorie = {
  id: string;
  label: string;
  entscheidungen: number;
  erreicht: number;
  mitAuswahl: number;
  wahlenSchnitt: number | null;
  vollstaendig: number;
};

export type KOption = { id: string; label: string; sitzungen: number; anteil: number | null; abwahlen: number; details: number };
export type KUntergruppe = { id: string; label: string; sitzungen: number; optionen: KOption[] };

export type KonfigAnalyse = {
  zeitraum: Zeitraum;
  kennzahlen: KKennzahlen;
  vorperiode: KKennzahlen;
  trichter: KStufe[];
  trichterVorher: KStufe[];
  trichterGeraete: { geraet: string; label: string; stufen: KStufe[] }[];
  sprachen: { sprache: string; label: string; stufen: KStufe[] }[];
  verlauf: { schluessel: string; offen: number; start: number; ziel: number }[];
  kategorien: KKategorie[];
  untergruppen: Record<string, KUntergruppe[]>;
  ausstieg: { schritt: string; label: string; sitzungen: number }[];
  wahlenVerteilung: { label: string; sitzungen: number }[];
};

const GERAET_LABEL: Record<string, string> = { mobil: 'Smartphone', tablet: 'Tablet', desktop: 'Computer', unbekannt: 'Unbekannt' };
const SPRACHE_LABEL: Record<string, string> = {
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

async function kennzahlen(tx: Tx, f: 'k' | 'kv'): Promise<KKennzahlen> {
  const s = sql.raw(`${f}_s`);
  const [r] = await zeilen(
    tx,
    sql`select count(*) filter (where offen)::int as geoeffnet,
      count(*) filter (where start)::int as mit_auswahl,
      avg(wahlen) filter (where wahlen > 0) as wahlen_schnitt,
      percentile_cont(0.5) within group (order by wahlen) filter (where wahlen > 0) as wahlen_median,
      count(*) filter (where fertig @> array['jacket','trousers']::text[])::int as anzug,
      count(*) filter (where pdf_zeit is not null)::int as pdf,
      count(*) filter (where termin_zeit is not null)::int as termin,
      count(*) filter (where anfrage)::int as anfrage,
      count(*) filter (where offen and anfrage)::int as offen_anfrage,
      percentile_cont(0.5) within group (order by extract(epoch from pdf_zeit - offen_zeit)) filter (where pdf_zeit > offen_zeit) as bis_pdf,
      percentile_cont(0.5) within group (order by extract(epoch from termin_zeit - offen_zeit)) filter (where termin_zeit > offen_zeit) as bis_termin,
      count(*) filter (where stoff)::int as stoff,
      count(*) filter (where reset)::int as geleert
    from ${s}`,
  );
  const geoeffnet = n(r?.geoeffnet);
  const median = nOderNull(r?.wahlen_median);
  const bisPdf = nOderNull(r?.bis_pdf);
  const bisTermin = nOderNull(r?.bis_termin);
  return {
    geoeffnet,
    mitAuswahl: n(r?.mit_auswahl),
    startquote: anteil(n(r?.mit_auswahl), geoeffnet),
    wahlenSchnitt: nOderNull(r?.wahlen_schnitt),
    wahlenMedian: median,
    anzugVollstaendig: n(r?.anzug),
    pdf: n(r?.pdf),
    termin: n(r?.termin),
    anfrage: n(r?.anfrage),
    abschlussquote: anteil(n(r?.offen_anfrage), geoeffnet),
    bisPdfS: bisPdf === null ? null : Math.round(bisPdf),
    bisTerminS: bisTermin === null ? null : Math.round(bisTermin),
    stoffNotiert: n(r?.stoff),
    geleert: n(r?.geleert),
  };
}

export async function konfigAnalyse(z: Zeitraum): Promise<KonfigAnalyse> {
  const von = tagesbeginn(z.von);
  const bis = tagesbeginn(tagPlus(z.bis, 1));
  const vVon = tagesbeginn(z.vorher.von);
  const vBis = tagesbeginn(tagPlus(z.vorher.bis, 1));

  return db().transaction(async (tx) => {
    for (const q of [...fensterSql('k', von, bis), ...fensterSql('kv', vVon, vBis)]) await tx.execute(q);

    const jetzt = await kennzahlen(tx, 'k');
    const vorher = await kennzahlen(tx, 'kv');

    const [tr] = await zeilen(tx, sql`select ${STUFEN_SPALTEN} from k_s`);
    const [trv] = await zeilen(tx, sql`select ${STUFEN_SPALTEN} from kv_s`);
    const trichterGeraete = (await zeilen(tx, sql`select geraet, ${STUFEN_SPALTEN} from k_s group by 1 order by offen desc`)).map((r) => ({
      geraet: String(r.geraet),
      label: GERAET_LABEL[String(r.geraet)] ?? String(r.geraet),
      stufen: stufenAus(r),
    }));
    const sprachen = (await zeilen(tx, sql`select sprache, ${STUFEN_SPALTEN} from k_s group by 1 order by offen desc, 1`)).map((r) => ({
      sprache: String(r.sprache),
      label: SPRACHE_LABEL[String(r.sprache)] ?? String(r.sprache),
      stufen: stufenAus(r),
    }));

    // Verlauf: je Tag (bzw. Stunde bei einem Tag) Sitzungen nach Beginn
    const fmt = z.aufloesung === 'stunde' ? `'YYYY-MM-DD"T"HH24'` : `'YYYY-MM-DD'`;
    const roh = await zeilen(
      tx,
      sql`select to_char(coalesce(offen_zeit, termin_zeit, pdf_zeit) at time zone ${tz}, ${sql.raw(fmt)}) as schluessel,
        count(*) filter (where offen)::int as offen, count(*) filter (where start)::int as start,
        count(*) filter (where pdf_zeit is not null or termin_zeit is not null or anfrage)::int as ziel
      from k_s where coalesce(offen_zeit, termin_zeit, pdf_zeit) is not null group by 1`,
    );
    const rm = new Map(roh.map((r) => [String(r.schluessel), r]));
    const schluessel: string[] = [];
    if (z.aufloesung === 'stunde') for (let h = 0; h < 24; h++) schluessel.push(`${z.von}T${String(h).padStart(2, '0')}`);
    else for (let t = z.von; t <= z.bis; t = tagPlus(t, 1)) schluessel.push(t);
    const verlauf = schluessel.map((k) => {
      const r = rm.get(k);
      return { schluessel: k, offen: n(r?.offen), start: n(r?.start), ziel: n(r?.ziel) };
    });

    // Je Kategorie: erreicht, mit Auswahl, Ø Wahlen, vollständig
    const wahlRoh = await zeilen<{ label: string; sid: string }>(tx, sql`select distinct sid, label from k_ev where typ = 'konfig_wahl' and label is not null`);
    const proKat = new Map<string, { sids: Set<string>; n: number }>();
    for (const w of wahlRoh) {
      const kat = UNTERGRUPPE_KAT.get(String(w.label).split(':')[0]);
      if (!kat) continue;
      const e = proKat.get(kat) ?? { sids: new Set(), n: 0 };
      e.sids.add(String(w.sid));
      e.n++;
      proKat.set(kat, e);
    }
    const katRoh = await zeilen(
      tx,
      sql`select k, count(*) filter (where k = any(kategorien))::int as erreicht, count(*) filter (where k = any(fertig))::int as fertig
        from k_s cross join unnest(${sql.raw(`array[${KONFIG_KATEGORIEN.map((k) => `'${k.id}'`).join(',')}]::text[]`)}) as k group by k`,
    );
    const kategorien: KKategorie[] = KONFIG_KATEGORIEN.map((k) => {
      const r = katRoh.find((x) => x.k === k.id);
      const w = proKat.get(k.id);
      return {
        id: k.id,
        label: k.title,
        entscheidungen: entscheidungen(k).length,
        erreicht: n(r?.erreicht),
        mitAuswahl: w?.sids.size ?? 0,
        wahlenSchnitt: w && w.sids.size ? w.n / w.sids.size : null,
        vollstaendig: n(r?.fertig),
      };
    });

    // Optionen: Sitzungen mit Wahl, Abwahl, Details angesehen
    const optRoh = await zeilen(
      tx,
      sql`select label, count(distinct sid) filter (where typ = 'konfig_wahl')::int as wahl,
          count(distinct sid) filter (where typ = 'konfig_abwahl')::int as abwahl,
          count(distinct sid) filter (where typ = 'konfig_detail')::int as detail
        from k_ev where typ in ('konfig_wahl', 'konfig_abwahl', 'konfig_detail') and label is not null group by 1`,
    );
    const ugRoh = await zeilen(
      tx,
      sql`select split_part(label, ':', 1) as ug, count(distinct sid)::int as sitzungen from k_ev where typ = 'konfig_wahl' and label is not null group by 1`,
    );
    const om = new Map(optRoh.map((r) => [String(r.label), r]));
    const ugm = new Map(ugRoh.map((r) => [String(r.ug), n(r.sitzungen)]));
    const untergruppen: Record<string, KUntergruppe[]> = {};
    for (const k of KONFIG_KATEGORIEN) {
      untergruppen[k.id] = k.subCategories.map((u) => {
        const sitzungen = ugm.get(u.id) ?? 0;
        const optionen = u.options
          .map((o) => {
            const r = om.get(`${u.id}:${o.id}`);
            const wahl = n(r?.wahl);
            return { id: o.id, label: OPTIONEN.get(`${u.id}:${o.id}`)?.label ?? o.label, sitzungen: wahl, anteil: anteil(wahl, sitzungen), abwahlen: n(r?.abwahl), details: n(r?.detail) };
          })
          .sort((a, b) => b.sitzungen - a.sitzungen || b.details - a.details);
        return { id: u.id, label: UNTERGRUPPE_TITEL.get(u.id) ?? u.title, sitzungen, optionen };
      });
    }

    // Wo hören sie auf? Letzter erreichter Schritt der Sitzungen, die geöffnet, aber weder PDF noch Termin noch Anfrage haben
    const ausstieg = (
      await zeilen(
        tx,
        sql`select coalesce(letzter_schritt, '–') as schritt, count(*)::int as sitzungen from k_s
          where offen and pdf_zeit is null and termin_zeit is null and not anfrage group by 1 order by 2 desc`,
      )
    ).map((r) => ({
      schritt: String(r.schritt),
      label: r.schritt === '–' ? 'Kein Schritt (nur kurz geöffnet)' : (SCHRITT_LABEL[String(r.schritt)] ?? String(r.schritt)),
      sitzungen: n(r.sitzungen),
    }));
    const reihenfolge = ['–', ...KONFIG_KATEGORIEN.map((k) => k.id), 'stoff', 'uebersicht'];
    ausstieg.sort((a, b) => reihenfolge.indexOf(a.schritt) - reihenfolge.indexOf(b.schritt));

    const [wv] = await zeilen(
      tx,
      sql`select count(*) filter (where offen and wahlen = 0)::int as a, count(*) filter (where wahlen between 1 and 3)::int as b,
        count(*) filter (where wahlen between 4 and 9)::int as c, count(*) filter (where wahlen between 10 and 19)::int as d,
        count(*) filter (where wahlen >= 20)::int as e from k_s`,
    );
    const wahlenVerteilung = [
      ['keine Auswahl', 'a'],
      ['1–3 Details', 'b'],
      ['4–9 Details', 'c'],
      ['10–19 Details', 'd'],
      ['20 und mehr', 'e'],
    ].map(([label, k]) => ({ label, sitzungen: n(wv?.[k]) }));

    return {
      zeitraum: z,
      kennzahlen: jetzt,
      vorperiode: vorher,
      trichter: stufenAus(tr),
      trichterVorher: stufenAus(trv),
      trichterGeraete,
      sprachen,
      verlauf,
      kategorien,
      untergruppen,
      ausstieg,
      wahlenVerteilung,
    };
  });
}

/** Nur die Kennzahlen (Zeitraum + Vorperiode) — für die Kachel auf der Webseitenanalyse. */
export async function konfigKennzahlen(z: Zeitraum): Promise<{ jetzt: KKennzahlen; vorher: KKennzahlen }> {
  return db().transaction(async (tx) => {
    for (const q of [
      ...fensterSql('k', tagesbeginn(z.von), tagesbeginn(tagPlus(z.bis, 1))),
      ...fensterSql('kv', tagesbeginn(z.vorher.von), tagesbeginn(tagPlus(z.vorher.bis, 1))),
    ])
      await tx.execute(q);
    return { jetzt: await kennzahlen(tx, 'k'), vorher: await kennzahlen(tx, 'kv') };
  });
}
