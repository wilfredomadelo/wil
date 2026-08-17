import Link from "next/link";
import { postAuthPath } from "@/lib/app-path";
import type { WilSubscriber } from "@/lib/types";

type LandingHeaderActionsProps = {
  user?: WilSubscriber | null;
};

export const LandingHeaderActions = ({
  user = null,
}: LandingHeaderActionsProps) => {
  if (user) {
    return (
      <>
        <Link
          href="/pricing"
          className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Pricing
        </Link>
        <Link
          href="/billing"
          className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Billing
        </Link>
        <Link
          href={postAuthPath(user)}
          className="btn-solid rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Open wil
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/pricing"
        className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Pricing
      </Link>
      <Link
        href="/billing"
        className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Billing
      </Link>
      <Link
        href="/login"
        className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="btn-solid rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Get started
      </Link>
    </>
  );
};
