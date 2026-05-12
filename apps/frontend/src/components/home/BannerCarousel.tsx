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
    if (items.length <= 1) return;
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [items.length, next]);

  if (items.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-28 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 animate-fade-up">
            高精度 3D 打印服务
          </h1>
          <p className="text-xl mb-10 text-blue-100 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            多种材质 · 快速交付 · 品质保证
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              浏览产品
              <span>→</span>
            </Link>
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
            >
              代打询价
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gray-900 h-[420px]">
      {items.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-700 ${
            i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title || ''}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              {banner.title && (
                <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">{banner.title}</h2>
              )}
              {banner.subtitle && (
                <p className="text-lg text-gray-200 drop-shadow">{banner.subtitle}</p>
              )}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="inline-block mt-6 bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-2.5 rounded-xl font-medium hover:bg-white transition-all hover:shadow-lg"
                >
                  了解更多
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {items.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-8 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
