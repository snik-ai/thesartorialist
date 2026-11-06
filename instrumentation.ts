// Serverstart: Datenbank-Migrationen einspielen (idempotent). Fehler blockieren die öffentliche Site nicht.
// Der Import steht im NEXT_RUNTIME-Zweig, damit der Edge-Build (Middleware) den DB-Treiber nicht bündelt.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') return;
    try {
      const { migriere } = await import('./lib/db/migrieren');
      const r = await migriere();
      console.log(`[db] Migrationen: ${r}`);
    } catch (err) {
      console.error('[db] Migration fehlgeschlagen:', (err as Error).message);
    }
  }
}
