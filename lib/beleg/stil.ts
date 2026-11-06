// Gestaltung des A4-Blatts (Angebot, Auftrag, Rechnung, Mahnung) — EIN Stylesheet für das Papier im Editor, die
// Kundenansicht und das PDF (Chrome). Aufbau nach VoxCRM verkauf/vorlagen.ts (Swiss Style: klare Hierarchie, Haarlinien
// statt Kästen, Zahlen rechtsbündig mit tabellarischen Ziffern), im Look des Ateliers: Playfair Display für Titel,
// Inter für Text, Gold #c9a063 als einziger Akzent, eckig. Keine Schatten und keine Transparenz-Effekte (PDF-Vorschau
// auf macOS zeichnet sie als dunkle Flächen).
//
// Masse in mm wie das PDF: Ränder 15 mm oben, 18 mm rechts, 27 mm unten (Fuss), 20 mm links. Adressfeld für das
// Fenstercouvert C5/6 rechts (118 mm von links, 50 mm von oben), Absender gegenüber, Falz- und Lochmarken.
export const RAND = { oben: 15, rechts: 18, unten: 27, links: 20 } as const;
export const FENSTER = { x: 118, y: 50, b: 74 } as const;
export const START_MM = 98;

/** @font-face für Inter und Playfair: im Browser aus /fonts/pdf/, im PDF als data:-URI (gleiche Dateien). */
export function schriftenCss(quelle: { sans: string; serif: string }) {
  return `@font-face{font-family:"BL Sans";src:url(${quelle.sans}) format("truetype");font-weight:100 900;font-style:normal;font-display:block}
@font-face{font-family:"BL Serif";src:url(${quelle.serif}) format("truetype");font-weight:400 900;font-style:normal;font-display:block}`;
}
export const SCHRIFTEN_WEB = schriftenCss({ sans: '"/fonts/pdf/Inter.ttf"', serif: '"/fonts/pdf/PlayfairDisplay.ttf"' });

const r = RAND;
const ab = (y: number) => `${y - r.oben}mm`;

