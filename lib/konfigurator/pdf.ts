// Stil-Auswahl als PDF (A4), im Browser erzeugt mit jsPDF.
// Gestaltung: ruhige Typografie (Times für Titel, Helvetica für Text), zweispaltige
// Karten mit Illustration, Stoffnummern, Notizfeld fürs Atelier, Seitenzahlen.
// Keine Schatten und keine Transparenzen (macOS-Vorschau zeigt sie als Blöcke) —
// Tiefe nur über feine Linien und Flächen.
import { SITE } from '@/lib/site';
import { STOFF_LINK } from './konst';
import { optionText, type Gewaehlt } from './auswahl';
import { fmt, mz } from '@/lib/i18n/fmt';
import { AUSWAHL_TEXTE_DE, PDF_TEXTE_DE, type AuswahlTexte, type PdfTexte } from './texte';

type RGB = [number, number, number];
const INK: RGB = [16, 16, 16];
const SOFT: RGB = [60, 58, 54];
const MUTED: RGB = [122, 118, 110];
const LINE: RGB = [226, 223, 216];
const WARM: RGB = [246, 244, 239];
const GOLD: RGB = [176, 141, 87];

/** Bild über ein Canvas in JPEG auf Weiss umwandeln (scharf, jsPDF liest WebP nicht zuverlässig). */
async function jpeg(src: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const target = 600; // ~300 dpi bei 50 mm Höhe
    const scale = Math.min(2, target / img.naturalHeight);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    const g = c.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    return { data: c.toDataURL('image/jpeg', 0.9), w: c.width, h: c.height };
  } catch {
    return null;
  }
}


/** Ausserhalb von Latin-1 (z. B. Kyrillisch) können die PDF-Standardschriften nicht zeichnen —
 * dann laden wir Noto Sans/Serif (OFL) aus /fonts/pdf/ und betten sie ein. */
const NICHT_LATIN1 = /[^\u0000-\u00ff\u2018-\u201e\u2013\u2014\u2022\u2026\u20ac]/;
async function ladeSchriften(doc: import('jspdf').jsPDF) {
  const dateien: [string, string, string][] = [
    ['NotoSans-Regular.ttf', 'NotoSans', 'normal'],
    ['NotoSans-Bold.ttf', 'NotoSans', 'bold'],
    ['NotoSerif-Bold.ttf', 'NotoSerif', 'bold'],
    ['NotoSerif-Italic.ttf', 'NotoSerif', 'italic'],
  ];
  await Promise.all(
    dateien.map(async ([datei, name, stil]) => {
      const buf = new Uint8Array(await (await fetch(`/fonts/pdf/${datei}`)).arrayBuffer());
      let bin = '';
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      doc.addFileToVFS(datei, btoa(bin));
      doc.addFont(datei, name, stil);
    }),
  );
}

/** Stil-PDF erzeugen und herunterladen. Texte aus dem Wörterbuch (konfigurator.pdf bzw.
 * konfigurator.ui.auswahl); ohne Angabe Deutsch. */
