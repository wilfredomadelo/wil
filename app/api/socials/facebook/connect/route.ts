import { NextRequest, NextResponse } from "next/server";
import { appPath } from "@/lib/app-path";
import { getWilAccessToken, getWilSessionUser } from "@/lib/session";

const getFredsApiUrl = () =>
  (process.env.FREDS_API_URL ?? process.env.NEXT_PUBLIC_FREDS_API_URL ?? "")
    .replace(/\/$/, "");

export const GET = async (request: NextRequest) => {
  const origin = request.nextUrl.origin;
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const user = await getWilSessionUser();
  const facebookPath = user
    ? appPath(user, "/socials/facebook")
    : "/login";

  const fredsUrl = getFredsApiUrl();
  if (!fredsUrl) {
    return NextResponse.redirect(
      new URL(`${facebookPath}?error=FREDS%20URL%20missing`, origin),
    );
  }

  const target = new URL("/api/wil/facebook/connect", fredsUrl);
  target.searchParams.set("wil_token", token);
  return NextResponse.redirect(target);
};
