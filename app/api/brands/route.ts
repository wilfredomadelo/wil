import { NextRequest, NextResponse } from "next/server";
import { createFredsBrand } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const POST = async (request: NextRequest) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    name?: unknown;
    kind?: unknown;
    industry?: unknown;
    tagline?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await createFredsBrand(token, {
      name: typeof body.name === "string" ? body.name : "",
      kind: typeof body.kind === "string" ? body.kind : "company",
      industry: typeof body.industry === "string" ? body.industry : "",
      tagline: typeof body.tagline === "string" ? body.tagline : "",
    });

    if (!result.brand) {
      return NextResponse.json(
        {
          error: result.error ?? "Could not create brand.",
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
