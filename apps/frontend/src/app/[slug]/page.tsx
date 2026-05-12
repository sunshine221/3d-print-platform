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
        <h1 className="text-3xl font-bold mb-6 capitalize">{slug}</h1>
        <p className="text-gray-500">此页面暂无内容，请联系管理员更新。</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
      {page.content && (
        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
    </div>
  );
}
