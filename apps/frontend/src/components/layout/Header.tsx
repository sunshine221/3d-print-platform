'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          3D 打印
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/products" className="hover:text-blue-600">产品浏览</Link>
          <Link href="/materials" className="hover:text-blue-600">材料介绍</Link>
          <Link href="/guide" className="hover:text-blue-600">打印指南</Link>
          <Link href="/about" className="hover:text-blue-600">关于我们</Link>
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700"
              >
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                  {((user?.name ?? user?.email ?? '?')[0] ?? '?').toUpperCase()}
                </span>
                <span className="hidden md:inline">{user?.name || user?.email}</span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      个人中心
                    </Link>
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-blue-600 font-medium">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
