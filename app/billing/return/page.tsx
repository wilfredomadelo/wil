import { redirectToAppPath } from "@/lib/redirect-to-app";

const BillingReturnRedirectPage = async () => {
  await redirectToAppPath("/billing/return");
};

export default BillingReturnRedirectPage;
