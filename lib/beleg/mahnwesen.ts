// Mahnwesen (aus VoxCRM verkauf/mahnwesen.ts übernommen, CH-Regeln, förmliche Anrede): rein, ohne Datenbank und Uhr.
//
// | Stufe | Brief              | ab Tagen überfällig | Gebühr (Standard, Einstellungen) |
// |-------|--------------------|---------------------|----------------------------------|
// | 1     | Zahlungserinnerung | 7                   | keine                            |
// | 2     | 1. Mahnung         | 21                  | CHF 20                           |
// | 3     | 2. Mahnung         | 35                  | CHF 40                           |
//
// Eine Stufe wird erst vorgeschlagen, wenn die Frist der vorherigen abgelaufen ist. Nach Stufe 3 folgt keine weitere
// Mahnung (Betreibung ist ausserhalb der Software). Frist je Mahnung: 10 Tage.
import type { BelegSprache } from '@/lib/db/schema';
import { DOK, fuell } from './texte';

export type Mahnstufe = 1 | 2 | 3;
export const ABTAGE: Record<Mahnstufe, number> = { 1: 7, 2: 21, 3: 35 };
export const GEBUEHR_STANDARD_RP: Record<Mahnstufe, number> = { 1: 0, 2: 2000, 3: 4000 };
export const FRIST_TAGE = 10;

export const stufeName = (stufe: number, sprache: BelegSprache = 'de') => {
  const D = DOK[sprache];
  return stufe === 1 ? D.mahnStufe1 : stufe === 2 ? D.mahnStufe2 : stufe === 3 ? D.mahnStufe3 : '';
};

const TEXTE: Record<BelegSprache, Record<Mahnstufe, { einleitung: string; folge: string }>> = {
  de: {
    1: {
      einleitung: 'unsere unten aufgeführte Rechnung ist noch offen. Vermutlich ist sie im Alltag untergegangen – wir bitten Sie freundlich, den Betrag bis zum genannten Datum zu überweisen.',
      folge: 'Hat sich Ihre Zahlung mit diesem Schreiben gekreuzt, betrachten Sie es bitte als gegenstandslos.',
    },
    2: {
      einleitung: 'trotz unserer Zahlungserinnerung ist die unten aufgeführte Rechnung weiterhin offen. Wir bitten Sie, den Betrag bis zum genannten Datum zu überweisen.',
      folge: 'Für den zusätzlichen Aufwand verrechnen wir eine Mahngebühr. Hat sich Ihre Zahlung mit diesem Schreiben gekreuzt, betrachten Sie es bitte als gegenstandslos.',
    },
    3: {
      einleitung: 'auf unsere Zahlungserinnerung und die erste Mahnung haben wir keine Zahlung erhalten. Die unten aufgeführte Rechnung ist weiterhin offen.',
      folge: 'Geht der Betrag nicht bis zum genannten Datum bei uns ein, übergeben wir die Forderung der Betreibung nach SchKG. Die Kosten sowie ein Verzugszins von 5 % gehen zu Ihren Lasten. Ist der Betrag im Moment nicht auf einmal tragbar, melden Sie sich bitte – eine Ratenvereinbarung ist in aller Regel möglich.',
    },
  },
  en: {
    1: {
      einleitung: 'our invoice listed below is still outstanding. It has probably been overlooked – we kindly ask you to transfer the amount by the date stated.',
      folge: 'If your payment has crossed with this letter, please disregard it.',
    },
    2: {
      einleitung: 'despite our payment reminder, the invoice listed below is still outstanding. We ask you to transfer the amount by the date stated.',
      folge: 'We charge a reminder fee for the additional work. If your payment has crossed with this letter, please disregard it.',
    },
    3: {
      einleitung: 'we have not received any payment following our payment reminder and first reminder. The invoice listed below is still outstanding.',
      folge: 'If the amount is not received by the date stated, we will hand the claim over to debt collection (SchKG). The costs and default interest of 5 % will be charged to you. If you cannot pay the amount at once, please contact us – an instalment agreement is usually possible.',
    },
  },
  fr: {
    1: {
      einleitung: 'notre facture mentionnée ci-dessous est encore ouverte. Elle a sans doute été oubliée – nous vous prions aimablement de virer le montant à la date indiquée.',
      folge: 'Si votre paiement a croisé ce courrier, veuillez le considérer comme nul et non avenu.',
    },
    2: {
      einleitung: 'malgré notre rappel de paiement, la facture mentionnée ci-dessous est toujours ouverte. Nous vous prions de virer le montant à la date indiquée.',
      folge: 'Nous facturons des frais de rappel pour le travail supplémentaire. Si votre paiement a croisé ce courrier, veuillez le considérer comme nul et non avenu.',
    },
    3: {
      einleitung: "nous n'avons reçu aucun paiement suite à notre rappel de paiement et à notre premier rappel. La facture mentionnée ci-dessous est toujours ouverte.",
      folge: "Si le montant ne nous parvient pas à la date indiquée, nous transmettrons la créance à l'office des poursuites (LP). Les frais ainsi qu'un intérêt moratoire de 5 % seront à votre charge. Si le montant n'est pas supportable en une fois, veuillez nous contacter – un paiement échelonné est en général possible.",
    },
  },
  it: {
    1: {
      einleitung: 'la nostra fattura indicata qui sotto risulta ancora aperta. Probabilmente è stata dimenticata – la preghiamo gentilmente di versare l’importo entro la data indicata.',
      folge: 'Se il suo pagamento si è incrociato con questa lettera, la consideri nulla.',
    },
    2: {
      einleitung: 'nonostante il nostro promemoria di pagamento, la fattura indicata qui sotto risulta ancora aperta. La preghiamo di versare l’importo entro la data indicata.',
      folge: 'Per il lavoro supplementare addebitiamo spese di sollecito. Se il suo pagamento si è incrociato con questa lettera, la consideri nulla.',
    },
    3: {
      einleitung: 'dopo il promemoria di pagamento e il primo sollecito non abbiamo ricevuto alcun pagamento. La fattura indicata qui sotto risulta ancora aperta.',
      folge: "Se l'importo non ci perviene entro la data indicata, affideremo il credito all'esecuzione (LEF). Le spese e un interesse di mora del 5 % saranno a suo carico. Se l'importo non è sostenibile in una sola volta, ci contatti – di regola è possibile un pagamento rateale.",
    },
  },
};

