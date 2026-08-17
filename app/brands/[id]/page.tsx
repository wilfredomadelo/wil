import { redirectToAppPath } from "@/lib/redirect-to-app";

type BrandRedirectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const BrandRedirectPage = async ({
  params,
  searchParams,
}: BrandRedirectPageProps) => {
  const { id } = await params;
  const { tab } = await searchParams;
  const query = tab ? `?tab=${encodeURIComponent(tab)}` : "";
  await redirectToAppPath(`/brands/${id}`, query);
};

export default BrandRedirectPage;
