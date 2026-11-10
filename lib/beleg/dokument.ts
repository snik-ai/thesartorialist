// Belege als Dokument (BelegDokument) aus den Daten von Angebot, Rechnung und Mahnung – rein, im Browser (Live-Ansicht
// im Editor, Modus «Kunde») und auf dem Server (PDF, Kundenansicht) gleich. Entspricht VoxCRM dokumentHtml()-Aufrufen
// in offerten.ts/rechnungen.ts.
import type { Abzug, BelegSprache, Position, RechnungArt, StilZeileDb, Zahlungsplan } from '@/lib/db/schema';
import { planBedingung } from '@/lib/crm/zahlungsplan';
import type { Firma } from '@/lib/crm/firma';
import { summen } from '@/lib/crm/geld';
import { stilGruppen } from '@/lib/crm/status';
import { DOK, datumText, fuell } from './texte';
import { qrTeil } from './qr';
import { stufeName, type Mahnstufe } from './mahnwesen';
import type { BelegAbsender, BelegDokument, BelegEmpfaenger } from './vorlage';

type D = Date | string | null | undefined;

export type FirmaKurz = Pick<
  Firma,
  'name' | 'rechtsname' | 'strasse' | 'plz' | 'ort' | 'land' | 'telefon' | 'email' | 'web' | 'mwstNr' | 'mwstPflichtig' | 'iban' | 'qrIban' | 'bank' | 'anzahlungProzent' | 'zahlungsfristTage'
>;
export type KontaktKurz = { name: string; anrede?: string | null; firma?: string | null; strasse?: string | null; plz?: string | null; ort?: string | null; land?: string | null; email?: string | null };

export const absenderVon = (f: FirmaKurz, logo: string | null): BelegAbsender => ({
  name: f.name,
  rechtsname: f.rechtsname,
  strasse: f.strasse,
  plz: f.plz,
  ort: f.ort,
  telefon: f.telefon,
  email: f.email,
  web: f.web,
  mwstNr: f.mwstNr,
  mwstPflichtig: f.mwstPflichtig,
  iban: f.iban,
  qrIban: f.qrIban,
  bank: f.bank,
  logo,
});
export const empfaengerVon = (k: KontaktKurz): BelegEmpfaenger => ({ name: k.name || k.email || '—', anrede: k.anrede, firma: k.firma, strasse: k.strasse, plz: k.plz, ort: k.ort, land: k.land });

const stilVon = (stil: StilZeileDb[], stoffe: string[]) =>
  stil.length || stoffe.length ? { gruppen: stilGruppen(stil).map((g) => ({ kategorie: g.kategorie, zeilen: g.zeilen.map((z) => ({ untergruppe: z.untergruppe, option: z.option })) })), stoffe } : null;

