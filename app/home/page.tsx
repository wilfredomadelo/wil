import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getWilSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Home — wil",
};

const HomePage = async () => {
  const user = await getWilSessionUser();
  if (!user) {
    redirect("/login");
  }

  const displayName = user.name?.trim() || user.email || "there";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LogoutButton />} />
      <main id="main" className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16">
        <div className="auth-card rounded-3xl p-6 sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Signed in
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
            Hi, {displayName}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            You are in as a wil subscriber. Agent tools and workspace come next.
          </p>
          {user.email ? (
            <p className="mt-6 text-sm text-muted">{user.email}</p>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default HomePage;
