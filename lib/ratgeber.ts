// Ratgeber «Der passende Anzug» (Lead-Magnet). Zwei Gestaltungskonzepte liegen unter public/ratgeber/:
//   A = editorial/Magazin (Schwarz, Creme, Gold) — Quellen: Marketing/Ratgeber-Anzug/quellen/
//   B = grafischer Guide (Matrix, Entscheidungsbaum) — Quellen: Marketing/Ratgeber-Anzug/alternative/quellen/
// TAUSCH: nur diese eine Konstante ändern ('a' → 'b'). PDF, Cover-Mockup und Download wechseln überall mit.
// Diese Datei wird auch im Browser geladen: nur Konstanten.
export const RATGEBER_KONZEPT: 'a' | 'b' = 'a';

export const RATGEBER = {
  pdf: `/ratgeber/ratgeber-anzug-${RATGEBER_KONZEPT}.pdf`,
  cover: `/ratgeber/cover-${RATGEBER_KONZEPT}.webp`,
  /** Seite 2 (Editorial/Inhalt) — erscheint, wenn das Cover nach dem Absenden aufklappt */
  innen: `/ratgeber/innen-${RATGEBER_KONZEPT}.webp`,
  /** Dateiname beim Herunterladen */
  dateiname: 'The-Sartorialist-Ratgeber-Der-passende-Anzug.pdf',
  /** Ratgeber ist auf Deutsch; Hinweis auf fremdsprachigen Seiten */
  sprache: 'de',
} as const;

/** Event, das das Ratgeber-Fenster öffnet (wie ts-rueckruf für das Kontakt-Panel) */
export const RATGEBER_EVENT = 'ts-ratgeber';
