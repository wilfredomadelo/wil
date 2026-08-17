import type { Metadata } from "next";
import { BillingReturn } from "@/components/billing-return";

export const metadata: Metadata = {
  title: "Confirming payment — wil",
};

const BillingReturnPage = () => {
  return <BillingReturn />;
};

export default BillingReturnPage;
