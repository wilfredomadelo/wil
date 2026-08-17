import { NextRequest, NextResponse } from "next/server";
import { publishFredsPost } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string; postId: string }> };

export const POST = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, postId } = await params;
  let body: { pageId?: unknown; scheduledAt?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const pageId = typeof body.pageId === "string" ? body.pageId.trim() : "";
  const scheduledAt =
    typeof body.scheduledAt === "string" ? body.scheduledAt.trim() : "";

  if (!pageId) {
    return NextResponse.json({ error: "Select a Facebook page." }, { status: 400 });
  }
  if (!scheduledAt) {
    return NextResponse.json(
      { error: "Pick a schedule time (at least 10 minutes from now)." },
      { status: 400 },
    );
  }

  try {
    const result = await publishFredsPost(token, id, postId, {
      pageId,
      scheduledAt,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Could not schedule on Facebook." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      scheduled: result.scheduled,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
