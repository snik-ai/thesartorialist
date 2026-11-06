// Lädt .env.local (falls vorhanden) für die DB-Skripte. Bestehende Umgebungsvariablen haben Vorrang.
import { existsSync, readFileSync } from 'node:fs';

for (const datei of ['.env.local', '.env']) {
  if (!existsSync(datei)) continue;
  for (const zeile of readFileSync(datei, 'utf8').split('\n')) {
    const m = zeile.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
