import { NextRequest, NextResponse } from "next/server";
import {
  deleteFredsBrand,
  fetchFredsBrand,
  updateFredsBrand,
} from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";
import type { BrandKitInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

const readKitInput = (body: Record<string, unknown>): BrandKitInput => ({
  name: typeof body.name === "string" ? body.name : "",
  kind: typeof body.kind === "string" ? body.kind : "company",
  industry: typeof body.industry === "string" ? body.industry : "",
  tagline: typeof body.tagline === "string" ? body.tagline : "",
  description: typeof body.description === "string" ? body.description : "",
  vision: typeof body.vision === "string" ? body.vision : "",
  mission: typeof body.mission === "string" ? body.mission : "",
  voice: typeof body.voice === "string" ? body.voice : "",
  textStyle: typeof body.textStyle === "string" ? body.textStyle : "",
  sampleCopy: typeof body.sampleCopy === "string" ? body.sampleCopy : "",
  guidelines: typeof body.guidelines === "string" ? body.guidelines : "",
  designNotes: typeof body.designNotes === "string" ? body.designNotes : "",
  typographyNotes:
    typeof body.typographyNotes === "string" ? body.typographyNotes : "",
  primaryColor: typeof body.primaryColor === "string" ? body.primaryColor : "",
  secondaryColor:
    typeof body.secondaryColor === "string" ? body.secondaryColor : "",
  accentColor: typeof body.accentColor === "string" ? body.accentColor : "",
});

export const GET = async (_request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const brand = await fetchFredsBrand(token, id);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found." }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};

export const PATCH = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await updateFredsBrand(token, id, readKitInput(body));
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not update brand." },
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
    const result = await deleteFredsBrand(token, id);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Could not delete brand." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
