import Link from 'next/link';
import { JsonLd, breadcrumbSchema } from './JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';

/** Brotkrumen; «items» ohne Startseite, Hrefs bereits in der Seitensprache (pfad()). */
export default function Breadcrumbs({ lang, items }: { lang: Sprache; items: { name: string; href: string }[] }) {
  const all = [{ name: woerterbuch(lang).allgemein.breadcrumbStart, href: pfad(lang, 'start') }, ...items];
  return (
    <nav className="crumbs container" aria-label="Breadcrumb">
      {all.map((item, i) => (
        <span key={item.href}>
          {i < all.length - 1 ? (
            <>
              <Link href={item.href}>{item.name}</Link>
              <span aria-hidden="true">/</span>
            </>
          ) : (
            <span aria-current="page">{item.name}</span>
          )}
        </span>
      ))}
      <JsonLd data={breadcrumbSchema(all)} />
    </nav>
  );
}
