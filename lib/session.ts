import { cookies } from "next/headers";
import { WIL_SESSION_COOKIE } from "@/lib/auth-cookie";
import { fetchFredsMe } from "@/lib/freds";
import type { WilSubscriber } from "@/lib/types";

export const getWilSessionUser = async (): Promise<WilSubscriber | null> => {
  const store = await cookies();
  const token = store.get(WIL_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    return await fetchFredsMe(token);
  } catch {
    return null;
  }
};
