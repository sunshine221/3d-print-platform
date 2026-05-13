import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, message, Upload,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
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

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function BannerPage() {
  const [data, setData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

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
    setFileList([]);
    setModalOpen(true);
  };

  const openEdit = (record: Banner) => {
    setEditing(record);
    form.setFieldsValue(record);
    setFileList([]);
    setModalOpen(true);
  };

  const beforeUpload = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      message.error('仅支持 JPG、PNG、WebP 格式');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_SIZE) {
      message.error('图片大小不能超过 5MB');
      return Upload.LIST_IGNORE;
    }
    setFileList([{ uid: '-1', name: file.name, status: 'done', originFileObj: file as any }]);
    return false; // 阻止自动上传
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setUploading(true);
    try {
      const formData = new FormData();
      for (const [key, val] of Object.entries(values)) {
        if (val !== undefined && val !== null) {
          formData.append(key, typeof val === 'boolean' ? String(val) : val as string);
        }
      }

      // 如果有新图片，附加文件
      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append('file', fileList[0].originFileObj as File);
      }

      if (editing) {
        await api.patch(`/admin/banners/${editing.id}`, formData);
        message.success('已更新');
      } else {
        await api.post('/admin/banners', formData);
        message.success('已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch { /* 拦截器已处理 */ }
    finally { setUploading(false); }
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
      width: 100,
      render: (url: string) => (
        url ? <img src={url} alt="" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : '-'
      ),
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
        confirmLoading={uploading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onRemove={() => setFileList([])}
              maxCount={1}
              accept="image/jpeg,image/png,image/webp"
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
            {editing?.imageUrl && fileList.length === 0 && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={editing.imageUrl}
                  alt="当前图片"
                  style={{ width: 102, height: 102, objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
                <p style={{ color: '#999', fontSize: 12 }}>当前图片（上传新图片将替换）</p>
              </div>
            )}
            {!editing && fileList.length === 0 && (
              <p style={{ color: '#999', fontSize: 12 }}>支持 JPG/PNG/WebP，最大 5MB</p>
            )}
          </Form.Item>
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题">
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
