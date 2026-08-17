import { NextRequest, NextResponse } from "next/server";
import { deleteFredsPost } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string; postId: string }> };

export const DELETE = async (_request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, postId } = await params;

  try {
    const result = await deleteFredsPost(token, id, postId);
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not delete post." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }
    return NextResponse.json({ ok: true, brand: result.brand });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
