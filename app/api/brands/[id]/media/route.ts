import { NextRequest, NextResponse } from "next/server";
import { uploadFredsBrandMedia } from "@/lib/freds";
import { getWilAccessToken } from "@/lib/session";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

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
    const result = await uploadFredsBrandMedia(token, id, formData);
    if (!result.brand) {
      return NextResponse.json(
        { error: result.error ?? "Could not upload images." },
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
