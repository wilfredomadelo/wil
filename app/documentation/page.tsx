import type { Metadata } from "next";
import { DocumentationCopy } from "@/components/marketing-copy";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Documentation — wil",
};

const DocumentationPage = () => (
  <MarketingPage eyebrow="Guides" title="Documentation">
    <DocumentationCopy />
  </MarketingPage>
);

export default DocumentationPage;
