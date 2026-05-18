'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { register, isLoggedIn, isLoading } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn && !isLoading) {
    window.location.href = '/account';
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setSubmitting(true);
    try {
      await register({ phone, password, confirmPassword });
      window.location.href = '/account';
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded-lg text-void-800 dark:text-void-200 placeholder:text-void-400 dark:placeholder:text-void-500 focus:outline-none focus:ring-2 focus:ring-cyber-500 dark:focus:ring-cyber-400 focus:border-transparent';

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-8 text-void-900 dark:text-void-100">注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-void-600 dark:text-void-300 mb-1">手机号</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="请输入11位手机号"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-void-600 dark:text-void-300 mb-1">密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="至少6位"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-void-600 dark:text-void-300 mb-1">确认密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="再次输入密码"
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
          {submitting ? '注册中...' : '注册'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-void-500 dark:text-void-400">
        已有账号？<Link href="/login" className="text-cyber-500 dark:text-cyber-400 hover:text-cyber-600 dark:hover:text-cyber-300">去登录</Link>
      </p>
    </div>
  );
}
