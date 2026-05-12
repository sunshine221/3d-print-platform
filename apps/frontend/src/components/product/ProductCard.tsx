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
      className="card group overflow-hidden flex flex-col"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-blue-500 text-lg font-bold">3D</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.minPrice !== null && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-sm font-bold text-red-500 shadow-sm">
            <PriceDisplay price={product.minPrice} />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        {product.subtitle && (
          <p className="text-xs text-gray-500 truncate mt-1">{product.subtitle}</p>
        )}
        <div className="mt-auto pt-3 flex items-center gap-1.5 flex-wrap">
          {product.materials.slice(0, 3).map((m) => (
            <span key={m} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {m}
            </span>
          ))}
          {product.materials.length > 3 && (
            <span className="text-[10px] text-gray-400">+{product.materials.length - 3}</span>
          )}
        </div>
        <div className="mt-2">
          {product.minPrice !== null ? (
            <span className="text-lg font-bold text-red-500">
              <PriceDisplay price={product.minPrice} />
            </span>
          ) : (
            <span className="text-sm text-gray-400">暂无定价</span>
          )}
          {product.maxPrice != null && product.minPrice !== product.maxPrice && (
            <span className="text-xs text-gray-400 ml-1">
              - ¥{(product.maxPrice / 100).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
