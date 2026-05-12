import useSWR from 'swr';
import { getBanners } from '@/lib/api';
import type { Banner } from '@3d-print/types';

export function useBanners() {
  const { data, error, isLoading } = useSWR('banners', getBanners);

  return {
    banners: (data as Banner[]) ?? [],
    isLoading,
    isError: !!error,
  };
}
