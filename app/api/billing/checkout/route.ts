import { NextRequest, NextResponse } from "next/server";
import { startFredsCheckout } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const POST = async (request: NextRequest) => {
  const token = await getWilAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { plan?: unknown; phone?: unknown };
  try {
    body = (await request.json()) as { plan?: unknown; phone?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = body.plan === "STARTER" || body.plan === "PRO" ? body.plan : null;
  if (!plan) {
    return NextResponse.json({ error: "Choose Starter or Pro." }, { status: 400 });
  }

  try {
    const result = await startFredsCheckout(token, {
      plan,
      phone: typeof body.phone === "string" ? body.phone : undefined,
    });
    if (!result.checkout) {
      return NextResponse.json(
        { error: result.error ?? "Could not start checkout." },
        { status: result.status === 200 ? 502 : result.status },
      );
    }
    return NextResponse.json({
      checkout: result.checkout,
      billing: result.billing,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
