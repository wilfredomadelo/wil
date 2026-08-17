import { redirect } from "next/navigation";
import { USERNAME_SETUP_PATH } from "@/lib/app-path";
import { getWilSessionUser } from "@/lib/session";
import type { WilSubscriber } from "@/lib/types";

export const requireSessionUser = async (): Promise<WilSubscriber> => {
  const user = await getWilSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
};

export const requireAppUser = async (): Promise<WilSubscriber> => {
  const user = await requireSessionUser();
  if (!user.username) {
    redirect(USERNAME_SETUP_PATH);
  }
  return user;
};
