import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import OrderListPage from './pages/OrderListPage';
import InquiryListPage from './pages/InquiryListPage';

export default function App() {
  const hasToken = !!localStorage.getItem('admin_token');

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
        <Route path="orders" element={<OrderListPage />} />
        <Route path="inquiries" element={<InquiryListPage />} />
      </Route>
    </Routes>
  );
}
