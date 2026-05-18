import Link from 'next/link';

const footerLinks = {
  '产品服务': [
    { href: '/products', label: '产品浏览' },
    { href: '/inquiry', label: '代打服务' },
    { href: '/materials', label: '材料介绍' },
  ],
  '帮助支持': [
    { href: '/guide', label: '打印指南' },
    { href: '/faq', label: '常见问题' },
    { href: '/contact', label: '联系我们' },
  ],
  '关于我们': [
    { href: '/about', label: '公司介绍' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-void-100 dark:bg-void-950 text-void-500 dark:text-void-300 relative border-t border-void-200 dark:border-white/5">
      <div className="glow-line absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center text-void-900 font-bold text-sm shadow-glow-cyan-sm">
                3D
              </span>
              <span className="text-void-900 dark:text-white font-bold text-lg">3D 打印</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-void-500 dark:text-void-300">
              高精度工业级 3D 打印服务，提供多种材质选择，快速交付，品质保证。
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-void-700 dark:text-void-100 font-semibold text-sm mb-4 tracking-wide">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-void-500 dark:text-void-300 hover:text-cyber-500 dark:hover:text-cyber-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-void-200 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-void-400 dark:text-void-400">&copy; {new Date().getFullYear()} 3D 打印平台. All rights reserved.</p>
          <div className="flex items-center gap-1 text-void-400 dark:text-void-400">
            <span>邮箱: contact@ymbj.online</span>
            <span className="mx-2 text-void-300 dark:text-white/15">·</span>
            <span>在线服务</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
