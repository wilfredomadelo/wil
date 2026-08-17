"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fieldClassName, FormField } from "@/components/form-field";
import { brandIndustrySuggestions, brandKinds } from "@/lib/brand-options";
import type { BrandDetail, BrandKitInput } from "@/lib/types";

type BrandKitFormProps = {
  brand: BrandDetail;
};

type KitSectionId = "identity" | "colors" | "design" | "voice";

const kitSections: Array<{ id: KitSectionId; label: string; index: string }> = [
  { id: "identity", label: "Identity", index: "01" },
  { id: "colors", label: "Colors", index: "02" },
  { id: "design", label: "Design", index: "03" },
  { id: "voice", label: "Voice", index: "04" },
];

const toKitInput = (brand: BrandDetail): BrandKitInput => ({
  name: brand.name,
  kind: brand.kind,
  industry: brand.industry,
  tagline: brand.tagline,
  description: brand.description,
  vision: brand.vision,
  mission: brand.mission,
  voice: brand.voice,
  textStyle: brand.textStyle,
  sampleCopy: brand.sampleCopy,
  guidelines: brand.guidelines,
  designNotes: brand.designNotes,
  typographyNotes: brand.typographyNotes,
  primaryColor: brand.primaryColor,
  secondaryColor: brand.secondaryColor,
  accentColor: brand.accentColor,
});

const ColorField = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <FormField htmlFor={id} label={label}>
    <div className="flex items-center gap-2">
      <input
        id={`${id}-swatch`}
        type="color"
        value={value || "#000000"}
        onChange={(event) => onChange(event.target.value)}
        className="size-10 shrink-0 cursor-pointer rounded-lg border border-line bg-navy"
        aria-label={`${label} color picker`}
      />
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName}
        placeholder="#7c5cdb"
      />
    </div>
  </FormField>
);

