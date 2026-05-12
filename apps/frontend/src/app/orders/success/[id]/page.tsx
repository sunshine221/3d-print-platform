'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-6 text-green-500">&#10003;</div>
      <h1 className="text-2xl font-bold mb-4">下单成功！</h1>
      <p className="text-gray-600 mb-8">
        您的订单已提交，我们会尽快处理。
      </p>
      <div className="space-x-4">
        <Link
          href={`/account/orders/${id}`}
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          查看订单详情
        </Link>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          继续浏览
        </Link>
      </div>
    </div>
  );
}
