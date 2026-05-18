const values = [
  {
    title: '高品质',
    desc: '工业级打印精度',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: '快速交付',
    desc: '下单后最快 24 小时发货',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: '专业团队',
    desc: '10 年行业经验',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: '售后保障',
    desc: '不满意免费重印',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export default function ValueBar() {
  return (
    <section className="border-t border-void-200 dark:border-white/5 bg-void-100 dark:bg-void-800/20 py-10 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 relative">
        {values.map((v) => (
          <div key={v.title} className="text-center group">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-cyber-400/5 text-cyber-500 dark:text-cyber-400 flex items-center justify-center group-hover:bg-cyber-400/10 group-hover:scale-110 group-hover:shadow-glow-cyan transition-all duration-300 border border-cyber-400/10">
              {v.icon}
            </div>
            <div className="text-base font-semibold text-void-800 dark:text-void-100">{v.title}</div>
            <p className="text-sm text-void-500 dark:text-void-400 mt-1.5">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
