import Link from "next/link";

export const LandingHeaderActions = () => {
  return (
    <>
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
