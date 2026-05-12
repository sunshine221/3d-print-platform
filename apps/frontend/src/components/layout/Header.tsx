import Link from 'next/link';

export default function Header() {
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
          <Link href="/login" className="text-blue-600 font-medium">登录</Link>
        </nav>
      </div>
    </header>
  );
}
