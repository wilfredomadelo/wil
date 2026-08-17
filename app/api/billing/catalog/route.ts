import { NextResponse } from "next/server";
import { fetchFredsBillingCatalog } from "@/lib/freds";

export const GET = async () => {
  try {
    const data = await fetchFredsBillingCatalog();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach FREDS. Is it running?" },
      { status: 502 },
    );
  }
};
