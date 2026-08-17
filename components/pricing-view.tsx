import { PricingGrid } from "@/components/pricing-grid";
import type { WilBillingPlanId, WilCatalogPlan } from "@/lib/types";

type PricingViewProps = {
  eyebrow: string;
  title: string;
  description: string;
  catalog: WilCatalogPlan[];
  currentPlan?: WilBillingPlanId;
  signedIn: boolean;
  basePath?: string;
};

export const PricingView = ({
  eyebrow,
  title,
  description,
  catalog,
  currentPlan,
  signedIn,
  basePath = "",
}: PricingViewProps) => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
      <PricingGrid
        catalog={catalog}
        currentPlan={currentPlan}
        signedIn={signedIn}
        basePath={basePath}
      />
    </div>
  );
};
