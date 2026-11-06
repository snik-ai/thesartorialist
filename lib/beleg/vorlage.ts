// HTML-Vorlage der Belege (Angebot, Auftragsbestätigung, Rechnung, Mahnung) – Grundlage für PDF (Chrome), PDF-Vorschau
// im Editor und Kundenansicht. Aufbau 1:1 nach VoxCRM apps/api/src/module/verkauf/vorlagen.ts (Briefkopf fürs
// Fenstercouvert, Titel mit Betrag, Angaben-Leiste, Positionen mit Zwischentiteln, Zahlung neben den Totalen, Fuss in
// Spalten, QR-Zahlteil nach SIX auf eigener Seite), Gestaltung und Masse aus lib/beleg/stil.ts.
// Rein (Browser + Server), keine Datenbank.
import type { BelegSprache, Position } from '@/lib/db/schema';
import { chf, istPosition, positionBetrag, type Summen } from '@/lib/crm/geld';
import { DOK, einheitText, fuell, type DokTexte } from './texte';
import { qrBetrag, type QrTeil } from './qr';
import { DRUCK_CSS, PAPIER_CSS, SCHRIFTEN_WEB } from './stil';

export type BelegAbsender = {
  name: string;
  rechtsname: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  web: string;
  mwstNr: string;
  mwstPflichtig: boolean;
  iban: string;
  qrIban: string;
  bank: string;
  /** data:-URI oder Pfad (/images/marke/wortmarke-schwarz.png) */
  logo: string | null;
};
export type BelegEmpfaenger = { name: string; anrede?: string | null; firma?: string | null; strasse?: string | null; plz?: string | null; ort?: string | null; land?: string | null };
export type StilAnhang = { gruppen: { kategorie: string; zeilen: { untergruppe: string; option: string }[] }[]; stoffe: string[] };

export type BelegDokument = {
  art: 'angebot' | 'auftrag' | 'rechnung' | 'mahnung';
  sprache: BelegSprache;
  /** «Angebot», «Schlussrechnung», «1. Mahnung» (in der Dokumentsprache) */
  dokTitel: string;
  nummer: string;
  /** Betreff */
  titel: string;
  meta: [string, string][];
  absender: BelegAbsender;
  empfaenger: BelegEmpfaenger;
  einleitung: string;
  schluss: string;
  positionen: Position[];
  summen: Summen;
  /** Abzüge (Anzahlungen) unter dem Total */
  abzug: { text: string; betragRp: number }[];
  bezahltRp: number;
  /** Betrag rechts im Titel */
  held: { label: string; rp: number; zusatz?: string | null } | null;
  /** Zahlungsangaben links neben den Totalen */
  zahlung: { bis: string | null; iban: string | null; referenz: string | null; qrNotiz: boolean } | null;
  /** Zahlungsbedingungen (Angebot), z. B. Anzahlung */
  info: string | null;
  qr: QrTeil | null;
  stempel: { text: string; art: 'ok' | 'storno' | 'entwurf' } | null;
  unterschrift: boolean;
  angenommen: string | null;
  stil: StilAnhang | null;
  /** Mahnung: Zeilen der Forderung */
  mahnzeilen?: [string, number][];
  fussBezug: string;
};

export const h = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const zahl = (rp: number) => chf(rp, false);
const absatz = (t: string | null | undefined) =>
  t && t.trim()
    ? t
        .trim()
        .split(/\n{2,}/)
        .map((p) => `<p>${h(p).replace(/\n/g, '<br>')}</p>`)
        .join('')
    : '';
export const mengeText = (m: number) => (Number.isInteger(m) ? String(m) : String(Math.round(m * 1000) / 1000));
export const satzText = (s: number) => String(Math.round(s * 100) / 100);

/* ---------- Bausteine (auch vom Editor genutzt, damit Texte gleich sind) ---------- */

