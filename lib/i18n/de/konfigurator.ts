// Massanzug-Konfigurator «Styles & Options»: Seitentexte, Metadaten, Texte der
// Client-Komponente (ui, inkl. Auswahl-Text für Mail/Termin) und des PDFs (pdf).
import { AUSWAHL_TEXTE_DE, PDF_TEXTE_DE } from '@/lib/konfigurator/texte';

export const konfigurator = {
  meta: {
    titel: 'Styles & Options — Massanzug-Konfigurator',
    /** {anzahl} = Anzahl Optionen im Katalog */
    beschreibung:
      'Massanzug selbst gestalten: {anzahl} Styles & Options für Sakko, Hose, Weste und Smoking — Revers, Knöpfe, Taschen, Futter. Auswahl als PDF speichern und Ihren Anzug nach Mass in Zürich fertigen lassen.',
    ogTitel: 'Massanzug selbst gestalten — Styles & Options, The Sartorialist Zürich',
    ogBeschreibung:
      'Revers, Taschen, Knöpfe und Futter für Ihren Massanzug online wählen — und die Auswahl zum Termin ins Atelier mitbringen.',
  },
  breadcrumb: { massanzug: 'Massanzug', seite: 'Styles & Options' },
  hero: {
    eyebrow: 'Styles & Options · Stil-Konfigurator',
    h1: 'Ihr Massanzug beginnt hier.',
    lead: 'Ihr Stil. Ihr Mass. Ihr Anzug. Entdecken Sie Revers, Knöpfe, Taschen und Verarbeitungsdetails und stellen Sie in Ruhe zusammen, was zu Ihnen passt — wo und wann Sie möchten. Ihre Auswahl bringen Sie zum Termin ins Atelier mit: Dort nehmen wir Mass, wählen mit Ihnen den Stoff und verfeinern jedes Detail, bis der Anzug nicht nur zu Ihrem Körper passt, sondern zu Ihrem Charakter.',
    hinweise: ['Antippen, was gefällt', 'Sie müssen nicht alles wählen', 'Übersicht unten — als PDF oder direkt zum Termin'],
  },
  sogehts: {
    titel: 'Massanzug selbst gestalten — so einfach geht es',
    absaetze: [
      'Ein Massanzug entsteht aus vielen kleinen Entscheidungen. Hier treffen Sie die ersten in Ruhe: Einreiher oder Zweireiher, fallendes oder steigendes Revers, Paspel- oder Pattentaschen, weiche neapolitanische oder klassische Schulter, gefüttert oder ungefüttert. Jede Option ist gezeichnet, damit Sie sehen, was sich verändert.',
      'Wählen Sie nur, was Ihnen wichtig ist. Ihre Auswahl erscheint unten in der Übersicht, lässt sich als PDF speichern und geht mit Ihrer Terminanfrage direkt an uns.',
    ],
  },
  zuerich: {
    titel: 'Ihr Anzug nach Mass in Zürich',
    text: 'Im Atelier an der Kuttelgasse 7 nehmen wir Mass, zeigen Ihnen die Stoffe von Loro Piana, Vitale Barberis Canonico, Holland & Sherry und weiteren Webereien und verfeinern jedes Detail mit Ihnen. Jeder massgeschneiderte Anzug entsteht in Full-Canvas-Verarbeitung, 100 % Made in Italy, ab CHF 1’690 — in 20 Arbeitstagen abholbereit.',
    linkMassanzug: 'Mehr zum Massanzug in Zürich',
    linkHochzeit: 'Hochzeitsanzug nach Mass',
  },
  faqTitel: 'Fragen zum Massanzug-Konfigurator',
  faq: [
    {
      q: 'Kann ich meinen Massanzug online selbst gestalten?',
      a: [
        'Ja. In «Styles & Options» wählen Sie online die Details Ihres Massanzugs — Knopfung, Revers, Taschen, Schulter, Futter, Hosenbund und mehr. Massnehmen und Stoffwahl erfolgen danach persönlich im Atelier in Zürich, damit der Anzug wirklich sitzt.',
      ],
    },
    {
      q: 'Wofür ist der Massanzug-Konfigurator?',
      a: [
        'Im Konfigurator treffen Sie die ersten Stil-Entscheidungen in Ruhe zu Hause: Revers, Knöpfe, Taschen, Schulter, Futter, Hosenbund und Saum. Die Auswahl bringen Sie zum Termin mit — im Atelier nehmen wir Mass, wählen den Stoff und verfeinern jedes Detail gemeinsam.',
      ],
    },
    {
      q: 'Muss ich alle Details auswählen?',
      a: [
        'Nein. Wählen Sie nur, was Ihnen wichtig ist. Alles Offene besprechen wir im Termin, und wir beraten ehrlich, was zu Ihrer Figur und zum Anlass passt.',
      ],
    },
    {
      q: 'Wo wird meine Auswahl gespeichert?',
      a: [
        'Nur in Ihrem Browser auf diesem Gerät. Wir erhalten sie erst, wenn Sie einen Termin mit Ihrer Auswahl anfragen oder sie uns als PDF oder Text schicken.',
      ],
    },
    {
      q: 'Was kostet ein Massanzug mit diesen Details?',
      a: [
        'Unsere Massanzüge beginnen ab CHF 1’690. Der Endpreis hängt vor allem vom Stoff ab und liegt typischerweise bis etwa CHF 2’500. Alle Anzüge entstehen in Full-Canvas-Verarbeitung, 100 % Made in Italy, und sind in 20 Arbeitstagen abholbereit.',
      ],
    },
  ],
  cta: {
    titel: 'Ihre Auswahl steht? Jetzt Masse nehmen lassen.',
    text: 'Bringen Sie Ihre Stil-Auswahl in die kostenlose Beratung an der Kuttelgasse 7 — oder wir rufen Sie zurück und besprechen alles am Telefon.',
  },
  schema: {
    name: 'Massanzug-Konfigurator',
    beschreibung: 'Online-Stilwahl für Massanzüge: Sakko, Hose, Weste und Smoking — Auswahl als PDF und für den Termin im Atelier Zürich.',
  },
  /** Texte der Client-Komponente components/konfigurator/Konfigurator.tsx */
  ui: {
    kategorienAria: 'Kategorien',
    gewaehltAria: '{n} gewählt',
    stoff: 'Stoff',
    meineAuswahl: 'Meine Auswahl',
    brustSeite: 'Brust · Seite',
    detailsZu: 'Details zu {label}',
    stoffSub: 'Die Stoffkollektion von Holland & Sherry',
    stoffText:
      'Seit 1836 webt Holland & Sherry Stoffe für die besten Schneider der Welt. Stöbern Sie in der Kollektion und notieren Sie die Nummern Ihrer Favoriten — wir legen die Muster zu Ihrem Termin im Atelier bereit.',
    stoffBildAlt: 'Stoffe von Holland & Sherry',
    stoffAnsehen: 'Stoffkollektion ansehen',
    neuesFenster: 'Öffnet in neuem Fenster',
    stoffKicker: 'Stoffnummer (optional)',
    stoffPlatzhalter: 'z. B. 9722022',
    stoffAria: 'Stoffnummer',
    hinzufuegen: 'Hinzufügen',
    stoffHinweis:
      'Die Nummer steht auf der Stoffseite unter «Product Code». Mehrere Nummern sind möglich — oder Sie wählen den Stoff einfach im Atelier.',
    stoffEntfernen: 'Stoff {n} entfernen',
    uebersicht: 'Übersicht',
    summaryTitelEins: 'Ihr Massanzug in {n} Details',
    summaryTitelMehr: 'Ihr Massanzug in {n} Details',
    summaryText: 'Gespeichert in diesem Browser. Mass nehmen wir gemeinsam im Atelier — dort verfeinern wir jedes Detail.',
    reset: 'Alles zurücksetzen',
    stoffGruppe: 'Stoff · Holland & Sherry',
    stoffnummer: 'Stoffnummer',
    leerTitel: 'Noch nichts gewählt.',
    leerText: 'Tippen Sie oben auf Revers, Taschen, Knöpfe und Futter — Ihre Auswahl erscheint hier.',
    leerKnopf: 'Mit dem Sakko beginnen',
    entfernen: '{label} entfernen',
    terminKnopf: 'Termin mit dieser Auswahl buchen',
    pdfKnopf: 'PDF herunterladen',
    pdfLaeuft: 'PDF wird erstellt …',
    pdfFertig: 'PDF heruntergeladen',
    pdfFehler: 'PDF konnte nicht erstellt werden',
    dockLeer: 'Ihre Übersicht',
    dockEins: '{n} Detail gewählt',
    dockMehr: '{n} Details gewählt',
    dockText: 'Sie müssen nicht alles wählen — den Rest besprechen wir im Atelier.',
    dockGo: 'Zur Übersicht',
    schliessen: 'Schliessen',
    code: 'Code {code}',
    brusttasche: 'Brusttasche:',
    seitentaschen: 'Seitentaschen:',
    abwaehlen: 'Auswahl entfernen',
    waehlen: 'Dieses Detail wählen',
    /** Auswahl als Text (Übersicht, Mail, Terminanfrage) */
    auswahl: AUSWAHL_TEXTE_DE,
  },
  /** Texte des Stil-PDFs (lib/konfigurator/pdf.ts) */
  pdf: PDF_TEXTE_DE,
};
