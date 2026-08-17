import { NextRequest, NextResponse } from "next/server";
import {
  deleteFredsBrandLogo,
  fetchFredsBrandLogo,
  uploadFredsBrandLogo,
} from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export const maxDuration = 60;

export const GET = async (_request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await fetchFredsBrandLogo(token, id);
    if (!result.body) {
      return NextResponse.json(
        { error: "Logo not found." },
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

export const POST = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  try {
    const result = await uploadFredsBrandLogo(token, id, formData);
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not upload logo." },
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

export const DELETE = async (_request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await deleteFredsBrandLogo(token, id);
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not remove logo." },
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
