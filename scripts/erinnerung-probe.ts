// Termin-Erinnerung trocken testen (rendert die fälligen Mails, sendet nichts): `npx tsx scripts/erinnerung-probe.ts`
import './db/env';
import { erinnerungenSenden } from '../lib/crm/erinnerung';
import { sqlClient } from '../lib/db';

async function main() {
  const r = await erinnerungenSenden({ trocken: true });
  console.log(`Fällig: ${r.geprueft}${r.uebersprungen ? ` (übersprungen: ${r.uebersprungen})` : ''}`);
  for (const v of r.vorschau ?? []) console.log(`\n--- an ${v.an}\nBetreff: ${v.betreff}\n${v.text}`);
  await sqlClient().end({ timeout: 5 });
}
main();
