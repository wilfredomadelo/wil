import { NextRequest, NextResponse } from "next/server";
import { setFredsUsername } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const PATCH = async (request: NextRequest) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { username?: unknown };
  try {
    body = (await request.json()) as { username?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await setFredsUsername(
      token,
      typeof body.username === "string" ? body.username : "",
    );
    if (!result.user) {
      return NextResponse.json(
        { error: result.error ?? "Could not save username." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }
    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
