'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProduct } from '@/hooks/useProduct';
import { getRelatedProducts } from '@/lib/api';
import useSWR from 'swr';
import type { SKU } from '@3d-print/types';
import { PriceDisplay } from '@3d-print/ui';
import ImageGallery from '@/components/product/ImageGallery';
import SKUSelector from '@/components/product/SKUSelector';
import ModelViewer from '@/components/product/ModelViewer';
import ProductGrid from '@/components/product/ProductGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Loading from '@/components/ui/Loading';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { product, isLoading, isError } = useProduct(slug);
  const { data: related } = useSWR(
    slug ? ['related', slug] : null,
    () => getRelatedProducts(slug),
  );

  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [activeTab, setActiveTab] = useState<'images' | 'model3d'>('images');

  if (isLoading) return <Loading />;
  if (isError || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-void-500 dark:text-void-400">
        产品不存在或已下架
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: '产品浏览', href: '/products' },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* 左侧：媒体 */}
        <div>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('images')}
              className={`text-sm pb-2 border-b-2 transition-colors ${
                activeTab === 'images'
                  ? 'border-cyber-400 text-cyber-500 dark:text-cyber-400'
                  : 'border-transparent text-void-500 dark:text-void-400 hover:text-void-800 dark:hover:text-void-200'
              }`}
            >
              产品图片
            </button>
            {product.model3d && (
              <button
                onClick={() => setActiveTab('model3d')}
                className={`text-sm pb-2 border-b-2 transition-colors ${
                  activeTab === 'model3d'
                    ? 'border-cyber-400 text-cyber-400'
                    : 'border-transparent text-void-500 dark:text-void-400 hover:text-void-800 dark:hover:text-void-200'
                }`}
              >
                3D 预览
              </button>
            )}
          </div>

          {activeTab === 'images' ? (
            <ImageGallery images={product.images} />
          ) : (
            <div className="border border-void-200 dark:border-white/5 rounded-lg overflow-hidden">
              <ModelViewer fileUrl={product.model3d?.fileUrl} />
            </div>
          )}
        </div>

        {/* 中间：产品信息 */}
        <div>
          <h1 className="text-2xl font-bold text-void-900 dark:text-void-100">{product.name}</h1>
          {product.subtitle && (
            <p className="text-void-500 dark:text-void-400 mt-2">{product.subtitle}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {product.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="text-xs bg-cyber-400/10 text-cyber-400 px-2 py-1 rounded hover:bg-cyber-400/20 border border-cyber-400/20 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {product.materials.map((m) => (
              <span key={m} className="text-xs bg-void-100 dark:bg-white/5 text-void-600 dark:text-void-300 px-2 py-1 rounded border border-void-200 dark:border-white/5">
                {m}
              </span>
            ))}
            {product.techniques.map((t) => (
              <span
                key={t}
                className="text-xs bg-void-100 dark:bg-white/5 text-void-600 dark:text-void-300 px-2 py-1 rounded border border-void-200 dark:border-white/5"
              >
                {t}
              </span>
            ))}
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="font-medium text-void-800 dark:text-void-100 mb-2">产品描述</h3>
              <p className="text-void-600 dark:text-void-300 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.specs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-void-800 dark:text-void-100 mb-2">规格参数</h3>
              <div className="border border-void-200 dark:border-white/8 rounded-lg divide-y divide-void-200 dark:divide-white/5">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex px-4 py-2.5 text-sm">
                    <span className="text-void-500 dark:text-void-400 w-24 shrink-0">{spec.name}</span>
                    <span className="text-void-800 dark:text-void-200">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.tolerance && (
            <p className="mt-4 text-sm text-void-500 dark:text-void-400">
              公差: {product.tolerance}
            </p>
          )}
        </div>

        {/* 右侧：SKU 选择 + 双 CTA */}
        <div className="lg:border-l lg:border-void-200 dark:lg:border-white/8 lg:pl-8">
          <h3 className="font-medium text-void-800 dark:text-void-100 mb-4">选择规格</h3>
          <SKUSelector skus={product.skus} onSelect={setSelectedSku} />

          <div className="flex flex-col gap-3 mt-6">
            <button
              disabled={!selectedSku}
              onClick={() => {
                if (selectedSku) {
                  router.push(`/orders/confirm?skuId=${selectedSku.id}&productSlug=${slug}&quantity=1`);
                }
              }}
              className="gradient-btn w-full py-3.5 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              立即下单
            </button>
            <Link
              href={`/inquiry?productSlug=${slug}`}
              className="w-full py-3.5 border border-cyber-400/30 text-cyber-400 rounded-xl font-semibold text-center hover:bg-cyber-400/5 hover:border-cyber-400/50 transition-all duration-200"
            >
              代打询价
            </Link>
          </div>
        </div>
      </div>

      {/* 相关产品 */}
      {related && related.length > 0 && (
        <section className="mt-16 pt-8 border-t border-void-200 dark:border-white/8">
          <h2 className="text-xl font-bold text-void-900 dark:text-void-100 mb-6">相关产品</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
