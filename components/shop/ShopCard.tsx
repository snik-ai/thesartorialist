import Link from 'next/link';
import { chf } from '@/lib/shop/format';

export type CardData = {
  handle: string;
  title: string;
  brand: string;
  category: string;
  group: string;
  type: string | null;
  color: string | null;
  gender: string;
  price: number;
  compareAt: number | null;
  available: boolean;
  image: string;
  hover: string | null;
  sizes: string[];
  sizeKeys: string[];
  cutout: string | null;
};

function src(url: string, w: number) {
  const u = new URL(url);
  u.searchParams.set('width', String(w));
  return u.toString();
}

export default function ShopCard({ p, eager = false }: { p: CardData; eager?: boolean }) {
  return (
    <Link href={`/shop/products/${p.handle}/`} className="shop-card">
      <div className="shop-media">
        <img
          src={src(p.image, 600)}
          srcSet={`${src(p.image, 400)} 400w, ${src(p.image, 600)} 600w, ${src(p.image, 900)} 900w`}
          sizes="(max-width: 560px) 50vw, (max-width: 960px) 33vw, 25vw"
          alt={`${p.title} — ${p.brand}`}
          width={600}
          height={800}
          loading={eager ? 'eager' : 'lazy'}
        />
        {p.hover && <img className="shop-hover" src={src(p.hover, 600)} alt="" width={600} height={800} loading="lazy" aria-hidden="true" />}
        {!p.available && <span className="shop-badge">Ausverkauft</span>}
        {p.compareAt && p.available && <span className="shop-badge shop-badge--sale">Sale</span>}
        {p.sizes.length > 0 && <span className="shop-sizes">{p.sizes.join(' · ')}</span>}
      </div>
      <div className="shop-info">
        <span className="shop-brand">{p.brand}</span>
        <h3 className="shop-title">{p.title}</h3>
        <p className="shop-price num">
          {p.compareAt && <s>{chf(p.compareAt)}</s>} {chf(p.price)}
        </p>
      </div>
    </Link>
  );
}
