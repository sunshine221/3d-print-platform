import { useState, useEffect, useCallback } from 'react';
import { Table, Select, Card, Row, Col } from 'antd';
import api from '../services/api';

interface LogItem {
  id: string;
  adminUserId: string | null;
  adminUser: { username: string; name: string } | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_MAP: Record<string, string> = {
  POST: '创建',
  PATCH: '更新',
  PUT: '更新',
  DELETE: '删除',
};

export default function LogListPage() {
  const [data, setData] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [actionFilter, setActionFilter] = useState<string | undefined>();

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, pageSize };
      if (actionFilter) params.action = actionFilter;
      const res = await api.get('/admin/logs', { params });
      setData(res.data?.items || []);
      setPagination(res.data?.pagination || { page, pageSize, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    {
      title: '操作人',
      key: 'admin',
      width: 150,
      render: (_: unknown, record: LogItem) =>
        record.adminUser ? record.adminUser.username : '系统',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (a: string) => ACTION_MAP[a] || a,
    },
    { title: '目标类型', dataIndex: 'targetType', key: 'targetType', width: 120 },
    { title: '目标 ID', dataIndex: 'targetId', key: 'targetId', width: 100, ellipsis: true },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', width: 140 },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      <h2>操作日志</h2>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={4}>
            <Select
              placeholder="操作类型"
              value={actionFilter}
              onChange={(v) => setActionFilter(v)}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 'POST', label: '创建' },
                { value: 'PATCH', label: '更新' },
                { value: 'PUT', label: '批量更新' },
                { value: 'DELETE', label: '删除' },
              ]}
            />
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
