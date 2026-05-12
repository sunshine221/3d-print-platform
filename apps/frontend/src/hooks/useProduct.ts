import useSWR from 'swr';
import { getProductBySlug } from '@/lib/api';
import type { ProductDetail } from '@3d-print/types';

export function useProduct(slug: string | undefined) {
  const { data, error, isLoading } = useSWR(
    slug ? ['product', slug] : null,
    () => getProductBySlug(slug!),
  );

  return {
    product: data as ProductDetail | undefined,
    isLoading,
    isError: !!error,
  };
}
