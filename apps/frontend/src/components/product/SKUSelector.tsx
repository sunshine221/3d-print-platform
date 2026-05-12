'use client';

import { useState, useMemo } from 'react';
import type { SKU } from '@3d-print/types';
import { PriceDisplay } from '@3d-print/ui';

interface Props {
  skus: SKU[];
  onSelect: (sku: SKU) => void;
}

export default function SKUSelector({ skus, onSelect }: Props) {
  // 从 SKU specCombos 中提取所有规格维度
  const dimensions = useMemo(() => {
    const keys = new Set<string>();
    const values = new Map<string, Set<string>>();
    for (const sku of skus) {
      for (const [key, val] of Object.entries(sku.specCombo)) {
        keys.add(key);
        if (!values.has(key)) values.set(key, new Set());
        values.get(key)!.add(val);
      }
    }
    return { keys: Array.from(keys), values };
  }, [skus]);

  const [selected, setSelected] = useState<Record<string, string>>({});

  const matchedSku = useMemo(() => {
    return skus.find((sku) => {
      for (const key of dimensions.keys) {
        if (selected[key] && sku.specCombo[key] !== selected[key]) return false;
      }
      return true;
    });
  }, [skus, selected, dimensions.keys]);

  const handleSelect = (key: string, value: string) => {
    const next = { ...selected, [key]: value };
    setSelected(next);

    // 检查是否完全匹配
    const exact = skus.find((sku) => {
      for (const k of dimensions.keys) {
        if (sku.specCombo[k] !== next[k]) return false;
      }
      return true;
    });
    if (exact) {
      onSelect(exact);
    }
  };

  if (dimensions.keys.length === 0) {
    return (
      <div className="text-gray-400 text-sm">暂无 SKU</div>
    );
  }

  return (
    <div className="space-y-4">
      {dimensions.keys.map((key) => (
        <div key={key}>
          <div className="text-sm font-medium text-gray-700 mb-2">{key}</div>
          <div className="flex flex-wrap gap-2">
            {Array.from(dimensions.values.get(key) || []).map((val) => {
              const isSelected = selected[key] === val;
              return (
                <button
                  key={val}
                  onClick={() => handleSelect(key, val)}
                  className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {matchedSku && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-baseline gap-2">
            <PriceDisplay price={matchedSku.price} />
          </div>
          <div className="text-sm text-gray-500 mt-2 space-y-1">
            <p>编码: {matchedSku.skuCode}</p>
            <p>
              库存:{' '}
              {
                {
                  in_stock: '现货',
                  low_stock: '库存紧张',
                  out_of_stock: '缺货',
                  make_to_order: '接单生产',
                }[matchedSku.stockStatus]
              }
            </p>
            {matchedSku.leadTimeDays && <p>交期: {matchedSku.leadTimeDays} 天</p>}
            {matchedSku.minOrderQty > 1 && <p>起订量: {matchedSku.minOrderQty}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
