import Link from "next/link";
import { MARKETING_LINKS } from "@/lib/marketing-links";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg font-extrabold lowercase tracking-tight text-ink">
            wil
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            AI agent for content &amp; social media
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {MARKETING_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};
