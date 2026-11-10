// PDF-Belege mit PDFKit (serverseitig, ohne Browser): Angebot, Rechnung mit Swiss QR-Zahlteil, Massblatt.
// Gestaltung: Wortmarke oben links, feine Linien, Noto Serif/Sans, Zahlen rechtsbündig. Keine Schatten, keine Transparenzen.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { SwissQRBill } from 'swissqrbill/pdf';
import { qrKonto } from '@/lib/beleg/qr';
import { glaeubigerFehler, ibanGruppen } from '@/lib/beleg/bank';
import type { Data as QrDaten } from 'swissqrbill/types';
import { formatReference } from 'swissqrbill/utils';
import type { Abzug, Position, StilZeileDb } from '@/lib/db/schema';
import { chf, positionBetrag, summen } from '@/lib/crm/geld';
import type { Firma } from '@/lib/crm/firma';
import { KOERPER, MASS_BEREICHE, differenz, massText } from '@/lib/crm/massblatt';
import { stilGruppen } from '@/lib/crm/status';
import { TZ } from '@/lib/zeit';

type Doc = PDFKit.PDFDocument;

const MM = 72 / 25.4;
const mm = (n: number) => n * MM;
const INK = '#101010';
const SOFT = '#3a3833';
const MUTED = '#7a766e';
const LINE = '#dcd8d0';
const GOLD = '#c9a063';
const WARM = '#f6f4ef';

const L = mm(20);
const R = mm(190);
const BREITE = R - L;
const UNTEN = mm(297 - 24);

export type Empfaenger = { name: string; anrede?: string | null; firma?: string | null; strasse?: string | null; plz?: string | null; ort?: string | null; land?: string | null; email?: string | null };

function schriftPfad(datei: string) {
  const kandidaten = [path.join(process.cwd(), 'public', 'fonts', 'pdf', datei), path.join(process.cwd(), '.next', 'standalone', 'public', 'fonts', 'pdf', datei)];
  return kandidaten.find((k) => existsSync(k)) ?? kandidaten[0];
}
function standardLogo(): Buffer | null {
  const kandidaten = [path.join(process.cwd(), 'public', 'images', 'marke', 'wortmarke-schwarz.png'), path.join(process.cwd(), '.next', 'standalone', 'public', 'images', 'marke', 'wortmarke-schwarz.png')];
  const p = kandidaten.find((k) => existsSync(k));
  return p ? readFileSync(p) : null;
}

const datum = (d: Date | null | undefined) => (d ? d.toLocaleDateString('de-CH', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

function neuesDokument(titel: string, firma: Firma) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false, bufferPages: true, info: { Title: titel, Author: firma.name, Creator: firma.name } });
  doc.registerFont('Sans', schriftPfad('NotoSans-Regular.ttf'));
  doc.registerFont('SansBold', schriftPfad('NotoSans-Bold.ttf'));
  doc.registerFont('Serif', schriftPfad('NotoSerif-Bold.ttf'));
  doc.font('Sans');
  return doc;
}

function alsBuffer(doc: Doc): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const teile: Buffer[] = [];
    doc.on('data', (c: Buffer) => teile.push(c));
    doc.on('end', () => resolve(Buffer.concat(teile)));
    doc.on('error', reject);
    doc.end();
  });
}

function kopf(doc: Doc, f: Firma, logo: Buffer | null) {
  const lg = logo ?? standardLogo();
  if (lg) {
    try {
      doc.image(lg, L, mm(16), { fit: [mm(64), mm(14)] });
    } catch {
      doc.font('Serif').fontSize(18).fillColor(INK).text(f.name.toUpperCase(), L, mm(18));
    }
  } else doc.font('Serif').fontSize(18).fillColor(INK).text(f.name.toUpperCase(), L, mm(18));
  doc.rect(L, mm(33), mm(12), 1.2).fill(GOLD);
  const zeilen = [f.rechtsname && f.rechtsname !== f.name ? f.rechtsname : '', f.strasse, `${f.plz} ${f.ort}`, f.telefon, f.email, f.web].filter(Boolean);
  doc.font('Sans').fontSize(7.6).fillColor(MUTED);
  let y = mm(16);
  for (const z of zeilen) {
    doc.text(z, mm(120), y, { width: R - mm(120), align: 'right' });
    y += 10.2;
  }
}