export function absenderZeilen(a: BelegAbsender): string[] {
  return [a.rechtsname && a.rechtsname !== a.name ? a.rechtsname : '', a.strasse, `${a.plz} ${a.ort}`.trim(), a.telefon, a.email, a.web, a.mwstPflichtig && a.mwstNr ? a.mwstNr : ''].filter(Boolean);
}
export function empfaengerZeilen(e: BelegEmpfaenger): string[] {
  const land = e.land && e.land.toUpperCase() !== 'CH' ? e.land.toUpperCase() : '';
  return [e.firma ?? '', e.strasse ?? '', `${e.plz ?? ''} ${e.ort ?? ''}`.trim(), land].filter(Boolean);
}
export const ruecksendeZeile = (a: BelegAbsender) => [a.name, a.strasse, `${a.plz} ${a.ort}`.trim()].filter(Boolean).join(' · ');

export function fussSpalten(a: BelegAbsender): string[][] {
  const iban = a.iban.trim() || a.qrIban.trim();
  return [
    [a.rechtsname || a.name, a.strasse, `${a.plz} ${a.ort}`.trim()].filter(Boolean),
    [a.telefon, a.email, a.web].filter(Boolean),
    [iban ? `IBAN ${iban}` : '', a.bank, a.mwstPflichtig && a.mwstNr ? a.mwstNr : ''].filter(Boolean),
  ].filter((s) => s.length);
}

/** Zwischentotal je Gruppe: ab zwei Zwischentiteln unter jeder Gruppe mit Positionen (Index der letzten Zeile → Summe) */
export function zwischentotale(pos: Position[]): Map<number, number> {
  const m = new Map<number, number>();
  if (pos.filter((p) => p.art === 'titel').length < 2) return m;
  let summe = 0;
  let mit = false;
  let inGruppe = false;
  let letzte = -1;
  const schliesse = () => {
    if (inGruppe && mit && letzte >= 0) m.set(letzte, summe);
  };
  pos.forEach((p, i) => {
    if (p.art === 'titel') {
      schliesse();
      summe = 0;
      mit = false;
      inGruppe = true;
      letzte = i;
      return;
    }
    letzte = i;
    if (istPosition(p)) {
      summe += positionBetrag(p);
      mit = true;
    }
  });
  schliesse();
  return m;
}

/** Zusatzangaben einer Position (Stoffnummer, Rabatt, abweichender MWST-Satz) */
export function positionZusatz(p: Position, D: DokTexte, belegSatz: number): string[] {
  const z: string[] = [];
  if (p.stoffnummer) z.push(`${D.stoff} ${p.stoffnummer}`);
  if (p.rabattProzent) {
    const voll = Math.round(p.menge * p.einzelpreisRp);
    const weg = voll - positionBetrag(p);
    z.push(`${fuell(D.rabatt, { p: satzText(p.rabattProzent) })}${weg > 0 ? ` (−${zahl(weg)})` : ''}`);
  }
  if (belegSatz > 0 && p.mwstSatz !== undefined && p.mwstSatz !== belegSatz) z.push(`${D.mwstKurz} ${satzText(p.mwstSatz)} %`);
  return z;
}

/** Totale als Zeilen (für Papier und PDF): [Klasse, Text, Betrag] */
export function totalZeilen(d: Pick<BelegDokument, 'summen' | 'abzug' | 'bezahltRp' | 'sprache' | 'absender'>): [string, string, string][] {
  const D = DOK[d.sprache];
  const s = d.summen;
  const z: [string, string, string][] = [];
  const letzte = d.bezahltRp ? 'offen' : d.abzug.length ? 'abzug' : 'total';
  if (s.rabattRp || s.rundungRp) z.push(['', D.zwischentotal, zahl(s.zwischenRp)]);
  if (s.rabattRp) z.push(['m', D.rabattBetrag, `−${zahl(s.rabattRp)}`]);
  if (s.rundungRp) z.push(['m', D.rundung, `${s.rundungRp < 0 ? '−' : ''}${zahl(Math.abs(s.rundungRp))}`]);
  z.push([`g${letzte === 'total' ? ' haupt' : ''}`, D.totalChf, zahl(s.totalRp)]);
  let rest = s.totalRp;
  for (const a of d.abzug) {
    z.push(['m', a.text, `−${zahl(a.betragRp)}`]);
    rest -= a.betragRp;
  }
  if (d.abzug.length) z.push([`g${letzte === 'abzug' ? ' haupt' : ''}`, `${D.zuZahlen} CHF`, zahl(rest)]);
  if (d.bezahltRp) {
    z.push(['m', D.bereitsBezahlt, `−${zahl(d.bezahltRp)}`]);
    z.push(['g haupt', `${D.offen} CHF`, zahl(rest - d.bezahltRp)]);
  }
  if (s.mwstSatz > 0) for (const m of s.mwst) z.push(['inkl', fuell(D.mwstAuf, { satz: satzText(m.satz), basis: zahl(m.basisRp) }), zahl(m.betragRp)]);
  else if (!d.absender.mwstPflichtig) z.push(['inkl', D.nichtPflichtig, '']);
  return z;
}

