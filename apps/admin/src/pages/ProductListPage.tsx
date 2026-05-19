import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  Card,
  App,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import api from '../services/api';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  productType: string;
  materials: string[];
  categories: { id: string; name: string }[];
  minPrice: number | null;
  maxPrice: number | null;
  status: string;
  viewCount: number;
  skuCount: number;
  createdAt: string;
}

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  published: { color: 'green', label: '已上架' },
  archived: { color: 'orange', label: '已下架' },
};

const TYPE_MAP: Record<string, string> = {
  standard: '标准产品',
  print_service: '代打服务',
  both: '双模式',
};

export default function ProductListPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/admin/products', { params });
      setData(res.data?.items || []);
      setPagination(res.data?.pagination || { page, pageSize, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBatchPublish = async () => {
    try {
      await api.patch('/admin/products/batch', { ids: selectedRowKeys, status: 'published' });
      message.success('已上架');
      setSelectedRowKeys([]);
      fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器已处理 */ }
  };

  const handleBatchArchive = async () => {
    try {
      await api.patch('/admin/products/batch', { ids: selectedRowKeys, status: 'archived' });
      message.success('已下架');
      setSelectedRowKeys([]);
      fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器已处理 */ }
  };

  const handleBatchDelete = async () => {
    try {
      await api.patch('/admin/products/batch', { ids: selectedRowKeys, status: 'archived' });
      message.success('已删除');
      setSelectedRowKeys([]);
      fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器已处理 */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/products/${id}`);
      message.success('已删除');
      fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器已处理 */ }
  };

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnail',
      width: 60,
      render: (url: string | null) =>
        url ? (
          <img src={url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} />
        ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: ProductItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.subtitle}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categories',
      key: 'categories',
      width: 150,
      render: (cats: { name: string }[]) =>
        cats?.length ? cats.map((c) => <Tag key={c.name}>{c.name}</Tag>) : '-',
    },
    {
      title: '类型',
      dataIndex: 'productType',
      key: 'productType',
      width: 90,
      render: (t: string) => TYPE_MAP[t] || t,
    },
    {
      title: '材质',
      dataIndex: 'materials',
      key: 'materials',
      width: 150,
      render: (mats: string[]) =>
        mats?.length ? mats.map((m) => <Tag key={m}>{m}</Tag>) : '-',
    },
    {
      title: '价格',
      key: 'price',
      width: 120,
      render: (_: unknown, record: ProductItem) => {
        if (record.minPrice == null) return '-';
        const min = record.minPrice;
        const max = record.maxPrice;
        return `¥${min}${max && max !== min ? ` - ¥${max}` : ''}`;
      },
    },
    {
      title: 'SKU数',
      dataIndex: 'skuCount',
      key: 'skuCount',
      width: 60,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => {
        const config = STATUS_MAP[s] || { color: 'default', label: s };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 70,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: ProductItem) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record.id}/edit`)}
          />
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/products/${record.slug}`, '_blank')}
          />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>产品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/create')}>
          新增产品
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Input
            placeholder="搜索产品名称或 slug"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={() => fetchData()}
            allowClear
            style={{ flex: '1 1 180px', minWidth: 140 }}
          />
          <Select
            placeholder="状态筛选"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            allowClear
            style={{ width: 120, flexShrink: 0 }}
            options={[
              { value: 'draft', label: '草稿' },
              { value: 'published', label: '已上架' },
              { value: 'archived', label: '已下架' },
            ]}
          />
          <Button type="primary" onClick={() => fetchData()} style={{ marginLeft: 'auto' }}>
            搜索
          </Button>
        </div>
      </Card>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <span>已选 {selectedRowKeys.length} 项</span>
            <Button onClick={handleBatchPublish}>批量上架</Button>
            <Button onClick={handleBatchArchive}>批量下架</Button>
            <Popconfirm title="确定批量删除？" onConfirm={handleBatchDelete}>
              <Button danger>批量删除</Button>
            </Popconfirm>
          </Space>
        </div>
      )}

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
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
          position: ['bottomRight'],
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