function fuss(doc: Doc, f: Firma, ohneSeiten: Set<number>) {
  const r = doc.bufferedPageRange();
  for (let i = r.start; i < r.start + r.count; i++) {
    if (ohneSeiten.has(i)) continue;
    doc.switchToPage(i);
    doc.moveTo(L, mm(297 - 16)).lineTo(R, mm(297 - 16)).lineWidth(0.5).strokeColor(LINE).stroke();
    const links = [f.name, f.rechtsname !== f.name ? f.rechtsname : '', `${f.strasse}, ${f.plz} ${f.ort}`, f.mwstNr ? `MWST ${f.mwstNr}` : ''].filter(Boolean).join('  ·  ');
    doc.font('Sans').fontSize(7).fillColor(MUTED).text(links, L, mm(297 - 13), { width: BREITE - mm(25), lineBreak: false });
    doc.text(`Seite ${i - r.start + 1} / ${r.count}`, R - mm(25), mm(297 - 13), { width: mm(25), align: 'right', lineBreak: false });
  }
}

function empfaengerBlock(doc: Doc, f: Firma, e: Empfaenger, meta: [string, string][]) {
  doc.font('Sans').fontSize(6.8).fillColor(MUTED).text(`${f.name} · ${f.strasse} · ${f.plz} ${f.ort}`, L, mm(48), { width: mm(85), lineBreak: false });
  doc.moveTo(L, mm(51.5)).lineTo(L + mm(85), mm(51.5)).lineWidth(0.4).strokeColor(LINE).stroke();
  const zeilen = [e.firma || '', [e.anrede, e.name].filter(Boolean).join(' '), e.strasse || '', [e.plz, e.ort].filter(Boolean).join(' '), e.land && e.land !== 'CH' ? e.land : ''].filter(Boolean);
  let y = mm(55);
  for (const [i, z] of zeilen.entries()) {
    doc.font(i === (e.firma ? 1 : 0) ? 'SansBold' : 'Sans').fontSize(10).fillColor(INK).text(z, L, y, { width: mm(85) });
    y += 14;
  }
  let my = mm(48);
  for (const [k, v] of meta) {
    doc.font('Sans').fontSize(8).fillColor(MUTED).text(k, mm(122), my, { width: mm(30) });
    doc.font('SansBold').fontSize(8.6).fillColor(INK).text(v, mm(150), my, { width: R - mm(150), align: 'right' });
    my += 14;
  }
}

function titel(doc: Doc, haupt: string, unter?: string) {
  doc.font('Serif').fontSize(21).fillColor(INK).text(haupt, L, mm(86), { width: BREITE });
  let y = doc.y + 2;
  if (unter) {
    doc.font('Sans').fontSize(11).fillColor(SOFT).text(unter, L, y, { width: BREITE });
    y = doc.y;
  }
  return y + mm(5);
}

function absatz(doc: Doc, text: string | null | undefined, y: number) {
  if (!text) return y;
  y = platz(doc, y, doc.heightOfString(text, { width: BREITE }) + 8);
  doc.font('Sans').fontSize(9.6).fillColor(SOFT).text(text, L, y, { width: BREITE, lineGap: 2.2 });
  return doc.y + mm(5);
}

/** Neue Seite, wenn `hoehe` nicht mehr passt (Folgeseiten beginnen oben, ohne Kopf) */
function platz(doc: Doc, y: number, hoehe: number) {
  if (y + hoehe <= UNTEN) return y;
  doc.addPage({ size: 'A4', margin: 0 });
  return mm(22);
}

const SP = { nr: L, text: L + mm(10), menge: mm(128), preis: mm(140), betrag: mm(165) };

function tabellenKopf(doc: Doc, y: number) {
  doc.font('SansBold').fontSize(7).fillColor(MUTED);
  doc.text('POS', SP.nr, y, { characterSpacing: 0.8 });
  doc.text('BEZEICHNUNG', SP.text, y, { characterSpacing: 0.8 });
  doc.text('MENGE', SP.menge - mm(8), y, { width: mm(18), align: 'right', characterSpacing: 0.8 });
  doc.text('PREIS', SP.preis, y, { width: mm(22), align: 'right', characterSpacing: 0.8 });
  doc.text('BETRAG CHF', SP.betrag, y, { width: R - SP.betrag, align: 'right', characterSpacing: 0.8 });
  const ly = y + 12;
  doc.moveTo(L, ly).lineTo(R, ly).lineWidth(0.8).strokeColor(INK).stroke();
  return ly + 8;
}

