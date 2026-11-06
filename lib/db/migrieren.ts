// Migrationen einspielen (idempotent, Drizzle-Journal in drizzle.__drizzle_migrations).
// Ein Advisory-Lock verhindert, dass zwei Instanzen gleichzeitig migrieren.
import { existsSync } from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

function ordner() {
  // Standalone-Server wechselt ins Verzeichnis .next/standalone (postbuild kopiert drizzle/ dorthin)
  const kandidaten = [path.join(process.cwd(), 'drizzle'), path.join(process.cwd(), '.next', 'standalone', 'drizzle')];
  return kandidaten.find((k) => existsSync(path.join(k, 'meta', '_journal.json')));
}

export async function migriere(): Promise<'ok' | 'ohne-db' | 'ohne-ordner'> {
  const url = process.env.DATABASE_URL;
  if (!url) return 'ohne-db';
  const migrationsFolder = ordner();
  if (!migrationsFolder) return 'ohne-ordner';
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await sql`select pg_advisory_lock(727274)`;
    await migrate(drizzle(sql), { migrationsFolder });
    await sql`select pg_advisory_unlock(727274)`;
    return 'ok';
  } finally {
    await sql.end({ timeout: 5 });
  }
}
