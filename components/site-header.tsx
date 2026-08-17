import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

type SiteHeaderProps = {
  actions?: ReactNode;
};

export const SiteHeader = ({ actions }: SiteHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-navy-soft/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="wil home"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <BrandMark />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-3">
          <ThemeToggle />
          {actions}
        </nav>
      </div>
    </header>
  );
};
