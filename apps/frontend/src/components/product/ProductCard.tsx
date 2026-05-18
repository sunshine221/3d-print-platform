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
      className="card-dark group overflow-hidden flex flex-col"
    >
      <div className="aspect-square bg-void-800 relative overflow-hidden">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-400/20 to-cyber-600/10 flex items-center justify-center border border-cyber-400/10">
              <span className="text-cyber-400 text-lg font-bold">3D</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.minPrice !== null && (
          <div className="absolute top-3 right-3 bg-void-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 text-sm font-bold text-cyber-400 shadow-glow-card border border-white/5 dark:border-white/5">
            <PriceDisplay price={product.minPrice} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-400 via-neon-400 to-cyber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-void-800 dark:text-void-100 truncate group-hover:text-cyber-500 dark:group-hover:text-cyber-400 transition-colors">
          {product.name}
        </h3>
        {product.subtitle && (
          <p className="text-xs text-void-500 dark:text-void-400 truncate mt-1">{product.subtitle}</p>
        )}
        <div className="mt-auto pt-3 flex items-center gap-1.5 flex-wrap">
          {product.materials.slice(0, 3).map((m) => (
            <span key={m} className="text-[10px] bg-void-100 dark:bg-void-700/50 text-void-600 dark:text-void-300 px-2 py-0.5 rounded-full font-medium border border-void-200 dark:border-white/5">
              {m}
            </span>
          ))}
          {product.materials.length > 3 && (
            <span className="text-[10px] text-void-500 dark:text-void-400">+{product.materials.length - 3}</span>
          )}
        </div>
        <div className="mt-2">
          {product.minPrice !== null ? (
            <span className="text-lg font-bold text-cyber-400">
              <PriceDisplay price={product.minPrice} />
            </span>
          ) : (
            <span className="text-sm text-void-400 dark:text-void-500">暂无定价</span>
          )}
          {product.maxPrice != null && product.minPrice !== product.maxPrice && (
            <span className="text-xs text-void-400 dark:text-void-500 ml-1">
              - ¥{(product.maxPrice / 100).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
