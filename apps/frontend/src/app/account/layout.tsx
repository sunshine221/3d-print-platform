'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/Loading';

const navItems = [
  { label: '个人信息', href: '/account/profile' },
  { label: '我的订单', href: '/account/orders' },
  { label: '我的询价', href: '/account/inquiries' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, isLoggedIn } = useAuth();

  if (isLoading) return <Loading />;
  if (!isLoggedIn) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-void-900 dark:text-void-100">个人中心</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-48 shrink-0">
          <div className="mb-4 pb-4 border-b border-void-200 dark:border-white/8">
            <p className="font-medium text-void-800 dark:text-void-100">{user?.name || user?.username}</p>
            <p className="text-sm text-void-500 dark:text-void-400">{user?.phone}</p>
          </div>
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  pathname.startsWith(item.href)
                    ? 'bg-cyber-400/10 text-cyber-400 font-medium'
                    : 'text-void-600 dark:text-void-300 hover:bg-void-100 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
