import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/admin/auth/login', values);
      console.log('API response:', res.data);
      localStorage.setItem('admin_token', res.data.data.accessToken);
      localStorage.setItem('admin_refresh', res.data.data.refreshToken);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('登录错误:', err);
      const msg = err?.response?.data?.message || err?.message || '登录失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title="3D 打印管理后台" style={{ width: 400 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input prefix={<UserOutlined />} placeholder="管理员邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
