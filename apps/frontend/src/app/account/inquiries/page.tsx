'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { getMyInquiries } from '@/lib/api';
import Loading from '@/components/ui/Loading';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_review: { color: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20', label: '待审核' },
  quoted: { color: 'bg-cyber-400/10 text-cyber-400 border border-cyber-400/20', label: '已报价' },
  negotiating: { color: 'bg-neon-400/10 text-neon-400 border border-neon-400/20', label: '协商中' },
  accepted: { color: 'bg-green-400/10 text-green-400 border border-green-400/20', label: '已接受' },
  rejected: { color: 'bg-void-100 dark:bg-white/5 text-void-500 dark:text-void-400 border border-void-200 dark:border-white/5', label: '已拒绝' },
  closed: { color: 'bg-void-100 dark:bg-white/5 text-void-500 dark:text-void-400 border border-void-200 dark:border-white/5', label: '已关闭' },
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
      <h2 className="text-lg font-semibold text-void-900 dark:text-void-100 mb-4">我的询价</h2>
      {inquiries.length === 0 ? (
        <p className="text-void-500 dark:text-void-400 py-8 text-center">暂无询价</p>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => {
            const st = STATUS_MAP[inq.status] || { color: 'bg-void-100 dark:bg-white/5 text-void-500 dark:text-void-400 border border-void-200 dark:border-white/5', label: inq.status };
            return (
              <Link
                key={inq.id}
                href={`/account/inquiries/${inq.id}`}
                className="block card-dark p-4 hover:border-cyber-400/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-void-600 dark:text-void-300">{inq.inquiryNo}</p>
                    <p className="text-sm mt-1 text-void-800 dark:text-void-200">
                      {inq.productName || '未指定产品'}
                      {inq.desiredMaterial && <span className="text-void-500 dark:text-void-400 ml-2">· {inq.desiredMaterial}</span>}
                      {inq.desiredColor && <span className="text-void-500 dark:text-void-400 ml-1">· {inq.desiredColor}</span>}
                    </p>
                    <p className="text-xs text-void-500 dark:text-void-500 mt-1">
                      {new Date(inq.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${st.color}`}>{st.label}</span>
                    {inq.adminQuoteTotalPrice != null && (
                      <span className="font-semibold text-void-900 dark:text-void-100">
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
