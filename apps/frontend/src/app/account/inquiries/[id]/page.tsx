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
  if (!data) return <p className="text-void-400">询价不存在</p>;

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
      <Link href="/account/inquiries" className="text-sm text-cyber-400 hover:text-cyber-300 mb-4 inline-block">
        ← 返回询价列表
      </Link>

      <div className="card-dark p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-void-100">{inquiry.inquiryNo}</h2>
            <p className="text-sm text-void-400">
              {new Date(inquiry.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
          <span className="text-sm px-3 py-1 rounded bg-cyber-400/10 text-cyber-400 font-medium border border-cyber-400/20">
            {STATUS_MAP[inquiry.status] || inquiry.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {inquiry.productName && (
            <div>
              <span className="text-void-400">关联产品：</span>
              <span className="text-void-200">{inquiry.productName}</span>
            </div>
          )}
          {inquiry.desiredMaterial && (
            <div>
              <span className="text-void-400">期望材质：</span>
              <span className="text-void-200">{inquiry.desiredMaterial}</span>
            </div>
          )}
          {inquiry.desiredColor && (
            <div>
              <span className="text-void-400">期望颜色：</span>
              <span className="text-void-200">{inquiry.desiredColor}</span>
            </div>
          )}
          {inquiry.desiredQuantity && (
            <div>
              <span className="text-void-400">期望数量：</span>
              <span className="text-void-200">{inquiry.desiredQuantity}</span>
            </div>
          )}
          {inquiry.desiredSize && (
            <div>
              <span className="text-void-400">期望尺寸：</span>
              <span className="text-void-200">{inquiry.desiredSize}</span>
            </div>
          )}
          {inquiry.desiredDeadline && (
            <div>
              <span className="text-void-400">期望交期：</span>
              <span className="text-void-200">{new Date(inquiry.desiredDeadline).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
        </div>

        {inquiry.additionalNotes && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-void-300 border border-white/5">
            {inquiry.additionalNotes}
          </div>
        )}

        {inquiry.adminQuoteTotalPrice != null && (
          <div className="mt-4 p-4 bg-cyber-400/5 rounded-lg border border-cyber-400/10">
            <h4 className="font-medium text-cyber-400 mb-2">管理员报价</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-void-400">单价：</span>
                <span className="text-void-200">¥{(inquiry.adminQuoteUnitPrice / 100).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-void-400">数量：</span>
                <span className="text-void-200">{inquiry.adminQuoteQuantity}</span>
              </div>
              <div>
                <span className="text-void-400 font-semibold">总价：</span>
                <span className="font-semibold text-cyber-400">¥{(inquiry.adminQuoteTotalPrice / 100).toFixed(2)}</span>
              </div>
              {inquiry.adminQuoteDeliveryDays && (
                <div>
                  <span className="text-void-400">交期：</span>
                  <span className="text-void-200">{inquiry.adminQuoteDeliveryDays} 天</span>
                </div>
              )}
            </div>
            {inquiry.adminQuoteNote && (
              <p className="mt-2 text-sm text-void-300">{inquiry.adminQuoteNote}</p>
            )}
          </div>
        )}
      </div>

      <div className="card-dark p-6 mb-6">
        <h3 className="font-medium text-void-100 mb-4">沟通记录</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(inquiry.messages || []).map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                  msg.senderType === 'customer'
                    ? 'bg-cyber-500 text-white'
                    : 'bg-white/5 text-void-200 border border-white/5'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.senderType === 'customer' ? 'text-cyber-200' : 'text-void-500'}`}>
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
            className="flex-1 px-3 py-2 bg-void-800 border border-white/10 rounded-lg text-void-200 placeholder:text-void-500 focus:outline-none focus:ring-2 focus:ring-cyber-400 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="gradient-btn px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
