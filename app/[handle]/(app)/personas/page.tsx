import type { Metadata } from "next";
import { PersonaWorkspace } from "@/components/persona-workspace";
import { getWilPersonas } from "@/lib/session";
import { requireAppUser } from "@/lib/require-app-user";

export const metadata: Metadata = {
  title: "Personas — wil",
};

const PersonasPage = async () => {
  await requireAppUser();
  const personas = await getWilPersonas();

  return <PersonaWorkspace personas={personas} />;
};

export default PersonasPage;
