import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">高精度 3D 打印服务</h1>
          <p className="text-lg mb-8 text-blue-100">多种材质 · 快速交付 · 品质保证</p>
          <Link href="/products" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
            浏览产品
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">热门分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['手办模型', '工业零件', '建筑模型', '艺术雕塑'].map((cat) => (
            <Link
              key={cat}
              href={`/categories/${cat}`}
              className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-2">&#9679;</div>
              <div className="font-medium">{cat}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Service Entry */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">代打服务</h2>
          <p className="text-gray-600 mb-6">有 3D 模型文件？上传即可获取报价，专业团队为您打印</p>
          <Link href="/inquiry" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            上传模型获取报价
          </Link>
        </div>
      </section>
    </div>
  );
}
