import Link from 'next/link';
import type { CategoryNode } from '@3d-print/types';

interface Props {
  category: CategoryNode;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card group flex flex-col items-center p-8 text-center"
    >
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 shadow-sm overflow-hidden">
        {category.imageUrl ? (
          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
        ) : category.icon ? (
          <span className="text-3xl">{category.icon}</span>
        ) : (
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
        )}
      </div>
      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {category.name}
      </div>
      {category.description && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{category.description}</p>
      )}
    </Link>
  );
}
