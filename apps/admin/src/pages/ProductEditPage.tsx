import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Card,
  Table,
  Modal,
  InputNumber,
  Space,
  Switch,
  Tag,
  Popconfirm,
  message,
  Upload,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  StarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import api from '../services/api';

interface CategoryBrief {
  id: string;
  name: string;
  slug: string;
}

interface SKUItem {
  id: string;
  skuCode: string;
  specCombo: Record<string, string>;
  price: number;
  minOrderQty: number;
  stockStatus: string;
  leadTimeDays: number | null;
  imageUrl: string | null;
  status: string;
}

interface ImageItem {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface Model3DItem {
  id: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  thumbnailUrl: string | null;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  productType: string;
  tolerance: string | null;
  status: string;
  specs: { name: string; value: string }[];
  categories: CategoryBrief[];
  skus: SKUItem[];
  images: ImageItem[];
  model3d: Model3DItem | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  thumbnailUrl: string | null;
}

const STOCK_STATUS_OPTIONS = [
  { value: 'in_stock', label: '现货' },
  { value: 'low_stock', label: '低库存' },
  { value: 'out_of_stock', label: '缺货' },
  { value: 'make_to_order', label: '接单生产' },
];

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreate = !id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<CategoryBrief[]>([]);
  const [form] = Form.useForm();

