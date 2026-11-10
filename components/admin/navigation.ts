// Navigation des Backends (gemeinsam für Seitenleiste, Tab-Leiste und die Seite «Mehr»).
export type Zaehler = { termine: number; tasks: number; ueberfaellig: number; leads: number };

export type Eintrag = { href: string; label: string; icon: string; zahl?: keyof Zaehler; warn?: boolean };

export const NAV: { titel: string | null; eintraege: Eintrag[] }[] = [
  { titel: null, eintraege: [{ href: '/admin/uebersicht/', label: 'Übersicht', icon: 'uebersicht' }] },
  {
    titel: 'Kunden',
    eintraege: [
      { href: '/admin/termine/', label: 'Termine', icon: 'kalender', zahl: 'termine' },
      { href: '/admin/leads/', label: 'Leads', icon: 'leads', zahl: 'leads' },
      { href: '/admin/kunden/', label: 'Kunden', icon: 'kunde' },
      { href: '/admin/kontakte/', label: 'Alle Kontakte', icon: 'kontakte' },
    ],
  },
  {
    titel: 'Atelier',
    eintraege: [
      { href: '/admin/angebote/', label: 'Angebote', icon: 'dokument' },
      { href: '/admin/auftraege/', label: 'Aufträge', icon: 'auftrag', zahl: 'tasks' },
      { href: '/admin/rechnungen/', label: 'Rechnungen', icon: 'rechnung', zahl: 'ueberfaellig', warn: true },
      { href: '/admin/produkte/', label: 'Produkte', icon: 'schere' },
      { href: '/admin/massblaetter/', label: 'Massblätter', icon: 'mass' },
    ],
  },
  { titel: 'Auswertung', eintraege: [{ href: '/admin/reichweite/', label: 'Webseitenanalyse', icon: 'chart' }] },
  { titel: 'Konto', eintraege: [{ href: '/admin/einstellungen/', label: 'Einstellungen', icon: 'einstellungen' }] },
];

