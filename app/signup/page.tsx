import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { postAuthPath } from "@/lib/app-path";
import { getWilSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create account — wil",
};

const SignupPage = async () => {
  const user = await getWilSessionUser();
  if (user) {
    redirect(postAuthPath(user));
  }
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader
        actions={
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Log in
          </Link>
        }
      />
      <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
        <div className="auth-card rounded-3xl p-6 sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Subscriber
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Create your wil account
          </h1>
          <p className="mt-3 mb-8 text-sm leading-relaxed text-muted">
            You will be stored as a subscriber in FREDS. No admin access.
          </p>
          <AuthForm mode="signup" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default SignupPage;
