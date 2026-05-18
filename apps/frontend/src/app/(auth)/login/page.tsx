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

  const inputClass = 'w-full px-3 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded-lg text-void-800 dark:text-void-200 placeholder:text-void-400 dark:placeholder:text-void-500 focus:outline-none focus:ring-2 focus:ring-cyber-500 dark:focus:ring-cyber-400 focus:border-transparent';

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-8 text-void-900 dark:text-void-100">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-void-600 dark:text-void-300 mb-1">手机号/账号</label>
          <input
            type="text"
            required
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className={inputClass}
            placeholder="请输入手机号或账号"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-void-600 dark:text-void-300 mb-1">密码</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="请输入密码"
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="gradient-btn w-full py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-void-500 dark:text-void-400 space-y-2">
        <p>
          还没有账号？<Link href="/register" className="text-cyber-500 dark:text-cyber-400 hover:text-cyber-600 dark:hover:text-cyber-300">立即注册</Link>
        </p>
        <p>
          <Link href="/forgot-password" className="text-cyber-500 dark:text-cyber-400 hover:text-cyber-600 dark:hover:text-cyber-300">忘记密码？</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-void-500 dark:text-void-400">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
