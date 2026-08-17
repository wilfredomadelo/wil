"use client";

import { THEMES, useTheme, type Theme } from "@/components/theme-provider";

const THEME_LABELS: Record<Theme, string> = {
  dark: "Dark",
  light: "Light",
  moonlight: "Moon Light",
};

export const ThemeToggle = () => {
  const { theme, handleSetTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex rounded-full border border-line bg-panel p-0.5"
    >
      {THEMES.map((option) => {
        const isSelected = theme === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={THEME_LABELS[option]}
            onClick={() => handleSetTheme(option)}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3 ${
              isSelected
                ? "bg-accent text-[color:var(--button-ink)]"
                : "text-muted hover:text-ink"
            }`}
          >
            {THEME_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
};
