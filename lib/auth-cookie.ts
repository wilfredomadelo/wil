export const WIL_SESSION_COOKIE = "wil_access_token";
export const WIL_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const wilSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: WIL_SESSION_MAX_AGE,
};
