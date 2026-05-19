import axios from 'axios';
import { getMessage } from './messageHolder';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

function showError(msg: string) {
  const message = getMessage();
  if (message) {
    message.error(msg);
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code !== 0 && data.code !== undefined) {
      showError(data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    const msg = error.response?.data?.message || error.message || '网络错误';
    showError(msg);
    return Promise.reject(error);
  },
);

export default api;
