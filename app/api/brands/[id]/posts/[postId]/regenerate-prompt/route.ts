import { NextRequest, NextResponse } from "next/server";
import { regenerateFredsPostPrompt } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string; postId: string }> };

export const POST = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, postId } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  try {
    const result = await regenerateFredsPostPrompt(token, id, postId, {
      kind: typeof body.kind === "string" ? body.kind : "",
      title: typeof body.title === "string" ? body.title : "",
      caption: typeof body.caption === "string" ? body.caption : "",
      imagePrompt: typeof body.imagePrompt === "string" ? body.imagePrompt : "",
      imageAspect: typeof body.imageAspect === "string" ? body.imageAspect : "9:16",
    });

    if (!result.imagePrompt) {
      return NextResponse.json(
        { error: result.error ?? "Could not regenerate prompt." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }

    return NextResponse.json({ imagePrompt: result.imagePrompt });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
