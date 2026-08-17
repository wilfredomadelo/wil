import { NextRequest, NextResponse } from "next/server";
import { cancelFredsBilling } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const POST = async (request: NextRequest) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { reason?: unknown } = {};
  try {
    body = (await request.json()) as { reason?: unknown };
  } catch {
    body = {};
  }

  try {
    const result = await cancelFredsBilling(
      token,
      typeof body.reason === "string" ? body.reason : undefined,
    );
    if (result.status !== 200) {
      return NextResponse.json(
        { error: result.error ?? "Could not cancel." },
        { status: result.status },
      );
    }
    return NextResponse.json({ billing: result.billing });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
