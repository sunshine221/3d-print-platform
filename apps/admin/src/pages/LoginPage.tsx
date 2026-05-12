import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/admin/auth/login', values);
      localStorage.setItem('admin_token', res.data.data.accessToken);
      localStorage.setItem('admin_refresh', res.data.data.refreshToken);
      message.success('登录成功');
      window.location.href = '/dashboard';
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '登录失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -300,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }}
      />

      <Card
        style={{
          width: 400,
          borderRadius: 16,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          border: 'none',
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            3D
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            3D 打印管理后台
          </h1>
          <p style={{ color: '#9ca3af', marginTop: 6, fontSize: 13 }}>
            请登录管理员账户
          </p>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, message: '请输入管理员邮箱' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="管理员邮箱"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="密码"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                borderRadius: 10,
                height: 46,
                fontWeight: 600,
                fontSize: 15,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
