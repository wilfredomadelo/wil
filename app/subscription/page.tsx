import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { SubscriptionCopy } from "@/components/marketing-copy";

export const metadata: Metadata = {
  title: "Subscription — wil",
};

const SubscriptionPage = () => (
  <MarketingPage eyebrow="Billing" title="Subscription">
    <SubscriptionCopy />
  </MarketingPage>
);

export default SubscriptionPage;
