import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  FolderOutlined,
  PictureOutlined,
  FileOutlined,
  SettingOutlined,
  MailOutlined,
  TeamOutlined,
  FileSearchOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Sider, Header, Content } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'content',
    icon: <FolderOutlined />,
    label: '内容管理',
    children: [
      { key: '/banners', icon: <PictureOutlined />, label: 'Banner' },
      { key: '/pages', icon: <FileOutlined />, label: '页面管理' },
    ],
  },
  { key: '/products', icon: <InboxOutlined />, label: '产品管理' },
  { key: '/categories', icon: <FolderOutlined />, label: '分类管理' },
  { key: '/media', icon: <PictureOutlined />, label: '素材库' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/inquiries', icon: <FileTextOutlined />, label: '代打询价' },
  {
    key: 'users',
    icon: <TeamOutlined />,
    label: '用户管理',
    children: [
      { key: '/customers', icon: <TeamOutlined />, label: '客户管理' },
      { key: '/messages', icon: <MailOutlined />, label: '联系我们' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统设置',
    children: [
      { key: '/settings', icon: <SettingOutlined />, label: '系统配置' },
      { key: '/logs', icon: <FileSearchOutlined />, label: '操作日志' },
    ],
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
    navigate('/login');
  };

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean)[0];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        }}
        width={240}
      >
        <div
          style={{
            height: 56,
            margin: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            3D
          </div>
          {!collapsed && (
            <span style={{ color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>
              3D 打印
            </span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['content', 'users', 'system']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            padding: '0 12px',
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            height: 56,
          }}
        >
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="text"
            style={{ color: '#6b7280' }}
          >
            退出
          </Button>
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
