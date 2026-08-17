import { NextResponse } from "next/server";
import { fetchFredsBilling } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const GET = async () => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = await fetchFredsBilling(token);
    if (!data) {
      return NextResponse.json(
        { error: "Could not load billing." },
        { status: 502 },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