/** Begrüssung + Einleitung und Folgesatz einer Stufe in der Dokumentsprache */
export function stufenText(stufe: Mahnstufe, sprache: BelegSprache, o: { name: string; anrede?: string | null; frist: string }) {
  const D = DOK[sprache];
  const t = TEXTE[sprache][stufe];
  const nachname = o.name.trim().split(/\s+/).slice(-1)[0] ?? '';
  const gruss =
    sprache === 'de'
      ? o.anrede === 'Frau'
        ? `Sehr geehrte Frau ${nachname}`
        : o.anrede === 'Herr'
          ? `Sehr geehrter Herr ${nachname}`
          : `Guten Tag ${o.name}`
      : sprache === 'en'
        ? o.anrede === 'Frau'
          ? `Dear Ms ${nachname}`
          : o.anrede === 'Herr'
            ? `Dear Mr ${nachname}`
            : `Dear ${o.name}`
        : sprache === 'fr'
          ? o.anrede === 'Frau'
            ? 'Chère Madame'
            : o.anrede === 'Herr'
              ? 'Cher Monsieur'
              : `Bonjour ${o.name}`
          : o.anrede === 'Frau'
            ? 'Gentile Signora'
            : o.anrede === 'Herr'
              ? 'Gentile Signore'
              : `Buongiorno ${o.name}`;
  return {
    bezeichnung: stufeName(stufe, sprache),
    einleitung: `${gruss}${sprache === 'de' ? '' : ','}\n\n${t.einleitung.charAt(0).toUpperCase() + t.einleitung.slice(1)}`,
    schluss: `${fuell(D.mahnZahlenBis, { frist: o.frist })} ${t.folge}`,
  };
}

/** Gebühr einer Stufe (Rappen); Einstellungen der Firma, sonst Standard */
export const mahngebuehr = (stufe: Mahnstufe, f?: { mahnGebuehr2Rp?: number; mahnGebuehr3Rp?: number }) =>
  stufe === 1 ? 0 : stufe === 2 ? (f?.mahnGebuehr2Rp ?? GEBUEHR_STANDARD_RP[2]) : (f?.mahnGebuehr3Rp ?? GEBUEHR_STANDARD_RP[3]);

const TAG = 86_400_000;
const tagNr = (d: Date) => Math.floor((d.getTime() + 2 * 3600_000) / TAG); // Zürcher Tag (ohne Sommerzeit-Genauigkeit)
export const tagePlus = (d: Date, n: number) => new Date(d.getTime() + n * TAG);

export type Mahnkandidat = { status: string; faelligAm: Date | null; mahnstufe: number; mahnfristBis: Date | null; offenRp: number };
export type Mahnvorschlag = { stufe: Mahnstufe; faellig: boolean; ab: Date; tageUeberfaellig: number; gebuehrRp: number; bezeichnung: string };

/** Nächste Mahnstufe einer Rechnung; null = keine Mahnung möglich (Entwurf, bezahlt, storniert, Stufe 3 erreicht). */
export function mahnvorschlag(r: Mahnkandidat, heute: Date, f?: { mahnGebuehr2Rp?: number; mahnGebuehr3Rp?: number }): Mahnvorschlag | null {
  if (!['offen', 'teilbezahlt'].includes(r.status) || r.offenRp <= 0 || !r.faelligAm) return null;
  if (r.mahnstufe >= 3) return null;
  const stufe = (r.mahnstufe + 1) as Mahnstufe;
  const nachAlter = tagePlus(r.faelligAm, ABTAGE[stufe]);
  const nachFrist = r.mahnfristBis ? tagePlus(r.mahnfristBis, 1) : nachAlter;
  const ab = nachAlter > nachFrist ? nachAlter : nachFrist;
  return {
    stufe,
    faellig: tagNr(heute) >= tagNr(ab),
    ab,
    tageUeberfaellig: Math.max(0, tagNr(heute) - tagNr(r.faelligAm)),
    gebuehrRp: mahngebuehr(stufe, f),
    bezeichnung: stufeName(stufe),
  };
}

export const mahnBetreff = (stufe: Mahnstufe, nummer: string, sprache: BelegSprache = 'de') =>
  `${stufeName(stufe, sprache)} – ${DOK[sprache].rechnung} ${nummer}`;
