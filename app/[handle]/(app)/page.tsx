import type { Metadata } from "next";
import { BrandWorkspace } from "@/components/brand-workspace";
import { requireAppUser } from "@/lib/require-app-user";
import { getWilBrands } from "@/lib/session";

type HandleHomePageProps = {
  params: Promise<{ handle: string }>;
};

export const generateMetadata = async ({
  params,
}: HandleHomePageProps): Promise<Metadata> => {
  const { handle } = await params;
  return { title: `${handle} — wil` };
};

const HandleHomePage = async () => {
  const user = await requireAppUser();
  const brands = await getWilBrands();

  return <BrandWorkspace brands={brands} billing={user.billing} />;
};

export default HandleHomePage;
