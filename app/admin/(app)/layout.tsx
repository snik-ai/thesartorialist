import { and, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { brauchtAdmin } from '@/lib/admin/zugang';
import Shell from '@/components/admin/Shell';
import PasskeyAngebot from '@/components/admin/PasskeyAngebot';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await brauchtAdmin();
  const [{ offen }] = await db()
    .select({ offen: sql<number>`count(*)::int` })
    .from(schema.termin)
    .where(and(eq(schema.termin.status, 'angefragt')));
  const [{ passkeys }] = await db()
    .select({ passkeys: sql<number>`count(*)::int` })
    .from(schema.passkey)
    .where(eq(schema.passkey.adminUserId, s.user.id));
  return (
    <Shell email={s.user.email} offen={offen}>
      <PasskeyAngebot anzahl={passkeys} frisch={Date.now() - s.erstelltAm.getTime() < 10 * 60_000} />
      {children}
    </Shell>
  );
}
