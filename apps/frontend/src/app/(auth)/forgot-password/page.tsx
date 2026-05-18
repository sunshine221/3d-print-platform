'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/api';

const inputClass = 'w-full px-3 py-2 bg-void-100 dark:bg-void-800 border border-void-300 dark:border-white/10 rounded-lg text-void-800 dark:text-void-200 placeholder:text-void-400 dark:placeholder:text-void-500 focus:outline-none focus:ring-2 focus:ring-cyber-500 dark:focus:ring-cyber-400 focus:border-transparent';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await resetPassword({ phone, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '重置失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-void-900 dark:text-void-100">密码重置成功</h1>
        <p className="text-void-500 dark:text-void-400 mb-6">您可以使用新密码登录了。</p>
        <Link href="/login" className="text-cyber-500 dark:text-cyber-400 hover:text-cyber-600 dark:hover:text-cyber-300 font-medium">
          前往登录 →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4 text-void-900 dark:text-void-100">重置密码</h1>
      <p className="text-void-500 dark:text-void-400 text-center text-sm mb-8">
        输入手机号和新密码
      </p>
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
          <label className="block text-sm font-medium text-void-600 dark:text-void-300 mb-1">新密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="至少6位"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="gradient-btn w-full py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {submitting ? '重置中...' : '重置密码'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-void-500 dark:text-void-400">
        <Link href="/login" className="text-cyber-500 dark:text-cyber-400 hover:text-cyber-600 dark:hover:text-cyber-300">← 返回登录</Link>
      </p>
    </div>
  );
}
