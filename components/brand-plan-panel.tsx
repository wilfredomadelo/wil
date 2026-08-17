import type { BrandPlan } from "@/lib/types";

type BrandPlanPanelProps = {
  plans: BrandPlan[];
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const BrandPlanPanel = ({ plans }: BrandPlanPanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-ink">
          Content plan
        </h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Plans generated for this brand. Create and refine posts here after the
          kit and social handles are set.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="auth-card rounded-3xl p-6 sm:p-8">
          <p className="font-semibold text-ink">No content plans yet</p>
          <p className="mt-2 text-sm text-muted">
            Finish Kit and Social first. Plan generation is next — Calendar will
            show the posts once a plan exists.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {plans.map((plan) => (
            <li key={plan.id} className="auth-card rounded-3xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-ink">
                    {plan.name || "Untitled plan"}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Starts {formatDate(plan.startDate)} · {plan.days}{" "}
                    {plan.days === 1 ? "day" : "days"} · {plan.posts.length}{" "}
                    {plan.posts.length === 1 ? "post" : "posts"}
                  </p>
                </div>
                <p className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  {plan.status}
                </p>
              </div>
              {plan.brief ? (
                <p className="mt-3 text-sm leading-relaxed text-ink/80">
                  {plan.brief}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted">
                Text {plan.textCount} · Image {plan.imageCount} · Video{" "}
                {plan.videoCount} · Infographic {plan.infographicCount}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
