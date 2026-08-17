import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { requireAppUser } from "@/lib/require-app-user";

export const metadata: Metadata = {
  title: "TikTok — wil",
};

const TikTokPage = async () => {
  const user = await requireAppUser();
  const displayName = user.name?.trim() || user.email || "there";

  return (
    <AppShell userName={displayName} userEmail={user.email ?? ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        Socials
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">
        TikTok
      </h1>
      <p className="mt-3 text-sm text-muted">Coming soon.</p>
    </AppShell>
  );
};

export default TikTokPage;