export async function stilPdf(items: Gewaehlt[], stoffe: string[] = [], t: PdfTexte = PDF_TEXTE_DE, ta: AuswahlTexte = AUSWAHL_TEXTE_DE) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const M = 16;
  const CW = W - 2 * M;
  const FOOT = H - 18; // ab hier Fusszeile
  const datum = new Date().toLocaleDateString(t.locale, { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setProperties({ title: t.dokTitel, author: SITE.name, subject: t.dokThema });
  const alleTexte = JSON.stringify([t, ta, items.map((g) => [g.kategorie, g.untergruppe, g.option.label, g.option.subLabel])]);
  const eigeneSchrift = NICHT_LATIN1.test(alleTexte);
  if (eigeneSchrift) await ladeSchriften(doc);
  const SANS = eigeneSchrift ? 'NotoSans' : 'helvetica';
  const SERIF = eigeneSchrift ? 'NotoSerif' : 'times';

  const color = (c: RGB, kind: 'text' | 'draw' | 'fill' = 'text') =>
    kind === 'text' ? doc.setTextColor(...c) : kind === 'draw' ? doc.setDrawColor(...c) : doc.setFillColor(...c);

  const kopf = (erste: boolean) => {
    if (erste) {
      // Markenkopf
      color(INK);
      doc.setFont(SERIF, 'bold');
      doc.setFontSize(22);
      doc.text('THE SARTORIALIST', W / 2, 22, { align: 'center' });
      doc.setFont(SANS, 'normal');
      doc.setFontSize(7.5);
      doc.setCharSpace(2.6);
      doc.text(t.ort, W / 2, 27.5, { align: 'center' });
      doc.setCharSpace(0);
      color(INK, 'draw');
      doc.setLineWidth(0.35);
      doc.line(M, 33, W - M, 33);
      return 33;
    }
    // Folgeseiten: schlanke Kopfzeile
    color(INK);
    doc.setFont(SERIF, 'bold');
    doc.setFontSize(11);
    doc.text('THE SARTORIALIST', M, 14);
    doc.setFont(SANS, 'normal');
    doc.setFontSize(7.5);
    color(MUTED);
    doc.text(fmt(t.kopfFolge, { datum }), W - M, 14, { align: 'right' });
    color(LINE, 'draw');
    doc.setLineWidth(0.25);
    doc.line(M, 17.5, W - M, 17.5);
    return 17.5;
  };

  let y = kopf(true) + 12;

  // Titel
  color(INK);
  doc.setFont(SERIF, 'bold');
  doc.setFontSize(24);
  doc.text(t.titel, M, y);
  y += 7.5;
  doc.setFont(SERIF, 'italic');
  doc.setFontSize(12);
  color(SOFT);
  doc.text(t.untertitel, M, y);
  // Meta rechts
  doc.setFont(SANS, 'normal');
  doc.setFontSize(8.5);
  color(MUTED);
  doc.text(datum, W - M, y - 7.5, { align: 'right' });
  doc.text(`${mz(items.length, t.detailEins, t.detailMehr)}${stoffe.length ? ` · ${mz(stoffe.length, t.stoffEins, t.stoffMehr)}` : ''}`, W - M, y, { align: 'right' });
  y += 9;

  const neueSeite = () => {
    doc.addPage();
    y = kopf(false) + 10;
  };
  const platz = (h: number) => {
    if (y + h > FOOT - 4) neueSeite();
  };

  const abschnitt = (titel: string) => {
    platz(14 + 40);
    color(INK);
    doc.setFont(SANS, 'bold');
    doc.setFontSize(8);
    const sp = 0.45; // Sperrung in mm pro Zeichen
    doc.setCharSpace(sp);
    doc.text(titel.toUpperCase(), M, y);
    doc.setCharSpace(0);
    const tw = doc.getTextWidth(titel.toUpperCase()) + titel.length * sp;
    color(LINE, 'draw');
    doc.setLineWidth(0.25);
    doc.line(M + tw + 4, y - 1.2, W - M, y - 1.2);
    y += 5;
  };

  // Stoff zuerst (wenn notiert)
  if (stoffe.length) {
    abschnitt(t.stoffAbschnitt);
    const h = 16;
    color(WARM, 'fill');
    color(LINE, 'draw');
    doc.setLineWidth(0.25);
    doc.rect(M, y, CW, h, 'FD');
    color(MUTED);
    doc.setFont(SANS, 'normal');
    doc.setFontSize(7.5);
    doc.text(stoffe.length > 1 ? t.stoffnummernKopf : t.stoffnummerKopf, M + 5, y + 6);
    color(INK);
    doc.setFont(SANS, 'bold');
    doc.setFontSize(12);
    doc.text(stoffe.join('   ·   '), M + 5, y + 12);
    color(MUTED);
    doc.setFont(SANS, 'normal');
    doc.setFontSize(7.5);
    doc.text(STOFF_LINK.replace('https://', ''), W - M - 5, y + 12, { align: 'right' });
    y += h + 9;
  }

  // Details nach Kleidungsstück, zweispaltig
  const gap = 5;
  const cw = (CW - gap) / 2;
  const ch = 30;
  const imgBox = 20;
  const gruppen = [...new Set(items.map((g) => g.kategorie))];
  const bilder = await Promise.all(items.map((g) => jpeg(g.option.image)));

  for (const kat of gruppen) {
    abschnitt(kat);
    const liste = items.map((g, i) => ({ g, im: bilder[i] })).filter((x) => x.g.kategorie === kat);
    for (let i = 0; i < liste.length; i += 2) {
      platz(ch + gap);
      for (let col = 0; col < 2; col++) {
        const e = liste[i + col];
        if (!e) continue;
        const x = M + col * (cw + gap);
        color(LINE, 'draw');
        doc.setLineWidth(0.25);
        doc.rect(x, y, cw, ch);
        // Bildfeld
        color(LINE, 'draw');
        doc.line(x + imgBox + 4, y + 3, x + imgBox + 4, y + ch - 3);
        if (e.im) {
          const maxH = ch - 6;
          const maxW = imgBox;
          const r = Math.min(maxW / e.im.w, maxH / e.im.h);
          const iw = e.im.w * r;
          const ih = e.im.h * r;
          doc.addImage(e.im.data, 'JPEG', x + 2 + (maxW - iw) / 2, y + 3 + (maxH - ih) / 2, iw, ih, undefined, 'FAST');
        }
        // Text
        const tx = x + imgBox + 8;
        const tw = cw - imgBox - 11;
        color(MUTED);
        doc.setFont(SANS, 'normal');
        doc.setFontSize(6.8);
        doc.setCharSpace(0.25);
        const kopfzeile = doc.splitTextToSize(e.g.untergruppe.toUpperCase(), tw)[0];
        doc.text(kopfzeile, tx, y + 7);
        doc.setCharSpace(0);
        color(INK);
        doc.setFont(SANS, 'bold');
        doc.setFontSize(10);
        const titel = doc.splitTextToSize(optionText(e.g, ta), tw).slice(0, 2);
        doc.text(titel, tx, y + 12.5);
        const sub = e.g.option.subLabel;
        if (sub) {
          color(MUTED);
          doc.setFont(SANS, 'normal');
          doc.setFontSize(7.8);
          const zeilen = doc.splitTextToSize(sub, tw).slice(0, titel.length > 1 ? 2 : 3);
          doc.text(zeilen, tx, y + 12.5 + titel.length * 4.3 + 0.8);
        }
      }
      y += ch + gap;
    }
    y += 3;
  }

  // Notizen fürs Atelier
  platz(46);
  abschnitt(t.notizen);
  color(LINE, 'draw');
  doc.setLineWidth(0.25);
  for (let i = 0; i < 5; i++) doc.line(M, y + 6 + i * 7.5, W - M, y + 6 + i * 7.5);
  y += 6 + 5 * 7.5;

  // Fusszeile auf jeder Seite
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    color(LINE, 'draw');
    doc.setLineWidth(0.25);
    doc.line(M, FOOT, W - M, FOOT);
    color(GOLD, 'fill');
    doc.rect(M, FOOT - 0.4, 12, 0.8, 'F');
    color(INK);
    doc.setFont(SANS, 'bold');
    doc.setFontSize(7.5);
    doc.text(SITE.name, M, FOOT + 5);
    doc.setFont(SANS, 'normal');
    color(MUTED);
    doc.text(`${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}  ·  ${SITE.phone}  ·  ${SITE.email}  ·  thesartorialist.ch`, M, FOOT + 9);
    doc.text(t.fussHinweis, M, FOOT + 12.8);
    doc.text(fmt(t.seite, { p, n: pages }), W - M, FOOT + 5, { align: 'right' });
  }

  doc.save(t.dateiname);
}
