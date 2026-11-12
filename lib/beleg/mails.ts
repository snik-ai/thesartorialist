// Kundenmails zum Mahnwesen in der Sprache der Rechnung (de/en/fr/it): Zahlungserinnerung, 1. und 2. Mahnung,
// PDF mit QR-Zahlteil im Anhang (lib/admin/belege.ts mahnungPdfFuer). Gestaltung wie lib/mail-vorlagen.ts.
import type { BelegSprache } from '@/lib/db/schema';
import { mailBausteine as B } from '@/lib/mail-vorlagen';
import { kundenTexte } from '@/lib/i18n/kundenmail';
import { SITE } from '@/lib/site';
import { stufeName, type Mahnstufe } from './mahnwesen';

const T: Record<BelegSprache, { gruezi: string; titel: Record<Mahnstufe, string>; text: Record<Mahnstufe, string>; offen: string; frist: string; rechnung: string; mahnung: string; anhang: string; frage: string; gruss: string; betreff: string }> = {
  de: {
    gruezi: 'Hallo',
    titel: { 1: 'Eine kleine Erinnerung', 2: 'Ihre Rechnung ist noch offen', 3: 'Letzte Mahnung vor der Betreibung' },
    text: {
      1: 'Vermutlich ist unsere Rechnung im Alltag untergegangen. Im Anhang finden Sie die Zahlungserinnerung mit QR-Zahlteil – scannen Sie den Code einfach mit Ihrer Banking-App.',
      2: 'Trotz unserer Zahlungserinnerung ist die Rechnung weiterhin offen. Bitte begleichen Sie den Betrag bis zur genannten Frist. Die Mahnung mit QR-Zahlteil liegt bei.',
      3: 'Leider haben wir auf unsere Erinnerung und die erste Mahnung keine Zahlung erhalten. Geht der Betrag nicht bis zur Frist ein, übergeben wir die Forderung der Betreibung.',
    },
    offen: 'Offener Betrag',
    frist: 'Zahlbar bis',
    rechnung: 'Rechnung',
    mahnung: 'Mahnung',
    anhang: 'Das Schreiben mit QR-Zahlteil liegt als PDF bei. Hat sich Ihre Zahlung mit dieser E-Mail gekreuzt, betrachten Sie sie bitte als gegenstandslos.',
    frage: 'Fragen? Antworten Sie einfach auf diese E-Mail.',
    gruss: 'Freundliche Grüsse',
    betreff: '{stufe} – Rechnung {nummer}',
  },
  en: {
    gruezi: 'Hello',
    titel: { 1: 'A friendly reminder', 2: 'Your invoice is still outstanding', 3: 'Final reminder before debt collection' },
    text: {
      1: 'Our invoice has probably been overlooked. Attached is the payment reminder with the QR payment part – simply scan the code with your banking app.',
      2: 'Despite our payment reminder, the invoice is still outstanding. Please pay the amount by the date stated. The reminder with QR payment part is attached.',
      3: 'Unfortunately we have not received payment after our reminder and first reminder. If the amount is not received by the deadline, we will hand the claim over to debt collection.',
    },
    offen: 'Amount outstanding',
    frist: 'Payable by',
    rechnung: 'Invoice',
    mahnung: 'Reminder',
    anhang: 'The letter with QR payment part is attached as a PDF. If your payment has crossed with this e-mail, please disregard it.',
    frage: 'Questions? Simply reply to this e-mail.',
    gruss: 'Kind regards',
    betreff: '{stufe} – Invoice {nummer}',
  },
  fr: {
    gruezi: 'Bonjour',
    titel: { 1: 'Un petit rappel', 2: 'Votre facture est encore ouverte', 3: 'Dernier rappel avant poursuite' },
    text: {
      1: 'Notre facture a sans doute été oubliée. Vous trouverez en annexe le rappel de paiement avec la section paiement QR – scannez simplement le code avec votre application bancaire.',
      2: 'Malgré notre rappel de paiement, la facture est toujours ouverte. Veuillez régler le montant dans le délai indiqué. Le rappel avec section paiement QR est joint.',
      3: "Nous n'avons malheureusement reçu aucun paiement suite à notre rappel et à notre premier rappel. Si le montant ne nous parvient pas dans le délai, nous transmettrons la créance à l'office des poursuites.",
    },
    offen: 'Montant dû',
    frist: "Payable jusqu'au",
    rechnung: 'Facture',
    mahnung: 'Rappel',
    anhang: 'Le courrier avec section paiement QR est joint en PDF. Si votre paiement a croisé cet e-mail, veuillez le considérer comme nul et non avenu.',
    frage: 'Des questions ? Répondez simplement à cet e-mail.',
    gruss: 'Meilleures salutations',
    betreff: '{stufe} – Facture {nummer}',
  },
  it: {
    gruezi: 'Buongiorno',
    titel: { 1: 'Un piccolo promemoria', 2: 'La sua fattura è ancora aperta', 3: "Ultimo sollecito prima dell'esecuzione" },
    text: {
      1: 'Probabilmente la nostra fattura è stata dimenticata. In allegato trova il promemoria di pagamento con la sezione pagamento QR – basta scansionare il codice con la sua app bancaria.',
      2: 'Nonostante il nostro promemoria, la fattura risulta ancora aperta. La preghiamo di saldare l’importo entro il termine indicato. Il sollecito con sezione pagamento QR è allegato.',
      3: "Purtroppo non abbiamo ricevuto alcun pagamento dopo il promemoria e il primo sollecito. Se l'importo non ci perviene entro il termine, affideremo il credito all'esecuzione.",
    },
    offen: 'Importo scoperto',
    frist: 'Pagabile entro il',
    rechnung: 'Fattura',
    mahnung: 'Sollecito',
    anhang: 'La lettera con sezione pagamento QR è allegata in PDF. Se il suo pagamento si è incrociato con questa e-mail, la consideri nulla.',
    frage: 'Domande? Risponda semplicemente a questa e-mail.',
    gruss: 'Cordiali saluti',
    betreff: '{stufe} – Fattura {nummer}',
  },
};

