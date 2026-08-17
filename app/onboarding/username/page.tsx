import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UsernameForm } from "@/components/username-form";
import { appHomePath } from "@/lib/app-path";
import { requireSessionUser } from "@/lib/require-app-user";

export const metadata: Metadata = {
  title: "Add username — wil",
};

const UsernameOnboardingPage = async () => {
  const user = await requireSessionUser();
  if (user.username) {
    redirect(appHomePath(user));
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader actions={<LogoutButton />} />
      <main
        id="main"
        className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16"
      >
        <div className="auth-card rounded-3xl p-6 sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Almost there
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Add a username
          </h1>
          <p className="mt-3 mb-8 text-sm leading-relaxed text-muted">
            Choose a unique username before you use wil. It cannot be changed
            to one someone else already has.
          </p>
          <UsernameForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default UsernameOnboardingPage;
