import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { brauchtAdmin } from '@/lib/admin/zugang';
import Shell from '@/components/admin/Shell';
import NachLogin from '@/components/admin/NachLogin';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await brauchtAdmin();
  const [z] = await db().execute<{ termine: number; tasks: number; ueberfaellig: number; leads: number; ratgeber: number }>(sql`
    select
      (select count(*)::int from termin where status = 'angefragt') as termine,
      (select count(*)::int from auftrag_task t join auftrag a on a.id = t.auftrag_id
         where t.erledigt_am is null and t.faellig_am < now() + interval '1 day' and a.status not in ('abgeschlossen', 'storniert')) as tasks,
      (select count(*)::int from rechnung where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day') as ueberfaellig,
      (select count(*)::int from kontakt where zusammengefuehrt_in is null and status = 'lead' and lead_phase = 'neu') as leads,
      -- PDF-Downloads, deren Lead noch unbearbeitet ist (Phase «neu»)
      (select count(distinct k.id)::int from aktivitaet a join kontakt k on k.id = a.kontakt_id
         where a.daten->>'art' = 'ratgeber' and k.zusammengefuehrt_in is null and k.status = 'lead' and k.lead_phase = 'neu') as ratgeber`);
  const [{ passkeys }] = await db()
    .select({ passkeys: sql<number>`count(*)::int` })
    .from(schema.passkey)
    .where(eq(schema.passkey.adminUserId, s.user.id));
  return (
    <Shell email={s.user.email} zaehler={z}>
      <NachLogin sitzung={s.sitzungId.slice(0, 8)} passkeys={passkeys} frisch={Date.now() - s.erstelltAm.getTime() < 10 * 60_000} />
      {children}
    </Shell>
  );
}
