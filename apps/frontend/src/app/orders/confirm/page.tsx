'use client';

import { Suspense, useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { getProductBySlug, createOrder } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { PriceDisplay } from '@3d-print/ui';
import Loading from '@/components/ui/Loading';

const inputClass = 'w-full px-3 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded-lg text-void-800 dark:text-void-200 placeholder:text-void-400 dark:placeholder:text-void-500 focus:outline-none focus:ring-2 focus:ring-cyber-500 dark:focus:ring-cyber-400 focus:border-transparent';
const labelClass = 'block text-sm text-void-600 dark:text-void-300 mb-1';

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  const skuId = searchParams.get('skuId') || '';
  const productSlug = searchParams.get('productSlug') || '';
  const qty = Number(searchParams.get('quantity')) || 1;

  const { data: product, isLoading: productLoading } = useSWR(
    productSlug ? ['confirm-product', productSlug] : null,
    () => getProductBySlug(productSlug),
  );

  const [quantity, setQuantity] = useState(qty);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setContactName((user as any).defaultContactName || user.name || '');
      setContactPhone((user as any).defaultContactPhone || '');
      setShippingAddress((user as any).defaultAddress || '');
    }
  }, [user]);

  if (authLoading || productLoading) return <Loading />;

  if (!isLoggedIn) {
    router.push(`/login?redirect=/orders/confirm?skuId=${skuId}&productSlug=${productSlug}&quantity=${quantity}`);
    return null;
  }

  if (!product) return <p className="text-center py-16 text-void-500 dark:text-void-400">产品信息加载失败</p>;

  const productData = product as any;
  const sku = productData.skus?.find((s: any) => s.id === skuId);
  if (!sku) return <p className="text-center py-16 text-void-500 dark:text-void-400">SKU 不存在</p>;

  const totalPrice = sku.price * quantity;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result: any = await createOrder({
        items: [{ productId: productData.id, skuId: sku.id, quantity }],
        contactName,
        contactPhone,
        shippingAddress,
        note: note || undefined,
      });
      router.push(`/orders/success/${result.id}`);
    } catch (err: any) {
      setError(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-void-900 dark:text-void-100">确认订单</h1>

      <div className="card-dark p-6 mb-6">
        <h2 className="font-medium text-void-900 dark:text-void-100 mb-3">商品信息</h2>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium text-void-900 dark:text-void-100">{productData.name}</p>
            <p className="text-sm text-void-500 dark:text-void-400">SKU: {sku.skuCode}</p>
            <p className="text-sm text-void-500 dark:text-void-400">
              {Object.entries(sku.specCombo).map(([k, v]) => `${k}: ${v}`).join('，')}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-3 border-t border-void-200 dark:border-white/8 text-sm gap-3">
          <div className="flex items-center gap-2">
            <span className="text-void-500 dark:text-void-400">数量</span>
            <input
              type="number"
              min={sku.minOrderQty || 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 px-2 py-1 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded text-center text-void-800 dark:text-void-200"
            />
          </div>
          <div>
            <span className="text-void-500 dark:text-void-400 mr-2">单价</span>
            <span className="text-void-800 dark:text-void-200"><PriceDisplay price={sku.price} /></span>
          </div>
        </div>
        <div className="text-right mt-3 pt-3 border-t border-void-200 dark:border-white/8">
          <span className="text-void-500 dark:text-void-400 mr-2">合计</span>
          <span className="text-xl font-bold text-cyber-400">
            ¥{(totalPrice / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-dark p-6 mb-6 space-y-4">
          <h2 className="font-medium text-void-900 dark:text-void-100">联系信息</h2>
          <div>
            <label className={labelClass}>联系人 *</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>联系电话 *</label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>收货地址 *</label>
            <textarea
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="gradient-btn w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {submitting ? '提交中...' : '提交订单'}
        </button>
      </form>
    </div>
  );
}

export default function OrderConfirmPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmForm />
    </Suspense>
  );
}
