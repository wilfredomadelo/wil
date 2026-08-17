import { NextRequest, NextResponse } from "next/server";
import { createFredsPlan } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const maxDuration = 180;

type Params = { params: Promise<{ id: string }> };

export const POST = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  let body: {
    name?: unknown;
    days?: unknown;
    postsPerDay?: unknown;
    platforms?: unknown;
    startDate?: unknown;
    brief?: unknown;
    mix?: {
      text?: unknown;
      image?: unknown;
      video?: unknown;
      infographic?: unknown;
    };
    imageModelValue?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const platforms = Array.isArray(body.platforms)
    ? body.platforms.filter((item): item is string => typeof item === "string")
    : [];

  try {
    const result = await createFredsPlan(token, id, {
      name: typeof body.name === "string" ? body.name : "",
      days: Number(body.days) || 7,
      postsPerDay: Number(body.postsPerDay) || 1,
      platforms,
      startDate: typeof body.startDate === "string" ? body.startDate : "",
      brief: typeof body.brief === "string" ? body.brief : "",
      mix: {
        text: Number(body.mix?.text) || 0,
        image: Number(body.mix?.image) || 0,
        video: Number(body.mix?.video) || 0,
        infographic: Number(body.mix?.infographic) || 0,
      },
      imageModelValue:
        typeof body.imageModelValue === "string"
          ? body.imageModelValue
          : undefined,
    });

    if (!result.planId || !result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not create plan." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }

    return NextResponse.json({
      planId: result.planId,
      needsAssets: Boolean(result.needsAssets),
      brand: result.brand,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
