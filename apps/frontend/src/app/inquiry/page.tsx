import Link from 'next/link';

export default function InquiryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">代打服务</h1>
      <p className="text-gray-600 mb-8">
        上传您的 3D 模型文件，我们的团队将为您评估并提供报价。
      </p>
      <div className="bg-gray-50 rounded-lg p-8 text-gray-500">
        代打询价功能即将上线，敬请期待。
      </div>
      <Link
        href="/products"
        className="inline-block mt-8 text-blue-500 hover:text-blue-600"
      >
        ← 返回产品浏览
      </Link>
    </div>
  );
}
