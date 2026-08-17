"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { joinBasePath } from "@/lib/app-path";
import { BrandMark } from "@/components/brand-mark";
import { ProfileIcon } from "@/components/profile-icon";

type AppSidebarProps = {
  userName: string;
  userEmail: string;
  homeHref: string;
};

const socialItems = [
  { path: "/socials/facebook", label: "Facebook", soon: false },
  { path: "/socials/tiktok", label: "TikTok", soon: true },
  { path: "/socials/instagram", label: "Instagram", soon: true },
  { path: "/socials/youtube", label: "YouTube", soon: true },
] as const;

const navClass = (active: boolean) =>
  `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    active ? "bg-accent text-[color:var(--button-ink)]" : "text-ink hover:bg-navy-soft"
  }`;

export const AppSidebar = ({ userName, userEmail, homeHref }: AppSidebarProps) => {
  const pathname = usePathname();
  const href = (path: string) => joinBasePath(homeHref, path);
  const pricingHref = href("/pricing");
  const billingHref = href("/billing");
  const personasHref = href("/personas");
  const profileHref = href("/profile");
  const [isOpen, setIsOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(
    pathname.startsWith(`${homeHref}/socials`),
  );

  const handleClose = () => setIsOpen(false);
  const handleToggleMenu = () => setIsOpen((current) => !current);
  const handleToggleSocials = () => setIsSocialsOpen((current) => !current);

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line px-4 py-4">
        <Link
          href={homeHref}
          onClick={handleClose}
          aria-label="wil home"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <BrandMark />
        </Link>
      </div>
      <nav aria-label="App" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <div>
          <button
            type="button"
            onClick={handleToggleSocials}
            aria-expanded={isSocialsOpen}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Socials
            <span aria-hidden="true">{isSocialsOpen ? "–" : "+"}</span>
          </button>
          {isSocialsOpen ? (
            <div className="mt-1 space-y-1 pl-3">
              {socialItems.map((item) =>
                item.soon ? (
                  <p
                    key={item.path}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-muted"
                  >
                    {item.label}
                    <span className="text-[10px] font-semibold uppercase tracking-wide">
                      Soon
                    </span>
                  </p>
                ) : (
                  <Link
                    key={item.path}
                    href={href(item.path)}
                    onClick={handleClose}
                    className={navClass(pathname === href(item.path))}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          ) : null}
        </div>
        <Link
          href={homeHref}
          onClick={handleClose}
          className={navClass(
            pathname === homeHref || pathname.startsWith(`${homeHref}/brands`),
          )}
        >
          Brands
        </Link>
        <Link
          href={pricingHref}
          onClick={handleClose}
          className={navClass(pathname === pricingHref)}
        >
          Pricing
        </Link>
        <Link
          href={billingHref}
          onClick={handleClose}
          className={navClass(pathname.startsWith(billingHref))}
        >
          Billing
        </Link>
        <Link
          href={personasHref}
          onClick={handleClose}
          className={navClass(pathname === personasHref)}
        >
          Personas
        </Link>
      </nav>
      <div className="border-t border-line px-4 py-4">
        <div className="flex items-center gap-3">
          <ProfileIcon
            name={userName}
            href={profileHref}
            onClick={handleClose}
            isActive={pathname === profileHref}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{userName}</p>
            <p className="truncate text-xs text-muted">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-navy-soft/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ProfileIcon
            name={userName}
            href={profileHref}
            isActive={pathname === profileHref}
          />
          <button
            type="button"
            onClick={handleToggleMenu}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            Menu
          </button>
        </div>
      </header>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 self-start border-r border-line bg-panel lg:block">
        {sidebar}
      </aside>
      {isOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={handleClose}
          />
          <aside className="relative h-dvh w-72 bg-panel shadow-xl">{sidebar}</aside>
        </div>
      ) : null}
    </>
  );
};