function positionen(doc: Doc, pos: Position[], y: number) {
  y = platz(doc, y, 60);
  y = tabellenKopf(doc, y);
  pos.forEach((p, i) => {
    const beschr = [p.beschreibung, p.stoffnummer ? `Stoff ${p.stoffnummer}` : '', p.rabattProzent ? `Rabatt ${p.rabattProzent} %` : ''].filter(Boolean).join('\n');
    const breite = SP.menge - mm(10) - SP.text;
    const h = doc.font('SansBold').fontSize(9.6).heightOfString(p.bezeichnung, { width: breite }) + (beschr ? doc.font('Sans').fontSize(8.4).heightOfString(beschr, { width: breite, lineGap: 1.5 }) + 3 : 0);
    if (y + h + 10 > UNTEN) {
      y = platz(doc, y, h + 40);
      y = tabellenKopf(doc, y);
    }
    doc.font('Sans').fontSize(9.2).fillColor(MUTED).text(String(i + 1), SP.nr, y);
    doc.font('SansBold').fontSize(9.6).fillColor(INK).text(p.bezeichnung, SP.text, y, { width: breite });
    if (beschr) doc.font('Sans').fontSize(8.4).fillColor(MUTED).text(beschr, SP.text, doc.y + 2, { width: breite, lineGap: 1.5 });
    doc.font('Sans').fontSize(9.4).fillColor(INK);
    doc.text(String(p.menge).replace('.', ','), SP.menge - mm(8), y, { width: mm(18), align: 'right' });
    doc.text(chf(p.einzelpreisRp, false), SP.preis, y, { width: mm(22), align: 'right' });
    doc.font('SansBold').text(chf(positionBetrag(p), false), SP.betrag, y, { width: R - SP.betrag, align: 'right' });
    y += h + 8;
    doc.moveTo(L, y - 3).lineTo(R, y - 3).lineWidth(0.4).strokeColor(LINE).stroke();
    y += 4;
  });
  return y;
}

function summenBlock(doc: Doc, zeilen: { k: string; v: string; stark?: boolean; leise?: boolean }[], y: number) {
  y = platz(doc, y, zeilen.length * 18 + 20) + 2;
  const x = mm(104);
  for (const z of zeilen) {
    if (z.stark) {
      doc.moveTo(x, y - 2).lineTo(R, y - 2).lineWidth(0.8).strokeColor(INK).stroke();
      y += 5;
      doc.font('SansBold').fontSize(11.5).fillColor(INK).text(z.k, x, y, { width: R - x - mm(32), lineBreak: false });
      doc.text(z.v, R - mm(32), y, { width: mm(32), align: 'right', lineBreak: false });
      y += 20;
    } else {
      doc.font('Sans').fontSize(z.leise ? 8.2 : 9.2).fillColor(z.leise ? MUTED : SOFT).text(z.k, x, y, { width: R - x - mm(32), lineBreak: false, ellipsis: true });
      doc.text(z.v, R - mm(32), y, { width: mm(32), align: 'right', lineBreak: false });
      y += z.leise ? 13 : 16;
    }
  }
  return y + mm(4);
}

