// Mails zu Angebot und Rechnung in der Sprache des Dokuments (de/en/fr/it). Deutsch nutzt die bestehenden Vorlagen
// (lib/mail-vorlagen.ts), die übrigen Sprachen denselben Rahmen mit übersetzten Texten.
import type { BelegSprache, RechnungArt } from '@/lib/db/schema';
import { mailAngebot, mailBausteine, mailRechnung } from '@/lib/mail-vorlagen';
import { SITE } from '@/lib/site';
import { DOK, fuell } from './texte';

const { rahmen, titelZeile, kicker, knopf, esc, chfMail, telHref, farben } = mailBausteine;

const T = {
  en: {
    angebotTitel: 'Your offer, {name}.',
    angebotText: 'Thank you for your visit. We are pleased to send you our offer for your made-to-measure garment – you can view it online and accept it with one click.',
    ansehen: 'View & accept offer',
    beilage: 'The offer is also attached as a PDF.',
    fragen: 'Questions about the offer?',
    antworten: 'Simply reply to this e-mail or give us a call.',
    gueltig: 'incl. VAT · valid until {datum}',
    inkl: 'incl. VAT',
    rechnungTitel: 'Your {art}, {name}.',
    rechnungText: 'Thank you very much for your order. Please find the invoice with QR payment part attached – simply scan the code with your banking app.',
    zahlbar: 'payable by {datum}',
    rechnungFragen: 'Questions about the invoice? Simply reply to this e-mail.',
    gruss: 'Kind regards',
    hallo: 'Dear {name}',
    betreffAngebot: 'Your offer {nummer} — The Sartorialist Zurich',
  },
  fr: {
    angebotTitel: 'Votre offre, {name}.',
    angebotText: "Merci de votre visite. Nous avons le plaisir de vous envoyer notre offre pour votre confection sur mesure – vous pouvez la consulter en ligne et l'accepter en un clic.",
    ansehen: "Consulter et accepter l'offre",
    beilage: "L'offre est également jointe en PDF.",
    fragen: "Des questions sur l'offre ?",
    antworten: 'Répondez simplement à cet e-mail ou appelez-nous.',
    gueltig: "TVA incluse · valable jusqu'au {datum}",
    inkl: 'TVA incluse',
    rechnungTitel: 'Votre {art}, {name}.',
    rechnungText: 'Nous vous remercions de votre commande. Vous trouverez ci-joint la facture avec section paiement QR – scannez simplement le code avec votre application bancaire.',
    zahlbar: "payable jusqu'au {datum}",
    rechnungFragen: 'Des questions sur la facture ? Répondez simplement à cet e-mail.',
    gruss: 'Meilleures salutations',
    hallo: 'Bonjour {name}',
    betreffAngebot: 'Votre offre {nummer} — The Sartorialist Zurich',
  },
  it: {
    angebotTitel: 'La sua offerta, {name}.',
    angebotText: "Grazie per la sua visita. Siamo lieti di inviarle la nostra offerta per il suo capo su misura – può visualizzarla online e accettarla con un clic.",
    ansehen: "Visualizzare e accettare l'offerta",
    beilage: "L'offerta è allegata anche in PDF.",
    fragen: "Domande sull'offerta?",
    antworten: 'Risponda semplicemente a questa e-mail o ci chiami.',
    gueltig: 'IVA inclusa · valida fino al {datum}',
    inkl: 'IVA inclusa',
    rechnungTitel: 'La sua {art}, {name}.',
    rechnungText: "La ringraziamo per l'ordine. In allegato trova la fattura con sezione pagamento QR – scansioni semplicemente il codice con la sua app bancaria.",
    zahlbar: 'pagabile entro il {datum}',
    rechnungFragen: 'Domande sulla fattura? Risponda semplicemente a questa e-mail.',
    gruss: 'Cordiali saluti',
    hallo: 'Buongiorno {name}',
    betreffAngebot: 'La sua offerta {nummer} — The Sartorialist Zurigo',
  },
};

