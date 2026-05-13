'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import FilterSidebar from '@/components/filter/FilterSidebar';
import SearchSortBar from '@/components/filter/SearchSortBar';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Loading from '@/components/ui/Loading';

function ProductList() {
  const searchParams = useSearchParams();
  const query = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: 20,
    category: searchParams.get('category') || undefined,
    material: searchParams.get('material') || undefined,
    technique: searchParams.get('technique') || undefined,
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as 'default' | 'newest' | 'price_asc' | 'price_desc' | 'popular') || undefined,
  };

  const { products, pagination, isLoading } = useProducts(query);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: '产品浏览' }]} />

      <div className="flex gap-8 mt-6">
        <FilterSidebar />

        <div className="flex-1 min-w-0">
          <SearchSortBar />

          {isLoading ? (
            <Loading />
          ) : (
            <>
              {pagination && (
                <p className="text-sm text-gray-500 mt-4 mb-6">
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  );
}
