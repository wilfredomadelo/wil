import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-navy/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="wil home"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <BrandMark />
        </Link>
        <nav aria-label="Primary">
          <a
            href="#main"
            className="btn-solid rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Get started
          </a>
        </nav>
      </div>
    </header>
  );
};
