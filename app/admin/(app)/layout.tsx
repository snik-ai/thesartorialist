import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { brauchtAdmin } from '@/lib/admin/zugang';
import Shell from '@/components/admin/Shell';
import PasskeyAngebot from '@/components/admin/PasskeyAngebot';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await brauchtAdmin();
  const [z] = await db().execute<{ termine: number; tasks: number; ueberfaellig: number; leads: number }>(sql`
    select
      (select count(*)::int from termin where status = 'angefragt') as termine,
      (select count(*)::int from auftrag_task t join auftrag a on a.id = t.auftrag_id
         where t.erledigt_am is null and t.faellig_am < now() + interval '1 day' and a.status not in ('abgeschlossen', 'storniert')) as tasks,
      (select count(*)::int from rechnung where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day') as ueberfaellig,
      (select count(*)::int from kontakt where zusammengefuehrt_in is null and status = 'lead' and lead_phase = 'neu') as leads`);
  const [{ passkeys }] = await db()
    .select({ passkeys: sql<number>`count(*)::int` })
    .from(schema.passkey)
    .where(eq(schema.passkey.adminUserId, s.user.id));
  return (
    <Shell email={s.user.email} zaehler={z}>
      <PasskeyAngebot anzahl={passkeys} frisch={Date.now() - s.erstelltAm.getTime() < 10 * 60_000} />
      {children}
    </Shell>
  );
}
