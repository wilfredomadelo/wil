"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { brandIndustrySuggestions, brandKinds } from "@/lib/brand-options";

const fieldClassName =
  "w-full rounded-xl border border-line bg-navy px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type BrandCreateFormProps = {
  onSuccess?: () => void;
};

export const BrandCreateForm = ({ onSuccess }: BrandCreateFormProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState("company");
  const [industry, setIndustry] = useState("");
  const [tagline, setTagline] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kind, industry, tagline }),
      });
      const data = (await response.json()) as {
        error?: string;
        brand?: { id?: string };
      };

      if (!response.ok) {
        setError(data.error ?? "Could not create brand.");
        return;
      }

      onSuccess?.();
      if (data.brand?.id) {
        router.push(`/brands/${data.brand.id}`);
        return;
      }

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
        <label htmlFor="brandName" className="mb-1.5 block text-sm font-semibold">
          Name
        </label>
        <input
          id="brandName"
          name="name"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClassName}
          placeholder="Acme Homes, Sari-Sari Snacks…"
        />
      </div>
      <div>
        <label htmlFor="brandKind" className="mb-1.5 block text-sm font-semibold">
          Type
        </label>
        <select
          id="brandKind"
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className={fieldClassName}
          aria-label="Brand type"
        >
          {brandKinds.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="brandIndustry" className="mb-1.5 block text-sm font-semibold">
          Industry
        </label>
        <input
          id="brandIndustry"
          name="industry"
          list="industry-suggestions"
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
          className={fieldClassName}
          placeholder="Real estate, food, footwear…"
        />
        <datalist id="industry-suggestions">
          {brandIndustrySuggestions.map((option) => (
            <option key={option.value} value={option.label} />
          ))}
        </datalist>
      </div>
      <div>
        <label htmlFor="brandTagline" className="mb-1.5 block text-sm font-semibold">
          Tagline
        </label>
        <input
          id="brandTagline"
          name="tagline"
          maxLength={240}
          value={tagline}
          onChange={(event) => setTagline(event.target.value)}
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
        className="btn-solid inline-flex rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {isSubmitting ? "Creating…" : "Create brand"}
      </button>
    </form>
  );
};
