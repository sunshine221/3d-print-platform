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
  MenuOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Sider, Header, Content } = Layout;

const MOBILE_BREAKPOINT = 991;

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // 移动端导航后自动关闭侧边栏
  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
    navigate('/login');
  };

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean)[0];

  const isBrandCollapsed = isMobile ? false : collapsed;

  const sidebarContent = (
    <>
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
        {!isBrandCollapsed && (
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
    </>
  );

  const siderStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          style={siderStyle}
          width={240}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* 移动端侧边栏覆层 */}
      {isMobile && mobileSidebarOpen && (
        <>
          <div
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 240,
              zIndex: 999,
              background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
              overflow: 'auto',
            }}
          >
            {sidebarContent}
          </div>
        </>
      )}

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            height: 56,
          }}
        >
          <Button
            icon={<MenuOutlined />}
            onClick={() => {
              if (isMobile) {
                setMobileSidebarOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            type="text"
          />
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
