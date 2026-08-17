import type { WilBillingPlanId } from "@/lib/types";

export const formatPhpAmount = (centavos: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Math.round(centavos) / 100);

export const planDisplayName = (plan: WilBillingPlanId): string => {
  if (plan === "STARTER") {
    return "Starter";
  }
  if (plan === "PRO") {
    return "Pro";
  }
  return "Free";
};
