import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { dbBereit } from '@/lib/db';
import { aktuelleSitzung } from '@/lib/admin/sitzung';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Anmelden' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ weiter?: string; fehler?: string }> }) {
  const sp = await searchParams;
  const weiter = sp.weiter && /^\/admin\/[\w\-/]*$/.test(sp.weiter) ? sp.weiter : '/admin/uebersicht/';
  const db = dbBereit();
  if (db && (await aktuelleSitzung())) redirect(weiter);
  return (
    <div className="a-login">
      <div className="a-login-bild" style={{ backgroundImage: 'url(/images/anzug-nach-mass.webp)' }}>
        <div className="a-login-marke">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mono" src="/images/marke/monogramm-weiss.png" alt="" width={64} height={51} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wort" src="/images/marke/wortmarke-weiss.png" alt="The Sartorialist Zürich" width={320} height={47} />
        </div>
        <span>ATELIER · BACKEND</span>
        <i />
      </div>
      <div className="a-login-form">
        <div>
          <span className="a-kicker">Atelier-Backend</span>
          <h1>Anmelden</h1>
          <p className="a-sub">Anfragen, Kunden, Angebote, Aufträge und Rechnungen — nur für das Team.</p>
          {db ? <LoginForm weiter={weiter} /> : <p className="a-hinweis rot">Die Datenbank ist nicht konfiguriert (DATABASE_URL fehlt).</p>}
        </div>
      </div>
    </div>
  );
}
