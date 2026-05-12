'use client';

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
        className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors ${
          active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
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

export default function FilterSidebar() {
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
    <aside className="w-60 shrink-0 space-y-6">
      {/* 分类 */}
      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">产品分类</h4>
        <div className="max-h-60 overflow-y-auto">
          {categories.map((node) => (
            <CategoryTreeItem key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* 材质 */}
      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">材质</h4>
        <div className="space-y-1">
          {MATERIAL_LIST.map((m) => (
            <label
              key={m}
              className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer hover:bg-gray-50 ${
                activeMaterial === m ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={activeMaterial === m}
                onChange={() => toggleFilter('material', m)}
                className="rounded"
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* 工艺 */}
      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">打印工艺</h4>
        <div className="space-y-1">
          {TECHNIQUE_LIST.map((t) => (
            <label
              key={t}
              className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer hover:bg-gray-50 ${
                activeTechnique === t ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={activeTechnique === t}
                onChange={() => toggleFilter('technique', t)}
                className="rounded"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* 价格区间 */}
      <div>
        <h4 className="font-medium text-sm text-gray-900 mb-2">价格区间</h4>
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <input
            name="minPrice"
            type="number"
            placeholder="最低"
            defaultValue={minPrice}
            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-400">-</span>
          <input
            name="maxPrice"
            type="number"
            placeholder="最高"
            defaultValue={maxPrice}
            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            确定
          </button>
        </form>
      </div>
    </aside>
  );
}
