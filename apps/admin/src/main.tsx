import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#2563eb',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            colorInfo: '#3b82f6',
            borderRadius: 8,
            borderRadiusLG: 12,
            fontFamily:
              "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 14,
            colorBgContainer: '#ffffff',
            colorBorder: '#f0f0f0',
            colorBorderSecondary: '#f5f5f5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.06)',
          },
          components: {
            Menu: {
              itemBorderRadius: 8,
              itemMarginInline: 8,
              darkItemBg: 'transparent',
              darkItemSelectedBg: 'rgba(37, 99, 235, 0.25)',
              darkItemHoverBg: 'rgba(255,255,255,0.06)',
              darkSubMenuItemBg: 'transparent',
            },
            Card: {
              paddingLG: 24,
            },
            Table: {
              headerBg: '#fafbfc',
              headerColor: '#6b7280',
              headerSplitColor: 'transparent',
              rowHoverBg: '#f8fafc',
            },
            Button: {
              primaryShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            },
            Tag: {
              borderRadiusSM: 4,
            },
          },
        }}
      >
        <AntdApp>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
