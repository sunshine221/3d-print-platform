'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/api';

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
        <h1 className="text-2xl font-bold mb-4">密码重置成功</h1>
        <p className="text-gray-600 mb-6">您可以使用新密码登录了。</p>
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          前往登录 →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">重置密码</h1>
      <p className="text-gray-500 text-center text-sm mb-8">
        输入手机号和新密码
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入11位手机号"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="至少6位"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {submitting ? '重置中...' : '重置密码'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-blue-600 hover:underline">← 返回登录</Link>
      </p>
    </div>
  );
}
