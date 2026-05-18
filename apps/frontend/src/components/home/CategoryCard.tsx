import Link from 'next/link';
import type { CategoryNode } from '@3d-print/types';

interface Props {
  category: CategoryNode;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card-dark group flex flex-col items-center p-8 text-center h-full"
    >
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyber-500/10 to-cyber-600/5 flex items-center justify-center group-hover:from-cyber-500/20 group-hover:to-cyber-600/10 transition-all duration-300 shadow-glow-cyan-sm overflow-hidden border border-cyber-400/10">
        {category.imageUrl ? (
          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : category.icon ? (
          <span className="text-3xl">{category.icon}</span>
        ) : (
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-cyber-400 to-neon-500 shadow-glow-cyan-sm" />
        )}
      </div>
      <div className="font-semibold text-void-800 dark:text-void-100 group-hover:text-cyber-500 dark:group-hover:text-cyber-400 transition-colors">
        {category.name}
      </div>
      {category.description && (
        <p className="text-xs text-void-500 dark:text-void-400 mt-1.5 line-clamp-2">{category.description}</p>
      )}
    </Link>
  );
}
