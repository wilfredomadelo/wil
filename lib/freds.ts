import type {
  BrandDetail,
  BrandKitInput,
  BrandPlanInput,
  BrandPostInput,
  BrandSocialAccount,
  FacebookPageOption,
  FacebookStatus,
  BrandSummary,
  FredsAuthResponse,
  FredsBrandsResponse,
  FredsFacebookPagesResponse,
  FredsPersonasResponse,
  FredsPlanResponse,
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

export const fetchFredsBrandLogo = async (
  token: string,
  brandId: string,
): Promise<{
  status: number;
  body: ArrayBuffer | null;
  contentType: string;
}> => {
  allowLocalHttps();
  const response = await fetch(
    `${getFredsApiUrl()}/api/wil/brands/${brandId}/logo`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { status: response.status, body: null, contentType: "" };
  }

  return {
    status: response.status,
    body: await response.arrayBuffer(),
    contentType: response.headers.get("Content-Type") ?? "image/png",
  };
};

export const uploadFredsBrandLogo = async (
  token: string,
  brandId: string,
  formData: FormData,
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  allowLocalHttps();
  const response = await fetch(
    `${getFredsApiUrl()}/api/wil/brands/${brandId}/logo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    },
  );

  let data: FredsBrandsResponse = {
    error: "FREDS returned an unexpected response.",
  };
  try {
    data = (await response.json()) as FredsBrandsResponse;
  } catch {
    /* keep fallback */
  }

  return {
    brand: data.brand && isBrandDetail(data.brand) ? data.brand : undefined,
    error: data.error,
    status: response.status,
  };
};

export const deleteFredsBrandLogo = async (
  token: string,
  brandId: string,
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    `/api/wil/brands/${brandId}/logo`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return {
    brand: data.brand && isBrandDetail(data.brand) ? data.brand : undefined,
    error: data.error,
    status,
  };
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

export const updateFredsPost = async (
  token: string,
  brandId: string,
  postId: string,
  input: BrandPostInput,
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    `/api/wil/brands/${brandId}/posts/${postId}`,
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

export const createFredsPlan = async (
  token: string,
  brandId: string,
  input: BrandPlanInput,
): Promise<{
  planId?: string;
  brand?: BrandDetail;
  needsAssets?: boolean;
  error?: string;
  status: number;
}> => {
  const { status, data } = await callFreds<FredsPlanResponse>(
    `/api/wil/brands/${brandId}/plans`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    },
  );

  return {
    planId: data.planId,
    brand: data.brand,
    needsAssets: data.needsAssets,
    error: data.error,
    status,
  };
};

export const generateFredsPlanAssets = async (
  token: string,
  brandId: string,
  planId: string,
  input: { imageModelValue?: string } = {},
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    `/api/wil/brands/${brandId}/plans/${planId}/generate-assets`,
    {
      method: "POST",
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

export const generateFredsPostAssets = async (
  token: string,
  brandId: string,
  postId: string,
  input: { imageModelValue?: string; generateMotion?: boolean } = {},
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    `/api/wil/brands/${brandId}/posts/${postId}/generate-assets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ generateMotion: false, ...input }),
    },
  );

  return {
    brand: data.brand && isBrandDetail(data.brand) ? data.brand : undefined,
    error: data.error,
    status,
  };
};

export const fetchFredsBrandMedia = async (
  token: string,
  brandId: string,
  mediaId: string,
): Promise<{
  status: number;
  body: ArrayBuffer | null;
  contentType: string;
}> => {
  allowLocalHttps();
  const response = await fetch(
    `${getFredsApiUrl()}/api/wil/brands/${brandId}/media/${mediaId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { status: response.status, body: null, contentType: "" };
  }

  return {
    status: response.status,
    body: await response.arrayBuffer(),
    contentType: response.headers.get("Content-Type") ?? "image/png",
  };
};

export const uploadFredsBrandMedia = async (
  token: string,
  brandId: string,
  formData: FormData,
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  allowLocalHttps();
  const response = await fetch(
    `${getFredsApiUrl()}/api/wil/brands/${brandId}/media`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    },
  );

  let data: FredsBrandsResponse = {
    error: "FREDS returned an unexpected response.",
  };
  try {
    data = (await response.json()) as FredsBrandsResponse;
  } catch {
    /* keep fallback */
  }

  return {
    brand: data.brand && isBrandDetail(data.brand) ? data.brand : undefined,
    error: data.error,
    status: response.status,
  };
};

export const deleteFredsBrandMedia = async (
  token: string,
  brandId: string,
  mediaId: string,
): Promise<{ brand?: BrandDetail; error?: string; status: number }> => {
  const { status, data } = await callFreds<FredsBrandsResponse>(
    `/api/wil/brands/${brandId}/media/${mediaId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return {
    brand: data.brand && isBrandDetail(data.brand) ? data.brand : undefined,
    error: data.error,
    status,
  };
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

export const fetchFredsFacebookPages = async (
  token: string,
): Promise<FacebookPageOption[]> => {
  const { status, data } = await callFreds<FredsFacebookPagesResponse>(
    "/api/wil/facebook/pages",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (status !== 200 || !Array.isArray(data.pages)) {
    return [];
  }

  return data.pages;
};

export const regenerateFredsPostPrompt = async (
  token: string,
  brandId: string,
  postId: string,
  input: {
    kind: string;
    title: string;
    caption: string;
    imagePrompt: string;
    imageAspect: string;
  },
): Promise<{ imagePrompt?: string; error?: string; status: number }> => {
  const { status, data } = await callFreds<{
    imagePrompt?: string;
    error?: string;
  }>(`/api/wil/brands/${brandId}/posts/${postId}/regenerate-prompt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  return { imagePrompt: data.imagePrompt, error: data.error, status };
};

export const publishFredsPost = async (
  token: string,
  brandId: string,
  postId: string,
  input: { pageId: string; scheduledAt: string },
): Promise<{
  ok: boolean;
  scheduled?: boolean;
  error?: string;
  status: number;
}> => {
  const { status, data } = await callFreds<{
    ok?: boolean;
    scheduled?: boolean;
    error?: string;
  }>(`/api/wil/brands/${brandId}/posts/${postId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  return {
    ok: status === 200 && Boolean(data.ok),
    scheduled: data.scheduled,
    error: data.error,
    status,
  };
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

export const disconnectFredsFacebook = async (
  token: string,
): Promise<{ ok: boolean; error?: string; status: number }> => {
  const { status, data } = await callFreds<{ error?: string }>(
    "/api/wil/facebook/disconnect",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return { ok: status === 200, error: data.error, status };
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
