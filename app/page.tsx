import { AppShell } from "@/components/app-shell";
import { BrandWorkspace } from "@/components/brand-workspace";
import { Hero } from "@/components/hero";
import { LandingHeaderActions } from "@/components/landing-header-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getWilBrands, getWilSessionUser } from "@/lib/session";

const RootPage = async () => {
  const user = await getWilSessionUser();

  if (user) {
    const brands = await getWilBrands();
    const displayName = user.name?.trim() || user.email || "there";

    return (
      <AppShell userName={displayName} userEmail={user.email ?? ""}>
        <BrandWorkspace brands={brands} />
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LandingHeaderActions />} />
      <main id="main">
        <Hero />
      </main>
      <SiteFooter />
    </div>
  );
};

export default RootPage;
