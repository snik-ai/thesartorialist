// Eingaben eines privaten Kalendereintrags prüfen (gemeinsam für POST und PATCH).
import { txt } from '@/lib/admin/zugang';

export type PrivatDaten = { titel: string; start: Date; ende: Date; ganztaegig: boolean; notiz: string | null; wiederholung: 'woche' | null };

export function privatDaten(b: Record<string, unknown> | null): PrivatDaten | { fehler: string } {
  if (!b) return { fehler: 'Ungültige Anfrage' };
  const titel = txt(b.titel, 120);
  if (!titel) return { fehler: 'Bitte einen Titel eingeben.' };
  const start = typeof b.start === 'string' ? new Date(b.start) : null;
  const ende = typeof b.ende === 'string' ? new Date(b.ende) : null;
  if (!start || !ende || Number.isNaN(start.getTime()) || Number.isNaN(ende.getTime())) return { fehler: 'Bitte Datum und Uhrzeit wählen.' };
  if (ende <= start) return { fehler: 'Das Ende muss nach dem Beginn liegen.' };
  if (ende.getTime() - start.getTime() > 14 * 86400_000) return { fehler: 'Ein Eintrag darf höchstens 14 Tage dauern.' };
  if (Math.abs(start.getTime() - Date.now()) > 3 * 365 * 86400_000) return { fehler: 'Datum ausserhalb des Kalenders.' };
  return { titel, start, ende, ganztaegig: b.ganztaegig === true, notiz: txt(b.notiz, 2000) || null, wiederholung: b.wiederholung === 'woche' ? 'woche' : null };
}