function stilBlock(doc: Doc, stil: StilZeileDb[], stoffe: string[], y: number) {
  if (!stil.length && !stoffe.length) return y;
  y = platz(doc, y, 80);
  doc.font('SansBold').fontSize(7.4).fillColor(MUTED).text('IHRE STIL-AUSWAHL', L, y, { characterSpacing: 1.2 });
  y += 14;
  if (stoffe.length) {
    doc.rect(L, y, BREITE, 22).fill(WARM);
    doc.font('SansBold').fontSize(9.4).fillColor(INK).text(`Stoff · Holland & Sherry   ${stoffe.join('  ·  ')}`, L + 8, y + 6.5, { width: BREITE - 16 });
    y += 30;
  }
  const spalten = 2;
  const sb = (BREITE - mm(8)) / spalten;
  const gruppen = stilGruppen(stil);
  for (let i = 0; i < gruppen.length; i += spalten) {
    const reihe = gruppen.slice(i, i + spalten);
    const hoehe = Math.max(...reihe.map((g) => 16 + g.zeilen.length * 13));
    y = platz(doc, y, hoehe + 6);
    reihe.forEach((g, j) => {
      const x = L + j * (sb + mm(8));
      doc.font('SansBold').fontSize(8).fillColor(INK).text(g.kategorie.toUpperCase(), x, y, { characterSpacing: 1 });
      doc.moveTo(x, y + 11).lineTo(x + sb, y + 11).lineWidth(0.4).strokeColor(LINE).stroke();
      let yy = y + 15;
      for (const z of g.zeilen) {
        doc.font('Sans').fontSize(8).fillColor(MUTED).text(z.untergruppe, x, yy, { width: sb * 0.48, lineBreak: false, ellipsis: true });
        doc.font('SansBold').fontSize(8).fillColor(INK).text(z.option, x + sb * 0.5, yy, { width: sb * 0.5, lineBreak: false, ellipsis: true });
        yy += 13;
      }
    });
    y += hoehe + 8;
  }
  return y + mm(3);
}

/* ---------- Angebot ---------- */

