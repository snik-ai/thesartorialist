// Hintergrund-Aufgaben im Server-Prozess (gestartet in instrumentation.ts): alle 5 Minuten Termin-Erinnerungen.
// Ein globaler Merker verhindert doppelte Intervalle (Hot Reload); das Advisory-Lock in erinnerung.ts mehrere Instanzen.
const g = globalThis as unknown as { __tsScheduler?: NodeJS.Timeout };

export function starteScheduler() {
  if (g.__tsScheduler || !process.env.DATABASE_URL || process.env.SCHEDULER_AUS === '1') return;
  const lauf = async () => {
    try {
      const { erinnerungenSenden } = await import('./erinnerung');
      const r = await erinnerungenSenden();
      if (r.gesendet || r.fehler) console.log(`[erinnerung] ${r.gesendet} gesendet, ${r.fehler} Fehler (${r.geprueft} fällig)`);
    } catch (err) {
      console.error('[erinnerung] Durchlauf fehlgeschlagen:', (err as Error).message);
    }
  };
  setTimeout(lauf, 30_000).unref?.();
  g.__tsScheduler = setInterval(lauf, 5 * 60_000);
  g.__tsScheduler.unref?.();
  console.log('[erinnerung] Scheduler aktiv (alle 5 Minuten)');
}
