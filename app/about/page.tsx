import type { Metadata } from "next";
import { AboutCopy } from "@/components/marketing-copy";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "About us — wil",
};

const AboutPage = () => (
  <MarketingPage eyebrow="Company" title="About us">
    <AboutCopy />
  </MarketingPage>
);

export default AboutPage;
