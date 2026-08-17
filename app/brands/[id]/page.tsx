import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { BrandStudio } from "@/components/brand-studio";
import {
  fetchFredsFacebookPages,
  fetchFredsFacebookStatus,
} from "@/lib/freds";
import { getWilAccessToken, getWilBrand } from "@/lib/session";
import { requireAppUser } from "@/lib/require-app-user";

type BrandPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: BrandPageProps): Promise<Metadata> => {
  const { id } = await params;
  const brand = await getWilBrand(id);
  return {
    title: brand ? `${brand.name} — wil` : "Brand — wil",
  };
};

const BrandPage = async ({ params }: BrandPageProps) => {
  const user = await requireAppUser();
  const { id } = await params;
  const brand = await getWilBrand(id);
  if (!brand) {
    notFound();
  }

  const token = await getWilAccessToken();
  const facebook = token
    ? await fetchFredsFacebookStatus(token)
    : { connected: false, name: null };
  const pages = token
    ? await fetchFredsFacebookPages(token).catch(() => [])
    : [];
  const displayName = user.name?.trim() || user.email || "there";

  return (
    <AppShell userName={displayName} userEmail={user.email ?? ""} wide>
      <Suspense fallback={<p className="text-sm text-muted">Loading brand…</p>}>
        <BrandStudio brand={brand} facebook={facebook} pages={pages} />
      </Suspense>
    </AppShell>
  );
};

export default BrandPage;
