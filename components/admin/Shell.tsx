'use client';
// Rahmen des Backends: Seitenleiste (Desktop), Kopf- und Tab-Leiste (Mobil), Service-Worker, Abmelden.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Icon from './Icon';

const HAUPT = [
  { href: '/admin/termine/', label: 'Termine', icon: 'kalender', badge: true },
  { href: '/admin/kontakte/', label: 'Kontakte', icon: 'kontakte' },
  { href: '/admin/reichweite/', label: 'Reichweite', icon: 'chart' },
];
const FOLGT = [
  { href: '/admin/angebote/', label: 'Angebote', icon: 'dokument' },
  { href: '/admin/auftraege/', label: 'Aufträge', icon: 'auftrag' },
  { href: '/admin/rechnungen/', label: 'Rechnungen', icon: 'rechnung' },
  { href: '/admin/massblaetter/', label: 'Massblätter', icon: 'mass' },
];

export default function Shell({ email, offen, children }: { email: string; offen: number; children: React.ReactNode }) {
  const pfad = usePathname() ?? '';
  const router = useRouter();
  const aktiv = (href: string) => (pfad.startsWith(href) ? 'page' : undefined);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' }).catch(() => {});
  }, []);

  async function abmelden() {
    await fetch('/api/login/abmelden/', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login/');
    router.refresh();
  }

  const badge = offen > 0 ? <span className="a-badge zahl">{offen}</span> : null;

  return (
    <div className="a-shell">
      <aside className="a-side">
        <Link href="/admin/termine/" className="a-brand">
          <b>THE SARTORIALIST</b>
          <span>Backend</span>
          <i />
        </Link>
        <nav className="a-nav" aria-label="Backend">
          {HAUPT.map((n) => (
            <Link key={n.href} href={n.href} aria-current={aktiv(n.href)}>
              <Icon name={n.icon} />
              {n.label}
              {n.badge && badge}
            </Link>
          ))}
          <div className="a-nav-titel">Atelier · folgt</div>
          {FOLGT.map((n) => (
            <Link key={n.href} href={n.href} aria-current={aktiv(n.href)} className="a-folgt">
              <Icon name={n.icon} />
              {n.label}
              <em>folgt</em>
            </Link>
          ))}
          <div className="a-nav-titel">Konto</div>
          <Link href="/admin/einstellungen/" aria-current={aktiv('/admin/einstellungen/')}>
            <Icon name="einstellungen" />
            Einstellungen
          </Link>
        </nav>
        <div className="a-side-fuss">
          <div className="a-wer" title={email}>
            {email}
          </div>
          <button type="button" onClick={abmelden}>
            Abmelden
          </button>
        </div>
      </aside>

      <header className="a-topbar">
        <Link href="/admin/termine/">
          <b>THE SARTORIALIST</b>
          <small>BACKEND</small>
        </Link>
        <button type="button" onClick={abmelden} aria-label="Abmelden" style={{ color: '#cfcac0', display: 'inline-flex' }}>
          <Icon name="abmelden" width={22} height={22} />
        </button>
      </header>

      <div className="a-main">{children}</div>

      <nav className="a-tabbar" aria-label="Backend mobil">
        {HAUPT.map((n) => (
          <Link key={n.href} href={n.href} aria-current={aktiv(n.href)}>
            <Icon name={n.icon} />
            {n.label}
            {n.badge && badge}
          </Link>
        ))}
        <Link href="/admin/einstellungen/" aria-current={aktiv('/admin/einstellungen/') ?? (FOLGT.some((f) => pfad.startsWith(f.href)) ? 'page' : undefined)}>
          <Icon name="mehr" />
          Mehr
        </Link>
      </nav>
    </div>
  );
}
