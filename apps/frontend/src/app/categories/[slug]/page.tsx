'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import FilterSidebar from '@/components/filter/FilterSidebar';
import SearchSortBar from '@/components/filter/SearchSortBar';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Loading from '@/components/ui/Loading';

function findCategoryPath(
  nodes: { id: string; name: string; slug: string; children?: { id: string; name: string; slug: string }[] }[],
  target: string,
): { id: string; name: string; slug: string }[] {
  for (const node of nodes) {
    if (node.slug === target) return [node];
    if (node.children) {
      const found = findCategoryPath(node.children, target);
      if (found.length) return [node, ...found];
    }
  }
  return [];
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const { categories } = useCategories();
  const categoryPath = findCategoryPath(categories, slug);

  const query = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: 20,
    category: slug,
    material: searchParams.get('material') || undefined,
    technique: searchParams.get('technique') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as 'default' | 'newest' | 'price_asc' | 'price_desc' | 'popular') || undefined,
  };

  const { products, pagination, isLoading } = useProducts(query);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: '产品浏览', href: '/products' },
          ...categoryPath.map((c, i) => ({
            label: c.name,
            href: i < categoryPath.length - 1 ? `/categories/${c.slug}` : undefined,
          })),
        ]}
      />

      <h1 className="text-2xl font-bold text-void-100 mt-4 mb-6">
        {categoryPath[categoryPath.length - 1]?.name || slug}
      </h1>

      <div className="flex gap-8">
        <FilterSidebar />
        <div className="flex-1 min-w-0">
          <SearchSortBar />

          {isLoading ? (
            <Loading />
          ) : (
            <>
              {pagination && (
                <p className="text-sm text-void-400 mt-4 mb-6">
                  共 {pagination.total} 个产品
                </p>
              )}
              <ProductGrid products={products} />
              {pagination && <Pagination pagination={pagination} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
