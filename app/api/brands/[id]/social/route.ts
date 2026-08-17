import { NextRequest, NextResponse } from "next/server";
import { createFredsSocialAccount } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export const POST = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  let body: {
    platform?: unknown;
    handle?: unknown;
    url?: unknown;
    notes?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await createFredsSocialAccount(token, id, {
      platform: typeof body.platform === "string" ? body.platform : "",
      handle: typeof body.handle === "string" ? body.handle : "",
      url: typeof body.url === "string" ? body.url : "",
      notes: typeof body.notes === "string" ? body.notes : "",
    });

    if (!result.account) {
      return NextResponse.json(
        { error: result.error ?? "Could not save social account." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }

    return NextResponse.json({ account: result.account });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
