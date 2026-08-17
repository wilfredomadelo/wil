import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PersonaWorkspace } from "@/components/persona-workspace";
import { getWilPersonas } from "@/lib/session";
import { requireAppUser } from "@/lib/require-app-user";

export const metadata: Metadata = {
  title: "Personas — wil",
};

const PersonasPage = async () => {
  const user = await requireAppUser();
  const personas = await getWilPersonas();
  const displayName = user.name?.trim() || user.email || "there";

  return (
    <AppShell userName={displayName} userEmail={user.email ?? ""}>
      <PersonaWorkspace personas={personas} />
    </AppShell>
  );
};

export default PersonasPage;
