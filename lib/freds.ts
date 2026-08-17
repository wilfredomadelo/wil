import type {
  BrandDetail,
  BrandKitInput,
  BrandSocialAccount,
  BrandSummary,
  FacebookStatus,
  FredsAuthResponse,
  FredsBrandsResponse,
  FredsPersonasResponse,
  FredsSocialAccountsResponse,
  PersonaSummary,
  WilSubscriber,
} from "@/lib/types";

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

export const callFreds = async <T extends { error?: string } = FredsAuthResponse>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; data: T }> => {
  allowLocalHttps();

  const response = await fetch(`${getFredsApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  let data = { error: "FREDS returned an unexpected response." } as T;
  try {
    data = (await response.json()) as T;
  } catch {
    /* keep fallback */
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

export const fetchFredsBrands = async (
  token: string,
): Promise<BrandSummary[]> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    "/api/wil/brands",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (status !== 200 || !Array.isArray(data.brands)) {
    return [];
  }

  return data.brands;
};

const isBrandDetail = (brand: BrandDetail | BrandSummary): brand is BrandDetail =>
  "socialAccounts" in brand && Array.isArray(brand.socialAccounts);

export const fetchFredsBrand = async (
  token: string,
  brandId: string,
): Promise<BrandDetail | null> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    `/api/wil/brands/${brandId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (status !== 200 || !data.brand || !isBrandDetail(data.brand)) {
    return null;
  }

  return data.brand;
};

export const updateFredsBrand = async (
  token: string,
  brandId: string,
  input: BrandKitInput,
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    `/api/wil/brands/${brandId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    },
  );

  return {
    brand: data.brand && isBrandDetail(data.brand) ? data.brand : undefined,
    error: data.error,
    status,
  };
};

export const deleteFredsBrand = async (
  token: string,
  brandId: string,
): Promise<{ ok: boolean; error?: string; status: number }> => {
  const { status, data } = await callFreds<{ error?: string }>(
    `/api/wil/brands/${brandId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return { ok: status === 200, error: data.error, status };
};

export const createFredsSocialAccount = async (
  token: string,
  brandId: string,
  input: { platform: string; handle: string; url: string; notes: string },
): Promise<{ account?: BrandSocialAccount; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsSocialAccountsResponse>(
    `/api/wil/brands/${brandId}/social`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    },
  );

  return { account: data.account, error: data.error, status };
};

export const deleteFredsSocialAccount = async (
  token: string,
  brandId: string,
  accountId: string,
): Promise<{ ok: boolean; error?: string; status: number }> => {
  const { status, data } = await callFreds<{ error?: string }>(
    `/api/wil/brands/${brandId}/social/${accountId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return { ok: status === 200, error: data.error, status };
};

export const createFredsBrand = async (
  token: string,
  input: {
    name: string;
    kind: string;
    industry: string;
    tagline: string;
  },
): Promise<{ brand?: BrandSummary; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    "/api/wil/brands",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    },
  );

  return { brand: data.brand, error: data.error, status };
};

export const fetchFredsFacebookStatus = async (
  token: string,
): Promise<FacebookStatus> => {
  const { status, data } = await callFreds<FacebookStatus>(
    "/api/wil/facebook/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (status !== 200) {
    return { connected: false, name: null, error: data.error };
  }

  return { connected: data.connected, name: data.name ?? null };
};

export const fetchFredsPersonas = async (
  token: string,
): Promise<PersonaSummary[]> => {
  const { status, data } = await callFreds<FredsPersonasResponse>(
    "/api/wil/personas",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (status !== 200 || !Array.isArray(data.personas)) {
    return [];
  }

  return data.personas;
};

export const createFredsPersona = async (
  token: string,
  input: {
    name: string;
    voice: string;
    audience: string;
    guidelines: string;
    gender: string;
  },
): Promise<{ persona?: PersonaSummary; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsPersonasResponse>(
    "/api/wil/personas",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    },
  );

  return { persona: data.persona, error: data.error, status };
};
