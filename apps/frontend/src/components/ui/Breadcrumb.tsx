import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-void-500 dark:text-void-400 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-void-400 dark:text-void-600">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-cyber-500 dark:hover:text-cyber-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-void-800 dark:text-void-200 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
