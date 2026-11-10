import type { Metadata } from 'next';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { brauchtAdmin } from '@/lib/admin/zugang';
import { istFrisch } from '@/lib/admin/sitzung';
import { mailBereit } from '@/lib/mail';
import { TZ } from '@/lib/zeit';
import Passkeys from '@/components/admin/Passkeys';
import Admins from '@/components/admin/Admins';
import Benachrichtigungen from '@/components/admin/Benachrichtigungen';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { FirmaForm, LogoForm } from '@/components/admin/FirmaEinstellungen';
import { firma, logoDaten } from '@/lib/crm/firma';
import { bankPruefen } from '@/lib/beleg/bank';

export const metadata: Metadata = { title: 'Einstellungen' };
export const dynamic = 'force-dynamic';

export default async function EinstellungenPage() {
  const s = await brauchtAdmin();
  const liste = await db()
    .select({ id: schema.passkey.id, name: schema.passkey.name, erstelltAm: schema.passkey.erstelltAm, zuletztBenutzt: schema.passkey.zuletztBenutzt })
    .from(schema.passkey)
    .where(eq(schema.passkey.adminUserId, s.user.id))
    .orderBy(asc(schema.passkey.erstelltAm));
  const [admins, f, logo] = await Promise.all([db().select().from(schema.adminUser).orderBy(asc(schema.adminUser.erstelltAm)), firma(), logoDaten()]);
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
              <dt>Admins</dt>
              <dd>werden in der Datenbank verwaltet (Karte «Admins»)</dd>
              <dt>Termin-Erinnerung</dt>
              <dd>{f.erinnerungAktiv ? `${String(f.erinnerungStunden).replace('.', ',')} Std. vorher${mailBereit() ? '' : ' (wartet auf Mailversand)'}` : 'ausgeschaltet'}</dd>
              <dt>QR-Rechnung</dt>
              <dd>{bankPruefen(f).kurz}</dd>
            </dl>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <FirmaForm firma={f} />
      </div>
      <div className="a-zwei" style={{ marginTop: 20 }}>
        <div className="a-karte">
          <div className="a-karte-kopf">
            <h2>Preisliste</h2>
          </div>
          <div className="a-karte-inhalt">
            <p className="a-sub" style={{ marginTop: 0, marginBottom: 14 }}>
              Die Preisliste ist jetzt der Produktkatalog: Produkte mit Bild, Preis inkl. MWST, Einheit und Varianten (z. B. Stoffqualität Super 110–180). Sie erscheinen in der Positionssuche von Angebot und Rechnung.
            </p>
            <Link href="/admin/produkte/" className="a-knopf linie">
              <Icon name="schere" /> Produkte verwalten
            </Link>
          </div>
        </div>
        <LogoForm eigenes={Boolean(logo)} />
      </div>
      <div className="a-zwei" style={{ marginTop: 20 }}>
        <Admins liste={admins.map((a) => ({ id: a.id, email: a.email, name: a.name, aktiv: a.aktiv, zuletzt: fmt(a.letzteAnmeldung), ich: a.id === s.user.id }))} />
        <Benachrichtigungen />
      </div>
    </>
  );
}
