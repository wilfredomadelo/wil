import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { appPath } from "@/lib/app-path";
import { requireAppUser } from "@/lib/require-app-user";

export const metadata: Metadata = {
  title: "Profile — wil",
};

const ProfilePage = async () => {
  const user = await requireAppUser();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
          Profile
        </h1>
      </div>

      <div className="auth-card space-y-4 rounded-3xl p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Name
          </p>
          <p className="mt-1 text-base font-semibold text-ink">
            {user.name?.trim() || user.username || user.email || "there"}
          </p>
        </div>
        {user.username ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Username
            </p>
            <p className="mt-1 text-base text-ink">@{user.username}</p>
          </div>
        ) : null}
        {user.email ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Email
            </p>
            <p className="mt-1 text-base text-ink">{user.email}</p>
          </div>
        ) : null}
      </div>

      <div className="auth-card space-y-4 rounded-3xl p-6 sm:p-8">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Billing
          </h2>
          <p className="mt-1 text-sm text-muted">
            Plan, usage, and PayMongo subscription.
          </p>
        </div>
        <Link
          href={appPath(user, "/billing")}
          className="btn-solid inline-flex rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Open billing
        </Link>
      </div>

      <div className="auth-card space-y-4 rounded-3xl p-6 sm:p-8">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Theme
          </h2>
          <p className="mt-1 text-sm text-muted">
            Dark, Light, or Moon Light. Saved on this device.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <LogoutButton />
    </div>
  );
};

export default ProfilePage;
