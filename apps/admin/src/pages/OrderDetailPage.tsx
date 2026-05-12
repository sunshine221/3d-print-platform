import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Timeline,
  Input,
  message,
  Select,
  Modal,
} from 'antd';
import api from '../services/api';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_confirmation: { color: 'gold', label: '待确认' },
  in_production: { color: 'blue', label: '生产中' },
  shipped: { color: 'purple', label: '已发货' },
  completed: { color: 'green', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingModal, setTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCompany, setTrackingCompany] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/admin/orders/${id}`)
      .then((res: any) => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      message.success('状态已更新');
      const res = await api.get(`/admin/orders/${id}`);
      setOrder(res.data);
    } catch { /* 拦截器处理 */ }
  };

  const handleUpdateTracking = async () => {
    try {
      await api.patch(`/admin/orders/${id}/tracking`, {
        trackingNumber,
        trackingCompany: trackingCompany || undefined,
      });
      message.success('物流已更新');
      setTrackingModal(false);
      const res = await api.get(`/admin/orders/${id}`);
      setOrder(res.data);
    } catch { /* 拦截器处理 */ }
  };

  if (loading) return <Card loading />;
  if (!order) return <Card><p>订单不存在</p></Card>;

  const statusCfg = STATUS_MAP[order.status as string] || { color: 'default', label: order.status };
  const availableActions: string[] = ({
    pending_confirmation: ['in_production', 'cancelled'],
    in_production: ['shipped', 'cancelled'],
    shipped: ['completed'],
  } as Record<string, string[]>)[order.status as string] || [];

  const itemColumns = [
    { title: '商品', dataIndex: 'productName', key: 'productName' },
    { title: 'SKU', dataIndex: 'skuCode', key: 'skuCode' },
    {
      title: '规格', dataIndex: 'specCombo', key: 'specCombo',
      render: (v: any) => Object.entries(v).map(([k, val]) => `${k}: ${val}`).join('，'),
    },
    {
      title: '单价', dataIndex: 'unitPrice', key: 'unitPrice',
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '小计', dataIndex: 'subtotal', key: 'subtotal',
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Button onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>← 返回列表</Button>

      <Card title={`订单 ${order.orderNo}`} style={{ marginBottom: 16 }}
        extra={<Tag color={statusCfg.color}>{statusCfg.label}</Tag>}
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="总金额">¥{(order.totalPrice / 100).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="折扣">¥{(order.discountAmount / 100).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="优惠码">{order.couponCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(order.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{order.note || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="客户信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="联系人">{order.contactName}</Descriptions.Item>
          <Descriptions.Item label="电话">{order.contactPhone}</Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>{order.shippingAddress}</Descriptions.Item>
        </Descriptions>
      </Card>

      {order.trackingNumber && (
        <Card title="物流信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="物流单号">{order.trackingNumber}</Descriptions.Item>
            <Descriptions.Item label="快递公司">{order.trackingCompany || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="操作" style={{ marginBottom: 16 }}>
        <Space>
          {availableActions.map((status) => (
            <Button key={status} onClick={() => handleStatusChange(status)}>
              设为 {STATUS_MAP[status]?.label || status}
            </Button>
          ))}
          {['in_production', 'pending_confirmation'].includes(order.status) && (
            <Button onClick={() => setTrackingModal(true)}>更新物流</Button>
          )}
        </Space>
      </Card>

      <Card title="商品列表" style={{ marginBottom: 16 }}>
        <Table columns={itemColumns} dataSource={order.items || []} rowKey="id" pagination={false} />
      </Card>

      <Card title="操作日志">
        <Timeline items={(order.logs || []).map((log: any) => ({
          children: (
            <div>
              <p>{log.detail || log.action}</p>
              <p style={{ fontSize: 12, color: '#999' }}>
                {new Date(log.createdAt).toLocaleString('zh-CN')}
                {log.fromStatus && log.toStatus && ` (${log.fromStatus} → ${log.toStatus})`}
              </p>
            </div>
          ),
        }))} />
      </Card>

      <Modal
        title="更新物流信息"
        open={trackingModal}
        onOk={handleUpdateTracking}
        onCancel={() => setTrackingModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <Input
            placeholder="物流单号"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Select
            placeholder="快递公司（可选）"
            value={trackingCompany || undefined}
            onChange={(v) => setTrackingCompany(v || '')}
            allowClear
            style={{ width: '100%' }}
            options={[
              { value: '顺丰速运', label: '顺丰速运' },
              { value: '中通快递', label: '中通快递' },
              { value: '圆通速递', label: '圆通速递' },
              { value: '韵达快递', label: '韵达快递' },
              { value: '京东物流', label: '京东物流' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
