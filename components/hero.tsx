import Link from "next/link";
import { InteractiveMascot } from "@/components/interactive-mascot";
import { postAuthPath } from "@/lib/app-path";
import type { WilSubscriber } from "@/lib/types";

type HeroProps = {
  user?: WilSubscriber | null;
};

export const Hero = ({ user = null }: HeroProps) => {
  const primaryHref = user ? postAuthPath(user) : "/signup";
  const primaryLabel = user ? "Open wil" : "Get started";

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-24">
        <div className="relative z-10 max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            AI agent for content &amp; social media
          </p>
          <h1
            id="hero-heading"
            className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
          >
            Meet <span className="lowercase">wil</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Draft captions, shape content plans, and keep social moving. wil
            is your AI agent for content and social media.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={primaryHref}
              className="btn-solid inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {primaryLabel}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              See pricing
            </Link>
          </div>
        </div>

        <InteractiveMascot />
      </div>
    </section>
  );
};