/* ---------- HTML ---------- */

function kopfHtml(d: BelegDokument) {
  const a = d.absender;
  const e = d.empfaenger;
  const logo = a.logo ? `<img src="${h(a.logo)}" alt="${h(a.name)}">` : `<span class="bl-wort">${h(a.name)}</span>`;
  return `<div class="bl-brief">
  <div class="bl-logo">${logo}<i></i></div>
  <div class="bl-abs"><b>${h(a.name)}</b><br>${absenderZeilen(a).map(h).join('<br>')}</div>
  <div class="bl-fenster"><small>${h(ruecksendeZeile(a))}</small>${e.anrede ? `${h(e.anrede)}<br>` : ''}<b>${h(e.name)}</b>${empfaengerZeilen(e).map((z) => `<br>${h(z)}`).join('')}</div>
  <i class="bl-falz" style="top:90mm"></i><i class="bl-falz" style="top:195mm"></i><i class="bl-falz loch" style="top:133.5mm"></i>
</div>`;
}

function titelHtml(d: BelegDokument) {
  const held = d.held ? `<div class="bl-held"><small>${h(d.held.label)}</small><b>${zahl(d.held.rp)}</b>${d.held.zusatz ? `<span>${h(d.held.zusatz)}</span>` : ''}</div>` : '';
  const meta = d.meta.filter(([, v]) => v);
  return `${d.stempel ? `<div class="bl-stempel ${d.stempel.art}">${h(d.stempel.text)}</div>` : ''}
<div class="bl-titelblock"><div class="bl-titelblock-l"><h1 class="bl-h1">${h(d.dokTitel)} <span class="nr">${h(d.nummer)}</span></h1>${d.titel ? `<div class="bl-betreff">${h(d.titel)}</div>` : ''}</div>${held}</div>
${meta.length ? `<div class="bl-angaben">${meta.map(([l, v]) => `<div><small>${h(l)}</small><b>${h(v)}</b></div>`).join('')}</div>` : ''}`;
}

