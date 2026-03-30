import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

// Visual breadcrumb trail. JSON-LD BreadcrumbList schema is handled inline
// by each page so the structured data stays close to the page's other schemas.
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="relative z-10 px-6 max-w-7xl mx-auto pt-6 pb-2"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <li>
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-slate-700">›</span>
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-slate-300 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-300" : ""}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
