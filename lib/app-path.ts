import type { WilSubscriber } from "@/lib/types";

export const WIL_RESERVED_HANDLES = new Set([
  "about",
  "admin",
  "api",
  "app",
  "billing",
  "brands",
  "checkout",
  "contact",
  "docs",
  "documentation",
  "facebook",
  "help",
  "home",
  "instagram",
  "legal",
  "login",
  "onboarding",
  "personas",
  "pricing",
  "privacy",
  "profile",
  "return",
  "settings",
  "signup",
  "socials",
  "subscription",
  "support",
  "terms",
  "tiktok",
  "username",
  "wil",
  "www",
  "youtube",
]);

export const USERNAME_SETUP_PATH = "/onboarding/username";

export const userHandle = (user: {
  id: string;
  username?: string | null;
}): string => user.username || user.id;

export const joinHandlePath = (handle: string, path = ""): string => {
  if (!path || path === "/") {
    return `/${handle}`;
  }
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `/${handle}${suffix}`;
};

export const joinBasePath = (basePath: string, path: string): string => {
  if (!path || path === "/") {
    return basePath || "/";
  }
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${suffix}`;
};

export const appHomePath = (user: {
  id: string;
  username?: string | null;
}): string => joinHandlePath(userHandle(user));

export const appPath = (
  user: Pick<WilSubscriber, "id" | "username">,
  path = "",
): string => joinHandlePath(userHandle(user), path);

export const postAuthPath = (
  user: Pick<WilSubscriber, "id" | "username">,
): string => (user.username ? appHomePath(user) : USERNAME_SETUP_PATH);

export const appShellProps = (user: WilSubscriber) => ({
  userName: user.name?.trim() || user.username || user.email || "there",
  userEmail: user.email ?? "",
  homeHref: appHomePath(user),
});
