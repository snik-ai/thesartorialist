// Probe-PDFs (Angebot, Rechnung mit QR-Zahlteil, Massblatt) ohne Datenbank: `npx tsx scripts/pdf-probe.ts <ordner>`
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { angebotPdf, massblattPdf, rechnungPdf } from '../lib/pdf/dokument';
import { FIRMA_STANDARD } from '../lib/crm/firma';
import { summen } from '../lib/crm/geld';
import { referenzFuer } from '../lib/crm/ablauf';

const ziel = process.argv[2] ?? 'pdf-probe';
mkdirSync(ziel, { recursive: true });
const firma = { ...FIRMA_STANDARD, iban: 'CH44 3199 9123 0008 8901 2', qrIban: 'CH44 3199 9123 0008 8901 2', mwstNr: 'CHE-123.456.789 MWST', bank: 'Zürcher Kantonalbank' };
const kunde = { name: 'Sandro Bianchi', anrede: 'Herr', firma: 'Bianchi & Partner AG', strasse: 'Bahnhofstrasse 12', plz: '8001', ort: 'Zürich', land: 'CH' };
const pos = [
  { id: '1', kategorie: 'massanzug', bezeichnung: 'Massanzug dreiteilig', beschreibung: 'Sakko, Hose und Weste, Full-Canvas, Made in Italy\nEinreiher, zwei Knöpfe, fallendes Revers 8 cm', stoffnummer: 'HS8812', menge: 1, einzelpreisRp: 249000 },
  { id: '2', kategorie: 'hemd', bezeichnung: 'Hemd nach Mass', beschreibung: 'Haifischkragen, Doppelmanschette', menge: 2, einzelpreisRp: 29000 },
  { id: '3', kategorie: 'stoffzuschlag', bezeichnung: 'Stoffzuschlag Super 150s', menge: 1, einzelpreisRp: 35000 },
];
const stil = [
  { kategorie: 'Sakko', untergruppe: 'Vorderteil — Einreiher', option: 'Zwei Knöpfe' },
  { kategorie: 'Sakko', untergruppe: 'Revers', option: 'Fallendes Revers 8 cm' },
  { kategorie: 'Hose', untergruppe: 'Bund', option: 'Seitliche Riegel' },
  { kategorie: 'Weste', untergruppe: 'Verschluss', option: 'Fünf Knöpfe' },
];

async function main() {
  const jetzt = new Date();
  writeFileSync(
    path.join(ziel, 'angebot.pdf'),
    await angebotPdf({ nummer: 'AN-2026-0001', titel: 'Hochzeitsanzug dreiteilig', datum: jetzt, gueltigBis: new Date(Date.now() + 30 * 86400_000), einleitung: firma.texte.angebotEinleitung, schluss: firma.texte.angebotSchluss, positionen: pos, rabattProzent: 5, rabattRp: 0, mwstSatz: 8.1, stil, stoffe: ['HS8812'], link: 'https://thesartorialist.ch/angebot/BEISPIEL/' }, kunde, firma, null),
  );
  const s = summen(pos, { rabattProzent: 5, mwstSatz: 8.1 });
  writeFileSync(
    path.join(ziel, 'rechnung.pdf'),
    await rechnungPdf({ nummer: 'RE-2026-0002', art: 'schluss', titel: 'Hochzeitsanzug dreiteilig', datum: jetzt, faelligAm: new Date(Date.now() + 30 * 86400_000), einleitung: firma.texte.rechnungEinleitung, schluss: firma.texte.rechnungSchluss, positionen: pos, rabattProzent: 5, rabattRp: 0, mwstSatz: 8.1, abzug: [{ rechnungId: 'x', nummer: 'RE-2026-0001', datum: jetzt.toISOString(), betragRp: 165000 }], betragRp: s.totalRp - 165000, bezahltRp: 0, referenz: referenzFuer(firma, 'RE-2026-0002'), auftragNummer: 'AU-2026-0001' }, kunde, firma, null),
  );
  writeFileSync(
    path.join(ziel, 'massblatt.pdf'),
    await massblattPdf(
      {
        version: 2,
        gemessenAm: jetzt,
        gemessenVon: 'Alexander Shubin',
        masse: { 'allgemein.koerpergroesse': 182, 'allgemein.gewicht': 81, 'sakko.brust': 102, 'sakko.taille': 90, 'sakko.schulter': 47.5, 'sakko.laenge': 76, 'sakko.aermel_li': 63.5, 'sakko.aermel_re': 64, 'hose.bund': 88, 'hose.schritt': 81, 'hose.seite': 106, 'hose.saum': 20, 'hemd.hals': 41, 'hemd.manschette_li': 25, 'hemd.manschette_re': 25.5 },
        vorher: { version: 1, gemessenAm: new Date(Date.now() - 300 * 86400_000), masse: { 'sakko.brust': 101, 'sakko.taille': 92, 'hose.bund': 89, 'sakko.aermel_li': 63.5 } },
        koerper: ['Hängende Schulter rechts', 'Bauch', 'Uhr links'],
        notiz: 'Bevorzugt leicht taillierten Schnitt. Hose ohne Bruch.',
        auftragNummer: 'AU-2026-0001',
      },
      kunde,
      firma,
      null,
    ),
  );
  console.log('PDFs in', ziel);
}
main();
