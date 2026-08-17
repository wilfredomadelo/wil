const tabs = [
  {
    id: "kit",
    label: "Kit",
    summary: "Define the brand so AI and the team stay consistent.",
    steps: [
      "Fill Identity: name, type, industry, tagline, vision, and mission.",
      "Set Colors, Design notes, and Voice / sample copy.",
      "Save the kit before generating content.",
    ],
  },
  {
    id: "social",
    label: "Social",
    summary: "Store handles and profile links AI can reference in plans.",
    steps: [
      "Add each platform with handle and optional profile URL.",
      "Use notes for channel-specific rules (tone, posting windows).",
      "Connect Facebook when you are ready to publish.",
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    summary: "See every planned post across all content plans for this brand.",
    steps: [
      "Switch Week / Month to review the schedule.",
      "Unscheduled posts appear below the grid.",
      "Generate a plan first so dates have content.",
    ],
  },
  {
    id: "plans",
    label: "Content plan",
    summary: "Generate and edit the actual posts you will publish.",
    steps: [
      "Finish Kit and Social so the generator has brand rules.",
      "Create a plan with days, mix, and a brief.",
      "Calendar reflects planned dates after posts exist.",
    ],
  },
] as const;

const flow = [
  { step: "1", label: "Kit", detail: "Brand rules + voice + colors" },
  { step: "2", label: "Social", detail: "Handles AI should know" },
  { step: "3", label: "Content plan", detail: "Generate & refine posts" },
  { step: "4", label: "Calendar", detail: "Review schedule & publish" },
] as const;

export const BrandGuidePanel = () => (
  <div className="space-y-6">
    <section className="auth-card rounded-3xl p-5 sm:p-6">
      <h2 className="font-display text-xl font-extrabold text-ink">
        How to use this brand
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Work left to right: set the kit, add social handles, generate a content
        plan, then manage timing from Calendar.
      </p>
      <ol className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {flow.map((item, index) => (
          <li key={item.label} className="rounded-xl border border-line bg-navy px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              Step {item.step}
              {index < flow.length - 1 ? " →" : ""}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{item.label}</p>
            <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
          </li>
        ))}
      </ol>
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      {tabs.map((item) => (
        <section
          key={item.id}
          className="auth-card rounded-3xl p-5"
          aria-labelledby={`guide-${item.id}-title`}
        >
          <h3
            id={`guide-${item.id}-title`}
            className="text-base font-semibold text-ink"
          >
            {item.label}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{item.summary}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink">
            {item.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  </div>
);
