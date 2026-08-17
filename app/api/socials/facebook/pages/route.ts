import { NextResponse } from "next/server";
import { fetchFredsFacebookPages } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const GET = async () => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const pages = await fetchFredsFacebookPages(token);
    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
