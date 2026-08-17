import { NextRequest, NextResponse } from "next/server";
import {
  WIL_SESSION_COOKIE,
  wilSessionCookieOptions,
} from "@/lib/auth-cookie";
import { callFreds } from "@/lib/freds";

export const POST = async (request: NextRequest) => {
  let body: { name?: unknown; email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const { status, data } = await callFreds("/api/wil/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        password: body.password,
      }),
    });

    if (status !== 200 || !data.token || !data.user) {
      return NextResponse.json(
        { error: data.error ?? "Could not create your account." },
        { status: status === 200 ? 502 : status },
      );
    }

    const response = NextResponse.json({ user: data.user });
    response.cookies.set(WIL_SESSION_COOKIE, data.token, wilSessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
