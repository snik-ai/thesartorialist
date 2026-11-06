// Datenbank-Verbindung (postgres.js + Drizzle). Nur serverseitig, nur über DATABASE_URL.
// Eine Verbindung pro Prozess (auch über Hot Reload hinweg), lazy: ohne DATABASE_URL startet die Site trotzdem.
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;
const g = globalThis as unknown as { __tsSql?: postgres.Sql; __tsDb?: Db };

export const dbBereit = () => Boolean(process.env.DATABASE_URL);

export function sqlClient(): postgres.Sql {
  if (!g.__tsSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL fehlt');
    g.__tsSql = postgres(url, { max: 8, idle_timeout: 30, connect_timeout: 10, onnotice: () => {} });
  }
  return g.__tsSql;
}

export function db(): Db {
  if (!g.__tsDb) g.__tsDb = drizzle(sqlClient(), { schema });
  return g.__tsDb;
}

export { schema };
