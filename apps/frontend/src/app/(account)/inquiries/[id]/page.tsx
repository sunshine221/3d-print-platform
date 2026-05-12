'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { getInquiryDetail, sendInquiryMessage } from '@/lib/api';
import Loading from '@/components/ui/Loading';

const STATUS_MAP: Record<string, string> = {
  pending_review: '待审核',
  quoted: '已报价',
  negotiating: '协商中',
  accepted: '已接受',
  rejected: '已拒绝',
  closed: '已关闭',
};

export default function InquiryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useSWR(
    id ? ['inquiry-detail', id] : null,
    () => getInquiryDetail(id),
    { refreshInterval: 5000 },
  );

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  if (isLoading) return <Loading />;
  if (!data) return <p className="text-gray-400">询价不存在</p>;

  const inquiry = data as any;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await sendInquiryMessage(id, message.trim());
      setMessage('');
      await mutate(['inquiry-detail', id]);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Link href="/account/inquiries" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← 返回询价列表
      </Link>

      {/* 询价信息 */}
      <div className="border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{inquiry.inquiryNo}</h2>
            <p className="text-sm text-gray-500">
              {new Date(inquiry.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
          <span className="text-sm px-3 py-1 rounded bg-blue-50 text-blue-600 font-medium">
            {STATUS_MAP[inquiry.status] || inquiry.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {inquiry.productName && (
            <div>
              <span className="text-gray-500">关联产品：</span>
              <span>{inquiry.productName}</span>
            </div>
          )}
          {inquiry.desiredMaterial && (
            <div>
              <span className="text-gray-500">期望材质：</span>
              <span>{inquiry.desiredMaterial}</span>
            </div>
          )}
          {inquiry.desiredColor && (
            <div>
              <span className="text-gray-500">期望颜色：</span>
              <span>{inquiry.desiredColor}</span>
            </div>
          )}
          {inquiry.desiredQuantity && (
            <div>
              <span className="text-gray-500">期望数量：</span>
              <span>{inquiry.desiredQuantity}</span>
            </div>
          )}
          {inquiry.desiredSize && (
            <div>
              <span className="text-gray-500">期望尺寸：</span>
              <span>{inquiry.desiredSize}</span>
            </div>
          )}
          {inquiry.desiredDeadline && (
            <div>
              <span className="text-gray-500">期望交期：</span>
              <span>{new Date(inquiry.desiredDeadline).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
        </div>

        {inquiry.additionalNotes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            {inquiry.additionalNotes}
          </div>
        )}

        {/* 报价信息 */}
        {inquiry.adminQuoteTotalPrice != null && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">管理员报价</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-700">单价：</span>
                <span>¥{(inquiry.adminQuoteUnitPrice / 100).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-blue-700">数量：</span>
                <span>{inquiry.adminQuoteQuantity}</span>
              </div>
              <div>
                <span className="text-blue-700 font-semibold">总价：</span>
                <span className="font-semibold">¥{(inquiry.adminQuoteTotalPrice / 100).toFixed(2)}</span>
              </div>
              {inquiry.adminQuoteDeliveryDays && (
                <div>
                  <span className="text-blue-700">交期：</span>
                  <span>{inquiry.adminQuoteDeliveryDays} 天</span>
                </div>
              )}
            </div>
            {inquiry.adminQuoteNote && (
              <p className="mt-2 text-sm text-blue-800">{inquiry.adminQuoteNote}</p>
            )}
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div className="border rounded-lg p-6 mb-6">
        <h3 className="font-medium mb-4">沟通记录</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(inquiry.messages || []).map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                  msg.senderType === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.senderType === 'customer' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
