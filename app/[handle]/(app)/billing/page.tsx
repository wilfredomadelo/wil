import type { Metadata } from "next";
import { BillingPanel } from "@/components/billing-panel";
import { fetchFredsBilling } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";
import { requireAppUser } from "@/lib/require-app-user";

export const metadata: Metadata = {
  title: "Billing — wil",
};

const BillingPage = async () => {
  await requireAppUser();
  const token = await getWilAccessToken();
  const snapshot = token ? await fetchFredsBilling(token) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
          Billing
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Payment, usage, and PayMongo subscription for this account.
        </p>
      </div>
      {snapshot ? (
        <BillingPanel snapshot={snapshot} />
      ) : (
        <p className="text-sm text-muted">Could not load billing.</p>
      )}
    </div>
  );
};

export default BillingPage;
