// Probe-PDFs der A4-Vorlage (Chrome) ohne Datenbank: Angebot, Rechnung mit QR-Zahlteil, Mahnung – je Sprache.
// Aufruf: npx tsx scripts/beleg-probe.mts <ordner> [de,en,fr,it]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { FIRMA_STANDARD } from '../lib/crm/firma';
import { referenzFuer } from '../lib/crm/ablauf';
import { planAusVorlage } from '../lib/crm/zahlungsplan';
import { angebotDokument, mahnungDokument, rechnungDokument } from '../lib/beleg/dokument';
import { dokumentHtml, fussVorlage } from '../lib/beleg/vorlage';
import { htmlZuPdf, schriftenEingebettet, standardLogoEingebettet } from '../lib/beleg/pdf';
import { stufenText } from '../lib/beleg/mahnwesen';
import { datumText } from '../lib/beleg/texte';
import type { BelegSprache, Position } from '../lib/db/schema';

const ziel = process.argv[2] ?? 'beleg-probe';
const sprachen = (process.argv[3] ?? 'de').split(',') as BelegSprache[];
mkdirSync(ziel, { recursive: true });
// Offizielle Testwerte aus den SIX-Beispielen: IBAN CH58 0079 1123 0008 8901 2, QR-IBAN CH44 3199 9123 0008 8901 2
const f = { ...FIRMA_STANDARD, iban: 'CH58 0079 1123 0008 8901 2', mwstNr: 'CHE-123.456.789 MWST', bank: 'Zürcher Kantonalbank' };
const fQr = { ...f, qrIban: 'CH44 3199 9123 0008 8901 2' };
const fLeer = { ...f, iban: '', qrIban: '' };
const k = { name: 'Sandro Bianchi', anrede: 'Herr', firma: 'Bianchi & Partner AG', strasse: 'Bahnhofstrasse 12', plz: '8001', ort: 'Zürich', land: 'CH' };
const pos: Position[] = [
  { id: 't1', art: 'titel', kategorie: 'sonstiges', bezeichnung: 'Massanzug', menge: 0, einzelpreisRp: 0 },
  { id: '1', art: 'position', kategorie: 'massanzug', bezeichnung: 'Massanzug dreiteilig · Super 150', beschreibung: 'Sakko, Hose und Weste, Full-Canvas, Made in Italy\nEinreiher, zwei Knöpfe, fallendes Revers 8 cm', stoffnummer: 'HS8812', menge: 1, einheit: 'Stk.', einzelpreisRp: 249000, mwstSatz: 8.1 },
  { id: '2', art: 'position', kategorie: 'stoffzuschlag', bezeichnung: 'Stoffzuschlag Super 150s', menge: 1, einheit: 'Stk.', einzelpreisRp: 35000, rabattProzent: 10, mwstSatz: 8.1 },
  { id: 't2', art: 'titel', kategorie: 'sonstiges', bezeichnung: 'Hemden', menge: 0, einzelpreisRp: 0 },
  { id: '3', art: 'position', kategorie: 'hemd', bezeichnung: 'Hemd nach Mass', beschreibung: 'Haifischkragen, Doppelmanschette', menge: 2, einheit: 'Stk.', einzelpreisRp: 29000, mwstSatz: 8.1 },
  { id: 'x', art: 'text', kategorie: 'sonstiges', bezeichnung: 'Lieferung', beschreibung: 'Fertigung in Italien, Anprobe im Atelier nach rund vier Wochen.', menge: 0, einzelpreisRp: 0 },
];
const stil = [
  { kategorie: 'Sakko', untergruppe: 'Vorderteil', option: 'Einreiher, zwei Knöpfe' },
  { kategorie: 'Sakko', untergruppe: 'Revers', option: 'Fallendes Revers 8 cm' },
  { kategorie: 'Hose', untergruppe: 'Bund', option: 'Seitliche Verstellung' },
];
const logo = standardLogoEingebettet();

async function pdf(name: string, dok: Parameters<typeof dokumentHtml>[0]) {
  const html = dokumentHtml(dok, { schriften: schriftenEingebettet() });
  writeFileSync(path.join(ziel, `${name}.html`), dokumentHtml(dok));
  const buf = await htmlZuPdf(html, fussVorlage(dok));
  writeFileSync(path.join(ziel, `${name}.pdf`), buf);
  console.log(`✓ ${name}.pdf (${buf.length} Bytes)`);
}

