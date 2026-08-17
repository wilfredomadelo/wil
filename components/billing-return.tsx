"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppHref } from "@/components/app-base-path";

export const BillingReturn = () => {
  const router = useRouter();
  const href = useAppHref();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const response = await fetch("/api/billing/sync", { method: "POST" });
        const data = (await response.json()) as { error?: string };
        if (cancelled) {
          return;
        }
        if (!response.ok) {
          setError(data.error ?? "Could not confirm payment.");
          return;
        }
        router.replace(href("/billing"));
        router.refresh();
      } catch {
        if (!cancelled) {
          setError("Could not confirm payment. Open billing to refresh.");
        }
      }
    };
    void sync();
    return () => {
      cancelled = true;
    };
  }, [href, router]);

  return (
    <div className="auth-card rounded-3xl p-6 sm:p-8">
      <h1 className="font-display text-3xl font-extrabold text-ink">
        Confirming payment
      </h1>
      <p className="mt-3 text-sm text-muted">
        {error || "Hang on while we check your PayMongo subscription."}
      </p>
    </div>
  );
};
