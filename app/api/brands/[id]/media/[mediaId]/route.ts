import { NextRequest, NextResponse } from "next/server";
import { deleteFredsBrandMedia, fetchFredsBrandMedia } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string; mediaId: string }> };

export const GET = async (_request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, mediaId } = await params;

  try {
    const result = await fetchFredsBrandMedia(token, id, mediaId);
    if (!result.body) {
      return NextResponse.json(
        { error: "Media not found." },
        { status: result.status === 200 ? 404 : result.status },
      );
    }

    return new NextResponse(new Uint8Array(result.body), {
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": String(result.body.byteLength),
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};

export const DELETE = async (_request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, mediaId } = await params;

  try {
    const result = await deleteFredsBrandMedia(token, id, mediaId);
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not delete media." },
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
