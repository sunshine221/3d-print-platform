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
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        暂无图片
      </div>
    );
  }

  const current = images[active] ?? images[0];
  if (!current) return null;

  return (
    <div>
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
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
                i === active ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
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
