import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Input } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  isSystem: boolean;
  status: string;
  updatedAt: string;
}

export default function PageListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/pages', { params: { page: 1, pageSize: 100 } });
      setData(res.data?.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: '系统页',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 80,
      render: (v: boolean) => v ? <Tag color="blue">系统</Tag> : <Tag>自定义</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => <Tag color={s === 'published' ? 'green' : 'default'}>{s}</Tag>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: PageItem) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/pages/${record.id}/edit`)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>页面管理</h2>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
    </div>
  );
}
