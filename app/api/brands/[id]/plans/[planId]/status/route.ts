import { NextRequest, NextResponse } from "next/server";
import { updateFredsPlanStatus } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

type Params = { params: Promise<{ id: string; planId: string }> };

export const PATCH = async (request: NextRequest, { params }: Params) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, planId } = await params;
  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status : "";
  if (!status) {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  try {
    const result = await updateFredsPlanStatus(token, id, planId, status);
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not update plan." },
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
