'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    fetch('/api/v1/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagePath: pathname, referrer: document.referrer || undefined }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
