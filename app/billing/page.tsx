import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeaderActions } from "@/components/landing-header-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { appPath, USERNAME_SETUP_PATH } from "@/lib/app-path";
import { getWilSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Billing — wil",
};

const linkClassName =
  "font-semibold text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const BillingPage = async () => {
  const user = await getWilSessionUser();
  const manageHref = user?.username
    ? appPath(user, "/billing")
    : user
      ? USERNAME_SETUP_PATH
      : "/login";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LandingHeaderActions user={user} />} />
      <main
        id="main"
        className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:px-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Billing
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          How billing works
        </h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Paid wil plans are billed monthly in PHP through PayMongo. Cards
            and Maya are supported. wil never stores your card number.
          </p>
          <p>
            Free includes one brand, 7-day content plans, and a small AI image
            allowance. Starter and Pro raise those limits. Compare them on{" "}
            <Link href="/pricing" className={linkClassName}>
              Pricing
            </Link>
            .
          </p>
          <p>
            Cancelling stops future invoices. Access stays through the current
            paid period when applicable. After you have an account, manage or
            cancel from your billing page.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={manageHref}
            className="btn-solid inline-flex rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {user?.username ? "Manage your billing" : "Log in to manage billing"}
          </Link>
          <Link
            href="/pricing"
            className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            See pricing
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default BillingPage;
