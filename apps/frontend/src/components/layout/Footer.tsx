import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold mb-3">产品服务</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/products">产品浏览</Link></li>
            <li><Link href="/inquiry">代打服务</Link></li>
            <li><Link href="/materials">材料介绍</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">帮助支持</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/guide">打印指南</Link></li>
            <li><Link href="/faq">常见问题</Link></li>
            <li><Link href="/contact">联系我们</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">关于</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/about">公司介绍</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">联系方式</h3>
          <p className="text-sm">邮箱: contact@ymbj.online</p>
          <p className="text-sm mt-1">地址: 在线服务</p>
        </div>
      </div>
      <div className="text-center text-sm mt-8 pt-8 border-t border-gray-700">
        &copy; {new Date().getFullYear()} 3D 打印平台. All rights reserved.
      </div>
    </footer>
  );
}
