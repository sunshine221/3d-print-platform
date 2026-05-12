export default function ValueBar() {
  const values = [
    { title: '高品质', desc: '工业级打印精度' },
    { title: '快速交付', desc: '下单后最快 24 小时发货' },
    { title: '专业团队', desc: '10 年行业经验' },
    { title: '售后保障', desc: '不满意免费重印' },
  ];

  return (
    <section className="border-t bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {values.map((v) => (
          <div key={v.title} className="text-center">
            <div className="text-lg font-semibold text-gray-900">{v.title}</div>
            <p className="text-sm text-gray-500 mt-1">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
