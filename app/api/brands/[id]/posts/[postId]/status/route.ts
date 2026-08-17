import { NextRequest, NextResponse } from "next/server";
import { updateFredsPostStatus } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string; postId: string }> };

export const PATCH = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, postId } = await params;
  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status : "";
  if (!status) {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  try {
    const result = await updateFredsPostStatus(token, id, postId, status);
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not update post." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }
    return NextResponse.json({ brand: result.brand });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
