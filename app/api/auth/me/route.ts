import { NextResponse } from "next/server";
import { getWilSessionUser } from "@/lib/session";

export const GET = async () => {
  const user = await getWilSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user });
};