export type AngebotEingabe = {
  nummer: string | null;
  status: string;
  titel: string;
  datum: D;
  gueltigBis: D;
  einleitung: string | null;
  schluss: string | null;
  positionen: Position[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  sprache: BelegSprache;
  stil: StilZeileDb[];
  stoffe: string[];
  stilAnhang: boolean;
  angenommenAm?: D;
  angenommenName?: string | null;
  /** Zahlungsbedingungen (null/fehlend = beim Auftrag festlegen, nur Zahlungsfrist) */
  zahlungsplan?: Zahlungsplan | null;
};

export function angebotDokument(a: AngebotEingabe, k: KontaktKurz, f: FirmaKurz, logo: string | null): BelegDokument {
  const s = a.sprache;
  const T = DOK[s];
  const sm = summen(a.positionen, { rabattProzent: a.rabattProzent, rabattRp: a.rabattRp, mwstSatz: a.mwstSatz });
  const angenommen = a.status === 'angenommen' && a.angenommenAm ? fuell(T.angenommenVon, { datum: datumText(a.angenommenAm, s), name: a.angenommenName ?? '' }) : null;
  return {
    art: 'angebot',
    sprache: s,
    dokTitel: T.angebot,
    nummer: a.nummer ?? '',
    titel: a.titel,
    meta: [
      [T.datum, datumText(a.datum, s)],
      [T.gueltigBis, datumText(a.gueltigBis, s)],
    ],
    absender: absenderVon(f, logo),
    empfaenger: empfaengerVon(k),
    einleitung: a.einleitung ?? '',
    schluss: a.schluss ?? '',
    positionen: a.positionen,
    summen: sm,
    abzug: [],
    bezahltRp: 0,
    held: { label: T.totalChf, rp: sm.totalRp, zusatz: sm.mwstSatz > 0 ? T.inklMwst : null },
    zahlung: null,
    info: planBedingung(a.zahlungsplan ?? null, sm.totalRp, s, f.zahlungsfristTage),
    qr: null,
    stempel: a.status === 'angenommen' ? { text: T.angenommen, art: 'ok' } : a.status === 'storniert' ? { text: T.storniert, art: 'storno' } : null,
    unterschrift: a.status !== 'angenommen',
    angenommen,
    stil: a.stilAnhang ? stilVon(a.stil, a.stoffe) : null,
    fussBezug: `${T.angebot} ${a.nummer ?? ''}`,
  };
}

export type RechnungEingabe = {
  nummer: string | null;
  art: RechnungArt;
  status: string;
  titel: string;
  rechnungsdatum: D;
  faelligAm: D;
  einleitung: string | null;
  schluss: string | null;
  positionen: Position[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  abzug: Abzug[];
  bezahltRp: number;
  referenz: string | null;
  sprache: BelegSprache;
  auftragNummer?: string | null;
};

export const rechnungTitel = (art: RechnungArt, s: BelegSprache) => (art === 'anzahlung' ? DOK[s].anzahlung : art === 'schluss' ? DOK[s].schluss : DOK[s].rechnung);

export function rechnungDokument(r: RechnungEingabe, k: KontaktKurz, f: FirmaKurz, logo: string | null): BelegDokument {
  const s = r.sprache;
  const T = DOK[s];
  const sm = summen(r.positionen, { rabattProzent: r.rabattProzent, rabattRp: r.rabattRp, mwstSatz: r.mwstSatz });
  const abzug = r.abzug.map((a) => ({ text: fuell(T.abzugAnzahlung, { nummer: a.nummer }), betragRp: a.betragRp }));
  const betragRp = Math.max(0, sm.totalRp - r.abzug.reduce((x, a) => x + a.betragRp, 0));
  const offenRp = Math.max(0, betragRp - r.bezahltRp);
  const bis = datumText(r.faelligAm, s);
  const fertig = r.status === 'bezahlt' || r.status === 'storniert';
  const titel = rechnungTitel(r.art, s);
  const qr = !fertig ? qrTeil(f, empfaengerVon(k), { nummer: r.nummer ?? '', referenz: r.referenz, offenRp }, s) : null;
  return {
    art: 'rechnung',
    sprache: s,
    dokTitel: titel,
    nummer: r.nummer ?? '',
    titel: r.titel,
    meta: [
      [T.datum, datumText(r.rechnungsdatum, s)],
      [T.zahlbarBis, bis],
      ...(r.auftragNummer ? ([[T.auftragNr, r.auftragNummer]] as [string, string][]) : []),
    ],
    absender: absenderVon(f, logo),
    empfaenger: empfaengerVon(k),
    einleitung: r.einleitung ?? '',
    schluss: r.schluss ?? '',
    positionen: r.positionen,
    summen: sm,
    abzug,
    bezahltRp: r.bezahltRp,
    held: fertig ? { label: T.totalChf, rp: sm.totalRp } : { label: `${r.bezahltRp ? T.offen : T.zuZahlen} CHF`, rp: offenRp, zusatz: bis ? fuell(T.zahlbarBisDatum, { datum: bis }) : null },
    zahlung: fertig ? null : { bis: bis || null, iban: qr?.konto || null, referenz: qr?.referenz ?? null, qrNotiz: Boolean(qr?.svg) },
    info: null,
    qr,
    stempel: r.status === 'bezahlt' ? { text: T.bezahlt, art: 'ok' } : r.status === 'storniert' ? { text: T.storniert, art: 'storno' } : null,
    unterschrift: false,
    angenommen: null,
    stil: null,
    fussBezug: `${titel} ${r.nummer ?? ''}`,
  };
}

export type MahnungEingabe = { nummer: string; stufe: Mahnstufe; datum: D; fristBis: D; gebuehrRp: number; offenRp: number; sprache: BelegSprache; einleitung: string; schluss: string };

/** Mahnung: Forderung (Rechnung − bezahlt + Gebühren) mit QR-Zahlteil über den offenen Betrag */
export function mahnungDokument(m: MahnungEingabe, r: { nummer: string; rechnungsdatum: D; faelligAm: D; betragRp: number; bezahltRp: number; referenz: string | null; gebuehrenVorherRp: number }, k: KontaktKurz, f: FirmaKurz, logo: string | null): BelegDokument {
  const s = m.sprache;
  const T = DOK[s];
  const name = stufeName(m.stufe, s);
  const frist = datumText(m.fristBis, s);
  const zeilen: [string, number][] = [[fuell(T.mahnRechnungZeile, { nummer: r.nummer, datum: datumText(r.rechnungsdatum, s), faellig: datumText(r.faelligAm, s) }), r.betragRp]];
  if (r.bezahltRp) zeilen.push([T.bereitsBezahlt, -r.bezahltRp]);
  if (r.gebuehrenVorherRp) zeilen.push([T.mahnGebuehrenBisher, r.gebuehrenVorherRp]);
  if (m.gebuehrRp) zeilen.push([fuell(T.mahnGebuehr, { stufe: name }), m.gebuehrRp]);
  const qr = qrTeil(f, empfaengerVon(k), { nummer: r.nummer, referenz: r.referenz, offenRp: m.offenRp, mitteilung: `${name} ${m.nummer} · ${T.rechnung} ${r.nummer}` }, s);
  return {
    art: 'mahnung',
    sprache: s,
    dokTitel: name,
    nummer: m.nummer,
    titel: '',
    meta: [
      [T.datum, datumText(m.datum, s)],
      [T.zahlbarBis, frist],
      [T.rechnungNr, r.nummer],
      [T.rechnungsdatum, datumText(r.rechnungsdatum, s)],
    ],
    absender: absenderVon(f, logo),
    empfaenger: empfaengerVon(k),
    einleitung: m.einleitung,
    schluss: `${m.schluss}\n\n${T.gruss}\n${f.name}`,
    positionen: [],
    summen: summen([], { mwstSatz: 0 }),
    abzug: [],
    bezahltRp: 0,
    held: { label: `${T.offen} CHF`, rp: m.offenRp, zusatz: fuell(T.zahlbarBisDatum, { datum: frist }) },
    zahlung: { bis: frist, iban: qr.konto || null, referenz: qr.referenz, qrNotiz: Boolean(qr.svg) },
    info: null,
    qr,
    stempel: null,
    unterschrift: false,
    angenommen: null,
    stil: null,
    mahnzeilen: zeilen,
    fussBezug: `${name} ${m.nummer}`,
  };
}
