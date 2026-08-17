import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { SupportCopy } from "@/components/marketing-copy";

export const metadata: Metadata = {
  title: "Support — wil",
};

const SupportPage = () => (
  <MarketingPage eyebrow="Help" title="Support">
    <SupportCopy />
  </MarketingPage>
);

export default SupportPage;
