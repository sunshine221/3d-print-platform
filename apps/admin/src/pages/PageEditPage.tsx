import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Spin, message, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isSystem: boolean;
}

export default function PageEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/admin/pages/${id}`)
      .then((res) => setPage(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      await api.patch(`/admin/pages/${id}`, {
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      });
      message.success('已保存');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!page) return <div>页面不存在</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>编辑页面：{page.title}</h2>
        <Space>
          <Button onClick={() => navigate('/pages')}>返回</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            保存
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="标题">
            <Input value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} disabled={page.isSystem} />
          </Form.Item>
          <Form.Item label="Slug">
            <Input value={page.slug} disabled />
          </Form.Item>
          <Form.Item label="内容">
            <ReactQuill
              value={page.content || ''}
              onChange={(v) => setPage({ ...page, content: v })}
              style={{ height: 400, marginBottom: 48 }}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ color: [] }, { background: [] }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  ['clean'],
                ],
              }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="SEO 信息">
        <Form layout="vertical">
          <Form.Item label="Meta Title">
            <Input value={page.metaTitle || ''} onChange={(e) => setPage({ ...page, metaTitle: e.target.value })} />
          </Form.Item>
          <Form.Item label="Meta Description">
            <Input.TextArea
              rows={3}
              value={page.metaDescription || ''}
              onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
