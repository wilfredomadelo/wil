"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fieldClassName, FormField } from "@/components/form-field";
import { brandIndustrySuggestions, brandKinds } from "@/lib/brand-options";
import type {
  BrandDetail,
  BrandKitInput,
  FacebookPageOption,
  FacebookStatus,
} from "@/lib/types";

type BrandKitFormProps = {
  brand: BrandDetail;
  facebook: FacebookStatus;
  pages: FacebookPageOption[];
};

type KitSectionId = "logo" | "identity" | "colors" | "design" | "voice";

const kitSections: Array<{
  id: KitSectionId;
  label: string;
  index: string;
  description: string;
}> = [
  {
    id: "logo",
    label: "Logo",
    index: "01",
    description: "The mark used in content",
  },
  {
    id: "identity",
    label: "Identity",
    index: "02",
    description: "Name, type, and positioning",
  },
  {
    id: "colors",
    label: "Colors",
    index: "03",
    description: "Primary, secondary, accent",
  },
  {
    id: "design",
    label: "Design",
    index: "04",
    description: "Type and visual rules",
  },
  {
    id: "voice",
    label: "Voice",
    index: "05",
    description: "Tone, copy, guidelines",
  },
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

const assignedPageId = (brand: BrandDetail) =>
  brand.pageBrands?.[0]?.pageId ?? "";

export const BrandKitForm = ({
  brand,
  facebook,
  pages,
}: BrandKitFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState<BrandKitInput>(() => toKitInput(brand));
  const [saved, setSaved] = useState<BrandKitInput>(() => toKitInput(brand));
  const [kitPageId, setKitPageId] = useState(() => assignedPageId(brand));
  const [savedPageId, setSavedPageId] = useState(() => assignedPageId(brand));
  const [activeSection, setActiveSection] = useState<KitSectionId>("logo");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const isDirty =
    JSON.stringify(form) !== JSON.stringify(saved) || kitPageId !== savedPageId;
  const pageOptions =
    kitPageId && !pages.some((page) => page.id === kitPageId)
      ? [
          {
            id: kitPageId,
            name: brand.pageBrands?.[0]?.pageName || kitPageId,
          },
          ...pages,
        ]
      : pages;

  const handleChange = (patch: Partial<BrandKitInput>) => {
    setForm((current) => ({ ...current, ...patch }));
    setError("");
  };

  const handleCancel = () => {
    setForm(saved);
    setKitPageId(savedPageId);
    setError("");
  };

  const handleSelectSection = (sectionId: KitSectionId) => {
    setActiveSection(sectionId);
    const node = document.getElementById(`brand-kit-${sectionId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setError("");
    setUploadingLogo(true);
    try {
      const body = new FormData();
      body.append("logo", file);
      const response = await fetch(`/api/brands/${brand.id}/logo`, {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not upload logo.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setError("");
    setUploadingLogo(true);
    try {
      const response = await fetch(`/api/brands/${brand.id}/logo`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not remove logo.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/brands/${brand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pageId: kitPageId,
          pageName:
            pageOptions.find((page) => page.id === kitPageId)?.name ?? kitPageId,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save kit.");
        return;
      }

      setSaved(form);
      setSavedPageId(kitPageId);
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      <form
        id="brand-kit-form"
        onSubmit={handleSubmit}
        className="auth-card rounded-3xl"
      >
        <div className="grid lg:grid-cols-[214px_minmax(0,1fr)] lg:items-start">
          <aside className="sticky top-16 z-10 border-b border-line bg-panel px-4 py-5 lg:top-4 lg:self-start lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                Brand kit
              </p>
              <p className="mt-1 text-sm text-muted lg:max-w-[11rem]">
                Set the rules your content and AI tools should follow.
              </p>
            </div>
            <nav
              className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-5 lg:grid-cols-1 lg:gap-1"
              aria-label="Brand kit sections"
            >
              {kitSections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`${section.label}: ${section.description}`}
                    onClick={() => handleSelectSection(section.id)}
                    className={`min-w-0 rounded-xl border px-2.5 py-2.5 text-left transition lg:px-3 lg:py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? "border-accent bg-navy-soft"
                        : "border-transparent hover:border-line hover:bg-navy-soft"
                    }`}
                  >
                    <span className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-accent text-[color:var(--button-ink)]"
                            : "bg-navy text-muted"
                        }`}
                      >
                        {section.index}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-ink">
                          {section.label}
                        </span>
                        <span className="mt-0.5 hidden text-[11px] leading-snug text-muted lg:block">
                          {section.description}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

        <div className="min-w-0">
          <section
            id="brand-kit-logo"
            className="scroll-mt-6 space-y-4 border-b border-line p-5 sm:p-7"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                01 · Logo
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                Logo
              </h2>
              <p className="mt-1 text-sm text-muted">
                Upload the mark to keep generated assets on-brand.
              </p>
            </div>
            <div className="flex max-w-3xl flex-col gap-4 rounded-2xl border border-dashed border-line bg-navy-soft/40 p-4 sm:flex-row sm:items-center sm:p-5">
              {brand.hasLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/brands/${brand.id}/logo?v=${encodeURIComponent(brand.updatedAt)}`}
                  alt={`${brand.name} logo`}
                  className="size-20 shrink-0 rounded-xl border border-line bg-navy object-contain"
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-navy text-xs text-muted">
                  No logo
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {brand.hasLogo ? `${brand.name} logo` : "No logo uploaded"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  PNG, JPG, WEBP, or GIF · use a clear mark on a transparent
                  background when possible.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label
                    className={`inline-flex items-center rounded-xl border border-line bg-navy px-3 py-2 text-sm font-semibold text-ink hover:bg-navy-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                      uploadingLogo
                        ? "pointer-events-none cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    {uploadingLogo ? "Uploading…" : "Upload logo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={uploadingLogo}
                      aria-label="Upload logo"
                      onChange={(event) => void handleLogoUpload(event)}
                    />
                  </label>
                  {brand.hasLogo ? (
                    <button
                      type="button"
                      onClick={() => void handleRemoveLogo()}
                      disabled={uploadingLogo}
                      className="rounded-xl border border-line bg-navy px-3 py-2 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      aria-label="Remove logo"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section
            id="brand-kit-identity"
            className="scroll-mt-6 space-y-4 border-b border-line p-5 sm:p-7"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                02 · Identity
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
                <FormField
                  htmlFor="kit-page"
                  label="Facebook page"
                  hint="Default page for content plans and publishing."
                >
                  {facebook.connected || pageOptions.length > 0 ? (
                    <select
                      id="kit-page"
                      value={kitPageId}
                      onChange={(event) => {
                        setKitPageId(event.target.value);
                        setError("");
                      }}
                      className={fieldClassName}
                      aria-label="Facebook page for brand kit"
                    >
                      <option value="">No page</option>
                      {pageOptions.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.name || page.id}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-muted">
                      Connect Facebook on Social to choose a page.
                    </p>
                  )}
                </FormField>
              </div>
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
                03 · Colors
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
                04 · Design
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
                05 · Voice
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
      </form>

      <div className="fixed inset-x-4 bottom-4 z-20 lg:left-[calc(16rem+1.25rem)] lg:right-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:px-5">
        <p
          className="flex items-center gap-2 text-sm font-semibold text-ink"
          role="status"
          aria-live="polite"
        >
          <span
            className={`size-2 rounded-full ${isDirty ? "bg-amber-500" : "bg-accent"}`}
            aria-hidden="true"
          />
          {isSubmitting
            ? "Saving changes…"
            : isDirty
              ? "Unsaved changes"
              : "Kit saved"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || isSubmitting}
            className="rounded-full border border-line px-3.5 py-2 text-sm font-semibold text-ink hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="brand-kit-form"
            disabled={!isDirty || isSubmitting}
            className="btn-solid rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </div>
        {error ? (
          <p className="w-full text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}
        </div>
      </div>
    </div>
  );
};
