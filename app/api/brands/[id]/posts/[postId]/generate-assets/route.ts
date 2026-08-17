import { NextRequest, NextResponse } from "next/server";
import { generateFredsPostAssets } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const maxDuration = 300;

type Params = { params: Promise<{ id: string; postId: string }> };

export const POST = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, postId } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  try {
    const result = await generateFredsPostAssets(token, id, postId, {
      imageModelValue:
        typeof body.imageModelValue === "string"
          ? body.imageModelValue
          : undefined,
      generateMotion: body.generateMotion === true,
    });

    if (!result.brand) {
      return NextResponse.json(
        {
          error: result.error ?? "Could not generate assets.",
          ...(result.code ? { code: result.code } : {}),
        },
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
