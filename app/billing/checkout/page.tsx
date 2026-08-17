import { redirectToAppPath } from "@/lib/redirect-to-app";

type CheckoutRedirectPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

const CheckoutRedirectPage = async ({
  searchParams,
}: CheckoutRedirectPageProps) => {
  const { plan } = await searchParams;
  const query = plan ? `?plan=${encodeURIComponent(plan)}` : "";
  await redirectToAppPath("/billing/checkout", query);
};

export default CheckoutRedirectPage;
