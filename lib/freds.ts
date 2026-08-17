import type { FredsAuthResponse, WilSubscriber } from "@/lib/types";

const getFredsApiUrl = () => {
  const url =
    process.env.FREDS_API_URL ?? process.env.NEXT_PUBLIC_FREDS_API_URL ?? "";
  if (!url) {
    throw new Error("FREDS_API_URL is not set.");
  }

  return url.replace(/\/$/, "");
};

const allowLocalHttps = () => {
  const url = getFredsApiUrl();
  if (
    process.env.NODE_ENV !== "production" &&
    url.startsWith("https://localhost")
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
};

export const callFreds = async (
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; data: FredsAuthResponse }> => {
  allowLocalHttps();

  const response = await fetch(`${getFredsApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  let data: FredsAuthResponse = {};
  try {
    data = (await response.json()) as FredsAuthResponse;
  } catch {
    data = { error: "FREDS returned an unexpected response." };
  }

  return { status: response.status, data };
};

export const fetchFredsMe = async (
  token: string,
): Promise<WilSubscriber | null> => {
  const { status, data } = await callFreds("/api/wil/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (status !== 200 || !data.user) {
    return null;
  }

  return data.user;
};
