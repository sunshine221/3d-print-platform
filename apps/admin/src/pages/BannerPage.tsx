import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, message, Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function BannerPage() {
  const [data, setData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/banners', { params: { page: 1, pageSize: 100 } });
      setData(res.data?.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (record: Banner) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.patch(`/admin/banners/${editing.id}`, values);
        message.success('已更新');
      } else {
        await api.post('/admin/banners', values);
        message.success('已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch { /* 拦截器已处理 */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/banners/${id}`);
      message.success('已删除');
      fetchData();
    } catch { /* 拦截器已处理 */ }
  };

  const handleToggleActive = async (record: Banner) => {
    try {
      await api.patch(`/admin/banners/${record.id}`, { isActive: !record.isActive });
      message.success(record.isActive ? '已禁用' : '已启用');
      fetchData();
    } catch { /* 拦截器已处理 */ }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 80,
      render: (url: string) => <img src={url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />,
    },
    { title: '标题', dataIndex: 'title', key: 'title', width: 150 },
    { title: '副标题', dataIndex: 'subtitle', key: 'subtitle', width: 150 },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60 },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (_: boolean, record: Banner) => (
        <Switch checked={record.isActive} onChange={() => handleToggleActive(record)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Banner) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Banner 管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增 Banner</Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal
        title={editing ? '编辑 Banner' : '新增 Banner'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题">
            <Input />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片 URL" rules={[{ required: true, message: '请输入图片 URL' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="linkUrl" label="链接 URL">
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="isActive" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