export function mailMahnung(d: { sprache: BelegSprache; name: string; stufe: Mahnstufe; nummer: string; rechnungNummer: string; offenRp: number; frist: string; nachricht?: string }) {
  const t = T[d.sprache] ?? T.de;
  const { t: mt } = kundenTexte(d.sprache);
  const stufe = stufeName(d.stufe, d.sprache);
  const subject = `${t.betreff.replace('{stufe}', stufe).replace('{nummer}', d.rechnungNummer)} — ${SITE.name}`;
  const html = B.rahmen(
    `${stufe} ${d.nummer}`,
    B.titelZeile(`${t.titel[d.stufe]}`, d.nachricht || t.text[d.stufe]) +
      `<tr><td style="padding:18px 36px 6px">${B.kicker(`${stufe} ${d.nummer}`)}<div style="padding:20px 22px;background:${B.farben.INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${B.esc(B.chfMail(d.offenRp))}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">${B.esc(`${t.rechnung} ${d.rechnungNummer} · ${t.frist} ${d.frist}`)}</div></div></td></tr>` +
      `<tr><td style="padding:18px 36px 8px;font:14px/1.6 Helvetica,Arial,sans-serif;color:${B.farben.SOFT}">${B.esc(t.anhang)}</td></tr>` +
      `<tr><td style="padding:8px 36px 32px;font:13px/1.6 Helvetica,Arial,sans-serif;color:${B.farben.MUTED}">${B.esc(t.frage)}</td></tr>`,
    mt,
  );
  const text = [`${t.gruezi} ${B.vornameVon(d.name)}`, '', d.nachricht || t.text[d.stufe], '', `${stufe} ${d.nummer} · ${t.rechnung} ${d.rechnungNummer}`, `${t.offen}: ${B.chfMail(d.offenRp)}`, `${t.frist}: ${d.frist}`, '', t.anhang, '', t.gruss, SITE.name].join('\n');
  return { subject, html, text };
}
