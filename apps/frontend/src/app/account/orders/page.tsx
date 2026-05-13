'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { getMyOrders } from '@/lib/api';
import Loading from '@/components/ui/Loading';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_confirmation: { color: 'bg-yellow-100 text-yellow-700', label: '待确认' },
  in_production: { color: 'bg-blue-100 text-blue-700', label: '生产中' },
  shipped: { color: 'bg-purple-100 text-purple-700', label: '已发货' },
  completed: { color: 'bg-green-100 text-green-700', label: '已完成' },
  cancelled: { color: 'bg-gray-100 text-gray-500', label: '已取消' },
};

export default function MyOrdersPage() {
  const { data, isLoading } = useSWR('my-orders', () => getMyOrders({ page: 1, pageSize: 50 }));

  if (isLoading) return <Loading />;

  const orders = (data?.items || []) as Array<{
    id: string;
    orderNo: string;
    totalPrice: number;
    status: string;
    itemCount: number;
    createdAt: string;
  }>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">我的订单</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">暂无订单</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS_MAP[order.status] || { color: 'bg-gray-100 text-gray-600', label: order.status };
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{order.orderNo}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      共 {order.itemCount} 件 · {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${st.color}`}>{st.label}</span>
                    <span className="font-semibold text-gray-900">¥{(order.totalPrice / 100).toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
