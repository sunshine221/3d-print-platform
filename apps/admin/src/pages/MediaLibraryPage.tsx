import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Button, Modal, Upload, Breadcrumb, Space, Popconfirm, message,
  Card, Input,
} from 'antd';
import {
  UploadOutlined, FolderAddOutlined, DeleteOutlined,
  FolderOutlined, FileOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import api from '../services/api';

interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string | null;
  fileSize: number | null;
  isFolder: boolean;
  folderId: string | null;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [data, setData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: 1, pageSize: 200 };
      if (folderId) params.folderId = folderId;
      const res = await api.get('/admin/media', { params });
      setData(res.data?.items || []);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/media/${id}`);
      message.success('已删除');
      fetchData();
    } catch { /* 拦截器已处理 */ }
  };

  const handleBatchDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => api.delete(`/admin/media/${id}`)));
      message.success('已批量删除');
      setSelectedRowKeys([]);
      fetchData();
    } catch { /* 拦截器已处理 */ }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.post('/admin/media', { fileName: newFolderName, isFolder: true, folderId });
      message.success('已创建文件夹');
      setCreateFolderOpen(false);
      setNewFolderName('');
      fetchData();
    } catch { /* 拦截器已处理 */ }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    try {
      await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('上传成功');
      fetchData();
      setUploadOpen(false);
    } catch { /* 拦截器已处理 */ }
    return false;
  };

  const folders = data.filter((d) => d.isFolder);
  const files = data.filter((d) => !d.isFolder);

  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name: string, record: MediaItem) => (
        <Space>
          {record.isFolder ? <FolderOutlined style={{ color: '#faad14' }} /> : <FileOutlined />}
          {record.isFolder ? (
            <a onClick={() => { setFolderId(record.id); setFolderName(record.fileName); }}>{name}</a>
          ) : (
            <span>{name}</span>
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 100,
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number | null) => {
        if (size == null) return '-';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: MediaItem) => (
        <Space>
          {!record.isFolder && (
            <Button size="small" onClick={() => window.open(record.fileUrl, '_blank')}>查看</Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>素材库</h2>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          {folderId && (
            <Breadcrumb
              items={[
                { title: <a onClick={() => { setFolderId(null); setFolderName(''); }}>根目录</a> },
                { title: folderName },
              ]}
            />
          )}
          <Button icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>上传文件</Button>
          <Button icon={<FolderAddOutlined />} onClick={() => setCreateFolderOpen(true)}>新建文件夹</Button>
        </Space>
      </Card>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <span>已选 {selectedRowKeys.length} 项</span>
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
        pagination={false}
      />

      <Modal title="上传文件" open={uploadOpen} onCancel={() => setUploadOpen(false)} footer={null}>
        <Upload.Dragger
          beforeUpload={(file) => { handleUpload(file); return false; }}
          showUploadList={false}
        >
          <p><UploadOutlined style={{ fontSize: 48 }} /></p>
          <p>点击或拖拽文件到此区域上传</p>
        </Upload.Dragger>
      </Modal>

      <Modal
        title="新建文件夹"
        open={createFolderOpen}
        onOk={handleCreateFolder}
        onCancel={() => setCreateFolderOpen(false)}
      >
        <Input
          placeholder="文件夹名称"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleCreateFolder}
        />
      </Modal>
    </div>
  );
}
