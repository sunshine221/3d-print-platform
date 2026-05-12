'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { createInquiry, getProductBySlug } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/Loading';

export default function InquiryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  const productSlug = searchParams.get('productSlug') || '';

  const { data: product } = useSWR(
    productSlug ? ['inquiry-product', productSlug] : null,
    () => getProductBySlug(productSlug),
  );

  const [desiredMaterial, setDesiredMaterial] = useState('');
  const [desiredColor, setDesiredColor] = useState('');
  const [desiredQuantity, setDesiredQuantity] = useState(1);
  const [desiredSize, setDesiredSize] = useState('');
  const [desiredDeadline, setDesiredDeadline] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setContactName((user as any).defaultContactName || user.name || '');
      setContactPhone((user as any).defaultContactPhone || '');
    }
  }, [user]);

  if (authLoading) return <Loading />;

  if (!isLoggedIn) {
    const redirectUrl = productSlug
      ? `/login?redirect=/inquiry?productSlug=${productSlug}`
      : '/login?redirect=/inquiry';
    router.push(redirectUrl);
    return null;
  }

  const productData = product as any;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result: any = await createInquiry({
        productId: productData?.id,
        desiredMaterial: desiredMaterial || undefined,
        desiredColor: desiredColor || undefined,
        desiredQuantity: desiredQuantity || undefined,
        desiredSize: desiredSize || undefined,
        desiredDeadline: desiredDeadline || undefined,
        additionalNotes: additionalNotes || undefined,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
      });
      router.push(`/account/inquiries/${result.id}`);
    } catch (err: any) {
      setError(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">代打服务</h1>
      <p className="text-gray-600 mb-8">
        请描述您的需求，我们的团队将评估并提供报价。
      </p>

      <form onSubmit={handleSubmit}>
        <div className="border rounded-lg p-6 mb-6 space-y-4">
          <h2 className="font-medium">需求信息</h2>

          {productData && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">关联产品</label>
              <input
                type="text"
                value={productData.name}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">期望材质</label>
              <input
                type="text"
                value={desiredMaterial}
                onChange={(e) => setDesiredMaterial(e.target.value)}
                placeholder="如 PLA、ABS、树脂"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">期望颜色</label>
              <input
                type="text"
                value={desiredColor}
                onChange={(e) => setDesiredColor(e.target.value)}
                placeholder="如 白色、黑色"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">数量</label>
              <input
                type="number"
                min={1}
                value={desiredQuantity}
                onChange={(e) => setDesiredQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">期望尺寸</label>
              <input
                type="text"
                value={desiredSize}
                onChange={(e) => setDesiredSize(e.target.value)}
                placeholder="如 10cm × 5cm × 3cm"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">期望交期</label>
            <input
              type="date"
              value={desiredDeadline}
              onChange={(e) => setDesiredDeadline(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">附加说明</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              placeholder="请描述您的具体需求、用途、精度要求等..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border rounded-lg p-6 mb-6 space-y-4">
          <h2 className="font-medium">联系信息</h2>
          <div>
            <label className="block text-sm text-gray-700 mb-1">联系人</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">联系电话</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {submitting ? '提交中...' : '提交询价'}
        </button>
      </form>
    </div>
  );
}
