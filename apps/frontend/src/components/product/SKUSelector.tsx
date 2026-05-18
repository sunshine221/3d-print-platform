'use client';

import { useState, useMemo, useCallback } from 'react';
import type { SKU } from '@3d-print/types';
import { PriceDisplay } from '@3d-print/ui';

interface Props {
  skus: SKU[];
  onSelect: (sku: SKU | null) => void;
}

export default function SKUSelector({ skus, onSelect }: Props) {
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

  const availableValues = useMemo(() => {
    const avail = new Map<string, Set<string>>();
    const activeFilters = Object.entries(selected).filter(([, v]) => v);
    for (const key of dimensions.keys) {
      const values = new Set<string>();
      for (const sku of skus) {
        let match = true;
        for (const [k, v] of activeFilters) {
          if (k !== key && sku.specCombo[k] !== v) {
            match = false;
            break;
          }
        }
        if (match && sku.specCombo[key]) {
          values.add(sku.specCombo[key]);
        }
      }
      avail.set(key, values);
    }
    return avail;
  }, [skus, selected, dimensions.keys]);

  const matchedSku = useMemo(() => {
    return skus.find((sku) => {
      for (const key of dimensions.keys) {
        if (selected[key] && sku.specCombo[key] !== selected[key]) return false;
      }
      return true;
    });
  }, [skus, selected, dimensions.keys]);

  const handleSelect = useCallback(
    (key: string, value: string) => {
      const next = selected[key] === value ? { ...selected, [key]: '' } : { ...selected, [key]: value };
      setSelected(next);

      const exact = skus.find((sku) => {
        for (const k of dimensions.keys) {
          if (next[k] && sku.specCombo[k] !== next[k]) return false;
        }
        return true;
      });
      onSelect(exact || null);
    },
    [skus, selected, dimensions.keys, onSelect],
  );

  if (dimensions.keys.length === 0) {
    return <div className="text-void-500 dark:text-void-400 text-sm">暂无规格可选</div>;
  }

  return (
    <div className="space-y-4">
      {dimensions.keys.map((key) => {
        const availSet = availableValues.get(key) || new Set();
        return (
          <div key={key}>
            <div className="text-sm font-medium text-void-600 dark:text-void-300 mb-2">{key}</div>
            <div className="flex flex-wrap gap-2">
              {Array.from(dimensions.values.get(key) || []).map((val) => {
                const isSelected = selected[key] === val;
                const isAvailable = availSet.has(val);
                return (
                  <button
                    key={val}
                    onClick={() => isAvailable && handleSelect(key, val)}
                    disabled={!isAvailable}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                      isSelected
                        ? 'border-cyber-400 bg-cyber-400/10 text-cyber-400'
                        : isAvailable
                          ? 'border-void-300 dark:border-white/10 text-void-700 dark:text-void-300 hover:border-void-400 dark:hover:border-white/20 hover:bg-void-100 dark:hover:bg-white/5'
                          : 'border-void-200 dark:border-white/10 text-void-400 dark:text-void-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {matchedSku ? (
        <div className="mt-4 p-4 bg-void-100 dark:bg-white/5 rounded-lg border border-void-200 dark:border-white/8">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyber-400">
              <PriceDisplay price={matchedSku.price} />
            </span>
          </div>
          <div className="text-sm text-void-500 dark:text-void-400 mt-2 space-y-1">
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
      ) : selected && Object.values(selected).some(Boolean) ? (
        <div className="mt-4 p-4 bg-void-100 dark:bg-white/5 rounded-lg border border-void-200 dark:border-white/5 text-sm text-void-500 dark:text-void-500">
          该规格组合暂无库存，请选择其他规格
        </div>
      ) : null}
    </div>
  );
}
