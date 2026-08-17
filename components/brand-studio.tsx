"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandCalendarPanel } from "@/components/brand-calendar-panel";
import { BrandDeleteButton } from "@/components/brand-delete-button";
import { BrandGuidePanel } from "@/components/brand-guide-panel";
import { BrandKitForm } from "@/components/brand-kit-form";
import { BrandPlanPanel } from "@/components/brand-plan-panel";
import { BrandSocialPanel } from "@/components/brand-social-panel";
import {
  buildImageModelValue,
} from "@/lib/plan-options";
import type { BrandDetail, FacebookPageOption, FacebookStatus } from "@/lib/types";

type BrandStudioProps = {
  brand: BrandDetail;
  facebook: FacebookStatus;
  pages: FacebookPageOption[];
};

const tabs = [
  { id: "kit", label: "Kit" },
  { id: "social", label: "Social" },
  { id: "calendar", label: "Calendar" },
  { id: "plans", label: "Content plan" },
  { id: "guide", label: "How to use" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const isTabId = (value: string | null): value is TabId =>
  tabs.some((tab) => tab.id === value);

export const BrandStudio = ({ brand, facebook, pages }: BrandStudioProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = isTabId(searchParams.get("tab")) ? searchParams.get("tab")! : "kit";

  const handleSelectTab = (nextTab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.replace(`/brands/${brand.id}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            ← Brands
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
            {brand.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {[brand.kind, brand.industry].filter(Boolean).join(" · ") || "Brand"}
            {brand.tagline ? ` · ${brand.tagline}` : ""}
          </p>
        </div>
        <BrandDeleteButton
          brandId={brand.id}
          brandName={brand.name}
          redirectTo="/"
        />
      </div>

      <div
        className="inline-flex flex-wrap rounded-xl border border-line bg-panel p-1"
        role="tablist"
        aria-label="Brand sections"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => handleSelectTab(item.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              tab === item.id
                ? "bg-accent text-[color:var(--button-ink)]"
                : "text-muted hover:bg-navy-soft hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "kit" ? <BrandKitForm brand={brand} /> : null}
      {tab === "social" ? (
        <BrandSocialPanel
          brandId={brand.id}
          accounts={brand.socialAccounts}
          facebook={facebook}
        />
      ) : null}
      {tab === "calendar" ? (
        <BrandCalendarPanel
          brandId={brand.id}
          posts={brand.posts}
          pages={pages}
        />
      ) : null}
      {tab === "plans" ? (
        <BrandPlanPanel
          brandId={brand.id}
          hasLogo={brand.hasLogo}
          plans={brand.plans}
          pages={pages}
          defaultImageAi={buildImageModelValue(
            brand.imageProvider,
            brand.imageModel,
          )}
        />
      ) : null}
      {tab === "guide" ? <BrandGuidePanel /> : null}
    </div>
  );
};
