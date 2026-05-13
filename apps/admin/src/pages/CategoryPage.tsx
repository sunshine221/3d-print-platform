import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Popconfirm, message, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import api from '../services/api';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  isVisible: boolean;
  children: CategoryNode[];
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryNode | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = (parentId?: string) => {
    setEditing(null);
    form.resetFields();
    if (parentId) form.setFieldsValue({ parentId });
    setFileList([]);
    setModalOpen(true);
  };

  const openEdit = (record: CategoryNode) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      icon: record.icon,
      description: record.description,
      parentId: record.parentId || undefined,
      sortOrder: record.sortOrder,
      isVisible: record.isVisible,
    });
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
    return false;
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

      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append('file', fileList[0].originFileObj as File);
      }

      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, formData);
        message.success('分类已更新');
      } else {
        await api.post('/admin/categories', formData);
        message.success('分类已创建');
      }
      setModalOpen(false);
      fetchCategories();
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      message.success('分类已删除');
      fetchCategories();
    } catch {
      // 错误已在拦截器中处理
    }
  };

  const moveCategory = async (record: CategoryNode, direction: 'up' | 'down') => {
    const siblings = findSiblings(categories, record.parentId).sort(
      (a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0),
    );
    const idx = siblings.findIndex((s) => s.id === record.id);
    if (idx < 0) return;
    const other = direction === 'up' ? siblings[idx - 1] : siblings[idx + 1];
    if (!other) return;
    try {
      if (record.sortOrder === other.sortOrder) {
        // 同值：上移当前+1，下移邻居+1
        const id = direction === 'up' ? record.id : other.id;
        const newOrder = (direction === 'up' ? record.sortOrder : other.sortOrder) + 1;
        await api.put('/admin/categories/sort/batch', [{ id, sortOrder: newOrder }]);
      } else {
        // 不同值：交换 sortOrder
        await api.put('/admin/categories/sort/batch', [
          { id: record.id, sortOrder: other.sortOrder },
          { id: other.id, sortOrder: record.sortOrder },
        ]);
      }
      fetchCategories();
    } catch {
      // 错误已在拦截器中处理
    }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 80,
      render: (url: string | null) => (
        url ? <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : '-'
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 180,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
    },
    {
      title: '可见',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 60,
      render: (v: boolean) => (v ? '是' : '否'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: unknown, record: CategoryNode) => (
        <Space>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openCreate(record.id)}
          >
            子分类
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Button
            size="small"
            icon={<ArrowUpOutlined />}
            onClick={() => moveCategory(record, 'up')}
          />
          <Button
            size="small"
            icon={<ArrowDownOutlined />}
            onClick={() => moveCategory(record, 'down')}
          />
          <Popconfirm
            title="确定删除此分类？"
            description="有子分类或关联产品时无法删除"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
          新增分类
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        defaultExpandAllRows
        pagination={false}
      />

      <Modal
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={uploading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: '请输入 slug' }]}
          >
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item name="parentId" label="父分类">
            <Select
              allowClear
              placeholder="留空为一级分类"
              options={flattenCategories(categories)
                .filter((c) => c.id !== editing?.id)
                .map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item label="封面图">
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
                  alt="当前封面"
                  style={{ width: 102, height: 102, objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
                <p style={{ color: '#999', fontSize: 12 }}>当前封面（上传新图片将替换）</p>
              </div>
            )}
            {!editing && fileList.length === 0 && (
              <p style={{ color: '#999', fontSize: 12 }}>支持 JPG/PNG/WebP，最大 5MB</p>
            )}
          </Form.Item>
          <Form.Item name="icon" label="图标 URL">
            <Input placeholder="图标图片地址" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="isVisible" label="显示" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  const walk = (list: CategoryNode[], prefix: string) => {
    for (const node of list) {
      result.push({ ...node, name: prefix + node.name });
      if (node.children?.length) {
        walk(node.children, prefix + '--');
      }
    }
  };
  walk(nodes, '');
  return result;
}

function findSiblings(
  nodes: CategoryNode[],
  parentId: string | null,
): CategoryNode[] {
  if (!parentId) return nodes;
  for (const node of nodes) {
    if (node.id === parentId) return node.children || [];
    if (node.children?.length) {
      const found = findSiblings(node.children, parentId);
      if (found.length > 0) return found;
    }
  }
  return [];
}