type AngebotMail = { name: string; anrede?: string | null; nummer: string; titel: string; totalRp: number; gueltigBis?: string; link: string; nachricht?: string };

export function mailAngebotIn(sprache: BelegSprache, d: AngebotMail) {
  if (sprache === 'de') return mailAngebot(d);
  const t = T[sprache];
  const D = DOK[sprache];
  const html = rahmen(
    `${D.angebot} ${d.nummer} — ${d.titel}`,
    titelZeile(fuell(t.angebotTitel, { name: d.name }), d.nachricht || t.angebotText) +
      `<tr><td style="padding:18px 36px 6px">${kicker(`${D.angebot} ${d.nummer}`)}<div style="padding:20px 22px;background:${farben.INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(d.titel)}</div><div style="font:600 17px/1.5 Helvetica,Arial,sans-serif;color:#ffffff;margin-top:8px">${esc(chfMail(d.totalRp))}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:2px">${esc(d.gueltigBis ? fuell(t.gueltig, { datum: d.gueltigBis }) : t.inkl)}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 8px">${knopf(d.link, t.ansehen, 'gold')}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${farben.MUTED};margin-top:4px">${esc(t.beilage)}</div></td></tr>` +
      `<tr><td style="padding:14px 36px 32px">${kicker(t.fragen)}<p style="margin:0 0 14px;font:14px/1.6 Helvetica,Arial,sans-serif;color:${farben.SOFT}">${esc(t.antworten)}</p>${knopf(telHref(SITE.phone), SITE.phone, 'line')}${knopf(SITE.whatsapp, 'WhatsApp', 'line')}</td></tr>`,
  );
  const text = [fuell(t.hallo, { name: d.name }), '', d.nachricht || t.angebotText, '', `${D.angebot} ${d.nummer}: ${d.titel}`, `${chfMail(d.totalRp)} ${d.gueltigBis ? fuell(t.gueltig, { datum: d.gueltigBis }) : t.inkl}`, '', fuell(D.annahmeLink, { link: d.link }), '', t.gruss, 'The Sartorialist Zürich'].join('\n');
  return { html, text, subject: fuell(t.betreffAngebot, { nummer: d.nummer }) };
}

type RechnungMail = { name: string; anrede?: string | null; nummer: string; art: RechnungArt; titel: string; betragRp: number; faellig?: string; nachricht?: string };

export function mailRechnungIn(sprache: BelegSprache, d: RechnungMail) {
  if (sprache === 'de') return mailRechnung(d);
  const t = T[sprache];
  const D = DOK[sprache];
  const artText = d.art === 'anzahlung' ? D.anzahlung : d.art === 'schluss' ? D.schluss : D.rechnung;
  const html = rahmen(
    `${artText} ${d.nummer}`,
    titelZeile(fuell(t.rechnungTitel, { art: artText.toLowerCase(), name: d.name }), d.nachricht || t.rechnungText) +
      `<tr><td style="padding:18px 36px 6px">${kicker(`${artText} ${d.nummer}`)}<div style="padding:20px 22px;background:${farben.INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(chfMail(d.betragRp))}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">${esc([d.titel, d.faellig ? fuell(t.zahlbar, { datum: d.faellig }) : ''].filter(Boolean).join(' · '))}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 32px;font:13px/1.6 Helvetica,Arial,sans-serif;color:${farben.MUTED}">${esc(t.rechnungFragen)}</td></tr>`,
  );
  const text = [fuell(t.hallo, { name: d.name }), '', d.nachricht || t.rechnungText, '', `${artText} ${d.nummer}: ${chfMail(d.betragRp)}${d.faellig ? `, ${fuell(t.zahlbar, { datum: d.faellig })}` : ''}`, '', t.gruss, 'The Sartorialist Zürich'].join('\n');
  return { html, text, subject: `${artText} ${d.nummer} — The Sartorialist` };
}
