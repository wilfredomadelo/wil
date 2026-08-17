import type { Metadata } from "next";
import { ContactCopy } from "@/components/marketing-copy";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Contact us — wil",
};

const ContactPage = () => (
  <MarketingPage eyebrow="Help" title="Contact us">
    <ContactCopy />
  </MarketingPage>
);

export default ContactPage;
