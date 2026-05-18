'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { PaginationInfo } from '@3d-print/types';

interface Props {
  pagination: PaginationInfo;
}

export default function Pagination({ pagination }: Props) {
  const { page, totalPages } = pagination;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded border border-white/10 text-void-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
      >
        上一页
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-void-500">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`px-3 py-1.5 text-sm rounded border ${
              p === page
                ? 'bg-cyber-500 text-void-900 border-cyber-500 font-medium'
                : 'border-white/10 text-void-300 hover:bg-white/5'
            } transition-colors`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded border border-white/10 text-void-300 disabled:opacity-30 hover:bg-white/5 transition-colors"
      >
        下一页
      </button>
    </div>
  );
}
