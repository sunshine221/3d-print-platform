'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateMe, changePassword } from '@/lib/api';

const inputClass = 'w-full px-3 py-2 bg-void-800 border border-white/10 rounded-lg text-void-200 placeholder:text-void-500 focus:outline-none focus:ring-2 focus:ring-cyber-400 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-void-300 mb-1';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await updateMe({ name, defaultContactName: contactName, defaultContactPhone: contactPhone, defaultAddress: address });
      setProfileMsg('保存成功');
    } catch (err: any) {
      setProfileMsg(err.message || '保存失败');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg('');
    try {
      await changePassword({ currentPassword, newPassword });
      setPwdMsg('密码修改成功');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwdMsg(err.message || '修改失败');
    } finally {
      setPwdSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-void-100 mb-4">基本信息</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
          <div>
            <label className={labelClass}>昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>手机号</label>
            <input
              type="text"
              value={user?.phone || ''}
              disabled
              className="w-full px-3 py-2 border border-white/5 rounded-lg bg-white/5 text-void-400"
            />
          </div>
          {profileMsg && (
            <p className={`text-sm ${profileMsg.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{profileMsg}</p>
          )}
          <button
            type="submit"
            disabled={profileSaving}
            className="gradient-btn px-6 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {profileSaving ? '保存中...' : '保存'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-void-100 mb-4">默认联系信息</h2>
        <form className="space-y-4 max-w-md">
          <div>
            <label className={labelClass}>默认联系人</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>默认联系电话</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>默认地址</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-void-100 mb-4">修改密码</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className={labelClass}>当前密码</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>新密码</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {pwdMsg && (
            <p className={`text-sm ${pwdMsg.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{pwdMsg}</p>
          )}
          <button
            type="submit"
            disabled={pwdSaving}
            className="gradient-btn px-6 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {pwdSaving ? '保存中...' : '修改密码'}
          </button>
        </form>
      </section>
    </div>
  );
}
