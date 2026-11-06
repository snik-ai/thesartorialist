// Nummernkreise AN-2026-0001 (Angebot), AU-2026-0001 (Auftrag), RE-2026-0001 (Rechnung) — atomar per Upsert.
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { TZ } from '@/lib/zeit';

type Tx = Parameters<Parameters<ReturnType<typeof db>['transaction']>[0]>[0];
export type Exec = ReturnType<typeof db> | Tx;

export type Praefix = 'AN' | 'AU' | 'RE' | 'MA';

export async function naechsteNummer(x: Exec, praefix: Praefix, jetzt = new Date()): Promise<string> {
  const jahr = Number(jetzt.toLocaleDateString('en-CA', { timeZone: TZ }).slice(0, 4));
  const [r] = await x.execute<{ zaehler: number }>(sql`
    insert into nummernkreis (praefix, jahr, zaehler) values (${praefix}, ${jahr}, 1)
    on conflict (praefix, jahr) do update set zaehler = nummernkreis.zaehler + 1
    returning zaehler`);
  return `${praefix}-${jahr}-${String(r.zaehler).padStart(4, '0')}`;
}
