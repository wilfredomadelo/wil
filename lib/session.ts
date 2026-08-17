import { cookies } from "next/headers";
import { WIL_SESSION_COOKIE } from "@/lib/auth-cookie";
import {
  fetchFredsBrand,
  fetchFredsBrands,
  fetchFredsMe,
  fetchFredsPersonas,
} from "@/lib/freds";
import type {
  BrandDetail,
  BrandSummary,
  PersonaSummary,
  WilSubscriber,
} from "@/lib/types";

export const getWilAccessToken = async (): Promise<string | null> => {
  const store = await cookies();
  return store.get(WIL_SESSION_COOKIE)?.value ?? null;
};

export const getWilSessionUser = async (): Promise<WilSubscriber | null> => {
  const token = await getWilAccessToken();
  if (!token) {
    return null;
  }

  try {
    return await fetchFredsMe(token);
  } catch {
    return null;
  }
};

export const getWilBrands = async (): Promise<BrandSummary[]> => {
  const token = await getWilAccessToken();
  if (!token) {
    return [];
  }

  try {
    return await fetchFredsBrands(token);
  } catch {
    return [];
  }
};

export const getWilBrand = async (
  brandId: string,
): Promise<BrandDetail | null> => {
  const token = await getWilAccessToken();
  if (!token) {
    return null;
  }

  try {
    return await fetchFredsBrand(token, brandId);
  } catch {
    return null;
  }
};

export const getWilPersonas = async (): Promise<PersonaSummary[]> => {
  const token = await getWilAccessToken();
  if (!token) {
    return [];
  }

  try {
    return await fetchFredsPersonas(token);
  } catch {
    return [];
  }
};
