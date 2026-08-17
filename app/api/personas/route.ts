import { NextRequest, NextResponse } from "next/server";
import { createFredsPersona } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const POST = async (request: NextRequest) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    name?: unknown;
    voice?: unknown;
    audience?: unknown;
    guidelines?: unknown;
    gender?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await createFredsPersona(token, {
      name: typeof body.name === "string" ? body.name : "",
      voice: typeof body.voice === "string" ? body.voice : "",
      audience: typeof body.audience === "string" ? body.audience : "",
      guidelines: typeof body.guidelines === "string" ? body.guidelines : "",
      gender: typeof body.gender === "string" ? body.gender : "",
    });

    if (!result.persona) {
      return NextResponse.json(
        { error: result.error ?? "Could not create persona." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }

    return NextResponse.json({ persona: result.persona });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
