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
      <section className="relative overflow-hidden bg-gradient-to-br from-void-900 via-void-800 to-void-950 text-white">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="scan-line-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyber-400/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-cyber-400/3 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-neon-400/3 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 animate-fade-up gradient-text-cyan">
            高精度 3D 打印服务
          </h1>
          <p className="text-base sm:text-xl mb-8 sm:mb-10 text-void-200 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            多种材质 · 快速交付 · 品质保证
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-cyber-500 text-void-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-cyber-400 transition-all shadow-glow-cyan hover:shadow-glow-cyan hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              浏览产品
              <span>→</span>
            </Link>
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2 bg-white/5 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm border border-white/10 hover:border-cyber-400/30 w-full sm:w-auto justify-center"
            >
              代打询价
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-void-950 h-[280px] sm:h-[360px] md:h-[420px]">
      <div className="absolute inset-0 grid-bg opacity-20 z-10 pointer-events-none" />
      <div className="scan-line-overlay z-10" />
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
          <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-900/60 to-void-900/30" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white px-4">
              {banner.title && (
                <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 gradient-text-cyan drop-shadow-lg">{banner.title}</h2>
              )}
              {banner.subtitle && (
                <p className="text-base sm:text-lg text-void-200 drop-shadow">{banner.subtitle}</p>
              )}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="inline-block mt-6 bg-cyber-500/90 backdrop-blur-sm text-void-900 px-6 py-2.5 rounded-xl font-medium hover:bg-cyber-400 transition-all shadow-glow-cyan"
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-8 h-2.5 bg-cyber-400 shadow-glow-cyan-sm'
                    : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 backdrop-blur-sm text-white/50 hover:bg-white/10 hover:text-cyber-400 transition-all flex items-center justify-center z-30 border border-white/5"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 backdrop-blur-sm text-white/50 hover:bg-white/10 hover:text-cyber-400 transition-all flex items-center justify-center z-30 border border-white/5"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
