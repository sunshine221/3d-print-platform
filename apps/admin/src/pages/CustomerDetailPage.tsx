import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Card, Table, Tag, Button, Spin, Statistic, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../services/api';

interface UserDetail {
  id: string;
  username: string;
  name: string | null;
  phone: string;
  defaultContactName: string | null;
  defaultContactPhone: string | null;
  defaultAddress: string | null;
  status: string;
  createdAt: string;
  _count: { orders: number; inquiries: number };
}

const STATUS_MAP: Record<string, string> = {
  pending_confirmation: '待确认',
  in_production: '生产中',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/admin/users/${id}`)
      .then((res) => setUser(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>返回</Button>
        <h2>客户详情</h2>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="订单数" value={user._count.orders} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="询价数" value={user._count.inquiries} /></Card>
        </Col>
      </Row>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="账号">{user.username}</Descriptions.Item>
          <Descriptions.Item label="姓名">{user.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={user.status === 'active' ? 'green' : 'red'}>
              {user.status === 'active' ? '正常' : '已禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">{new Date(user.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="默认联系信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="联系人">{user.defaultContactName || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{user.defaultContactPhone || '-'}</Descriptions.Item>
          <Descriptions.Item label="地址">{user.defaultAddress || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
