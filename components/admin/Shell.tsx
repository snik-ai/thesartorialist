'use client';
// Rahmen des Backends: Seitenleiste mit Monogramm (Desktop), Kopf- und Tab-Leiste (Mobil), Service-Worker, Abmelden.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { NeuBelegDialog, NeuBelegFab } from './NeuBeleg';

import { NAV, type Eintrag, type Zaehler } from './navigation';

export type { Zaehler };

const TABS: Eintrag[] = [
  { href: '/admin/uebersicht/', label: 'Übersicht', icon: 'uebersicht' },
  { href: '/admin/termine/', label: 'Termine', icon: 'kalender', zahl: 'termine' },
  { href: '/admin/kunden/', label: 'Kunden', icon: 'kunde' },
  { href: '/admin/auftraege/', label: 'Aufträge', icon: 'auftrag', zahl: 'tasks' },
];

export default function Shell({ email, zaehler, children }: { email: string; zaehler: Zaehler; children: React.ReactNode }) {
  const pfad = usePathname() ?? '';
  const router = useRouter();
  const aktiv = (href: string) => (pfad.startsWith(href) ? 'page' : undefined);
  const [neu, setNeu] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' }).catch(() => {});
  }, []);

  async function abmelden() {
    await fetch('/api/login/abmelden/', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login/');
    router.refresh();
  }

  const badge = (e: Eintrag) => {
    const n = e.zahl ? zaehler[e.zahl] : 0;
    return n > 0 ? <span className={`a-badge zahl${e.warn ? ' rot' : ''}`}>{n}</span> : null;
  };
  const tabAktiv = TABS.some((t) => pfad.startsWith(t.href));

  return (
    <div className="a-shell">
      <aside className="a-side">
        <Link href="/admin/uebersicht/" className="a-brand" aria-label="The Sartorialist — Übersicht">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/marke/monogramm-weiss.png" alt="" className="a-brand-mono" width={44} height={35} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/marke/wortmarke-weiss.png" alt="The Sartorialist Zürich" className="a-brand-wort" width={168} height={25} />
          <span>Atelier · Backend</span>
        </Link>
        <button type="button" className="a-side-neu" onClick={() => setNeu(true)}>
          <Icon name="plus" />
          Neues Angebot
        </button>
        <nav className="a-nav" aria-label="Backend">
          {NAV.map((g, i) => (
            <div key={i} className="a-nav-gruppe">
              {g.titel && <div className="a-nav-titel">{g.titel}</div>}
              {g.eintraege.map((n) => (
                <Link key={n.href} href={n.href} aria-current={aktiv(n.href)}>
                  <Icon name={n.icon} />
                  {n.label}
                  {badge(n)}
                </Link>
              ))}
            </div>
          ))}
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
        <Link href="/admin/uebersicht/" className="a-topbar-marke" aria-label="Übersicht">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/marke/monogramm-weiss.png" alt="" width={34} height={27} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/marke/wortmarke-weiss.png" alt="The Sartorialist" width={128} height={19} className="wort" />
        </Link>
        <button type="button" onClick={abmelden} aria-label="Abmelden" className="a-topbar-knopf">
          <Icon name="abmelden" width={22} height={22} />
        </button>
      </header>

      <div className="a-main">{children}</div>
      <NeuBelegFab />
      <NeuBelegDialog art="angebot" offen={neu} onZu={() => setNeu(false)} />

      <nav className="a-tabbar" aria-label="Backend mobil">
        {TABS.map((n) => (
          <Link key={n.href} href={n.href} aria-current={aktiv(n.href)}>
            <Icon name={n.icon} />
            {n.label}
            {badge(n)}
          </Link>
        ))}
        <Link href="/admin/mehr/" aria-current={!tabAktiv ? 'page' : undefined}>
          <Icon name="mehr" />
          Mehr
        </Link>
      </nav>
    </div>
  );
}