function positionenHtml(d: BelegDokument, ende: string) {
  const D = DOK[d.sprache];
  const zt = zwischentotale(d.positionen);
  const blocks: { html: string; weiter: boolean }[] = [];
  let nr = 0;
  d.positionen.forEach((p, i) => {
    if (p.art === 'titel') blocks.push({ html: `<tr class="titel"><td colspan="6">${h(p.bezeichnung)}</td></tr>`, weiter: true });
    else if (p.art === 'text') blocks.push({ html: `<tr class="textblock"><td></td><td colspan="5">${p.bezeichnung ? `<b>${h(p.bezeichnung)}</b>` : ''}${p.beschreibung ? `<span class="bl-besch">${h(p.beschreibung)}</span>` : ''}</td></tr>`, weiter: true });
    else {
      nr++;
      const zusatz = positionZusatz(p, D, d.summen.mwstSatz);
      blocks.push({
        html: `<tr><td class="nr">${nr}</td><td class="pos"><b>${h(p.bezeichnung)}</b>${p.beschreibung ? `<span class="bl-besch">${h(p.beschreibung)}</span>` : ''}${zusatz.length ? `<span class="bl-zusatz">${zusatz.map((z) => `<span>${h(z)}</span>`).join('')}</span>` : ''}</td><td class="r me">${mengeText(p.menge)}</td><td class="ei">${h(einheitText(p.einheit, d.sprache))}</td><td class="r">${zahl(p.einzelpreisRp)}</td><td class="r">${zahl(positionBetrag(p))}</td></tr>`,
        weiter: false,
      });
    }
    if (zt.has(i)) {
      const v = blocks[blocks.length - 1];
      if (v) v.weiter = true;
      blocks.push({ html: `<tr class="zt"><td></td><td colspan="4" class="r">${h(D.zwischentotal)}</td><td class="r">${zahl(zt.get(i)!)}</td></tr>`, weiter: false });
    }
  });
  if (ende) {
    const v = blocks[blocks.length - 1];
    if (v) v.weiter = true;
    blocks.push({ html: `<tr class="schlussreihe"><td colspan="6" style="padding:0;border-bottom:0">${ende}</td></tr>`, weiter: false });
  }
  const koerper: string[] = [];
  let block = '';
  for (const b of blocks) {
    block += b.html;
    if (!b.weiter) {
      koerper.push(`<tbody>${block}</tbody>`);
      block = '';
    }
  }
  if (block) koerper.push(`<tbody>${block}</tbody>`);
  return `<table class="bl-pos"><colgroup><col style="width:8mm"><col><col style="width:14mm"><col style="width:13mm"><col style="width:22mm"><col style="width:24mm"></colgroup>
<thead><tr><th>${h(D.pos)}</th><th>${h(D.beschreibung)}</th><th class="r">${h(D.menge)}</th><th></th><th class="r">${h(D.preis)}</th><th class="r">${h(D.totalChf)}</th></tr></thead>${koerper.join('')}</table>`;
}

function totaleHtml(d: BelegDokument) {
  return `<div class="bl-tot">${totalZeilen(d)
    .map(([k, t, b]) => `<div class="${k}"><span>${h(t)}</span><span>${h(b)}</span></div>`)
    .join('')}</div>`;
}

export function zahlungZeilen(d: Pick<BelegDokument, 'zahlung' | 'sprache'>): [string, string][] {
  const D = DOK[d.sprache];
  const z = d.zahlung;
  if (!z) return [];
  return ([
    [D.zahlbarBis, z.bis],
    [D.iban, z.iban],
    [D.referenz, z.referenz],
  ] as [string, string | null][]).filter((x): x is [string, string] => Boolean(x[1]));
}

function zahlungHtml(d: BelegDokument) {
  const D = DOK[d.sprache];
  const teile: string[] = [];
  if (d.info) teile.push(`<div class="bl-info"><span class="bl-kicker">${h(D.zahlungsbedingungen)}</span>${absatz(d.info)}</div>`);
  const z = zahlungZeilen(d);
  if (z.length)
    teile.push(
      `<div class="bl-zahlung"${d.info ? ' style="margin-top:4mm"' : ''}><span class="bl-kicker">${h(D.zahlung)}</span><dl>${z.map(([l, v]) => `<dt>${h(l)}</dt><dd>${h(v)}</dd>`).join('')}</dl>${d.zahlung?.qrNotiz ? `<div class="notiz">${h(D.qrNotiz)}</div>` : ''}</div>`,
    );
  return teile.join('');
}

function fussHtml(d: BelegDokument, fest: boolean) {
  return `<div class="bl-fuss${fest ? ' fest' : ''}">${fussSpalten(d.absender)
    .map((s) => `<div>${s.map(h).join('<br>')}</div>`)
    .join('')}<div>${h(d.fussBezug)}</div></div>`;
}

