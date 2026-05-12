import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Input, Tag, Space, Popconfirm, message, Card, Row, Col,
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../services/api';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  _count: { orders: number; inquiries: number };
}

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '正常' },
  disabled: { color: 'red', label: '已禁用' },
};

export default function CustomerListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, pageSize };
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      setData(res.data?.items || []);
      setPagination(res.data?.pagination || { page, pageSize, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleStatus = async (record: UserItem) => {
    try {
      await api.patch(`/admin/users/${record.id}/status`);
      message.success(record.status === 'active' ? '已禁用' : '已启用');
      fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器已处理 */ }
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: unknown, record: UserItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name || '未设置'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
        </div>
      ),
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130, render: (v: string | null) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => {
        const cfg = STATUS_MAP[s] || { color: 'default', label: s };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    { title: '订单数', dataIndex: ['_count', 'orders'], key: 'orders', width: 70 },
    { title: '询价数', dataIndex: ['_count', 'inquiries'], key: 'inquiries', width: 70 },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: UserItem) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/customers/${record.id}`)}>
            详情
          </Button>
          <Popconfirm
            title={record.status === 'active' ? '确定禁用？' : '确定启用？'}
            onConfirm={() => handleToggleStatus(record)}
          >
            <Button size="small" danger={record.status === 'active'}>
              {record.status === 'active' ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>客户管理</h2>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="搜索邮箱、姓名、手机号"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => fetchData()}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={() => fetchData()}>搜索</Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchData(page, pageSize),
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
}