/** Papier-CSS; alles unter `.bl`, damit Admin und Website unberührt bleiben. */
export const PAPIER_CSS = `
.bl{--tinte:#101010;--text:#3a3833;--grau:#77736b;--hell:#a19c92;--haar:#e8e4dd;--linie:#d4cfc5;--gold:#c9a063;--hauch:#faf7f1;
  font-family:"BL Sans",Inter,"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:9pt;line-height:1.5;color:var(--tinte);font-weight:400;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-font-smoothing:antialiased;text-align:left;letter-spacing:0}
.bl *{box-sizing:border-box}
.bl .r,.bl .num,.bl-held b,.bl-tot>div>span:last-child,.bl td.nr,.bl-qr-betrag{font-variant-numeric:tabular-nums}
.bl p{margin:0;orphans:2;widows:2}
.bl b{font-weight:600}
.bl-serif{font-family:"BL Serif","Playfair Display",Georgia,serif}
/* Briefkopf: Lage in mm ab Blattrand, umgerechnet auf den Satzspiegel */
.bl-brief{position:relative;height:${START_MM - r.oben}mm}
.bl-brief>*{position:absolute}
.bl-logo{left:0;top:0;max-width:80mm}
.bl-logo img{display:block;height:11mm;width:auto;max-width:78mm}
.bl-logo .bl-wort{display:block;font-family:"BL Serif",Georgia,serif;font-weight:600;font-size:17pt;letter-spacing:.04em;line-height:1.1;color:var(--tinte);text-transform:uppercase}
.bl-logo i{display:block;width:12mm;height:.6mm;background:var(--gold);margin-top:3.2mm}
.bl-abs{left:0;top:${ab(FENSTER.y)};width:84mm;font-size:7.5pt;line-height:1.62;color:var(--grau)}
.bl-abs b{color:var(--tinte);font-weight:600}
.bl-fenster{left:${FENSTER.x - r.links}mm;top:${ab(FENSTER.y)};width:${FENSTER.b}mm;font-size:10pt;line-height:1.42;color:var(--tinte)}
.bl-fenster small{display:block;font-size:6.5pt;line-height:1.3;color:var(--hell);border-bottom:.5pt solid #bdb8ae;margin-bottom:2mm;padding-bottom:.8mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-fenster b{font-weight:600}
.bl-falz{left:-${r.links - 4}mm;width:5mm;height:0;border-top:.5pt solid #9a968f}
.bl-falz.loch{width:7mm}
/* Titel */
.bl-stempel{display:inline-block;border:1pt solid #2f7d5b;color:#2f7d5b;padding:.8mm 2.6mm;font-weight:700;font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;margin:0 0 4mm}
.bl-stempel.storno{border-color:#a63d32;color:#a63d32}
.bl-stempel.entwurf{border-color:var(--hell);color:var(--grau)}
.bl-titelblock{display:flex;align-items:flex-end;justify-content:space-between;gap:8mm}
.bl-titelblock-l{min-width:0;flex:1}
.bl-h1{font-family:"BL Serif","Playfair Display",Georgia,serif;font-size:21pt;line-height:1.1;letter-spacing:-.01em;margin:0;font-weight:600;color:var(--tinte)}
.bl-h1 .nr{font-family:"BL Sans",Inter,Helvetica,Arial,sans-serif;font-weight:300;font-size:13pt;color:var(--hell);margin-left:1.6mm;letter-spacing:0}
.bl-betreff{font-size:10.5pt;line-height:1.4;font-weight:500;margin-top:2mm;color:var(--text);overflow-wrap:anywhere}
.bl-held{flex:none;text-align:right;padding-bottom:.4mm}
.bl-held small{display:block;font-size:6.5pt;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--hell)}
.bl-held b{display:block;font-size:17pt;line-height:1.15;font-weight:600;letter-spacing:-.01em;margin-top:.6mm}
.bl-held span{display:block;font-size:8pt;color:var(--grau);margin-top:.4mm}
.bl-angaben{display:flex;flex-wrap:wrap;gap:2.5mm 9mm;margin:5.5mm 0 0;padding:2.8mm 0;border-top:.75pt solid var(--tinte);border-bottom:.5pt solid var(--haar)}
.bl-angaben>div{min-width:0}
.bl-angaben small{display:block;font-size:6.5pt;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--hell);margin-bottom:.5mm}
.bl-angaben b{display:block;font-weight:500;font-size:9pt;color:var(--tinte)}
.bl-text{margin-top:7mm;font-size:9.5pt;line-height:1.6;color:var(--tinte);white-space:normal}
.bl-text p+p{margin-top:3mm}
.bl-text:empty{display:none}
.bl-schluss{margin-top:8mm}
/* Positionen: Kopf wiederholt sich auf jeder Seite, Zeilen brechen nie */
.bl table{width:100%;border-collapse:collapse;table-layout:fixed}
.bl table.bl-pos{margin-top:7mm}
.bl thead{display:table-header-group}
.bl th{text-align:left;font-size:6.5pt;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:var(--hell);border-bottom:.75pt solid var(--tinte);padding:0 1mm 1.8mm;white-space:nowrap}
.bl td{padding:2.4mm 1mm;border-bottom:.5pt solid var(--haar);vertical-align:top}
.bl th:first-child,.bl td:first-child{padding-left:0}
.bl th:last-child,.bl td:last-child{padding-right:0}
.bl td.nr{color:var(--hell)}
.bl td.pos b{font-weight:600}
.bl td.me{padding-right:.6mm}
.bl td.ei{padding-left:0;color:var(--grau)}
.bl .r{text-align:right;white-space:nowrap}
.bl tr,.bl tbody{break-inside:avoid}
.bl tr.titel td{font-family:"BL Serif","Playfair Display",Georgia,serif;font-weight:600;font-size:10.5pt;padding-top:5.5mm;padding-bottom:1.6mm;color:var(--tinte);border-bottom:.75pt solid var(--gold)}
.bl tr.textblock td{color:var(--text)}
.bl tr.textblock b{font-weight:600;color:var(--tinte)}
.bl tr.zt td{border-bottom:0;padding-top:1.6mm;padding-bottom:1mm;font-size:8.5pt;color:var(--grau)}
.bl tr.zt td.r{color:var(--tinte);font-weight:600;border-top:.5pt solid var(--linie)}
.bl-besch{display:block;margin-top:.7mm;color:var(--grau);font-size:8.5pt;line-height:1.5;overflow-wrap:anywhere;white-space:pre-line}
.bl-zusatz{display:flex;flex-wrap:wrap;gap:1mm 3mm;margin-top:.9mm;font-size:7.8pt;color:var(--grau)}
.bl-marke{display:inline-block;font-size:6.5pt;font-weight:600;letter-spacing:.06em;text-transform:uppercase;border:.5pt solid var(--gold);color:#8a6a35;padding:0 1.2mm;line-height:1.7}
/* Abschluss: Zahlungsangaben links, Totale rechts – bleibt zusammen */
.bl-abschluss{display:flex;align-items:flex-start;gap:8mm;margin-top:5mm;break-inside:avoid;break-before:avoid}
.bl-abschluss-l{flex:1;min-width:0;padding-top:1.2mm}
.bl-kicker{display:block;font-size:6.5pt;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--hell);margin-bottom:1.4mm}
.bl-zahlung dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:.7mm 3.5mm;font-size:8pt;line-height:1.45}
.bl-zahlung dt{color:var(--grau)}
.bl-zahlung dd{margin:0;color:var(--tinte);overflow-wrap:anywhere}
.bl-zahlung .notiz{margin-top:2mm;font-size:7.5pt;color:var(--hell)}
.bl-tot{flex:none;width:76mm;margin-left:auto}
.bl-tot>div{display:flex;justify-content:space-between;gap:4mm;padding:1.1mm 0}
.bl-tot .m{color:var(--grau);font-size:8.5pt}
.bl-tot .g{border-top:.5pt solid var(--linie);margin-top:1.2mm;padding-top:1.8mm;font-weight:600}
.bl-tot .g.haupt{border-top:1.4pt solid var(--gold);margin-top:1.8mm;padding-top:2.4mm;font-weight:700;font-size:11.5pt}
.bl-tot .inkl{color:var(--grau);font-size:7.8pt;padding-top:.6mm}
.bl-unterschrift{margin-top:14mm;display:flex;gap:14mm;font-size:7.5pt;color:var(--grau);break-inside:avoid}
.bl-unterschrift div{flex:1;border-top:.5pt solid var(--tinte);padding-top:1.6mm}
.bl-angenommen{margin-top:8mm;border-left:.6mm solid #2f7d5b;padding:1mm 0 1mm 3mm;font-size:8.5pt;color:#2f7d5b}
.bl-ende{break-inside:avoid}
.bl-fuss{margin-top:14mm;padding-top:2.5mm;border-top:.5pt solid var(--haar);font-size:7pt;color:var(--grau);line-height:1.6;display:flex;gap:6mm}
.bl-fuss>div{flex:1;min-width:0}
.bl-fuss>div:last-child{flex:none;text-align:right;color:var(--hell)}
/* Stil-Auswahl (Anhang) */
.bl-stil{break-before:page;padding-top:2mm}
.bl-stil .bl-h1{font-size:17pt}
.bl-stil-text{margin-top:2mm;color:var(--grau);font-size:9pt;max-width:140mm}
.bl-stil-raster{margin-top:7mm;columns:2;column-gap:10mm}
.bl-stil-gruppe{break-inside:avoid;margin-bottom:6mm}
.bl-stil-gruppe h3{font-family:"BL Serif","Playfair Display",Georgia,serif;font-size:11pt;font-weight:600;margin:0 0 1.6mm;padding-bottom:1.2mm;border-bottom:.75pt solid var(--gold)}
.bl-stil-gruppe div{display:flex;justify-content:space-between;gap:4mm;padding:1.1mm 0;border-bottom:.5pt solid var(--haar);font-size:8.5pt}
.bl-stil-gruppe span{color:var(--grau)}
.bl-stil-gruppe b{font-weight:500;text-align:right}
.bl-stoffe{display:flex;flex-wrap:wrap;gap:2mm;margin-top:3mm}
.bl-stoffe span{border:.5pt solid var(--linie);padding:.8mm 2.4mm;font-size:8.5pt;letter-spacing:.04em}
/* QR-Zahlteil (SIX Style Guide): eigene A4-Seite, Zahlteil unten, 105 mm hoch */
.bl-qr-seite{break-before:page;position:relative;margin-left:-${r.links}mm;width:210mm;height:296mm;background:#fff;color:#000;font-family:Arial,Helvetica,"Liberation Sans",sans-serif;font-variant-numeric:normal;letter-spacing:0}
.bl-qr-hinweis{position:absolute;left:${r.links}mm;right:${r.rechts}mm;top:${r.oben + 5}mm;font-size:9pt;color:#333;line-height:1.5}
.bl-qr-hinweis b{display:block;font-family:"BL Serif","Playfair Display",Georgia,serif;font-size:15pt;font-weight:600;margin-bottom:2mm;color:#000}
.bl-qr-hinweis dl{display:grid;grid-template-columns:auto 1fr;gap:.6mm 4mm;margin:4mm 0 0;font-size:8.5pt}
.bl-qr-hinweis dt{color:#666}.bl-qr-hinweis dd{margin:0}
.bl-qr-abtrennen{position:absolute;left:0;right:0;bottom:105mm;border-top:.5pt dashed #000}
.bl-qr-abtrennen span{position:absolute;left:50%;transform:translateX(-50%);top:-3.2mm;background:#fff;padding:0 2mm;font-size:7pt}
.bl-qr-teil{position:absolute;left:0;bottom:0;width:210mm;height:105mm;display:flex}
.bl-qr-empfang{width:62mm;height:105mm;padding:5mm;border-right:.5pt dashed #000;display:flex;flex-direction:column;font-size:8pt;line-height:9pt}
.bl-qr-titel{font-size:11pt;font-weight:700;line-height:13pt;margin-bottom:3mm}
.bl-qr-empfang .bl-qr-kopf{font-size:6pt;font-weight:700;line-height:9pt}
.bl-qr-block{margin-bottom:2.5mm}
.bl-qr-zahl{width:148mm;height:105mm;padding:5mm;display:flex;gap:5mm;font-size:10pt;line-height:11pt}
.bl-qr-zahl .bl-qr-kopf{font-size:8pt;font-weight:700;line-height:11pt}
.bl-qr-links{width:51mm;display:flex;flex-direction:column}
.bl-qr-rechts{flex:1;min-width:0}
.bl-qr-bild{width:46mm;height:46mm;margin:5mm 0}
.bl-qr-bild svg{display:block;width:46mm;height:46mm}
.bl-qr-betrag{display:flex;gap:6mm}
.bl-qr-feld{position:relative;margin-top:1mm}
.bl-qr-feld.gross{width:65mm;height:25mm}.bl-qr-feld.klein{width:30mm;height:10mm}
.bl-qr-feld::before,.bl-qr-feld::after,.bl-qr-feld>i::before,.bl-qr-feld>i::after{content:"";position:absolute;width:3mm;height:3mm;border:.75pt solid #000}
.bl-qr-feld::before{top:0;left:0;border-right:0;border-bottom:0}.bl-qr-feld::after{top:0;right:0;border-left:0;border-bottom:0}
.bl-qr-feld>i::before{bottom:0;left:0;border-right:0;border-top:0}.bl-qr-feld>i::after{bottom:0;right:0;border-left:0;border-top:0}
.bl-qr-fehlt{position:absolute;left:${r.links}mm;right:${r.rechts}mm;bottom:40mm;border:1pt solid #a63d32;color:#a63d32;padding:4mm;font-size:9pt}
`;

/** Zusätzlich nur im PDF (Chrome): Seitenränder, Fuss im Rand (footerTemplate), Bildschirm-Vorschau als Blatt. */
export const DRUCK_CSS = `
@page{size:A4;margin:${r.oben}mm 0 ${r.unten}mm 0}
@page zahlteil{size:A4 portrait;margin:0}
html,body{margin:0;padding:0;background:#fff}
body.bl{padding:0 ${r.rechts}mm 0 ${r.links}mm}
.bl-qr-seite{page:zahlteil}
@media print{.bl-fuss.fest{display:none}}
@media screen{html{background:#eceae5}body.bl{width:210mm;min-height:297mm;margin:6mm auto;padding:${r.oben}mm ${r.rechts}mm ${r.unten}mm ${r.links}mm;background:#fff;border:1px solid #dcd8d0}.bl-qr-seite{margin-top:${r.unten}mm;border-top:1px dashed #ccc}}
`;
