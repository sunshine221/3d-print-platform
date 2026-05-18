'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { getMyOrders } from '@/lib/api';
import Loading from '@/components/ui/Loading';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_confirmation: { color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-400/20', label: '待确认' },
  in_production: { color: 'bg-cyber-400/10 text-cyber-400 border border-cyber-400/20', label: '生产中' },
  shipped: { color: 'bg-neon-400/10 text-neon-400 border border-neon-400/20', label: '已发货' },
  completed: { color: 'bg-green-400/10 text-green-400 border border-green-400/20', label: '已完成' },
  cancelled: { color: 'bg-white/5 text-void-400 border border-white/5', label: '已取消' },
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
      <h2 className="text-lg font-semibold text-void-100 mb-4">我的订单</h2>
      {orders.length === 0 ? (
        <p className="text-void-400 py-8 text-center">暂无订单</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS_MAP[order.status] || { color: 'bg-white/5 text-void-400 border border-white/5', label: order.status };
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block card-dark p-4 hover:border-cyber-400/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-void-300">{order.orderNo}</p>
                    <p className="text-xs text-void-500 mt-1">
                      共 {order.itemCount} 件 · {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${st.color}`}>{st.label}</span>
                    <span className="font-semibold text-void-100">¥{(order.totalPrice / 100).toFixed(2)}</span>
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
