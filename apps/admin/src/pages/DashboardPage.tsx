import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Tag } from 'antd';
import {
  EyeOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  InboxOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import api from '../services/api';

interface Stats {
  todayPageViews: number;
  monthOrders: number;
  monthInquiries: number;
  activeProducts: number;
  conversionRate: number;
}

interface RecentOrder {
  id: string;
  orderNo: string;
  totalPrice: string;
  status: string;
  createdAt: string;
  user: { phone: string; name: string | null };
}

interface RecentInquiry {
  id: string;
  inquiryNo: string;
  status: string;
  createdAt: string;
  user: { phone: string; name: string | null };
}

const ORDER_STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_confirmation: { color: 'gold', label: '待确认' },
  in_production: { color: 'blue', label: '生产中' },
  shipped: { color: 'purple', label: '已发货' },
  completed: { color: 'green', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
};

const INQUIRY_STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_review: { color: 'gold', label: '待审核' },
  quoted: { color: 'blue', label: '已报价' },
  negotiating: { color: 'purple', label: '协商中' },
  accepted: { color: 'green', label: '已接受' },
  rejected: { color: 'red', label: '已拒绝' },
  closed: { color: 'default', label: '已关闭' },
};

const statCards = [
  {
    key: 'todayPageViews',
    title: '今日访问量',
    icon: <EyeOutlined />,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    key: 'monthOrders',
    title: '本月订单',
    icon: <ShoppingCartOutlined />,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    key: 'monthInquiries',
    title: '代打询价',
    icon: <FileTextOutlined />,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    key: 'activeProducts',
    title: '在售产品',
    icon: <InboxOutlined />,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    key: 'conversionRate',
    title: '成交率',
    icon: <PercentageOutlined />,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    suffix: '%',
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard/stats'),
      api.get('/admin/dashboard/recent-orders'),
      api.get('/admin/dashboard/recent-inquiries'),
    ])
      .then(([statsRes, ordersRes, inquiriesRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data || []);
        setRecentInquiries(inquiriesRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>
        仪表盘
      </h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={card.key === 'conversionRate' ? 4 : undefined} key={card.key}>
            <Card
              style={{
                borderRadius: 12,
                border: 'none',
                overflow: 'hidden',
              }}
              styles={{ body: { padding: 0 } }}
            >
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div
                  style={{
                    width: 4,
                    minHeight: 88,
                    background: card.gradient,
                    flexShrink: 0,
                  }}
                />
                <div style={{ padding: '20px 24px', flex: 1 }}>
                  <Statistic
                    title={
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                        {card.title}
                      </span>
                    }
                    value={
                      stats
                        ? card.key === 'conversionRate'
                          ? stats.conversionRate
                          : stats[card.key as keyof Stats] ?? 0
                        : 0
                    }
                    suffix={card.suffix || undefined}
                    valueStyle={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}
                    prefix={
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: card.gradient,
                          color: 'white',
                          fontSize: 18,
                          marginRight: 12,
                        }}
                      >
                        {card.icon}
                      </span>
                    }
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>最新订单</span>}
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: '0 24px 24px' } }}
          >
            <Table
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              columns={[
                { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 160 },
                {
                  title: '用户',
                  key: 'user',
                  width: 130,
                  render: (_: unknown, r: RecentOrder) => r.user.phone,
                },
                {
                  title: '金额',
                  dataIndex: 'totalPrice',
                  key: 'totalPrice',
                  width: 100,
                  render: (v: string) => (
                    <span style={{ fontWeight: 600 }}>¥{(Number(v) / 100).toFixed(2)}</span>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 90,
                  render: (s: string) => {
                    const cfg = ORDER_STATUS_MAP[s] || { color: 'default', label: s };
                    return <Tag color={cfg.color}>{cfg.label}</Tag>;
                  },
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>最新询价</span>}
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: '0 24px 24px' } }}
          >
            <Table
              dataSource={recentInquiries}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              columns={[
                { title: '询价号', dataIndex: 'inquiryNo', key: 'inquiryNo', width: 160 },
                {
                  title: '用户',
                  key: 'user',
                  width: 130,
                  render: (_: unknown, r: RecentInquiry) => r.user.phone,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 90,
                  render: (s: string) => {
                    const cfg = INQUIRY_STATUS_MAP[s] || { color: 'default', label: s };
                    return <Tag color={cfg.color}>{cfg.label}</Tag>;
                  },
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
