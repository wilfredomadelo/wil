"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppHref } from "@/components/app-base-path";
import { formatPhpAmount, planDisplayName } from "@/lib/billing-format";
import type {
  WilBillingSnapshot,
  WilBillingPlanId,
} from "@/lib/types";

type BillingPanelProps = {
  snapshot: WilBillingSnapshot;
};

const isPaidPlan = (
  plan: WilBillingPlanId | undefined,
): plan is "STARTER" | "PRO" => plan === "STARTER" || plan === "PRO";

export const BillingPanel = ({ snapshot }: BillingPanelProps) => {
  const router = useRouter();
  const href = useAppHref();
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState("");
  const billing = snapshot.billing;
  const usage = snapshot.usage;
  const catalog = snapshot.catalog ?? [];

  const handleChangePlan = async (plan: "STARTER" | "PRO") => {
    setError("");
    setIsBusy(`change:${plan}`);
    try {
      const response = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not change plan.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsBusy("");
    }
  };

  const handleCancel = async () => {
    setError("");
    setIsBusy("cancel");
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "unused" }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not cancel.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsBusy("");
    }
  };

  const current = billing?.plan ?? "FREE";
  const otherPaid: Array<"STARTER" | "PRO"> =
    current === "STARTER" ? ["PRO"] : current === "PRO" ? ["STARTER"] : [];

  return (
    <div className="space-y-6">
      <div className="auth-card space-y-4 rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Current plan
        </p>
        <h2 className="font-display text-2xl font-extrabold text-ink">
          {planDisplayName(current)}
        </h2>
        <p className="text-sm text-muted">
          Status: {billing?.status ?? "NONE"}
          {billing?.pendingPlan
            ? ` · switches to ${planDisplayName(billing.pendingPlan)} next cycle`
            : ""}
        </p>
        {billing?.periodEnd ? (
          <p className="text-sm text-muted">
            Current period ends{" "}
            {new Date(billing.periodEnd).toLocaleDateString("en-PH", {
              dateStyle: "medium",
            })}
            .
          </p>
        ) : null}
        {billing?.status === "INCOMPLETE" ? (
          <Link
            href={`${href("/billing/checkout")}?plan=${billing.pendingPlan === "PRO" ? "PRO" : "STARTER"}`}
            className="btn-solid inline-flex rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Resume payment
          </Link>
        ) : null}
      </div>

      {usage ? (
        <div className="auth-card space-y-3 rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-xl font-extrabold text-ink">Usage</h2>
          <p className="text-sm text-muted">
            Brands: {usage.brands.used} / {usage.brands.max}
          </p>
          <p className="text-sm text-muted">
            Plan length: up to {usage.planDays.max} days
          </p>
          <p className="text-sm text-muted">
            AI images this month: {usage.aiImages.used} / {usage.aiImages.max}
          </p>
        </div>
      ) : null}

      <div className="auth-card space-y-4 rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Change plan
        </h2>
        {!snapshot.paymongoConfigured ? (
          <p className="text-sm text-muted">
            PayMongo is not configured yet. You can still review plans on the
            pricing page.
          </p>
        ) : null}
        {current === "FREE" ? (
          <div className="flex flex-wrap gap-3">
            {catalog
              .filter((item) => isPaidPlan(item.id))
              .map((item) => (
                <Link
                  key={item.id}
                  href={`${href("/billing/checkout")}?plan=${item.id}`}
                  className="btn-solid inline-flex rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  Subscribe to {item.name} · {formatPhpAmount(item.amount)}
                </Link>
              ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {otherPaid.map((plan) => (
              <button
                key={plan}
                type="button"
                disabled={Boolean(isBusy)}
                onClick={() => handleChangePlan(plan)}
                className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {isBusy === `change:${plan}`
                  ? "Updating…"
                  : `Switch to ${planDisplayName(plan)} next cycle`}
              </button>
            ))}
            {billing?.status === "ACTIVE" || billing?.status === "PAST_DUE" ? (
              <button
                type="button"
                disabled={Boolean(isBusy)}
                onClick={handleCancel}
                className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {isBusy === "cancel" ? "Cancelling…" : "Cancel subscription"}
              </button>
            ) : null}
          </div>
        )}
        {error ? (
          <p
            className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Link
          href={href("/pricing")}
          className="inline-flex text-sm font-semibold text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Compare all plans
        </Link>
      </div>
    </div>
  );
};
