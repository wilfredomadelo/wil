import type { ReactNode } from "react";

export const fieldClassName =
  "w-full rounded-xl border border-line bg-navy px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type FormFieldProps = {
  htmlFor: string;
  label: string;
  hint?: string;
  tooltip?: string;
  children: ReactNode;
};

export const FormField = ({
  htmlFor,
  label,
  hint,
  tooltip,
  children,
}: FormFieldProps) => (
  <div>
    <div className="mb-1.5 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {tooltip ? (
        <span className="group relative inline-flex">
          <button
            type="button"
            aria-label={tooltip}
            className="inline-flex size-4 items-center justify-center rounded-full border border-line text-[10px] font-bold leading-none text-muted hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            i
          </button>
          <span
            role="tooltip"
            className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-56 -translate-x-1/2 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-left text-xs font-medium leading-snug text-ink shadow-lg group-hover:visible group-focus-within:visible"
          >
            {tooltip}
          </span>
        </span>
      ) : null}
    </div>
    {hint ? <p className="mb-2 text-xs text-muted">{hint}</p> : null}
    {children}
  </div>
);
