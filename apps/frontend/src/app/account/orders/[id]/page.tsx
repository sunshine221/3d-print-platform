'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { getOrderDetail } from '@/lib/api';
import Loading from '@/components/ui/Loading';

const STATUS_MAP: Record<string, string> = {
  pending_confirmation: '待确认',
  in_production: '生产中',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useSWR(
    id ? ['order-detail', id] : null,
    () => getOrderDetail(id),
  );

  if (isLoading) return <Loading />;
  if (!data) return <p className="text-void-500 dark:text-void-400">订单不存在</p>;

  const order = data as any;

  return (
    <div>
      <Link href="/account/orders" className="text-sm text-cyber-500 dark:text-cyber-400 hover:text-cyber-600 dark:hover:text-cyber-300 mb-4 inline-block">
        ← 返回订单列表
      </Link>

      <div className="card-dark p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-lg font-semibold text-void-900 dark:text-void-100">{order.orderNo}</h2>
            <p className="text-sm text-void-500 dark:text-void-400">
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
          <span className="text-sm px-3 py-1 rounded bg-cyber-400/10 text-cyber-400 font-medium border border-cyber-400/20 w-fit">
            {STATUS_MAP[order.status] || order.status}
          </span>
        </div>

        <div className="text-right mb-4">
          <span className="text-2xl font-bold text-void-900 dark:text-void-100">
            ¥{(order.totalPrice / 100).toFixed(2)}
          </span>
          {order.discountAmount > 0 && (
            <span className="text-sm text-void-400 dark:text-void-500 ml-2 line-through">
              ¥{((order.totalPrice + order.discountAmount) / 100).toFixed(2)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-void-500 dark:text-void-400">联系人：</span>
            <span className="text-void-800 dark:text-void-200">{order.contactName}</span>
          </div>
          <div>
            <span className="text-void-500 dark:text-void-400">电话：</span>
            <span className="text-void-800 dark:text-void-200">{order.contactPhone}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-void-500 dark:text-void-400">地址：</span>
            <span className="text-void-800 dark:text-void-200">{order.shippingAddress}</span>
          </div>
          {order.trackingNumber && (
            <div className="sm:col-span-2">
              <span className="text-void-500 dark:text-void-400">物流单号：</span>
              <span className="text-void-800 dark:text-void-200">{order.trackingNumber}</span>
              {order.trackingCompany && <span className="text-void-500 dark:text-void-400 ml-2">({order.trackingCompany})</span>}
            </div>
          )}
        </div>
      </div>

      <div className="card-dark overflow-x-auto mb-6">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-void-100 dark:bg-white/5">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-void-600 dark:text-void-300">商品</th>
              <th className="text-left px-4 py-3 font-medium text-void-600 dark:text-void-300">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-void-600 dark:text-void-300">规格</th>
              <th className="text-right px-4 py-3 font-medium text-void-600 dark:text-void-300">单价</th>
              <th className="text-right px-4 py-3 font-medium text-void-600 dark:text-void-300">数量</th>
              <th className="text-right px-4 py-3 font-medium text-void-600 dark:text-void-300">小计</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-void-200 dark:divide-white/5">
            {order.items.map((item: any) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-void-800 dark:text-void-200">{item.productName}</td>
                <td className="px-4 py-3 text-void-500 dark:text-void-400">{item.skuCode}</td>
                <td className="px-4 py-3 text-void-500 dark:text-void-400">
                  {Object.entries(item.specCombo).map(([k, v]) => `${k}: ${v}`).join('，')}
                </td>
                <td className="px-4 py-3 text-right text-void-600 dark:text-void-300">¥{(item.unitPrice / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-void-600 dark:text-void-300">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium text-void-900 dark:text-void-100">¥{(item.subtotal / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.logs.length > 0 && (
        <div className="card-dark p-6">
          <h3 className="font-medium text-void-900 dark:text-void-100 mb-4">订单状态</h3>
          <div className="space-y-3">
            {order.logs.map((log: any) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <span className="text-void-400 dark:text-void-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('zh-CN')}
                </span>
                <span className="text-void-600 dark:text-void-300">
                  {log.detail || log.action}
                  {log.fromStatus && log.toStatus && (
                    <span className="text-void-400 dark:text-void-500 ml-1">
                      ({STATUS_MAP[log.fromStatus] || log.fromStatus} → {STATUS_MAP[log.toStatus] || log.toStatus})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
