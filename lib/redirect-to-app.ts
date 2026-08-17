import { redirect } from "next/navigation";
import { appPath } from "@/lib/app-path";
import { requireAppUser } from "@/lib/require-app-user";

export const redirectToAppPath = async (path: string, search = "") => {
  const user = await requireAppUser();
  redirect(`${appPath(user, path)}${search}`);
};
