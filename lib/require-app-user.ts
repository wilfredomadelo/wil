import { redirect } from "next/navigation";
import { getWilSessionUser } from "@/lib/session";
import type { WilSubscriber } from "@/lib/types";

export const requireAppUser = async (): Promise<WilSubscriber> => {
  const user = await getWilSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
};
