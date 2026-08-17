import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { planDisplayName } from "@/lib/billing-format";
import { requireAppUser } from "@/lib/require-app-user";

type CheckoutPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export const metadata: Metadata = {
  title: "Checkout — wil",
};

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const user = await requireAppUser();
  const { plan: planParam } = await searchParams;
  const plan = planParam === "PRO" ? "PRO" : planParam === "STARTER" ? "STARTER" : null;
  if (!plan) {
    notFound();
  }

  const displayName = user.name?.trim() || user.email || "there";
  const email = user.email ?? "";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Checkout
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
          Subscribe to {planDisplayName(plan)}
        </h1>
        <p className="mt-3 text-sm text-muted">
          Card details go only to PayMongo. wil never stores your card number.
        </p>
      </div>
      <div className="auth-card rounded-3xl p-6 sm:p-8">
        <CheckoutForm
          plan={plan}
          planName={planDisplayName(plan)}
          userName={displayName}
          userEmail={email}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
