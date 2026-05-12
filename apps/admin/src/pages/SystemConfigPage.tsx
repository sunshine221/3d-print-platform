import { useState, useEffect, useCallback } from 'react';
import { Tabs, Form, Input, Button, Card, Spin, message, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import api from '../services/api';

type ConfigMap = Record<string, Record<string, string>>;

export default function SystemConfigPage() {
  const [config, setConfig] = useState<ConfigMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/system-config');
      setConfig(res.data || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async (groupName: string, values: Record<string, string>) => {
    setSaving(true);
    try {
      const items = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        groupName,
      }));
      await api.put('/admin/system-config', items);
      message.success('已保存');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const groups = Object.keys(config);

  if (groups.length === 0) {
    return (
      <div>
        <h2>系统配置</h2>
        <Card><p style={{ color: '#999' }}>暂无配置项</p></Card>
      </div>
    );
  }

  return (
    <div>
      <h2>系统配置</h2>
      <Tabs
        items={groups.map((group) => ({
          key: group,
          label: group,
          children: (
            <ConfigForm
              groupName={group}
              values={config[group] || {}}
              onSave={handleSave}
              saving={saving}
            />
          ),
        }))}
      />
    </div>
  );
}

function ConfigForm({
  groupName,
  values,
  onSave,
  saving,
}: {
  groupName: string;
  values: Record<string, string>;
  onSave: (group: string, values: Record<string, string>) => Promise<void>;
  saving: boolean;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(values);
  }, [values, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(vals) => onSave(groupName, vals)}
    >
      {Object.keys(values).map((key) => (
        <Form.Item key={key} name={key} label={key}>
          <Input.TextArea rows={2} />
        </Form.Item>
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
          保存
        </Button>
      </Form.Item>
    </Form>
  );
}
