// Kundenmail-Vorschau je Sprache rendern (ohne Versand):
//   npx tsx scripts/mail-vorschau.mts en > /tmp/mail-en.html
// Simuliert eine Terminanfrage aus dem Formular (sprache, Datum, Stil-Auswahl mit IDs).
import { mailTerminKunde } from '../lib/mail-vorlagen';
import { kundenTexte, stilFuer, terminTextFuer } from '../lib/i18n/kundenmail';
import { zuerich } from '../lib/zeit';

const sprache = process.argv[2] ?? 'en';
const datum = '2026-11-12';
const zeit = '14:30';
const stilRoh = [
  { kategorie: 'Sakko', untergruppe: 'Vorderteil — Einreiher', option: 'Zwei Knöpfe (2 B)', kategorieId: 'jacket', untergruppeId: 'jacket-front-sb', optionId: 'jacket-sb-2b' },
];
const { t } = kundenTexte(sprache);
const m = mailTerminKunde(
  {
    name: 'James Miller',
    email: 'james@example.com',
    telefon: '+41 79 123 45 67',
    datum,
    zeit,
    wunschText: terminTextFuer(sprache, zuerich(datum, zeit), 'Donnerstag, 12. November 2026, 14:30 Uhr'),
    stil: stilFuer(sprache, stilRoh),
    stoffe: ['9722022'],
  },
  t,
);
console.error(`Betreff: ${m.subject}\n---\n${m.text}\n---`);
console.log(m.html);
