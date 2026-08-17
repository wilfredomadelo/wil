import type { Metadata } from "next";
import { PricingView } from "@/components/pricing-view";
import { appHomePath } from "@/lib/app-path";
import { fetchFredsBilling } from "@/lib/freds";
import { loadPricingCatalog } from "@/lib/pricing-catalog";
import { getWilAccessToken } from "@/lib/session";
import { requireAppUser } from "@/lib/require-app-user";
import { planDisplayName } from "@/lib/billing-format";

export const metadata: Metadata = {
  title: "Your plan — wil",
};

const HandlePricingPage = async () => {
  const user = await requireAppUser();
  const catalog = await loadPricingCatalog();
  let currentPlan = user.billing?.plan;
  const token = await getWilAccessToken();
  if (token) {
    try {
      const billing = await fetchFredsBilling(token);
      currentPlan = billing?.billing?.plan ?? currentPlan;
    } catch {
      /* keep session plan */
    }
  }

  const planName = planDisplayName(currentPlan ?? "FREE");

  return (
    <PricingView
      eyebrow="Account"
      title="Your plan"
      description={`This account is on ${planName}. Choose a paid plan to raise brand, plan-length, and AI image limits, or open Billing to manage payment.`}
      catalog={catalog}
      currentPlan={currentPlan}
      signedIn
      basePath={appHomePath(user)}
    />
  );
};

export default HandlePricingPage;