  // SKU 弹窗
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [skuEditing, setSkuEditing] = useState<SKUItem | null>(null);
  const [skuForm] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/admin/categories');
      // 扁平化树形分类
      const flat: CategoryBrief[] = [];
      const walk = (nodes: any[]) => {
        for (const node of nodes) {
          flat.push({ id: node.id, name: node.name, slug: node.slug });
          if (node.children?.length) walk(node.children);
        }
      };
      walk(res.data || []);
      setCategories(flat);
    } catch { /* */ }
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/products/${id}`);
      const p = res.data;
      setProduct(p);
      form.setFieldsValue({
        name: p.name,
        slug: p.slug,
        subtitle: p.subtitle,
        description: p.description,
        productType: p.productType,
        tolerance: p.tolerance,
        status: p.status,
        categoryIds: p.categories?.map((c: CategoryBrief) => c.id) || [],
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        seoKeywords: p.seoKeywords,
        thumbnailUrl: p.thumbnailUrl,
      });
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [fetchCategories, fetchProduct]);

  // ===== 保存基本信息 =====

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (isCreate) {
        const res = await api.post('/admin/products', values);
        message.success('产品已创建');
        navigate(`/products/${res.data.id}/edit`);
      } else {
        await api.put(`/admin/products/${id}`, values);
        message.success('已保存');
        fetchProduct();
      }
    } catch { /* 拦截器已处理 */ }
    finally { setSaving(false); }
  };

  // ===== SKU 管理 =====

  const openSkuCreate = () => {
    setSkuEditing(null);
    skuForm.resetFields();
    skuForm.setFieldsValue({ minOrderQty: 1, stockStatus: 'make_to_order', status: 'active' });
    setSkuModalOpen(true);
  };

  const openSkuEdit = (record: SKUItem) => {
    setSkuEditing(record);
    skuForm.setFieldsValue({
      skuCode: record.skuCode,
      specCombo: JSON.stringify(record.specCombo, null, 2),
      price: record.price,
      minOrderQty: record.minOrderQty,
      stockStatus: record.stockStatus,
      leadTimeDays: record.leadTimeDays,
      imageUrl: record.imageUrl,
      status: record.status,
    });
    setSkuModalOpen(true);
  };

  const handleSkuSubmit = async () => {
    const values = await skuForm.validateFields();
    const body = {
      ...values,
      specCombo: typeof values.specCombo === 'string'
        ? JSON.parse(values.specCombo)
        : values.specCombo,
    };

    try {
      if (skuEditing) {
        await api.put(`/admin/products/${id}/skus/${skuEditing.id}`, body);
        message.success('SKU 已更新');
      } else {
        await api.post(`/admin/products/${id}/skus`, body);
        message.success('SKU 已添加');
      }
      setSkuModalOpen(false);
      fetchProduct();
    } catch { /* 拦截器已处理 */ }
  };

  const handleSkuDelete = async (skuId: string) => {
    try {
      await api.delete(`/admin/products/${id}/skus/${skuId}`);
      message.success('SKU 已删除');
      fetchProduct();
    } catch { /* */ }
  };

  // ===== 图片管理 =====

  const handleImageUpload = async (file: File) => {
    try {
      // 1. 获取预签名 URL
      const presignRes = await api.post('/admin/media/presigned-url', {
        fileName: file.name,
        fileType: 'image',
        contentType: file.type,
      });
      const { uploadUrl, fileUrl } = presignRes.data;

      // 2. 直传到 MinIO
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

      // 3. 添加到产品图片
      await api.post(`/admin/products/${id}/images`, { url: fileUrl, altText: file.name });
      message.success('图片已上传');
      fetchProduct();
    } catch {
      message.error('上传失败');
    }
    return false; // 阻止默认上传
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await api.put(`/admin/products/${id}/images/${imageId}/primary`);
      fetchProduct();
    } catch { /* */ }
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      await api.delete(`/admin/products/${id}/images/${imageId}`);
      fetchProduct();
    } catch { /* */ }
  };

  // ===== 3D 模型 =====

  const handleModelUpload = async (file: File) => {
    try {
      const presignRes = await api.post('/admin/media/presigned-url', {
        fileName: file.name,
        fileType: 'model_3d',
        contentType: file.type || 'application/octet-stream',
      });
      const { uploadUrl, fileUrl } = presignRes.data;

      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });

      await api.post(`/admin/products/${id}/model3d`, {
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      });
      message.success('3D 模型已上传');
      fetchProduct();
    } catch {
      message.error('上传失败');
    }
    return false;
  };

  // ===== 规格参数 =====

  const [specs, setSpecs] = useState<{ name: string; value: string }[]>(
    product?.specs || [],
  );

  useEffect(() => {
    if (product?.specs) setSpecs(product.specs);
  }, [product?.specs]);

  const addSpecRow = () => setSpecs([...specs, { name: '', value: '' }]);
  const removeSpecRow = (idx: number) => setSpecs(specs.filter((_, i) => i !== idx));
  const updateSpec = (idx: number, field: 'name' | 'value', val: string) => {
    const next = [...specs];
    next[idx] = { ...next[idx]!, [field]: val };
    setSpecs(next);
  };

  // ===== 渲染 =====

  const skuColumns = [
    { title: '编码', dataIndex: 'skuCode', key: 'skuCode', width: 130 },
    {
      title: '规格组合', dataIndex: 'specCombo', key: 'specCombo', width: 200,
      render: (v: Record<string, string>) =>
        Object.entries(v || {}).map(([k, val]) => (
          <Tag key={k}>{k}: {val}</Tag>
        )),
    },
    {
      title: '价格', dataIndex: 'price', key: 'price', width: 90,
      render: (v: number) => `¥${v}`,
    },
    { title: '起订量', dataIndex: 'minOrderQty', key: 'minOrderQty', width: 60 },
    {
      title: '库存', dataIndex: 'stockStatus', key: 'stockStatus', width: 80,
      render: (v: string) => {
        const m: Record<string, string> = { in_stock: '现货', low_stock: '低库存', out_of_stock: '缺货', make_to_order: '接单生产' };
        return m[v] || v;
      },
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 60,
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: SKUItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openSkuEdit(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleSkuDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const imageColumns = [
    {
      title: '缩略图', dataIndex: 'url', key: 'url', width: 80,
      render: (url: string) => <img src={url} style={{ width: 50, height: 50, objectFit: 'cover' }} alt="" />,
    },
    { title: 'URL', dataIndex: 'url', key: 'url2', ellipsis: true },
    {
      title: '主图', dataIndex: 'isPrimary', key: 'isPrimary', width: 60,
      render: (v: boolean) => v ? <Tag color="gold">主图</Tag> : null,
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60 },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: ImageItem) => (
        <Space>
          {!record.isPrimary && (
            <Button size="small" icon={<StarOutlined />} onClick={() => handleSetPrimary(record.id)} />
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleImageDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 只有编辑模式才显示 SKU/图片/模型 tabs
  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Card>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="产品名称" rules={[{ required: true }]}>
                  <Input maxLength={200} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                  <Input maxLength={250} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="subtitle" label="副标题">
              <Input maxLength={300} />
            </Form.Item>
            <Form.Item name="description" label="描述（支持 HTML）">
              <Input.TextArea rows={6} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="productType" label="产品类型" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { value: 'standard', label: '标准产品' },
                      { value: 'print_service', label: '代打服务' },
                      { value: 'both', label: '双模式' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="categoryIds" label="分类">
                  <Select
                    mode="multiple"
                    placeholder="选择分类"
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="状态">
                  <Select
                    options={[
                      { value: 'draft', label: '草稿' },
                      { value: 'published', label: '已上架' },
                      { value: 'archived', label: '已下架' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="tolerance" label="精度/公差">
              <Input placeholder="如 ±0.1mm" />
            </Form.Item>
            <Form.Item name="thumbnailUrl" label="缩略图 URL">
              <Input placeholder="http://..." />
            </Form.Item>

            {/* 规格参数 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>规格参数</span>
                <Button size="small" icon={<PlusOutlined />} onClick={addSpecRow}>添加行</Button>
              </div>
              {specs.map((spec, idx) => (
                <Row key={idx} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={8}>
                    <Input
                      placeholder="参数名"
                      value={spec.name}
                      onChange={(e) => updateSpec(idx, 'name', e.target.value)}
                    />
                  </Col>
                  <Col span={14}>
                    <Input
                      placeholder="参数值"
                      value={spec.value}
                      onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                    />
                  </Col>
                  <Col span={2}>
                    <Button danger icon={<DeleteOutlined />} onClick={() => removeSpecRow(idx)} />
                  </Col>
                </Row>
              ))}
            </div>

            <Button type="primary" onClick={handleSave} loading={saving}>
              {isCreate ? '创建产品' : '保存基本信息'}
            </Button>
          </Form>
        </Card>
      ),
    },
  ];

  // 编辑模式才有更多 tab
  if (!isCreate) {
    tabItems.push(
      {
        key: 'skus',
        label: `SKU 管理 (${product?.skus?.length || 0})`,
        children: (
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={openSkuCreate}>
                新增 SKU
              </Button>
            </div>
            <Table
              columns={skuColumns}
              dataSource={product?.skus || []}
              rowKey="id"
              pagination={false}
              size="small"
            />

            <Modal
              title={skuEditing ? '编辑 SKU' : '新增 SKU'}
              open={skuModalOpen}
              onOk={handleSkuSubmit}
              onCancel={() => setSkuModalOpen(false)}
              width={600}
            >
              <Form form={skuForm} layout="vertical">
                <Form.Item name="skuCode" label="SKU 编码（留空自动生成）">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="specCombo"
                  label="规格组合 (JSON)"
                  rules={[{ required: true, message: '请输入规格组合' }]}
                >
                  <Input.TextArea rows={4} placeholder='{"材质":"树脂","颜色":"白色","尺寸":"15cm"}' />
                </Form.Item>
                <Form.Item name="price" label="价格 (元)" rules={[{ required: true }]}>
                  <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="minOrderQty" label="起订量">
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="stockStatus" label="库存状态">
                      <Select options={STOCK_STATUS_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="leadTimeDays" label="交货周期（天）">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="status" label="状态">
                      <Select
                        options={[
                          { value: 'active', label: '启用' },
                          { value: 'inactive', label: '停用' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="imageUrl" label="SKU 图片 URL">
                  <Input />
                </Form.Item>
              </Form>
            </Modal>
          </Card>
        ),
      },
      {
        key: 'images',
        label: `图片 (${product?.images?.length || 0})`,
        children: (
          <Card>
            <Upload
              beforeUpload={handleImageUpload}
              showUploadList={false}
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
            >
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
            <Table
              columns={imageColumns}
              dataSource={product?.images || []}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ marginTop: 16 }}
            />
          </Card>
        ),
      },
      {
        key: 'model3d',
        label: '3D 模型',
        children: (
          <Card>
            {product?.model3d ? (
              <div style={{ marginBottom: 16 }}>
                <p>文件名: {product.model3d.fileName || '-'}</p>
                <p>大小: {product.model3d.fileSize ? `${(product.model3d.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                <p>URL: {product.model3d.fileUrl}</p>
              </div>
            ) : (
              <p style={{ color: '#999', marginBottom: 16 }}>尚未上传 3D 模型</p>
            )}
            <Upload
              beforeUpload={handleModelUpload}
              showUploadList={false}
              accept=".gltf,.glb"
            >
              <Button icon={<UploadOutlined />}>
                {product?.model3d ? '替换模型' : '上传模型'}
              </Button>
            </Upload>
          </Card>
        ),
      },
      {
        key: 'seo',
        label: 'SEO',
        children: (
          <Card>
            <Form form={form} layout="vertical">
              <Form.Item name="seoTitle" label="SEO 标题">
                <Input maxLength={200} />
              </Form.Item>
              <Form.Item name="seoDescription" label="SEO 描述">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="seoKeywords" label="SEO 关键词">
                <Input placeholder="用英文逗号分隔" />
              </Form.Item>
              <Button type="primary" onClick={handleSave} loading={saving}>
                保存 SEO 设置
              </Button>
            </Form>
          </Card>
        ),
      },
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{isCreate ? '新增产品' : `编辑: ${product?.name || ''}`}</h2>
        <Button onClick={() => navigate('/products')}>返回列表</Button>
      </div>
      <Tabs items={tabItems} />
    </div>
  );
}
