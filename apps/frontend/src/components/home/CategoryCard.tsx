import Link from 'next/link';
import type { CategoryNode } from '@3d-print/types';

interface Props {
  category: CategoryNode;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block text-center p-6 border rounded-lg hover:shadow-lg transition-shadow hover:border-blue-200 group"
    >
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        {category.icon ? (
          <span className="text-2xl">{category.icon}</span>
        ) : (
          <span className="text-2xl text-blue-500">&#9679;</span>
        )}
      </div>
      <div className="font-medium text-gray-900">{category.name}</div>
      {category.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
      )}
    </Link>
  );
}
