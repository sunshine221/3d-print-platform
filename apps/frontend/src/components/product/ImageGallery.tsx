'use client';

import { useState } from 'react';
import type { ProductImage } from '@3d-print/types';

interface Props {
  images: ProductImage[];
}

export default function ImageGallery({ images }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-void-800 rounded-lg flex items-center justify-center text-void-500 border border-white/5">
        暂无图片
      </div>
    );
  }

  const current = images[active] ?? images[0];
  if (!current) return null;

  return (
    <div>
      <div className="aspect-square bg-void-800 rounded-lg overflow-hidden mb-4 border border-white/5">
        <img
          src={current.url}
          alt={current.altText || ''}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded border-2 shrink-0 overflow-hidden transition-colors ${
                i === active
                  ? 'border-cyber-400 shadow-glow-cyan-sm'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
