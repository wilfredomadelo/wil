import { fetchFredsBillingCatalog } from "@/lib/freds";
import type { WilCatalogPlan } from "@/lib/types";

export const FALLBACK_PRICING_CATALOG: WilCatalogPlan[] = [
  {
    id: "FREE",
    name: "Free",
    amount: 0,
    currency: "PHP",
    interval: "month",
    description: "Try wil with one brand and short content plans.",
    features: [
      "1 brand",
      "Plans up to 7 days",
      "30 posts generated per month",
      "Unlimited Pollinations, Cloudflare, and Hugging Face images",
      "2 Gemini images per month",
      "Facebook connect and publish",
    ],
    limits: {
      maxBrands: 1,
      maxPlanDays: 7,
      maxPostsPerMonth: 30,
      maxAiImagesPerMonth: 2,
    },
  },
  {
    id: "STARTER",
    name: "Starter",
    amount: 49900,
    currency: "PHP",
    interval: "month",
    description: "More brands, longer plans, and a larger post-generation allowance.",
    features: [
      "3 brands",
      "Plans up to 14 days",
      "150 posts generated per month",
      "Unlimited Pollinations, Cloudflare, and Hugging Face images",
      "75 Gemini images per month",
      "Gemini image models",
      "Facebook connect and publish",
    ],
    limits: {
      maxBrands: 3,
      maxPlanDays: 14,
      maxPostsPerMonth: 150,
      maxAiImagesPerMonth: 75,
    },
  },
  {
    id: "PRO",
    name: "Pro",
    amount: 149900,
    currency: "PHP",
    interval: "month",
    description: "Room for a full roster of brands and heavier AI usage.",
    features: [
      "8 brands",
      "Plans up to 30 days",
      "400 posts generated per month",
      "Unlimited Pollinations, Cloudflare, and Hugging Face images",
      "200 Gemini images per month",
      "Gemini image models",
      "Facebook connect and publish",
    ],
    limits: {
      maxBrands: 8,
      maxPlanDays: 30,
      maxPostsPerMonth: 400,
      maxAiImagesPerMonth: 200,
    },
  },
];

export const loadPricingCatalog = async (): Promise<WilCatalogPlan[]> => {
  try {
    const remote = await fetchFredsBillingCatalog();
    if (remote.catalog.length) {
      return remote.catalog;
    }
  } catch {
    /* use fallback */
  }
  return FALLBACK_PRICING_CATALOG;
};
