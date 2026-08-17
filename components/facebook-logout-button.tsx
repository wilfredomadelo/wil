"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FacebookLogoutButtonProps = {
  redirectTo?: string;
};

export const FacebookLogoutButton = ({
  redirectTo,
}: FacebookLogoutButtonProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/socials/facebook/disconnect", {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not log out of Facebook.");
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={isSubmitting}
        className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        aria-label="Log out of Facebook"
      >
        {isSubmitting ? "Logging out…" : "Log out of Facebook"}
      </button>
      {error ? (
        <p className="text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
