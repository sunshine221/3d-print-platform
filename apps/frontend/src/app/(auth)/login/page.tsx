'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { login, isLoggedIn, isLoading } = useAuth();

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn && !isLoading) {
    window.location.href = redirect;
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ account, password });
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-8">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号/账号</label>
          <input
            type="text"
            required
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入手机号或账号"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入密码"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
        <p>
          还没有账号？<Link href="/register" className="text-blue-600 hover:underline">立即注册</Link>
        </p>
        <p>
          <Link href="/forgot-password" className="text-blue-600 hover:underline">忘记密码？</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
