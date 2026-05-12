import useSWR from 'swr';
import { getProducts } from '@/lib/api';
import type { ProductQuery, ProductListItem, PaginationInfo } from '@3d-print/types';

interface UseProductsResult {
  products: ProductListItem[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  isError: boolean;
}

export function useProducts(query: ProductQuery): UseProductsResult {
  const { data, error, isLoading } = useSWR(
    ['products', query],
    () => getProducts(query),
    { keepPreviousData: true },
  );

  return {
    products: data?.items ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    isError: !!error,
  };
}
