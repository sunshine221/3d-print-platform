'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-nav'
          : 'bg-white/90 backdrop-blur-sm border-b border-gray-100/80'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
            3D
          </span>
          <span className="text-lg font-bold gradient-text hidden sm:block">
            3D 打印
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {[
            { href: '/', label: '首页' },
            { href: '/products', label: '产品浏览' },
            { href: '/materials', label: '材料介绍' },
            { href: '/guide', label: '打印指南' },
            { href: '/about', label: '关于我们' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}

          <div className="w-px h-5 bg-gray-200 mx-2" />

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-medium shadow-sm">
                  {((user?.name ?? user?.username ?? '?')[0] ?? '?').toUpperCase()}
                </span>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {user?.name || user?.username}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-scale-in origin-top-right">
                    <Link
                      href="/account"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      个人中心
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="gradient-btn px-4 py-2 rounded-lg text-sm font-medium"
            >
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
