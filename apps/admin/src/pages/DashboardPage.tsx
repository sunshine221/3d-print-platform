import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin } from 'antd';
import {
  InboxOutlined, ShoppingCartOutlined, FileTextOutlined,
  TeamOutlined, PercentageOutlined,
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
  user: { email: string; name: string | null };
}

interface RecentInquiry {
  id: string;
  inquiryNo: string;
  status: string;
  createdAt: string;
  user: { email: string; name: string | null };
}

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
      <h2>仪表盘</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic title="今日访问量" value={stats?.todayPageViews ?? 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="本月订单" value={stats?.monthOrders ?? 0} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="代打询价" value={stats?.monthInquiries ?? 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="在售产品" value={stats?.activeProducts ?? 0} prefix={<InboxOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="成交率"
              value={stats?.conversionRate ?? 0}
              suffix="%"
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="最新订单" style={{ marginBottom: 16 }}>
            <Table
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
                { title: '用户', key: 'user', render: (_: unknown, r: RecentOrder) => r.user.email },
                { title: '金额', dataIndex: 'totalPrice', key: 'totalPrice', render: (v: string) => `¥${v}` },
                { title: '状态', dataIndex: 'status', key: 'status' },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最新询价" style={{ marginBottom: 16 }}>
            <Table
              dataSource={recentInquiries}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '询价号', dataIndex: 'inquiryNo', key: 'inquiryNo' },
                { title: '用户', key: 'user', render: (_: unknown, r: RecentInquiry) => r.user.email },
                { title: '状态', dataIndex: 'status', key: 'status' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
