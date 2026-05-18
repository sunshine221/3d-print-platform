'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-4 text-void-900 dark:text-void-100">下单成功！</h1>
      <p className="text-void-500 dark:text-void-400 mb-8">
        您的订单已提交，我们会尽快处理。
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={`/account/orders/${id}`}
          className="inline-block px-6 py-2.5 gradient-btn rounded-lg font-medium text-sm"
        >
          查看订单详情
        </Link>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 border border-void-300 dark:border-white/10 rounded-lg text-void-600 dark:text-void-300 hover:bg-void-100 dark:hover:bg-white/5 transition-colors"
        >
          继续浏览
        </Link>
      </div>
    </div>
  );
}
