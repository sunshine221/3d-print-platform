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

  const topCategories = categories.slice(0, 4);

  return (
    <div>
      <BannerCarousel banners={banners} />

      {/* 热门分类 */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">热门分类</h2>
        {categoriesLoading ? (
          <Loading />
        ) : topCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">暂无分类</p>
        )}
      </section>

      {/* 精选产品 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">精选产品</h2>
            <Link href="/products" className="text-blue-500 hover:text-blue-600 text-sm">
              查看全部 →
            </Link>
          </div>
          {productsLoading ? <Loading /> : <ProductGrid products={products} />}
        </div>
      </section>

      {/* 代打服务入口 */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">代打服务</h2>
          <p className="text-gray-600 mb-6">
            有 3D 模型文件？上传即可获取报价，专业团队为您打印
          </p>
          <Link
            href="/inquiry"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            上传模型获取报价
          </Link>
        </div>
      </section>

      <ValueBar />
    </div>
  );
}
