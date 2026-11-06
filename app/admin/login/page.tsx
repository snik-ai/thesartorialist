import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { dbBereit } from '@/lib/db';
import { aktuelleSitzung } from '@/lib/admin/sitzung';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Anmelden' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ weiter?: string; fehler?: string }> }) {
  const sp = await searchParams;
  const weiter = sp.weiter && /^\/admin\/[\w\-/]*$/.test(sp.weiter) ? sp.weiter : '/admin/termine/';
  const db = dbBereit();
  if (db && (await aktuelleSitzung())) redirect(weiter);
  return (
    <div className="a-login">
      <div className="a-login-bild" style={{ backgroundImage: 'url(/images/anzug-nach-mass.webp)' }}>
        <b>THE SARTORIALIST</b>
        <span>ZÜRICH · BACKEND</span>
        <i />
      </div>
      <div className="a-login-form">
        <div>
          <span className="a-kicker">Atelier-Backend</span>
          <h1>Anmelden</h1>
          <p className="a-sub">Termine, Kontakte und Reichweite — nur für das Team.</p>
          {db ? <LoginForm weiter={weiter} /> : <p className="a-hinweis rot">Die Datenbank ist nicht konfiguriert (DATABASE_URL fehlt).</p>}
        </div>
      </div>
    </div>
  );
}
