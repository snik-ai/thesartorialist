// Bezeichnungen, Statusketten und Kategorien für Leads, Angebote, Aufträge und Rechnungen (Browser + Server).
import type { AngebotStatus, AuftragStatus, KontaktStatus, LeadPhase, RechnungStatus, ZahlungArt } from '@/lib/db/schema';

export const KONTAKT_STATUS: Record<KontaktStatus, string> = { lead: 'Lead', kunde: 'Kunde', inaktiv: 'Inaktiv' };

export const LEAD_PHASEN: { key: LeadPhase; label: string; text: string }[] = [
  { key: 'neu', label: 'Neu', text: 'Anfrage eingegangen' },
  { key: 'termin', label: 'Termin vereinbart', text: 'Beratung bestätigt oder erfolgt' },
  { key: 'angebot', label: 'Angebot offen', text: 'Angebot verschickt, Antwort ausstehend' },
  { key: 'gewonnen', label: 'Gewonnen', text: 'Angebot angenommen — jetzt Kunde' },
  { key: 'verloren', label: 'Verloren', text: 'Kein Auftrag' },
];
export const LEAD_LABEL = Object.fromEntries(LEAD_PHASEN.map((p) => [p.key, p.label])) as Record<LeadPhase, string>;

export const ANGEBOT_STATUS: Record<AngebotStatus | 'abgelaufen', string> = {
  entwurf: 'Entwurf',
  gesendet: 'Gesendet',
  angenommen: 'Angenommen',
  abgelehnt: 'Abgelehnt',
  storniert: 'Storniert',
  abgelaufen: 'Abgelaufen',
};

/** Gesendet, aber Gültigkeit vorbei → «abgelaufen» (nur Anzeige, die Annahme ist dann gesperrt). */
export function angebotAnzeigeStatus(a: { status: AngebotStatus; gueltigBis: Date | null }, jetzt = new Date()): AngebotStatus | 'abgelaufen' {
  if (a.status === 'gesendet' && a.gueltigBis && a.gueltigBis.getTime() < jetzt.getTime() - 86400_000 + 1) return 'abgelaufen';
  return a.status;
}

/** Statuskette eines Auftrags in der Massschneiderei */
export const AUFTRAG_SCHRITTE: { key: AuftragStatus; label: string; kurz: string; text: string }[] = [
  { key: 'mass', label: 'Mass genommen', kurz: 'Mass', text: 'Termin zum Massnehmen, Massblatt erfasst' },
  { key: 'bestellt', label: 'Stoff & Material bestellt', kurz: 'Bestellt', text: 'Stoff, Futter und Knöpfe bestellt' },
  { key: 'produktion', label: 'In Produktion', kurz: 'Produktion', text: 'Bei der Manufaktur, Liefertermin eingetragen' },
  { key: 'eingang', label: 'Eingang im Atelier', kurz: 'Eingang', text: 'Ware ist im Atelier eingetroffen' },
  { key: 'anprobe', label: 'Anprobe', kurz: 'Anprobe', text: 'Anprobe-Termin mit dem Kunden' },
  { key: 'aenderung', label: 'Änderungen', kurz: 'Änderung', text: 'Feinanpassungen nach der Anprobe' },
  { key: 'fertig', label: 'Fertig · abholbereit', kurz: 'Abholbereit', text: 'Kunde informieren, Abholung vereinbaren' },
  { key: 'abgeholt', label: 'Abgeholt', kurz: 'Abgeholt', text: 'Übergabe erfolgt' },
  { key: 'abgeschlossen', label: 'Abgeschlossen', kurz: 'Abgeschlossen', text: 'Bezahlt und erledigt' },
];
export const AUFTRAG_LABEL: Record<AuftragStatus, string> = {
  ...(Object.fromEntries(AUFTRAG_SCHRITTE.map((s) => [s.key, s.label])) as Record<AuftragStatus, string>),
  storniert: 'Storniert',
};
export const schrittIndex = (s: AuftragStatus) => AUFTRAG_SCHRITTE.findIndex((x) => x.key === s);
export const naechsterSchritt = (s: AuftragStatus): AuftragStatus | null => {
  const i = schrittIndex(s);
  return i >= 0 && i < AUFTRAG_SCHRITTE.length - 1 ? AUFTRAG_SCHRITTE[i + 1].key : null;
};

export const RECHNUNG_STATUS: Record<RechnungStatus | 'ueberfaellig', string> = {
  entwurf: 'Entwurf',
  offen: 'Offen',
  teilbezahlt: 'Teilbezahlt',
  bezahlt: 'Bezahlt',
  storniert: 'Storniert',
  ueberfaellig: 'Überfällig',
};
export function rechnungAnzeigeStatus(r: { status: RechnungStatus; faelligAm: Date | null }, jetzt = new Date()): RechnungStatus | 'ueberfaellig' {
  if ((r.status === 'offen' || r.status === 'teilbezahlt') && r.faelligAm && r.faelligAm.getTime() < jetzt.getTime() - 86400_000) return 'ueberfaellig';
  return r.status;
}
export const RECHNUNG_ART = { rechnung: 'Rechnung', anzahlung: 'Anzahlungsrechnung', schluss: 'Schlussrechnung' } as const;

export const ZAHLUNG_ART: Record<ZahlungArt, string> = { bank: 'Banküberweisung', twint: 'TWINT', karte: 'Karte', bar: 'Bar' };

/** Kategorien der Positionen (Massschneiderei) */
export const KATEGORIEN: { key: string; label: string }[] = [
  { key: 'massanzug', label: 'Massanzug' },
  { key: 'sakko', label: 'Sakko' },
  { key: 'hose', label: 'Hose' },
  { key: 'weste', label: 'Weste' },
  { key: 'hemd', label: 'Hemd' },
  { key: 'smoking', label: 'Smoking' },
  { key: 'mantel', label: 'Mantel' },
  { key: 'aenderung', label: 'Änderungen' },
  { key: 'stoffzuschlag', label: 'Stoffzuschlag' },
  { key: 'accessoire', label: 'Accessoires' },
  { key: 'sonstiges', label: 'Sonstiges' },
];
export const KATEGORIE_LABEL = Object.fromEntries(KATEGORIEN.map((k) => [k.key, k.label])) as Record<string, string>;
