'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/theme/ThemeToggle';

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
          ? 'glass shadow-glow-cyan-sm'
          : 'bg-void-50/90 dark:bg-void-900/80 backdrop-blur-sm border-b border-void-200 dark:border-white/5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center text-void-900 font-bold text-sm shadow-glow-cyan-sm group-hover:shadow-glow-cyan transition-shadow">
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
              className="px-3 py-2 rounded-lg text-void-600 dark:text-void-200 hover:text-cyber-600 dark:hover:text-cyber-400 hover:bg-cyber-400/5 transition-all duration-200 relative group"
            >
              {link.label}
              <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-cyber-400 to-neon-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            </Link>
          ))}

          <ThemeToggle />

          <div className="w-px h-5 bg-void-300 dark:bg-white/10 mx-2" />

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/5 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-400 to-neon-500 text-white flex items-center justify-center text-xs font-medium shadow-glow-cyan-sm">
                  {((user?.name ?? user?.username ?? '?')[0] ?? '?').toUpperCase()}
                </span>
                <span className="hidden md:inline text-sm font-medium text-void-700 dark:text-void-100">
                  {user?.name || user?.username}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-void-800 rounded-xl shadow-glow-card border border-void-200 dark:border-white/8 py-1 z-20 animate-scale-in origin-top-right backdrop-blur-xl">
                    <Link
                      href="/account"
                      className="block px-4 py-2.5 text-sm text-void-700 dark:text-void-100 hover:text-cyber-600 dark:hover:text-cyber-400 hover:bg-void-100 dark:hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      个人中心
                    </Link>
                    <hr className="my-1 border-void-200 dark:border-white/8" />
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
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
