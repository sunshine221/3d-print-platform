import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Tag, message, Row, Col, Card } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../services/api';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending_review: { color: 'gold', label: '待审核' },
  quoted: { color: 'blue', label: '已报价' },
  negotiating: { color: 'purple', label: '协商中' },
  accepted: { color: 'green', label: '已接受' },
  rejected: { color: 'red', label: '已拒绝' },
  closed: { color: 'default', label: '已关闭' },
};

export default function InquiryListPage() {
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
      const res = await api.get('/admin/inquiries', { params });
      setData(res.data?.items || []);
      setPagination(res.data?.pagination || { page, pageSize, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { title: '询价单号', dataIndex: 'inquiryNo', key: 'inquiryNo', width: 180 },
    {
      title: '用户', key: 'user', width: 180,
      render: (_: any, r: any) => r.user?.email || '-',
    },
    {
      title: '关联产品', dataIndex: 'productName', key: 'productName', width: 150,
      render: (v: string | null) => v || '-',
    },
    {
      title: '期望材质', dataIndex: 'desiredMaterial', key: 'desiredMaterial', width: 100,
      render: (v: string | null) => v || '-',
    },
    {
      title: '期望数量', dataIndex: 'desiredQuantity', key: 'desiredQuantity', width: 80,
      render: (v: number | null) => v ?? '-',
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => {
        const cfg = STATUS_MAP[s] || { color: 'default', label: s };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '报价金额', dataIndex: 'adminQuoteTotalPrice', key: 'adminQuoteTotalPrice', width: 100,
      render: (v: number | null) => v != null ? `¥${(v / 100).toFixed(2)}` : '-',
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: any, record: any) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/inquiries/${record.id}`)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>代打询价管理</h2>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="搜索询价单号"
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
