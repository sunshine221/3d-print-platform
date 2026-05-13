'use client';

import Link from 'next/link';
import { useBanners } from '@/hooks/useBanners';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import BannerCarousel from '@/components/home/BannerCarousel';
import CategoryCard from '@/components/home/CategoryCard';
import ProductGrid from '@/components/product/ProductGrid';
import ValueBar from '@/components/home/ValueBar';
import Loading from '@/components/ui/Loading';

export default function HomePage() {
  const { banners, isLoading: bannersLoading } = useBanners();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { products, isLoading: productsLoading } = useProducts({
    sort: 'popular',
    pageSize: 8,
  });

  const topCategories = [...categories]
    .sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0))
    .slice(0, 4);

  return (
    <div className="animate-fade-in">
      <BannerCarousel banners={banners} />

      {/* 热门分类 */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">热门分类</h2>
          <p className="text-gray-500 mt-2">选择您感兴趣的打印类别</p>
        </div>
        {categoriesLoading ? (
          <Loading />
        ) : topCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topCategories.map((cat, i) => (
              <div key={cat.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">暂无分类</p>
        )}
      </section>

      {/* 精选产品 */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">精选产品</h2>
              <p className="text-gray-500 mt-2">高品质 3D 打印产品，满足各种需求</p>
            </div>
            <Link
              href="/products"
              className="group flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              查看全部
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
          {productsLoading ? <Loading /> : <ProductGrid products={products} />}
        </div>
      </section>

      {/* 代打服务入口 */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">代打服务</h2>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            有 3D 模型文件？上传即可获取报价，专业团队为您打印
          </p>
          <Link
            href="/inquiry"
            className="gradient-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-lg"
          >
            上传模型获取报价
            <span className="text-white/80">→</span>
          </Link>
        </div>
      </section>

      <ValueBar />
    </div>
  );
}
