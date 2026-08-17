"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const fieldClassName =
  "w-full rounded-xl border border-line bg-navy px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type PersonaCreateFormProps = {
  onSuccess?: () => void;
};

export const PersonaCreateForm = ({ onSuccess }: PersonaCreateFormProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [voice, setVoice] = useState("");
  const [audience, setAudience] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, voice, audience, guidelines, gender }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not create persona.");
        return;
      }

      router.refresh();
      onSuccess?.();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="personaName" className="mb-1.5 block text-sm font-semibold">
          Name
        </label>
        <input
          id="personaName"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="personaVoice" className="mb-1.5 block text-sm font-semibold">
          Voice
        </label>
        <textarea
          id="personaVoice"
          name="voice"
          required
          rows={3}
          value={voice}
          onChange={(event) => setVoice(event.target.value)}
          className={fieldClassName}
          placeholder="How this persona speaks…"
        />
      </div>
      <div>
        <label htmlFor="personaAudience" className="mb-1.5 block text-sm font-semibold">
          Audience
        </label>
        <input
          id="personaAudience"
          name="audience"
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="personaGender" className="mb-1.5 block text-sm font-semibold">
          Gender
        </label>
        <input
          id="personaGender"
          name="gender"
          value={gender}
          onChange={(event) => setGender(event.target.value)}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="personaGuidelines" className="mb-1.5 block text-sm font-semibold">
          Guidelines
        </label>
        <textarea
          id="personaGuidelines"
          name="guidelines"
          rows={3}
          value={guidelines}
          onChange={(event) => setGuidelines(event.target.value)}
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
        {isSubmitting ? "Creating…" : "Create persona"}
      </button>
    </form>
  );
};