export function stilHtml(d: Pick<BelegDokument, 'stil' | 'sprache'>) {
  if (!d.stil || (!d.stil.gruppen.length && !d.stil.stoffe.length)) return '';
  const D = DOK[d.sprache];
  return `<section class="bl-stil"><h2 class="bl-h1">${h(D.stilTitel)}</h2><p class="bl-stil-text">${h(D.stilText)}</p>
${d.stil.stoffe.length ? `<div style="margin-top:6mm"><span class="bl-kicker">${h(D.stoffe)} · Holland &amp; Sherry</span><div class="bl-stoffe">${d.stil.stoffe.map((s) => `<span>${h(s)}</span>`).join('')}</div></div>` : ''}
<div class="bl-stil-raster">${d.stil.gruppen.map((g) => `<div class="bl-stil-gruppe"><h3>${h(g.kategorie)}</h3>${g.zeilen.map((z) => `<div><span>${h(z.untergruppe)}</span><b>${h(z.option)}</b></div>`).join('')}</div>`).join('')}</div></section>`;
}

/** Swiss QR-Zahlteil auf eigener A4-Seite (Masse nach SIX, Beschriftung in der Dokumentsprache) */
export function zahlteilHtml(qr: QrTeil, sprache: BelegSprache, kopf: { titel: string; zeilen: [string, string][] }) {
  const Q = DOK[sprache].qr;
  const hinweis = `<div class="bl-qr-hinweis"><b>${h(kopf.titel)}</b>${h(Q.hinweis)}${kopf.zeilen.length ? `<dl>${kopf.zeilen.map(([l, v]) => `<dt>${h(l)}</dt><dd>${h(v)}</dd>`).join('')}</dl>` : ''}</div>`;
  if (!qr.svg) return `<div class="bl-qr-seite">${hinweis}<div class="bl-qr-fehlt"><b>${h(Q.fehlt)}</b><br>${qr.fehler.map(h).join('<br>')}</div></div>`;
  const adr = (z: string[]) => z.map((x) => `<div>${h(x)}</div>`).join('');
  const blk = (k: string, inhalt: string) => `<div class="bl-qr-block"><div class="bl-qr-kopf">${h(k)}</div>${inhalt}</div>`;
  const konto = `<div>${h(qr.konto)}</div>${adr(qr.glaeubiger)}`;
  const ref = qr.referenz ? `<div>${h(qr.referenz)}</div>` : '';
  const betrag = qr.betragRp === null ? `<div class="bl-qr-feld klein"><i></i></div>` : `<div>${qrBetrag(qr.betragRp)}</div>`;
  const betragBlock = `<div class="bl-qr-betrag"><div><div class="bl-qr-kopf">${h(Q.waehrung)}</div><div>CHF</div></div><div><div class="bl-qr-kopf">${h(Q.betrag)}</div>${betrag}</div></div>`;
  const schuldner = (gross: boolean) => (qr.schuldner ? blk(Q.zahlbarDurch, adr(qr.schuldner)) : blk(Q.zahlbarDurchLeer, `<div class="bl-qr-feld ${gross ? 'gross' : 'klein'}"><i></i></div>`));
  return `<div class="bl-qr-seite">${hinweis}
<div class="bl-qr-abtrennen"><span>${h(Q.abtrennen)}</span></div>
<div class="bl-qr-teil">
  <div class="bl-qr-empfang"><div class="bl-qr-titel">${h(Q.empfangsschein)}</div>${blk(Q.konto, konto)}${ref ? blk(Q.referenz, ref) : ''}${schuldner(false)}
    <div style="margin-top:auto">${betragBlock}<div class="bl-qr-kopf" style="text-align:right;margin-top:2mm">${h(Q.annahmestelle)}</div></div></div>
  <div class="bl-qr-zahl"><div class="bl-qr-links"><div class="bl-qr-titel">${h(Q.zahlteil)}</div><div class="bl-qr-bild">${qr.svg}</div>${betragBlock}</div>
    <div class="bl-qr-rechts">${blk(Q.konto, konto)}${ref ? blk(Q.referenz, ref) : ''}${qr.mitteilung ? blk(Q.zusatz, `<div>${h(qr.mitteilung)}</div>`) : ''}${schuldner(true)}</div></div>
</div></div>`;
}

