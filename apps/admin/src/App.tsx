import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import AdminLayout from './components/layout/AdminLayout';
import { setMessageApi } from './services/messageHolder';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ProductEditPage from './pages/ProductEditPage';
import CategoryPage from './pages/CategoryPage';
import OrderListPage from './pages/OrderListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import InquiryListPage from './pages/InquiryListPage';
import InquiryDetailPage from './pages/InquiryDetailPage';
import BannerPage from './pages/BannerPage';
import PageListPage from './pages/PageListPage';
import PageEditPage from './pages/PageEditPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import SystemConfigPage from './pages/SystemConfigPage';
import ContactMessagePage from './pages/ContactMessagePage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import LogListPage from './pages/LogListPage';

export default function App() {
  const { message } = AntdApp.useApp();
  const hasToken = !!localStorage.getItem('admin_token');

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={hasToken ? <AdminLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/create" element={<ProductEditPage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="inquiries" element={<InquiryListPage />} />
        <Route path="inquiries/:id" element={<InquiryDetailPage />} />
        <Route path="banners" element={<BannerPage />} />
        <Route path="pages" element={<PageListPage />} />
        <Route path="pages/:id/edit" element={<PageEditPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="settings" element={<SystemConfigPage />} />
        <Route path="messages" element={<ContactMessagePage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="logs" element={<LogListPage />} />
      </Route>
    </Routes>
  );
}
