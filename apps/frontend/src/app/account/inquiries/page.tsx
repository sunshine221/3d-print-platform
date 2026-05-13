'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { getMyInquiries } from '@/lib/api';
import Loading from '@/components/ui/Loading';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_review: { color: 'bg-yellow-100 text-yellow-700', label: '待审核' },
  quoted: { color: 'bg-blue-100 text-blue-700', label: '已报价' },
  negotiating: { color: 'bg-purple-100 text-purple-700', label: '协商中' },
  accepted: { color: 'bg-green-100 text-green-700', label: '已接受' },
  rejected: { color: 'bg-gray-100 text-gray-500', label: '已拒绝' },
  closed: { color: 'bg-gray-100 text-gray-500', label: '已关闭' },
};

export default function MyInquiriesPage() {
  const { data, isLoading } = useSWR('my-inquiries', () => getMyInquiries({ page: 1, pageSize: 50 }));

  if (isLoading) return <Loading />;

  const inquiries = (data?.items || []) as Array<{
    id: string;
    inquiryNo: string;
    productName: string | null;
    desiredMaterial: string | null;
    desiredColor: string | null;
    desiredQuantity: number | null;
    status: string;
    adminQuoteTotalPrice: number | null;
    createdAt: string;
  }>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">我的询价</h2>
      {inquiries.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">暂无询价</p>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => {
            const st = STATUS_MAP[inq.status] || { color: 'bg-gray-100 text-gray-600', label: inq.status };
            return (
              <Link
                key={inq.id}
                href={`/account/inquiries/${inq.id}`}
                className="block border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{inq.inquiryNo}</p>
                    <p className="text-sm mt-1">
                      {inq.productName || '未指定产品'}
                      {inq.desiredMaterial && <span className="text-gray-400 ml-2">· {inq.desiredMaterial}</span>}
                      {inq.desiredColor && <span className="text-gray-400 ml-1">· {inq.desiredColor}</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(inq.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${st.color}`}>{st.label}</span>
                    {inq.adminQuoteTotalPrice != null && (
                      <span className="font-semibold text-gray-900">
                        ¥{(inq.adminQuoteTotalPrice / 100).toFixed(2)}
                      </span>
                    )}
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
