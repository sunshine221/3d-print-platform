import useSWR from 'swr';
import { getCategories } from '@/lib/api';
import type { CategoryNode } from '@3d-print/types';

export function useCategories() {
  const { data, error, isLoading } = useSWR('categories', getCategories);

  return {
    categories: (data as CategoryNode[]) ?? [],
    isLoading,
    isError: !!error,
  };
}
