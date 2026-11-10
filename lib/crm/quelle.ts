// Lesbare Bezeichnung der Kontakt-Quelle (kontakt.quelle) und Erkennung der Ratgeber-Leads.
export const QUELLE_RATGEBER = 'formular:ratgeber';

const LABEL: Record<string, string> = {
  'formular:termin': 'Terminanfrage (Website)',
  'formular:rueckruf': 'Rückrufbitte (Website)',
  [QUELLE_RATGEBER]: 'Ratgeber-Download (Website)',
};

export const quelleLabel = (q: string | null | undefined) => (q ? (LABEL[q] ?? q) : '–');

