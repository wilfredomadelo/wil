import type { Metadata } from "next";
import { LandingHeaderActions } from "@/components/landing-header-actions";
import { PricingView } from "@/components/pricing-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { appPath } from "@/lib/app-path";
import { loadPricingCatalog } from "@/lib/pricing-catalog";
import { getWilSessionUser } from "@/lib/session";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — wil",
};

const PricingPage = async () => {
  const user = await getWilSessionUser();
  const catalog = await loadPricingCatalog();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LandingHeaderActions user={user} />} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8">
        {user?.username ? (
          <p className="mb-8 text-sm text-muted">
            You are signed in.{" "}
            <Link
              href={appPath(user, "/pricing")}
              className="font-semibold text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              View your plan
            </Link>{" "}
            to upgrade or compare limits for this account.
          </p>
        ) : null}
        <PricingView
          eyebrow="Pricing"
          title="Plans for wil"
          description="Start free. Upgrade when you need more brands, longer content plans, and more generated posts. Billed monthly in PHP via PayMongo."
          catalog={catalog}
          signedIn={false}
        />
      </main>
      <SiteFooter />
    </div>
  );
};

export default PricingPage;
