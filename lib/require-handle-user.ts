import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { appPath } from "@/lib/app-path";
import { requireAppUser } from "@/lib/require-app-user";
import type { WilSubscriber } from "@/lib/types";

export const requireHandleUser = async (
  handle: string,
): Promise<WilSubscriber> => {
  const user = await requireAppUser();
  if (handle !== user.id && handle !== user.username) {
    notFound();
  }

  if (user.username && handle === user.id) {
    const headerStore = await headers();
    const pathname = headerStore.get("x-wil-pathname") ?? `/${handle}`;
    const search = headerStore.get("x-wil-search") ?? "";
    const rest = pathname.startsWith(`/${handle}`)
      ? pathname.slice(`/${handle}`.length)
      : "";
    redirect(`${appPath(user, rest || "/")}${search}`);
  }

  return user;
};
