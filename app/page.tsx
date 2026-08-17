import { Hero } from "@/components/hero";
import { LandingHeaderActions } from "@/components/landing-header-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getWilSessionUser } from "@/lib/session";

const HomePage = async () => {
  const user = await getWilSessionUser();
  const isSignedIn = Boolean(user);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LandingHeaderActions isSignedIn={isSignedIn} />} />
      <main id="main">
        <Hero isSignedIn={isSignedIn} />
      </main>
      <SiteFooter />
    </div>
  );
};

export default HomePage;
