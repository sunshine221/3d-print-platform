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
  if (!data) return <p className="text-gray-400">订单不存在</p>;

  const order = data as any;

  return (
    <div>
      <Link href="/account/orders" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← 返回订单列表
      </Link>

      <div className="border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{order.orderNo}</h2>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
          <span className="text-sm px-3 py-1 rounded bg-blue-50 text-blue-600 font-medium">
            {STATUS_MAP[order.status] || order.status}
          </span>
        </div>

        <div className="text-right mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ¥{(order.totalPrice / 100).toFixed(2)}
          </span>
          {order.discountAmount > 0 && (
            <span className="text-sm text-gray-400 ml-2 line-through">
              ¥{((order.totalPrice + order.discountAmount) / 100).toFixed(2)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">联系人：</span>
            <span>{order.contactName}</span>
          </div>
          <div>
            <span className="text-gray-500">电话：</span>
            <span>{order.contactPhone}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">地址：</span>
            <span>{order.shippingAddress}</span>
          </div>
          {order.trackingNumber && (
            <div className="col-span-2">
              <span className="text-gray-500">物流单号：</span>
              <span>{order.trackingNumber}</span>
              {order.trackingCompany && <span className="text-gray-400 ml-2">({order.trackingCompany})</span>}
            </div>
          )}
        </div>
      </div>

      {/* 商品列表 */}
      <div className="border rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">规格</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">单价</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">数量</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">小计</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((item: any) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.productName}</td>
                <td className="px-4 py-3 text-gray-500">{item.skuCode}</td>
                <td className="px-4 py-3 text-gray-500">
                  {Object.entries(item.specCombo).map(([k, v]) => `${k}: ${v}`).join('，')}
                </td>
                <td className="px-4 py-3 text-right">¥{(item.unitPrice / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium">¥{(item.subtotal / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 订单日志 */}
      {order.logs.length > 0 && (
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">订单状态</h3>
          <div className="space-y-3">
            {order.logs.map((log: any) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <span className="text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('zh-CN')}
                </span>
                <span className="text-gray-700">
                  {log.detail || log.action}
                  {log.fromStatus && log.toStatus && (
                    <span className="text-gray-400 ml-1">
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
