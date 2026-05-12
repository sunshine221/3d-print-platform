import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Timeline,
  Input,
  message,
  Modal,
  InputNumber,
} from 'antd';
import api from '../services/api';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_review: { color: 'gold', label: '待审核' },
  quoted: { color: 'blue', label: '已报价' },
  negotiating: { color: 'purple', label: '协商中' },
  accepted: { color: 'green', label: '已接受' },
  rejected: { color: 'red', label: '已拒绝' },
  closed: { color: 'default', label: '已关闭' },
};

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(1);
  const [quoteNote, setQuoteNote] = useState('');
  const [quoteDeliveryDays, setQuoteDeliveryDays] = useState<number | undefined>();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/inquiries/${id}`);
      setInquiry(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [inquiry?.messages]);

  const handleQuote = async () => {
    try {
      await api.post(`/admin/inquiries/${id}/quote`, {
        adminQuoteUnitPrice: quoteUnitPrice,
        adminQuoteQuantity: quoteQuantity,
        adminQuoteNote: quoteNote || undefined,
        adminQuoteDeliveryDays: quoteDeliveryDays,
      });
      message.success('报价成功');
      setQuoteModal(false);
      fetchDetail();
    } catch { /* 拦截器处理 */ }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/admin/inquiries/${id}/status`, { status });
      message.success('状态已更新');
      fetchDetail();
    } catch { /* 拦截器处理 */ }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      await api.post(`/admin/inquiries/${id}/messages`, { content: messageText.trim() });
      setMessageText('');
      fetchDetail();
    } catch { /* 拦截器处理 */ }
  };

  if (loading || !inquiry) return <Card loading />;

  const statusCfg = STATUS_MAP[inquiry.status] || { color: 'default', label: inquiry.status };

  return (
    <div>
      <Button onClick={() => navigate('/inquiries')} style={{ marginBottom: 16 }}>← 返回列表</Button>

      <Card title={`询价 ${inquiry.inquiryNo}`} style={{ marginBottom: 16 }}
        extra={<Tag color={statusCfg.color}>{statusCfg.label}</Tag>}
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="关联产品">{inquiry.productName || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(inquiry.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="客户需求" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="期望材质">{inquiry.desiredMaterial || '-'}</Descriptions.Item>
          <Descriptions.Item label="期望颜色">{inquiry.desiredColor || '-'}</Descriptions.Item>
          <Descriptions.Item label="期望数量">{inquiry.desiredQuantity ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="期望尺寸">{inquiry.desiredSize || '-'}</Descriptions.Item>
          <Descriptions.Item label="期望交期">
            {inquiry.desiredDeadline ? new Date(inquiry.desiredDeadline).toLocaleDateString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系人">{inquiry.contactName || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{inquiry.contactPhone || '-'}</Descriptions.Item>
          <Descriptions.Item label="附加说明" span={2}>{inquiry.additionalNotes || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {inquiry.files?.length > 0 && (
        <Card title="上传文件" style={{ marginBottom: 16 }}>
          {(inquiry.files || []).map((f: any) => (
            <a key={f.id} href={f.fileUrl} target="_blank" rel="noreferrer" style={{ marginRight: 16 }}>
              {f.fileName || f.fileUrl}
            </a>
          ))}
        </Card>
      )}

      <Card title="操作" style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" onClick={() => setQuoteModal(true)}>报价</Button>
          <Button onClick={() => handleStatusChange('closed')} disabled={['closed', 'rejected'].includes(inquiry.status)}>关闭</Button>
          <Button onClick={() => handleStatusChange('accepted')} disabled={inquiry.status !== 'quoted'}>标记已接受</Button>
        </Space>
      </Card>

      {inquiry.adminQuoteTotalPrice != null && (
        <Card title="报价信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="单价">¥{(inquiry.adminQuoteUnitPrice / 100).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="数量">{inquiry.adminQuoteQuantity}</Descriptions.Item>
            <Descriptions.Item label="总价">¥{(inquiry.adminQuoteTotalPrice / 100).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="交期">{inquiry.adminQuoteDeliveryDays ? `${inquiry.adminQuoteDeliveryDays} 天` : '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{inquiry.adminQuoteNote || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="沟通记录" style={{ marginBottom: 16 }}>
        <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
          {(inquiry.messages || []).map((msg: any) => (
            <div key={msg.id} style={{
              textAlign: msg.senderType === 'admin' ? 'right' : 'left',
              marginBottom: 12,
            }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '70%',
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: msg.senderType === 'admin' ? '#1677ff' : '#f0f0f0',
                color: msg.senderType === 'admin' ? '#fff' : '#000',
                textAlign: 'left',
              }}>
                <div>{msg.content}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                  {new Date(msg.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="输入消息..."
          />
          <Button type="primary" onClick={handleSendMessage}>发送</Button>
        </Space.Compact>
      </Card>

      <Card title="操作日志">
        <Timeline items={(inquiry.logs || []).map((log: any) => ({
          children: (
            <div>
              <p>{log.detail || log.action}</p>
              <p style={{ fontSize: 12, color: '#999' }}>
                {new Date(log.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          ),
        }))} />
      </Card>

      <Modal
        title="报价"
        open={quoteModal}
        onOk={handleQuote}
        onCancel={() => setQuoteModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div>
            <label>单价（分）</label>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              value={quoteUnitPrice}
              onChange={(v) => setQuoteUnitPrice(v || 0)}
              placeholder="人民币（分）"
            />
          </div>
          <div>
            <label>数量</label>
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              value={quoteQuantity}
              onChange={(v) => setQuoteQuantity(v || 1)}
            />
          </div>
          <div>
            <label>总价：¥{((quoteUnitPrice * quoteQuantity) / 100).toFixed(2)}</label>
          </div>
          <div>
            <label>交期（天）</label>
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              value={quoteDeliveryDays}
              onChange={(v) => setQuoteDeliveryDays(v || undefined)}
              placeholder="预计交付天数"
            />
          </div>
          <div>
            <label>备注</label>
            <Input.TextArea
              value={quoteNote}
              onChange={(e) => setQuoteNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