for (const s of sprachen) {
  const heute = new Date();
  await pdf(`angebot-${s}`, angebotDokument({ nummer: 'AN-2026-0042', status: 'gesendet', titel: 'Massanfertigung nach Ihrer Stil-Auswahl', datum: heute, gueltigBis: new Date(Date.now() + 30 * 86400_000), einleitung: f.texte.angebotEinleitung, schluss: f.texte.angebotSchluss, positionen: pos, rabattProzent: 5, rabattRp: 0, mwstSatz: 8.1, sprache: s, stil, stoffe: ['HS8812'], stilAnhang: true }, k, f, logo));
  await pdf(`angebot-30-40-30-${s}`, angebotDokument({ nummer: 'AN-2026-0043', status: 'gesendet', titel: 'Hochzeitsanzug dreiteilig', datum: heute, gueltigBis: new Date(Date.now() + 30 * 86400_000), einleitung: f.texte.angebotEinleitung, schluss: f.texte.angebotSchluss, positionen: pos, rabattProzent: 0, rabattRp: 0, mwstSatz: 8.1, sprache: s, stil: [], stoffe: [], stilAnhang: false, zahlungsplan: planAusVorlage('30-40-30') }, k, f, logo));
  const re = (nummer: string, referenz: string | null) => ({ nummer, art: 'anzahlung' as const, status: 'offen', titel: 'Anzahlung 30 % · Hochzeitsanzug', rechnungsdatum: heute, faelligAm: new Date(Date.now() + 30 * 86400_000), einleitung: f.texte.anzahlungEinleitung, schluss: f.texte.rechnungSchluss, positionen: [{ id: 'a', art: 'position' as const, kategorie: 'sonstiges', bezeichnung: '1. Rate 30 %', beschreibung: 'auf Auftrag AU-2026-0009', menge: 1, einheit: 'Stk.', einzelpreisRp: 99000, mwstSatz: 8.1 }], rabattProzent: 0, rabattRp: 0, mwstSatz: 8.1, abzug: [], bezahltRp: 0, referenz, sprache: s, auftragNummer: 'AU-2026-0009' });
  await pdf(`rechnung-qr-iban-${s}`, rechnungDokument(re('RE-2026-0018', referenzFuer(fQr, 'RE-2026-0018')), k, fQr, logo));
  await pdf(`rechnung-ohne-iban-${s}`, rechnungDokument(re('RE-2026-0019', null), k, fLeer, logo));
  await pdf(`rechnung-${s}`, rechnungDokument({ nummer: 'RE-2026-0017', art: 'schluss', status: 'offen', titel: 'Massanzug dreiteilig', rechnungsdatum: heute, faelligAm: new Date(Date.now() + 30 * 86400_000), einleitung: f.texte.rechnungEinleitung, schluss: f.texte.rechnungSchluss, positionen: pos, rabattProzent: 0, rabattRp: 0, mwstSatz: 8.1, abzug: [{ rechnungId: 'x', nummer: 'RE-2026-0012', datum: heute.toISOString(), betragRp: 150000 }], bezahltRp: 0, referenz: referenzFuer(f, 'RE-2026-0017'), sprache: s, auftragNummer: 'AU-2026-0009' }, k, f, logo));
  const frist = new Date(Date.now() + 10 * 86400_000);
  const t = stufenText(2, s, { name: k.name, anrede: k.anrede, frist: datumText(frist, s) });
  await pdf(`mahnung-${s}`, mahnungDokument({ nummer: 'MA-2026-0003', stufe: 2, datum: heute, fristBis: frist, gebuehrRp: 2000, offenRp: 189450, sprache: s, einleitung: t.einleitung, schluss: t.schluss }, { nummer: 'RE-2026-0017', rechnungsdatum: new Date(Date.now() - 50 * 86400_000), faelligAm: new Date(Date.now() - 20 * 86400_000), betragRp: 187450, bezahltRp: 0, referenz: referenzFuer(f, 'RE-2026-0017'), gebuehrenVorherRp: 0 }, k, f, logo));
}
process.exit(0);
