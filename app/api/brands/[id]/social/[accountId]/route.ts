import { NextRequest, NextResponse } from "next/server";
import { deleteFredsSocialAccount } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string; accountId: string }> };

export const DELETE = async (_request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, accountId } = await params;

  try {
    const result = await deleteFredsSocialAccount(token, id, accountId);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Could not delete social account." },
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