export type AngebotPdf = {
  nummer: string;
  titel: string;
  datum: Date;
  gueltigBis: Date | null;
  einleitung: string | null;
  schluss: string | null;
  positionen: Position[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  stil: StilZeileDb[];
  stoffe: string[];
  link?: string | null;
  angenommen?: { name: string; am: Date } | null;
  /** Zahlungsbedingungen (Text aus dem Zahlungsplan des Angebots) */
  bedingung?: string | null;
};

export async function angebotPdf(a: AngebotPdf, e: Empfaenger, f: Firma, logo: Buffer | null) {
  const doc = neuesDokument(`Angebot ${a.nummer}`, f);
  doc.addPage({ size: 'A4', margin: 0 });
  kopf(doc, f, logo);
  empfaengerBlock(doc, f, e, [
    ['Angebot', a.nummer],
    ['Datum', datum(a.datum)],
    ...(a.gueltigBis ? ([['Gültig bis', datum(a.gueltigBis)]] as [string, string][]) : []),
  ]);
  let y = titel(doc, 'Angebot', a.titel);
  y = absatz(doc, e.name ? `Guten Tag ${[e.anrede, e.name].filter(Boolean).join(' ')}\n\n${a.einleitung ?? ''}` : a.einleitung, y);
  y = positionen(doc, a.positionen, y);
  const s = summen(a.positionen, { rabattProzent: a.rabattProzent, rabattRp: a.rabattRp, mwstSatz: a.mwstSatz });
  y = summenBlock(
    doc,
    [
      ...(s.rabattRp ? [{ k: 'Zwischentotal', v: chf(s.zwischenRp, false) }, { k: a.rabattProzent ? `Rabatt ${a.rabattProzent} %` : 'Rabatt', v: chf(-s.rabattRp, false) }] : []),
      { k: 'Total CHF', v: chf(s.totalRp, false), stark: true },
      ...(a.mwstSatz > 0 ? [{ k: `inkl. MWST ${String(a.mwstSatz).replace('.', ',')} %`, v: chf(s.mwstRp, false), leise: true }] : []),
    ],
    y,
  );
  if (a.bedingung) y = absatz(doc, `Zahlungsbedingungen\n${a.bedingung}`, y);
  y = stilBlock(doc, a.stil, a.stoffe, y);
  y = absatz(doc, a.schluss, y);
  if (a.angenommen) {
    y = platz(doc, y, 50);
    doc.rect(L, y, BREITE, 40).lineWidth(0.8).strokeColor(INK).stroke();
    doc.font('SansBold').fontSize(9.6).fillColor(INK).text(`Angenommen am ${datum(a.angenommen.am)} von ${a.angenommen.name}`, L + 12, y + 14, { width: BREITE - 24 });
    y += 52;
  } else if (a.link) {
    y = platz(doc, y, 56);
    doc.rect(L, y, BREITE, 46).fill(INK);
    doc.font('SansBold').fontSize(10).fillColor('#ffffff').text('Angebot online annehmen', L + 14, y + 11, { width: BREITE - 28 });
    doc.font('Sans').fontSize(8.4).fillColor('#d8d4cc').text(a.link, L + 14, y + 26, { width: BREITE - 28, link: a.link, underline: false, lineBreak: false, ellipsis: true });
    y += 58;
  }
  doc.font('Sans').fontSize(9.4).fillColor(SOFT).text(`Freundliche Grüsse\n${f.name}`, L, platz(doc, y, 40), { width: BREITE, lineGap: 2 });
  fuss(doc, f, new Set());
  return alsBuffer(doc);
}

/* ---------- Rechnung mit QR-Zahlteil ---------- */

export type RechnungPdf = {
  nummer: string;
  art: 'rechnung' | 'anzahlung' | 'schluss';
  titel: string;
  datum: Date;
  faelligAm: Date | null;
  einleitung: string | null;
  schluss: string | null;
  positionen: Position[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  abzug: Abzug[];
  betragRp: number;
  bezahltRp: number;
  referenz: string | null;
  auftragNummer?: string | null;
};

const ART_TITEL = { rechnung: 'Rechnung', anzahlung: 'Anzahlungsrechnung', schluss: 'Schlussrechnung' } as const;

/** QR-Zahlteil-Daten (Schuldner nur mit vollständiger Adresse, sonst leer zum Ausfüllen) */
export function qrDaten(r: Pick<RechnungPdf, 'nummer' | 'betragRp' | 'bezahltRp' | 'referenz'>, e: Empfaenger, f: Firma): QrDaten | null {
  const k = qrKonto(f, r.referenz, r.nummer);
  if (!k || glaeubigerFehler(f).length) return null;
  const konto = k.konto;
  const offen = Math.max(0, r.betragRp - r.bezahltRp);
  const schuldner = e.strasse && e.plz && e.ort ? { name: [e.name, e.firma ? `(${e.firma})` : ''].filter(Boolean).join(' ').slice(0, 70), address: e.strasse.slice(0, 70), zip: e.plz, city: e.ort, country: (e.land || 'CH').toUpperCase() } : undefined;
  const ref = k.ref;
  return {
    currency: 'CHF',
    amount: offen > 0 ? offen / 100 : undefined,
    creditor: { account: konto, name: (f.rechtsname || f.name).slice(0, 70), address: f.strasse.slice(0, 70), zip: f.plz, city: f.ort, country: f.land || 'CH' },
    debtor: schuldner,
    reference: ref,
    message: `Rechnung ${r.nummer}`.slice(0, 140),
  };
}

export async function rechnungPdf(r: RechnungPdf, e: Empfaenger, f: Firma, logo: Buffer | null) {
  const doc = neuesDokument(`${ART_TITEL[r.art]} ${r.nummer}`, f);
  doc.addPage({ size: 'A4', margin: 0 });
  kopf(doc, f, logo);
  empfaengerBlock(doc, f, e, [
    ['Rechnung', r.nummer],
    ['Datum', datum(r.datum)],
    ...(r.faelligAm ? ([['Zahlbar bis', datum(r.faelligAm)]] as [string, string][]) : []),
    ...(r.auftragNummer ? ([['Auftrag', r.auftragNummer]] as [string, string][]) : []),
    ...(f.mwstNr ? ([['MWST-Nr.', f.mwstNr]] as [string, string][]) : []),
  ]);
  let y = titel(doc, ART_TITEL[r.art], r.titel);
  y = absatz(doc, e.name ? `Guten Tag ${[e.anrede, e.name].filter(Boolean).join(' ')}\n\n${r.einleitung ?? ''}` : r.einleitung, y);
  y = positionen(doc, r.positionen, y);
  const s = summen(r.positionen, { rabattProzent: r.rabattProzent, rabattRp: r.rabattRp, mwstSatz: r.mwstSatz });
  const zeilen: { k: string; v: string; stark?: boolean; leise?: boolean }[] = [
    ...(s.rabattRp ? [{ k: 'Zwischentotal', v: chf(s.zwischenRp, false) }, { k: r.rabattProzent ? `Rabatt ${r.rabattProzent} %` : 'Rabatt', v: chf(-s.rabattRp, false) }] : []),
  ];
  if (r.abzug.length || r.bezahltRp) {
    zeilen.push({ k: 'Total', v: chf(s.totalRp, false) });
    if (r.mwstSatz > 0) zeilen.push({ k: `inkl. MWST ${String(r.mwstSatz).replace('.', ',')} %`, v: chf(s.mwstRp, false), leise: true });
    for (const a of r.abzug) zeilen.push({ k: `abzüglich Anzahlung ${a.nummer}`, v: chf(-a.betragRp, false) });
    if (r.bezahltRp) zeilen.push({ k: 'bereits bezahlt', v: chf(-r.bezahltRp, false) });
    zeilen.push({ k: 'Zu bezahlen CHF', v: chf(Math.max(0, r.betragRp - r.bezahltRp), false), stark: true });
  } else {
    zeilen.push({ k: 'Total CHF', v: chf(s.totalRp, false), stark: true });
    if (r.mwstSatz > 0) zeilen.push({ k: `inkl. MWST ${String(r.mwstSatz).replace('.', ',')} %`, v: chf(s.mwstRp, false), leise: true });
  }
  y = summenBlock(doc, zeilen, y);
  const qk = qrKonto(f, r.referenz, r.nummer);
  const zahlung = [r.faelligAm ? `Zahlbar bis ${datum(r.faelligAm)}` : '', qk ? `IBAN ${ibanGruppen(qk.konto)}` : '', f.bank, qk?.ref ? `Referenz ${formatReference(qk.ref)}` : ''].filter(Boolean).join('  ·  ');
  y = absatz(doc, r.schluss, y);
  if (zahlung) {
    y = platz(doc, y, 20);
    doc.font('Sans').fontSize(8.4).fillColor(MUTED).text(zahlung, L, y, { width: BREITE });
    y = doc.y + mm(4);
  }
  doc.font('Sans').fontSize(9.4).fillColor(SOFT).text(`Freundliche Grüsse\n${f.name}`, L, platz(doc, y, 40), { width: BREITE, lineGap: 2 });

  const ohneFuss = new Set<number>();
  const daten = qrDaten(r, e, f);
  if (daten && r.betragRp - r.bezahltRp > 0) {
    // Zahlteil unten auf der letzten Seite, falls Platz (105 mm), sonst auf eigener Seite
    let qr: SwissQRBill | null = null;
    try {
      qr = new SwissQRBill(daten, { language: 'DE', scissors: true, separate: false });
    } catch (err) {
      // Ungültige Angaben dürfen das PDF nie verhindern – dann ohne Zahlteil (Festschreiben prüft vorher, das ist ein Notfall)
      console.error('[pdf] QR-Zahlteil', (err as Error).message);
    }
    if (qr) {
    // Reicht der Platz nicht, eine eigene A4-Seite (Zahlteil unten, druckbar auf A4-Papier mit Perforation)
    if (!SwissQRBill.isSpaceSufficient(doc)) {
      doc.addPage({ size: 'A4', margin: 0 });
      kopf(doc, f, logo);
      doc.font('Serif').fontSize(16).fillColor(INK).text(`Zahlteil · ${ART_TITEL[r.art]} ${r.nummer}`, L, mm(48), { width: BREITE });
      doc.font('Sans').fontSize(9.4).fillColor(SOFT).text([`Zu bezahlen: ${chf(Math.max(0, r.betragRp - r.bezahltRp))}`, r.faelligAm ? `bis ${datum(r.faelligAm)}` : ''].filter(Boolean).join(' '), L, doc.y + 4, { width: BREITE });
    }
    qr.attachTo(doc);
    ohneFuss.add(doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1);
    }
  }
  fuss(doc, f, ohneFuss);
  return alsBuffer(doc);
}

/* ---------- Massblatt ---------- */

export type MassblattPdf = {
  version: number;
  gemessenAm: Date;
  gemessenVon?: string | null;
  masse: Record<string, number | string>;
  vorher?: { version: number; gemessenAm: Date; masse: Record<string, number | string> } | null;
  koerper: string[];
  notiz: string | null;
  auftragNummer?: string | null;
};

export async function massblattPdf(m: MassblattPdf, e: Empfaenger & { telefon?: string | null }, f: Firma, logo: Buffer | null) {
  const doc = neuesDokument(`Massblatt ${e.name}`, f);
  doc.addPage({ size: 'A4', margin: 0 });
  kopf(doc, f, logo);
  empfaengerBlock(doc, f, e, [
    ['Version', `${m.version}`],
    ['Gemessen am', datum(m.gemessenAm)],
    ...(m.gemessenVon ? ([['Gemessen von', m.gemessenVon]] as [string, string][]) : []),
    ...(m.vorher ? ([['Vergleich mit', `V${m.vorher.version} · ${datum(m.vorher.gemessenAm)}`]] as [string, string][]) : []),
    ...(m.auftragNummer ? ([['Auftrag', m.auftragNummer]] as [string, string][]) : []),
  ]);
  let y = titel(doc, 'Massblatt', e.name);
  const sb = (BREITE - mm(10)) / 2;
  const bereiche = MASS_BEREICHE.filter((b) => b.felder.some((fl) => m.masse[fl.key] !== undefined));
  for (let i = 0; i < bereiche.length; i += 2) {
    const reihe = bereiche.slice(i, i + 2);
    const hoehe = Math.max(...reihe.map((b) => 26 + b.felder.filter((fl) => m.masse[fl.key] !== undefined).length * 15));
    y = platz(doc, y, hoehe);
    reihe.forEach((b, j) => {
      const x = L + j * (sb + mm(10));
      doc.font('SansBold').fontSize(8).fillColor(INK).text(b.titel.toUpperCase(), x, y, { characterSpacing: 1.2 });
      if (m.vorher) doc.font('Sans').fontSize(6.8).fillColor(MUTED).text(`V${m.vorher.version}      ±`, x + sb - mm(30), y + 1, { width: mm(30), align: 'right' });
      doc.moveTo(x, y + 12).lineTo(x + sb, y + 12).lineWidth(0.8).strokeColor(INK).stroke();
      let yy = y + 17;
      for (const fl of b.felder) {
        const w = m.masse[fl.key];
        if (w === undefined) continue;
        const v = m.vorher?.masse[fl.key];
        doc.font('Sans').fontSize(8.8).fillColor(SOFT).text(fl.label, x, yy, { width: sb * 0.5, lineBreak: false, ellipsis: true });
        doc.font('SansBold').fontSize(9.4).fillColor(INK).text(massText(w, fl.einheit), x + sb * 0.42, yy, { width: sb * 0.24, align: 'right' });
        if (m.vorher) {
          doc.font('Sans').fontSize(8.2).fillColor(MUTED).text(massText(v, ''), x + sb * 0.66, yy + 0.5, { width: sb * 0.17, align: 'right' });
          const d = differenz(w, v);
          doc.font('SansBold').fontSize(8.2).fillColor(d ? '#8a6a35' : MUTED).text(d, x + sb * 0.83, yy + 0.5, { width: sb * 0.17, align: 'right' });
        }
        doc.moveTo(x, yy + 12.5).lineTo(x + sb, yy + 12.5).lineWidth(0.3).strokeColor(LINE).stroke();
        yy += 15;
      }
    });
    y += hoehe + 10;
  }
  if (!bereiche.length) {
    doc.font('Sans').fontSize(9.6).fillColor(MUTED).text('Noch keine Masse erfasst.', L, y);
    y += 24;
  }
  if (m.koerper.length) {
    y = platz(doc, y, 60);
    doc.font('SansBold').fontSize(7.4).fillColor(MUTED).text('KÖRPERHALTUNG & BESONDERHEITEN', L, y, { characterSpacing: 1.2 });
    y += 14;
    let x = L;
    const reihenfolge = KOERPER.flatMap((g) => g.optionen).filter((o) => m.koerper.includes(o));
    for (const o of reihenfolge) {
      doc.font('SansBold').fontSize(8.4);
      const w = doc.widthOfString(o) + 18;
      if (x + w > R) {
        x = L;
        y += 22;
      }
      doc.roundedRect(x, y, w, 17, 8.5).lineWidth(0.7).strokeColor(INK).stroke();
      doc.fillColor(INK).text(o, x + 9, y + 4.3, { lineBreak: false });
      x += w + 6;
    }
    y += 30;
  }
  if (m.notiz) {
    y = platz(doc, y, 40);
    doc.font('SansBold').fontSize(7.4).fillColor(MUTED).text('NOTIZEN', L, y, { characterSpacing: 1.2 });
    y = absatz(doc, m.notiz, y + 13);
  }
  fuss(doc, f, new Set());
  return alsBuffer(doc);
}
