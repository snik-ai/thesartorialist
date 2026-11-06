// Deutsche Standardtexte für Auswahl-Text (Mail/Terminanfrage) und PDF. Bewusst klein und
// ohne Katalogdaten: wird im Browser genutzt (BookingWizard, PDF) und ist zugleich die
// Quelle für lib/i18n/de/konfigurator.ts (dort als ui.auswahl bzw. pdf eingebunden).

/** Texte für alsText()/optionText() — Platzhalter in geschweiften Klammern (fmt). */
export const AUSWAHL_TEXTE_DE = {
  /** Taschen-Kombination: Brust- und Seitentasche */
  taschen: 'Brust {brust}, Seite {seite}',
  stoffKopf: 'STOFF (HOLLAND & SHERRY)',
  stoffnummer: 'Stoffnummer',
  stoffnummern: 'Stoffnummern',
};
export type AuswahlTexte = typeof AUSWAHL_TEXTE_DE;

/** Texte des Stil-PDFs (lib/konfigurator/pdf.ts). */
export const PDF_TEXTE_DE = {
  dateiname: 'The-Sartorialist-Stil-Auswahl.pdf',
  /** Intl-Locale fürs Datum */
  locale: 'de-CH',
  dokTitel: 'Stil-Auswahl Massanzug — The Sartorialist Zürich',
  dokThema: 'Massanzug Styles & Options',
  ort: 'ZÜRICH',
  kopfFolge: 'Stil-Auswahl · {datum}',
  titel: 'Meine Stil-Auswahl',
  untertitel: 'für den Massanzug — Styles & Options',
  detailEins: '{n} Detail',
  detailMehr: '{n} Details',
  stoffEins: '{n} Stoff',
  stoffMehr: '{n} Stoffe',
  stoffAbschnitt: 'Stoff · Holland & Sherry',
  stoffnummerKopf: 'STOFFNUMMER',
  stoffnummernKopf: 'STOFFNUMMERN',
  notizen: 'Notizen fürs Atelier',
  fussHinweis: 'Masse nehmen wir im Atelier — bringen Sie diese Auswahl zu Ihrem Termin mit.',
  seite: 'Seite {p} von {n}',
};
export type PdfTexte = typeof PDF_TEXTE_DE;
