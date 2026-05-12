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
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                3D
              </span>
              <span className="text-white font-bold text-lg">3D 打印</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              高精度工业级 3D 打印服务，提供多种材质选择，快速交付，品质保证。
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} 3D 打印平台. All rights reserved.</p>
          <div className="flex items-center gap-1 text-gray-500">
            <span>邮箱: contact@ymbj.online</span>
            <span className="mx-2">·</span>
            <span>在线服务</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
