import type { Metadata } from 'next';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { brauchtAdmin } from '@/lib/admin/zugang';
import { istFrisch } from '@/lib/admin/sitzung';
import { mailBereit } from '@/lib/mail';
import { TZ } from '@/lib/zeit';
import Passkeys from '@/components/admin/Passkeys';

export const metadata: Metadata = { title: 'Einstellungen' };
export const dynamic = 'force-dynamic';

export default async function EinstellungenPage() {
  const s = await brauchtAdmin();
  const liste = await db()
    .select({ id: schema.passkey.id, name: schema.passkey.name, erstelltAm: schema.passkey.erstelltAm, zuletztBenutzt: schema.passkey.zuletztBenutzt })
    .from(schema.passkey)
    .where(eq(schema.passkey.adminUserId, s.user.id))
    .orderBy(asc(schema.passkey.erstelltAm));
  const fmt = (d: Date | null) => (d ? d.toLocaleString('de-CH', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null);

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Konto</span>
          <h1>Einstellungen</h1>
          <p className="a-sub">Angemeldet als {s.user.email}</p>
        </div>
      </div>
      <div className="a-zwei">
        <Passkeys
          liste={liste.map((p) => ({ id: p.id, name: p.name ?? 'Passkey', erstellt: fmt(p.erstelltAm)!, zuletzt: fmt(p.zuletztBenutzt) }))}
          darfEinrichten={istFrisch(s) || (s.methode === 'passkey' && liste.length > 0)}
        />
        <div className="a-karte">
          <div className="a-karte-kopf">
            <h2>System</h2>
          </div>
          <div className="a-karte-inhalt">
            <dl className="a-daten">
              <dt>E-Mail-Versand</dt>
              <dd>{mailBereit() ? 'Resend aktiv' : 'Nicht konfiguriert (RESEND_API_KEY / MAIL_FROM)'}</dd>
              <dt>Anmeldung</dt>
              <dd>{s.methode === 'passkey' ? 'mit Passkey' : 'mit E-Mail-Code'}</dd>
              <dt>Weitere Module</dt>
              <dd>Angebote, Aufträge, Rechnungen und Massblätter folgen.</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
