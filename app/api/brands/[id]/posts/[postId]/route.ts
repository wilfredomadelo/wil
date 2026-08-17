import { NextRequest, NextResponse } from "next/server";
import { updateFredsPost } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string; postId: string }> };

const readHashtags = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
};

export const PATCH = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, postId } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await updateFredsPost(token, id, postId, {
      kind: typeof body.kind === "string" ? body.kind : "TEXT",
      title: typeof body.title === "string" ? body.title : "",
      caption: typeof body.caption === "string" ? body.caption : "",
      imagePrompt: typeof body.imagePrompt === "string" ? body.imagePrompt : "",
      imageAspect:
        typeof body.imageAspect === "string" ? body.imageAspect : undefined,
      hashtags: readHashtags(body.hashtags),
      notes: typeof body.notes === "string" ? body.notes : "",
      pageId:
        body.pageId === null
          ? null
          : typeof body.pageId === "string"
            ? body.pageId
            : undefined,
      pageName: typeof body.pageName === "string" ? body.pageName : undefined,
      plannedAt:
        body.plannedAt === null
          ? null
          : typeof body.plannedAt === "string"
            ? body.plannedAt
            : undefined,
      imageModelValue:
        typeof body.imageModelValue === "string"
          ? body.imageModelValue
          : undefined,
    });

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
