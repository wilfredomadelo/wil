import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { PrivacyCopy } from "@/components/marketing-copy";

export const metadata: Metadata = {
  title: "Privacy policy — wil",
};

const PrivacyPage = () => (
  <MarketingPage eyebrow="Legal" title="Privacy policy">
    <PrivacyCopy />
  </MarketingPage>
);

export default PrivacyPage;
