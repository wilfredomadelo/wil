"use client";

import { useMemo, useState } from "react";
import type { BrandPost } from "@/lib/types";

type BrandCalendarPanelProps = {
  posts: BrandPost[];
};

type CalendarView = "week" | "month";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
};

const startOfMonth = (date: Date) => {
  const next = new Date(date.getFullYear(), date.getMonth(), 1);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

const formatWeekLabel = (start: Date) => {
  const end = addDays(start, 6);
  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
};

export const BrandCalendarPanel = ({ posts }: BrandCalendarPanelProps) => {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const postsByDay = useMemo(() => {
    const map = new Map<string, BrandPost[]>();
    for (const post of posts) {
      if (!post.plannedAt) {
        continue;
      }
      const key = toDateKey(new Date(post.plannedAt));
      const current = map.get(key) ?? [];
      current.push(post);
      map.set(key, current);
    }
    return map;
  }, [posts]);

  const days = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }

    const monthStart = startOfMonth(cursor);
    const gridStart = startOfWeek(monthStart);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [cursor, view]);

  const handlePrevious = () => {
    setCursor((current) =>
      view === "week"
        ? addDays(current, -7)
        : new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const handleNext = () => {
    setCursor((current) =>
      view === "week"
        ? addDays(current, 7)
        : new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCursor(today);
  };

  const todayKey = toDateKey(new Date());
  const unscheduled = posts.filter((post) => !post.plannedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-ink">
            Calendar
          </h2>
          <p className="mt-1 text-sm text-muted">
            Planned posts across every content plan ({posts.length}{" "}
            {posts.length === 1 ? "post" : "posts"}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-full border border-line bg-panel p-0.5"
            role="tablist"
            aria-label="Calendar range"
          >
            {(["week", "month"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={view === option}
                onClick={() => setView(option)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  view === option
                    ? "bg-accent text-[color:var(--button-ink)]"
                    : "text-muted hover:text-ink"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handlePrevious}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            aria-label="Previous period"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            aria-label="Next period"
          >
            Next
          </button>
          <p className="text-sm font-semibold text-ink">
            {view === "week"
              ? formatWeekLabel(startOfWeek(cursor))
              : formatMonthLabel(cursor)}
          </p>
        </div>
      </div>

      <div className="auth-card rounded-3xl p-4 sm:p-5">
        {!posts.length ? (
          <p className="py-10 text-center text-sm text-muted">
            No content yet. Generate a plan on the Content plan tab.
          </p>
        ) : (
          <>
            <div className="mb-2 grid grid-cols-7 gap-2">
              {weekdayLabels.map((label) => (
                <p
                  key={label}
                  className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted"
                >
                  {label}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const key = toDateKey(day);
                const items = postsByDay.get(key) ?? [];
                const isToday = key === todayKey;
                const isOutsideMonth =
                  view === "month" && day.getMonth() !== cursor.getMonth();

                return (
                  <div
                    key={key}
                    className={`min-h-24 rounded-xl border p-2 ${
                      isToday
                        ? "border-accent bg-navy-soft"
                        : "border-line"
                    } ${isOutsideMonth ? "opacity-40" : ""}`}
                  >
                    <p className="text-xs font-semibold text-muted">
                      {day.getDate()}
                    </p>
                    <div className="mt-1 space-y-1">
                      {items.map((post) => (
                        <p
                          key={post.id}
                          className="truncate rounded-lg bg-navy px-1.5 py-1 text-[11px] font-semibold text-ink"
                          title={post.title || post.caption}
                        >
                          {post.title || post.kind}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {unscheduled.length ? (
        <div className="auth-card rounded-3xl p-5">
          <h3 className="font-semibold text-ink">Unscheduled</h3>
          <ul className="mt-3 space-y-2">
            {unscheduled.map((post) => (
              <li key={post.id} className="text-sm text-muted">
                <span className="font-semibold text-ink">
                  {post.title || post.kind}
                </span>
                {post.caption ? ` · ${post.caption}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
