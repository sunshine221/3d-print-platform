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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              产品图片
            </button>
            {product.model3d && (
              <button
                onClick={() => setActiveTab('model3d')}
                className={`text-sm pb-2 border-b-2 transition-colors ${
                  activeTab === 'model3d'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                3D 预览
              </button>
            )}
          </div>

          {activeTab === 'images' ? (
            <ImageGallery images={product.images} />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <ModelViewer fileUrl={product.model3d?.fileUrl} />
            </div>
          )}
        </div>

        {/* 中间：产品信息 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.subtitle && (
            <p className="text-gray-500 mt-2">{product.subtitle}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {product.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {product.materials.map((m) => (
              <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {m}
              </span>
            ))}
            {product.techniques.map((t) => (
              <span
                key={t}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {t}
              </span>
            ))}
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">产品描述</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.specs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">规格参数</h3>
              <div className="border rounded-lg divide-y">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex px-4 py-2.5 text-sm">
                    <span className="text-gray-500 w-24 shrink-0">{spec.name}</span>
                    <span className="text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.tolerance && (
            <p className="mt-4 text-sm text-gray-500">
              公差: {product.tolerance}
            </p>
          )}
        </div>

        {/* 右侧：SKU 选择 + 双 CTA */}
        <div className="lg:border-l lg:pl-8">
          <h3 className="font-medium text-gray-900 mb-4">选择规格</h3>
          <SKUSelector skus={product.skus} onSelect={setSelectedSku} />

          <div className="flex flex-col gap-3 mt-6">
            <button
              disabled={!selectedSku}
              onClick={() => {
                if (selectedSku) {
                  router.push(`/orders/confirm?skuId=${selectedSku.id}&productSlug=${slug}&quantity=1`);
                }
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              立即下单
            </button>
            <Link
              href={`/inquiry?productSlug=${slug}`}
              className="w-full py-3 border border-blue-500 text-blue-600 rounded-lg font-semibold text-center hover:bg-blue-50 transition-colors"
            >
              代打询价
            </Link>
          </div>
        </div>
      </div>

      {/* 相关产品 */}
      {related && related.length > 0 && (
        <section className="mt-16 pt-8 border-t">
          <h2 className="text-xl font-bold mb-6">相关产品</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
