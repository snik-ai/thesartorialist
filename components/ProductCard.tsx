import Link from 'next/link';
import type { Piece } from '@/lib/collection';

export default function ProductCard({ piece, lazy = true }: { piece: Piece; lazy?: boolean }) {
  return (
    <Link href={`/kollektion/${piece.slug}/`} className="product-card">
      <div className="product-media">
        <img
          src={piece.image}
          alt={`${piece.name} — ${piece.subtitle}`}
          width={800}
          height={1067}
          loading={lazy ? 'lazy' : 'eager'}
        />
        <span className="product-tag">{piece.category}</span>
        <span className="product-cta">Termin buchen →</span>
      </div>
      <div className="product-info">
        <h3>{piece.name}</h3>
        <p className="sub">{piece.subtitle}</p>
        <p className="price">{piece.price}</p>
      </div>
    </Link>
  );
}
