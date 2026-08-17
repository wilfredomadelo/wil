"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { appHomePath } from "@/lib/app-path";
import type { WilSubscriber } from "@/lib/types";

const fieldClassName =
  "w-full rounded-xl border border-line bg-navy px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const UsernameForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = (await response.json()) as {
        error?: string;
        user?: WilSubscriber;
      };
      if (!response.ok || !data.user) {
        setError(data.error ?? "Could not save username.");
        return;
      }
      router.push(appHomePath(data.user));
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-semibold">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          minLength={3}
          maxLength={24}
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          className={fieldClassName}
          placeholder="yourname"
          aria-describedby="username-hint"
        />
        <p id="username-hint" className="mt-2 text-xs text-muted">
          3–24 characters. Start with a letter. Letters, numbers, and
          underscores only. This becomes your wil URL.
        </p>
      </div>
      {error ? (
        <p
          className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-solid inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {isSubmitting ? "Saving…" : "Save username"}
      </button>
    </form>
  );
};
