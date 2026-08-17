import { NextResponse } from "next/server";
import { syncFredsBilling } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const POST = async () => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await syncFredsBilling(token);
    if (result.status !== 200) {
      return NextResponse.json(
        { error: result.error ?? "Could not refresh billing." },
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
