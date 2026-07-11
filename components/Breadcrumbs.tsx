import Link from 'next/link';
import { JsonLd, breadcrumbSchema } from './JsonLd';

export default function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const all = [{ name: 'Startseite', href: '/' }, ...items];
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
