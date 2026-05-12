import useSWR from 'swr';
import { getPage } from '@/lib/api';
import type { PageContent } from '@3d-print/types';

export function usePage(slug: string | undefined) {
  const { data, error, isLoading } = useSWR(
    slug ? ['page', slug] : null,
    () => getPage(slug!),
  );

  return {
    page: data as PageContent | undefined,
    isLoading,
    isError: !!error,
  };
}
