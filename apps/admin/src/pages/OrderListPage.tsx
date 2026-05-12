import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Tag, message, Row, Col, Card, Dropdown } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../services/api';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_confirmation: { color: 'gold', label: '待确认' },
  in_production: { color: 'blue', label: '生产中' },
  shipped: { color: 'purple', label: '已发货' },
  completed: { color: 'green', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/orders', { params });
      setData(res.data?.items || []);
      setPagination(res.data?.pagination || { page, pageSize, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      message.success('状态已更新');
      fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器处理 */ }
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 180 },
    {
      title: '用户', key: 'user', width: 180,
      render: (_: any, r: any) => r.user?.email || '-',
    },
    {
      title: '金额', dataIndex: 'totalPrice', key: 'totalPrice', width: 100,
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: '件数', dataIndex: 'itemCount', key: 'itemCount', width: 60,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => {
        const cfg = STATUS_MAP[s] || { color: 'default', label: s };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    { title: '联系人', dataIndex: 'contactName', key: 'contactName', width: 100 },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/orders/${record.id}`)}>
            详情
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'in_production', label: '生产中', disabled: record.status !== 'pending_confirmation' },
                { key: 'shipped', label: '已发货', disabled: record.status !== 'in_production' },
                { key: 'completed', label: '已完成', disabled: record.status !== 'shipped' },
                { key: 'cancelled', label: '取消', disabled: ['completed', 'cancelled'].includes(record.status) },
              ].filter((item) => !item.disabled),
              onClick: ({ key }) => handleStatusChange(record.id, key),
            }}
          >
            <Button size="small">状态</Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>订单管理</h2>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="搜索订单号"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => fetchData()}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label }))}
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
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
