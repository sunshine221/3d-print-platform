'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SearchSortBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'default';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'default') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const value = (form.elements.namedItem('search') as HTMLInputElement).value;
    updateParam('search', value);
  };

  return (
    <div className="flex items-center gap-4">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <input
          name="search"
          type="text"
          placeholder="搜索产品..."
          defaultValue={search}
          className="w-full px-4 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded-lg text-void-800 dark:text-void-200 placeholder:text-void-400 dark:placeholder:text-void-500 focus:outline-none focus:ring-2 focus:ring-cyber-500 dark:focus:ring-cyber-400 text-sm"
        />
      </form>
      <select
        value={sort}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="px-3 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded-lg text-sm text-void-800 dark:text-void-200 focus:outline-none focus:ring-2 focus:ring-cyber-500 dark:focus:ring-cyber-400"
      >
        <option value="default">默认排序</option>
        <option value="newest">最新发布</option>
        <option value="price_asc">价格从低到高</option>
        <option value="price_desc">价格从高到低</option>
        <option value="popular">最受欢迎</option>
      </select>
    </div>
  );
}
