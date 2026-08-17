import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { TermsCopy } from "@/components/marketing-copy";

export const metadata: Metadata = {
  title: "Terms of service — wil",
};

const TermsPage = () => (
  <MarketingPage eyebrow="Legal" title="Terms of service">
    <TermsCopy />
  </MarketingPage>
);

export default TermsPage;