function mahnTabelle(d: BelegDokument) {
  const D = DOK[d.sprache];
  return `<table class="bl-pos"><colgroup><col><col style="width:32mm"></colgroup><thead><tr><th>${h(D.beschreibung)}</th><th class="r">CHF</th></tr></thead><tbody>
${(d.mahnzeilen ?? []).map(([t, b]) => `<tr><td>${h(t)}</td><td class="r">${b < 0 ? '−' : ''}${zahl(Math.abs(b))}</td></tr>`).join('')}</tbody></table>`;
}

/** Inhalt des Blatts (ohne <html>): für Vorschau im Browser und PDF gleich. */
export function blattHtml(d: BelegDokument, o: { fussFest?: boolean; mitStil?: boolean; mitQr?: boolean } = {}) {
  const D = DOK[d.sprache];
  const mahnung = d.art === 'mahnung';
  const abschluss = mahnung
    ? `<div class="bl-abschluss"><div class="bl-abschluss-l">${zahlungHtml(d)}</div><div class="bl-tot"><div class="g haupt"><span>${h(D.offen)} CHF</span><span>${zahl(d.held?.rp ?? 0)}</span></div></div></div>`
    : `<div class="bl-abschluss"><div class="bl-abschluss-l">${zahlungHtml(d)}</div>${totaleHtml(d)}</div>`;
  const ende =
    d.schluss.trim() || d.unterschrift || d.angenommen
      ? `<div class="bl-ende"><div class="bl-text bl-schluss">${absatz(d.schluss)}</div>${d.angenommen ? `<div class="bl-angenommen">${h(d.angenommen)}</div>` : d.unterschrift ? `<div class="bl-unterschrift"><div>${h(D.ortDatum)}</div><div>${h(D.unterschrift)}</div></div>` : ''}</div>`
      : '';
  const qrKopf = { titel: `${d.dokTitel} ${d.nummer}`, zeilen: d.meta };
  return `${kopfHtml(d)}
${titelHtml(d)}
<div class="bl-text">${absatz(d.einleitung)}</div>
${mahnung ? `${mahnTabelle(d)}${abschluss}` : positionenHtml(d, abschluss)}
${ende}
${fussHtml(d, o.fussFest ?? true)}
${o.mitStil !== false ? stilHtml(d) : ''}
${o.mitQr !== false && d.qr ? zahlteilHtml(d.qr, d.sprache, qrKopf) : ''}`;
}

/** Fuss für jede gedruckte Seite (Chrome footerTemplate): Firma | Kontakt | Bank, rechts Beleg und Seitenzahl */
export function fussVorlage(d: BelegDokument) {
  const D = DOK[d.sprache];
  const spalten = fussSpalten(d.absender);
  return `<div style="width:100%;box-sizing:border-box;padding:0 18mm 0 20mm;font-family:Helvetica,Arial,sans-serif;font-size:7px;line-height:1.55;color:#77736b;-webkit-print-color-adjust:exact"><div style="display:flex;gap:5mm;border-top:0.5pt solid #e8e4dd;padding-top:2mm">${spalten
    .map((s) => `<div style="flex:1;min-width:0">${s.map(h).join('<br>')}</div>`)
    .join('')}<div style="flex:none;text-align:right;color:#a19c92">${h(d.fussBezug)}<br>${h(D.seite)} <span class="pageNumber"></span> ${h(D.von)} <span class="totalPages"></span></div></div></div>`;
}

/** Ganzes HTML-Dokument. `schriften`: @font-face (PDF mit data:-URIs, Browser mit /fonts/pdf/…). */
export function dokumentHtml(d: BelegDokument, o: { schriften?: string; mitQr?: boolean } = {}) {
  return `<!doctype html><html lang="${d.sprache}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${h(`${d.dokTitel} ${d.nummer}`)}</title>
<style>${o.schriften ?? SCHRIFTEN_WEB}${PAPIER_CSS}${DRUCK_CSS}</style></head><body class="bl">${blattHtml(d, { mitQr: o.mitQr })}</body></html>`;
}
