import type { Metadata } from "next";
import { FacebookLogoutButton } from "@/components/facebook-logout-button";
import { fetchFredsFacebookStatus } from "@/lib/freds";
import { appPath } from "@/lib/app-path";
import { getWilAccessToken } from "@/lib/session";
import { requireAppUser } from "@/lib/require-app-user";

export const metadata: Metadata = {
  title: "Facebook — wil",
};

type FacebookPageProps = {
  searchParams: Promise<{ connected?: string; error?: string }>;
};

const FacebookPage = async ({ searchParams }: FacebookPageProps) => {
  const user = await requireAppUser();
  const token = await getWilAccessToken();
  const params = await searchParams;
  const status = token
    ? await fetchFredsFacebookStatus(token)
    : { connected: false, name: null };
  const facebookHref = appPath(user, "/socials/facebook");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Socials
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
          Facebook
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Connect your Facebook account through FREDS. Meta keys stay on the
          platform.
        </p>
      </div>
      {params.error ? (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
          {params.error}
        </p>
      ) : null}
      {params.connected === "1" || status.connected ? (
        <div className="auth-card rounded-3xl p-6">
          <p className="text-sm font-semibold text-ink">Connected</p>
          <p className="mt-2 text-sm text-muted">
            {status.name || "Facebook account linked."}
          </p>
          <div className="mt-5">
            <FacebookLogoutButton redirectTo={facebookHref} />
          </div>
        </div>
      ) : (
        <div className="auth-card rounded-3xl p-6">
          <p className="text-sm text-muted">
            Not connected yet. Log in with Facebook to link pages for later
            publishing.
          </p>
          <a
            href="/api/socials/facebook/connect"
            className="btn-solid mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Log in to Facebook
          </a>
        </div>
      )}
    </div>
  );
};

export default FacebookPage;
