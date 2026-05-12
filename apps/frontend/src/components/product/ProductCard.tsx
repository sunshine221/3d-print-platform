import Link from 'next/link';
import type { ProductListItem } from '@3d-print/types';
import { PriceDisplay } from '@3d-print/ui';

interface Props {
  product: ProductListItem;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
            &#9679;
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
        {product.subtitle && (
          <p className="text-sm text-gray-500 truncate mt-1">{product.subtitle}</p>
        )}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {product.materials.slice(0, 3).map((m) => (
            <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {m}
            </span>
          ))}
        </div>
        <div className="mt-3">
          {product.minPrice !== null ? (
            <span className="text-lg font-semibold text-red-500">
              <PriceDisplay price={product.minPrice} />
            </span>
          ) : (
            <span className="text-sm text-gray-400">暂无定价</span>
          )}
          {product.maxPrice != null && product.minPrice !== product.maxPrice && (
            <span className="text-sm text-gray-400 ml-1">
              - ¥{(product.maxPrice / 100).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
