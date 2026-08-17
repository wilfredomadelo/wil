import { NextResponse } from "next/server";
import { disconnectFredsFacebook } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const POST = async () => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await disconnectFredsFacebook(token);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Could not log out of Facebook." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
