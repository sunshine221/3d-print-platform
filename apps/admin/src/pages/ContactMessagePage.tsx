import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Tag, Input, Space, message, Form,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import api from '../services/api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  reply: string | null;
  createdAt: string;
}

export default function ContactMessagePage() {
  const [data, setData] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchData = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contact', { params: { page, pageSize } });
      setData(res.data?.items || []);
      setPagination(res.data?.pagination || { page, pageSize, total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (record: ContactMessage) => {
    try {
      const res = await api.get(`/admin/contact/${record.id}`);
      setDetail(res.data);
      setReplyText('');
      setDetailOpen(true);
      if (!res.data.isRead) fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器已处理 */ }
  };

  const handleReply = async () => {
    if (!detail || !replyText.trim()) return;
    try {
      await api.post(`/admin/contact/${detail.id}/reply`, { reply: replyText });
      message.success('已回复');
      setDetailOpen(false);
      fetchData(pagination.page, pagination.pageSize);
    } catch { /* 拦截器已处理 */ }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
    {
      title: '内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg: string) => msg.length > 50 ? `${msg.slice(0, 50)}...` : msg,
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 80,
      render: (read: boolean) => read ? <Tag color="green">已读</Tag> : <Tag color="blue">未读</Tag>,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: ContactMessage) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(record)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>联系我们</h2>

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

      <Modal
        title="消息详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {detail && (
          <div>
            <p><strong>姓名：</strong>{detail.name}</p>
            <p><strong>邮箱：</strong>{detail.email}</p>
            <p><strong>时间：</strong>{new Date(detail.createdAt).toLocaleString('zh-CN')}</p>
            <p><strong>内容：</strong></p>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, marginBottom: 16 }}>
              {detail.message}
            </div>
            {detail.reply && (
              <>
                <p><strong>已回复：</strong></p>
                <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                  {detail.reply}
                </div>
              </>
            )}
            {!detail.reply && (
              <div>
                <Input.TextArea
                  rows={3}
                  placeholder="输入回复内容..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <Button type="primary" onClick={handleReply} style={{ marginTop: 8 }} disabled={!replyText.trim()}>
                  发送回复
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
