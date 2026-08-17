import type { ReactNode } from "react";
import { LandingHeaderActions } from "@/components/landing-header-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getWilSessionUser } from "@/lib/session";

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export const MarketingPage = async ({
  eyebrow,
  title,
  children,
}: MarketingPageProps) => {
  const user = await getWilSessionUser();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LandingHeaderActions user={user} />} />
      <main
        id="main"
        className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:px-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};
