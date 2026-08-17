import type { BrandSummary } from "@/lib/types";

type BrandListProps = {
  brands: BrandSummary[];
};

const swatchStyle = (color: string) =>
  color ? { backgroundColor: color } : undefined;

export const BrandList = ({ brands }: BrandListProps) => {
  if (brands.length === 0) {
    return (
      <div className="auth-card rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Brands
        </p>
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">
          No brands yet
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Create your first brand below. You can add up to 2.
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="brands-heading" className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Brands
        </p>
        <h2
          id="brands-heading"
          className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Saved brands
        </h2>
      </div>
      <ul className="grid gap-3">
        {brands.map((brand) => (
          <li key={brand.id}>
            <article className="auth-card rounded-3xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-extrabold text-ink">
                    {brand.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {[brand.kind, brand.industry].filter(Boolean).join(" · ") ||
                      "Brand"}
                  </p>
                  {brand.tagline ? (
                    <p className="mt-3 text-sm leading-relaxed text-ink/80">
                      {brand.tagline}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1.5" aria-hidden="true">
                  <span
                    className="size-4 rounded-full border border-line"
                    style={swatchStyle(brand.primaryColor)}
                  />
                  <span
                    className="size-4 rounded-full border border-line"
                    style={swatchStyle(brand.secondaryColor)}
                  />
                  <span
                    className="size-4 rounded-full border border-line"
                    style={swatchStyle(brand.accentColor)}
                  />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};
