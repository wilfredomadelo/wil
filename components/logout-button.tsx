"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      {isSubmitting ? "Logging out…" : "Log out"}
    </button>
  );
};