export const BrandKitForm = ({ brand }: BrandKitFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState<BrandKitInput>(() => toKitInput(brand));
  const [activeSection, setActiveSection] = useState<KitSectionId>("identity");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (patch: Partial<BrandKitInput>) => {
    setForm((current) => ({ ...current, ...patch }));
    setStatus("");
  };

  const handleSelectSection = (sectionId: KitSectionId) => {
    setActiveSection(sectionId);
    const node = document.getElementById(`brand-kit-${sectionId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/brands/${brand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save kit.");
        return;
      }

      setStatus("Kit saved.");
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card overflow-hidden rounded-3xl">
      <div className="grid lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav
          aria-label="Kit sections"
          className="space-y-1 border-b border-line p-4 lg:border-b-0 lg:border-r"
        >
          {kitSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSelectSection(section.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                activeSection === section.id
                  ? "bg-accent text-[color:var(--button-ink)]"
                  : "text-ink hover:bg-navy-soft"
              }`}
            >
              {section.label}
              <span className="text-[10px] uppercase tracking-wide opacity-70">
                {section.index}
              </span>
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          <section
            id="brand-kit-identity"
            className="scroll-mt-6 space-y-4 border-b border-line p-5 sm:p-7"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                01 · Identity
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                Identity
              </h2>
              <p className="mt-1 text-sm text-muted">
                Core facts and positioning used across every channel.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField htmlFor="brandName" label="Name">
                <input
                  id="brandName"
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => handleChange({ name: event.target.value })}
                  className={fieldClassName}
                />
              </FormField>
              <FormField htmlFor="brandKind" label="Type">
                <select
                  id="brandKind"
                  value={form.kind}
                  onChange={(event) => handleChange({ kind: event.target.value })}
                  className={fieldClassName}
                  aria-label="Brand type"
                >
                  {brandKinds.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField htmlFor="brandIndustry" label="Industry">
                <input
                  id="brandIndustry"
                  list="industry-suggestions"
                  value={form.industry}
                  onChange={(event) =>
                    handleChange({ industry: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="Real estate, food, footwear…"
                />
                <datalist id="industry-suggestions">
                  {brandIndustrySuggestions.map((option) => (
                    <option key={option.value} value={option.label} />
                  ))}
                </datalist>
              </FormField>
              <FormField htmlFor="brandTagline" label="Tagline">
                <input
                  id="brandTagline"
                  maxLength={240}
                  value={form.tagline}
                  onChange={(event) =>
                    handleChange({ tagline: event.target.value })
                  }
                  className={fieldClassName}
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField htmlFor="brandDescription" label="Description">
                  <textarea
                    id="brandDescription"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      handleChange({ description: event.target.value })
                    }
                    className={fieldClassName}
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField
                  htmlFor="brandVision"
                  label="Vision"
                  hint="Where the brand is headed."
                >
                  <textarea
                    id="brandVision"
                    rows={3}
                    value={form.vision}
                    onChange={(event) =>
                      handleChange({ vision: event.target.value })
                    }
                    className={fieldClassName}
                    placeholder="A world where…"
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField
                  htmlFor="brandMission"
                  label="Mission"
                  hint="What the brand does day to day."
                >
                  <textarea
                    id="brandMission"
                    rows={3}
                    value={form.mission}
                    onChange={(event) =>
                      handleChange({ mission: event.target.value })
                    }
                    className={fieldClassName}
                    placeholder="We help…"
                  />
                </FormField>
              </div>
            </div>
          </section>

          <section
            id="brand-kit-colors"
            className="scroll-mt-6 space-y-4 border-b border-line p-5 sm:p-7"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                02 · Colors
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                Colors
              </h2>
              <p className="mt-1 text-sm text-muted">
                Palette that keeps generated content recognizable.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorField
                id="primaryColor"
                label="Primary"
                value={form.primaryColor}
                onChange={(primaryColor) => handleChange({ primaryColor })}
              />
              <ColorField
                id="secondaryColor"
                label="Secondary"
                value={form.secondaryColor}
                onChange={(secondaryColor) => handleChange({ secondaryColor })}
              />
              <ColorField
                id="accentColor"
                label="Accent"
                value={form.accentColor}
                onChange={(accentColor) => handleChange({ accentColor })}
              />
            </div>
          </section>

          <section
            id="brand-kit-design"
            className="scroll-mt-6 space-y-4 border-b border-line p-5 sm:p-7"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                03 · Design
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                Design & typography
              </h2>
            </div>
            <FormField
              htmlFor="typographyNotes"
              label="Typography notes"
              hint="Font families, weights, and when to use them."
            >
              <textarea
                id="typographyNotes"
                rows={3}
                value={form.typographyNotes}
                onChange={(event) =>
                  handleChange({ typographyNotes: event.target.value })
                }
                className={fieldClassName}
                placeholder="Display: bold serif headlines. Body: clean sans."
              />
            </FormField>
            <FormField
              htmlFor="designNotes"
              label="Design guidelines"
              hint="Layout, photography style, iconography, do/don't for visuals."
            >
              <textarea
                id="designNotes"
                rows={4}
                value={form.designNotes}
                onChange={(event) =>
                  handleChange({ designNotes: event.target.value })
                }
                className={fieldClassName}
              />
            </FormField>
          </section>

          <section id="brand-kit-voice" className="scroll-mt-6 space-y-4 p-5 sm:p-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                04 · Voice
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                Voice & text
              </h2>
            </div>
            <FormField htmlFor="brandVoice" label="Voice / tone">
              <textarea
                id="brandVoice"
                rows={3}
                value={form.voice}
                onChange={(event) => handleChange({ voice: event.target.value })}
                className={fieldClassName}
                placeholder="Warm, local, trustworthy — never pushy."
              />
            </FormField>
            <FormField htmlFor="textStyle" label="Text style">
              <textarea
                id="textStyle"
                rows={3}
                value={form.textStyle}
                onChange={(event) =>
                  handleChange({ textStyle: event.target.value })
                }
                className={fieldClassName}
                placeholder="Short sentences. Taglish OK. Avoid jargon."
              />
            </FormField>
            <FormField htmlFor="sampleCopy" label="Sample copy">
              <textarea
                id="sampleCopy"
                rows={3}
                value={form.sampleCopy}
                onChange={(event) =>
                  handleChange({ sampleCopy: event.target.value })
                }
                className={fieldClassName}
                placeholder="Example headlines or captions that sound on-brand."
              />
            </FormField>
            <FormField
              htmlFor="guidelines"
              label="Guidelines"
              hint="Claims to avoid, legal notes, required disclaimers."
            >
              <textarea
                id="guidelines"
                rows={4}
                value={form.guidelines}
                onChange={(event) =>
                  handleChange({ guidelines: event.target.value })
                }
                className={fieldClassName}
              />
            </FormField>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4 sm:px-7">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-solid rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {isSubmitting ? "Saving…" : "Save kit"}
        </button>
        {status ? (
          <p className="text-sm text-ink" role="status">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
};
