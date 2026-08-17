import { Hero } from "@/components/hero";
import { LandingHeaderActions } from "@/components/landing-header-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getWilSessionUser } from "@/lib/session";

const RootPage = async () => {
  const user = await getWilSessionUser();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LandingHeaderActions user={user} />} />
      <main id="main">
        <Hero user={user} />
      </main>
      <SiteFooter />
    </div>
  );
};

export default RootPage;
