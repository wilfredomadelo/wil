import Link from "next/link";
import { joinBasePath } from "@/lib/app-path";
import { formatPhpAmount, planDisplayName } from "@/lib/billing-format";
import type { WilBillingPlanId, WilCatalogPlan } from "@/lib/types";

type PricingGridProps = {
  catalog: WilCatalogPlan[];
  currentPlan?: WilBillingPlanId;
  signedIn: boolean;
  basePath?: string;
};

export const PricingGrid = ({
  catalog,
  currentPlan,
  signedIn,
  basePath = "",
}: PricingGridProps) => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {catalog.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        const isPaid = plan.id === "STARTER" || plan.id === "PRO";
        const alreadySubscribed = currentPlan === "STARTER" || currentPlan === "PRO";
        const href = !signedIn
          ? "/signup"
          : plan.id === "FREE" || isCurrent || (alreadySubscribed && isPaid)
            ? joinBasePath(basePath, "/billing")
            : `${joinBasePath(basePath, "/billing/checkout")}?plan=${plan.id}`;
        const cta = !signedIn
          ? "Get started"
          : isCurrent
            ? "Current plan"
            : alreadySubscribed && isPaid
              ? "Manage billing"
              : plan.id === "FREE"
                ? "Manage billing"
                : `Choose ${plan.name}`;

        return (
          <article
            key={plan.id}
            className={`auth-card flex flex-col rounded-3xl p-6 sm:p-8 ${
              plan.id === "STARTER" ? "ring-1 ring-accent/40" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {plan.name}
            </p>
            <p className="mt-3 font-display text-3xl font-extrabold text-ink">
              {plan.amount === 0 ? "₱0" : formatPhpAmount(plan.amount)}
              <span className="ml-1 text-base font-semibold text-muted">
                / month
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {plan.description}
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-ink">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link
              href={href}
              aria-label={
                isCurrent
                  ? `${planDisplayName(plan.id)} is your current plan`
                  : cta
              }
              className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                isPaid && !isCurrent
                  ? "btn-solid"
                  : "border border-line text-ink hover:bg-navy-soft"
              }`}
            >
              {cta}
            </Link>
          </article>
        );
      })}
    </div>
  );
};
