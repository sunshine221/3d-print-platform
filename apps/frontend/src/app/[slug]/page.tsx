import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const STATIC_SLUGS = new Set(['about', 'materials', 'guide', 'contact', 'faq']);

async function getPageContent(slug: string) {
  try {
    const url = `http://localhost:4000/api/v1/pages/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    if (json.code !== 0) return null;
    return json.data as {
      id: string;
      title: string;
      slug: string;
      content: string | null;
      metaTitle: string | null;
      metaDescription: string | null;
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getPageContent(params.slug);
  if (!page) return { title: '页面不存在' };
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || '',
  };
}

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (!STATIC_SLUGS.has(slug)) {
    notFound();
  }

  const page = await getPageContent(slug);

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-void-900 dark:text-void-100">{slug}</h1>
        <p className="text-void-500 dark:text-void-400">此页面暂无内容，请联系管理员更新。</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-void-900 dark:text-void-100">{page.title}</h1>
      {page.content && (
        <div
          className="prose dark:prose-invert max-w-none
            prose-headings:text-void-900 dark:prose-headings:text-void-100
            prose-p:text-void-600 dark:prose-p:text-void-300 prose-p:leading-relaxed
            prose-a:text-cyber-600 dark:prose-a:text-cyber-400 prose-a:no-underline hover:prose-a:text-cyber-500 dark:hover:prose-a:text-cyber-300
            prose-strong:text-void-900 dark:prose-strong:text-void-100
            prose-li:text-void-600 dark:prose-li:text-void-300
            prose-img:rounded-xl prose-img:shadow-glow-card
            prose-hr:border-void-200 dark:prose-hr:border-white/10
            prose-table:border-void-200 dark:prose-table:border-white/10 prose-th:border-void-200 dark:prose-th:border-white/10 prose-td:border-void-200 dark:prose-td:border-white/10
            prose-th:text-void-700 dark:prose-th:text-void-200 prose-td:text-void-600 dark:prose-td:text-void-300
            prose-code:bg-void-100 dark:prose-code:bg-white/5 prose-code:text-cyber-600 dark:prose-code:text-cyber-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-void-100 dark:prose-pre:bg-void-900 prose-pre:border prose-pre:border-void-200 dark:prose-pre:border-white/5
          "
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
    </div>
  );
}
