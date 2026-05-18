'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import type { CategoryNode } from '@3d-print/types';
import { MATERIAL_LIST, TECHNIQUE_LIST } from '@3d-print/utils';

function CategoryTreeItem({ node, depth = 0 }: { node: CategoryNode; depth?: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const active = searchParams.get('category') === node.slug;

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (active) {
      params.delete('category');
    } else {
      params.set('category', node.slug);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-void-100 dark:hover:bg-white/5 transition-colors ${
          active ? 'bg-cyber-400/10 text-cyber-500 dark:text-cyber-400 font-medium' : 'text-void-600 dark:text-void-300'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {node.name}
      </button>
      {node.children?.length > 0 && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterContent() {
  const { categories } = useCategories();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeMaterial = searchParams.get('material') || '';
  const activeTechnique = searchParams.get('technique') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const min = (form.elements.namedItem('minPrice') as HTMLInputElement).value;
    const max = (form.elements.namedItem('maxPrice') as HTMLInputElement).value;
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* 分类 */}
      <div>
        <h4 className="font-medium text-sm text-void-800 dark:text-void-100 mb-2">产品分类</h4>
        <div className="max-h-60 overflow-y-auto">
          {categories.map((node) => (
            <CategoryTreeItem key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* 材质 */}
      <div>
        <h4 className="font-medium text-sm text-void-800 dark:text-void-100 mb-2">材质</h4>
        <div className="space-y-1">
          {MATERIAL_LIST.map((m) => (
            <label
              key={m}
              className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer hover:bg-void-100 dark:hover:bg-white/5 ${
                activeMaterial === m ? 'text-cyber-500 dark:text-cyber-400' : 'text-void-600 dark:text-void-300'
              }`}
            >
              <input
                type="checkbox"
                checked={activeMaterial === m}
                onChange={() => toggleFilter('material', m)}
                className="rounded accent-cyber-400"
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* 工艺 */}
      <div>
        <h4 className="font-medium text-sm text-void-800 dark:text-void-100 mb-2">打印工艺</h4>
        <div className="space-y-1">
          {TECHNIQUE_LIST.map((t) => (
            <label
              key={t}
              className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer hover:bg-void-100 dark:hover:bg-white/5 ${
                activeTechnique === t ? 'text-cyber-500 dark:text-cyber-400' : 'text-void-600 dark:text-void-300'
              }`}
            >
              <input
                type="checkbox"
                checked={activeTechnique === t}
                onChange={() => toggleFilter('technique', t)}
                className="rounded accent-cyber-400"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* 价格区间 */}
      <div>
        <h4 className="font-medium text-sm text-void-800 dark:text-void-100 mb-2">价格区间</h4>
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <input
            name="minPrice"
            type="number"
            placeholder="最低"
            defaultValue={minPrice}
            className="w-full px-2 py-1.5 text-sm bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded text-void-800 dark:text-void-200 placeholder:text-void-400 dark:placeholder:text-void-500 focus:outline-none focus:ring-1 focus:ring-cyber-500 dark:focus:ring-cyber-400"
          />
          <span className="text-void-400 dark:text-void-500">-</span>
          <input
            name="maxPrice"
            type="number"
            placeholder="最高"
            defaultValue={maxPrice}
            className="w-full px-2 py-1.5 text-sm bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded text-void-800 dark:text-void-200 placeholder:text-void-400 dark:placeholder:text-void-500 focus:outline-none focus:ring-1 focus:ring-cyber-500 dark:focus:ring-cyber-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-cyber-500 text-void-900 rounded hover:bg-cyber-400 font-medium transition-colors"
          >
            确定
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FilterSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 移动端筛选按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded-lg text-sm text-void-700 dark:text-void-200 hover:border-cyber-400/30 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        筛选
        {open ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* 移动端展开的筛选面板 */}
      {open && (
        <div className="md:hidden bg-white dark:bg-void-800 border border-void-200 dark:border-white/8 rounded-xl p-4 animate-slide-down">
          <FilterContent />
        </div>
      )}

      {/* 桌面端固定侧边栏 */}
      <aside className="hidden md:block w-60 shrink-0">
        <FilterContent />
      </aside>
    </>
  );
}
