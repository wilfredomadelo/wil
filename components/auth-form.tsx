"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { postAuthPath } from "@/lib/app-path";
import type { WilSubscriber } from "@/lib/types";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

const fieldClassName =
  "w-full rounded-xl border border-line bg-navy px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const path = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
    const payload =
      mode === "signup" ? { name, email, password } : { email, password };

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        user?: WilSubscriber;
      };

      if (!response.ok || !data.user) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push(postAuthPath(data.user));
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {mode === "signup" ? (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClassName}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClassName}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-solid inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {isSubmitting
          ? "Please wait…"
          : mode === "signup"
            ? "Create account"
            : "Log in"}
      </button>
    </form>
  );
};
