'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Banner } from '@3d-print/types';

interface Props {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const items = banners.length > 0 ? banners : [];

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [items.length, next]);

  if (items.length === 0) {
    return (
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">高精度 3D 打印服务</h1>
          <p className="text-lg mb-8 text-blue-100">多种材质 · 快速交付 · 品质保证</p>
          <Link
            href="/products"
            className="inline-block bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            浏览产品
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gray-900 h-80">
      {items.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title || ''}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              {banner.title && <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>}
              {banner.subtitle && <p className="text-lg text-gray-200">{banner.subtitle}</p>}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  了解更多
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === current ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
