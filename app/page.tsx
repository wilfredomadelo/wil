import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const HomePage = () => {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main id="main">
        <Hero />
      </main>
      <SiteFooter />
    </div>
  );
};

export default HomePage;
