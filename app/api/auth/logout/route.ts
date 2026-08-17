import { NextResponse } from "next/server";
import {
  WIL_SESSION_COOKIE,
  wilSessionCookieOptions,
} from "@/lib/auth-cookie";
import { callFreds } from "@/lib/freds";

export const POST = async () => {
  try {
    await callFreds("/api/wil/auth/logout", { method: "POST" });
  } catch {
    // Cookie is cleared locally even if FREDS is unreachable.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(WIL_SESSION_COOKIE, "", {
    ...wilSessionCookieOptions,
    maxAge: 0,
  });
  return response;
};
