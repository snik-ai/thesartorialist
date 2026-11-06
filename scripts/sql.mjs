// Kleine SQL-Abfrage gegen die lokale Datenbank (.env.local): node scripts/sql.mjs "select …"
import postgres from 'postgres';
import { readFileSync } from 'node:fs';
const url = process.env.DATABASE_URL ?? readFileSync('.env.local', 'utf8').match(/DATABASE_URL=(.*)/)[1].trim();
const sql = postgres(url);
console.log(JSON.stringify(await sql.unsafe(process.argv[2]), null, 1));
await sql.end();
