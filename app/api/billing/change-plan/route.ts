import { NextRequest, NextResponse } from "next/server";
import { changeFredsBillingPlan } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const POST = async (request: NextRequest) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { plan?: unknown };
  try {
    body = (await request.json()) as { plan?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = body.plan === "STARTER" || body.plan === "PRO" ? body.plan : null;
  if (!plan) {
    return NextResponse.json({ error: "Choose Starter or Pro." }, { status: 400 });
  }

  try {
    const result = await changeFredsBillingPlan(token, plan);
    if (result.status !== 200) {
      return NextResponse.json(
        { error: result.error ?? "Could not change plan." },
        { status: result.status },
      );
    }
    return NextResponse.json({ billing: result.billing });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
