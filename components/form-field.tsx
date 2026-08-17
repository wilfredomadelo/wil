import type { ReactNode } from "react";

export const fieldClassName =
  "w-full rounded-xl border border-line bg-navy px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type FormFieldProps = {
  htmlFor: string;
  label: string;
  hint?: string;
  children: ReactNode;
};

export const FormField = ({ htmlFor, label, hint, children }: FormFieldProps) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
      {label}
    </label>
    {hint ? <p className="mb-2 text-xs text-muted">{hint}</p> : null}
    {children}
  </div>
);
