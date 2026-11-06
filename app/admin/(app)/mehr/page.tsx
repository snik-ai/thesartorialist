import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { NAV } from '@/components/admin/navigation';

export const metadata: Metadata = { title: 'Mehr' };

// Mobil: alle Bereiche des Backends als grosse Kacheln
export default function MehrPage() {
  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Backend</span>
          <h1>Alle Bereiche</h1>
        </div>
      </div>
      {NAV.filter((g) => g.titel).map((g) => (
        <section key={g.titel} style={{ marginBottom: 20 }}>
          <span className="a-kicker">{g.titel}</span>
          <div className="a-kacheln">
            {g.eintraege.map((e) => (
              <Link key={e.href} href={e.href} className="a-kachel">
                <Icon name={e.icon} />
                <b>{e.label}</b>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
