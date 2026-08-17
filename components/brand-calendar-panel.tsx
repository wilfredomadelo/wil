"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandPostFeed } from "@/components/brand-post-feed";
import { fieldClassName, FormField } from "@/components/form-field";
import { MediaPreview } from "@/components/media-preview";
import { Modal } from "@/components/modal";
import { toIsoFromLocal, toLocalInput } from "@/lib/datetime-local";
import type { BrandPost, BrandPostMedia, FacebookPageOption } from "@/lib/types";

type BrandCalendarPanelProps = {
  brandId: string;
  posts: BrandPost[];
  pages: FacebookPageOption[];
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

export const BrandCalendarPanel = ({
  brandId,
  posts,
  pages,
}: BrandCalendarPanelProps) => {
  const router = useRouter();
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedPost, setSelectedPost] = useState<BrandPost | null>(null);
  const [pubPageId, setPubPageId] = useState("");
  const [pubScheduledAt, setPubScheduledAt] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [previewMedia, setPreviewMedia] = useState<BrandPostMedia | null>(null);

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

  const handleOpenPost = (post: BrandPost) => {
    setPublishError("");
    setSelectedPost(post);
    setPubPageId(post.pageId ?? pages[0]?.id ?? "");
    setPubScheduledAt(toLocalInput(post.plannedAt));
  };

  const handleClosePost = () => {
    if (publishing) {
      return;
    }
    setSelectedPost(null);
    setPublishError("");
    setPreviewMedia(null);
  };

  const handleScheduleFacebook = async () => {
    if (!selectedPost) {
      return;
    }
    if (!pubPageId) {
      setPublishError("Select a Facebook page.");
      return;
    }
    const scheduledIso = toIsoFromLocal(pubScheduledAt);
    if (!scheduledIso) {
      setPublishError("Pick a schedule time (at least 10 minutes from now).");
      return;
    }
    setPublishError("");
    setPublishing(true);
    try {
      const response = await fetch(
        `/api/brands/${brandId}/posts/${selectedPost.id}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: pubPageId,
            scheduledAt: scheduledIso,
          }),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPublishError(data.error ?? "Could not schedule on Facebook.");
        return;
      }
      setSelectedPost(null);
      router.refresh();
    } catch {
      setPublishError("Could not reach wil. Try again.");
    } finally {
      setPublishing(false);
    }
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
                      isToday ? "border-accent bg-navy-soft" : "border-line"
                    } ${isOutsideMonth ? "opacity-40" : ""}`}
                  >
                    <p className="text-xs font-semibold text-muted">
                      {day.getDate()}
                    </p>
                    <div className="mt-1 space-y-1">
                      {items.map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => handleOpenPost(post)}
                          className="block w-full truncate rounded-lg bg-navy px-1.5 py-1 text-left text-[11px] font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          aria-label={`Show post ${post.title || post.kind}`}
                        >
                          {post.title || post.kind}
                        </button>
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
              <li key={post.id}>
                <button
                  type="button"
                  onClick={() => handleOpenPost(post)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-left text-sm hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-label={`Show post ${post.title || post.kind}`}
                >
                  <span className="font-semibold text-ink">
                    {post.title || post.kind}
                  </span>
                  {post.caption ? (
                    <span className="mt-0.5 block truncate text-muted">
                      {post.caption}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Modal
        title={selectedPost?.pageName || selectedPost?.title || "Post"}
        isOpen={Boolean(selectedPost)}
        onClose={handleClosePost}
        size="tall"
        hideTitle
      >
        {selectedPost ? (
          <div>
            <BrandPostFeed
              post={selectedPost}
              onPreview={setPreviewMedia}
            />
            <div className="space-y-4 px-4 pb-5 pt-4">
            {selectedPost.status !== "PUBLISHED" ? (
              <div className="space-y-3 rounded-xl border border-line p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Schedule on Facebook
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField htmlFor="cal-fb-page" label="Page">
                    <select
                      id="cal-fb-page"
                      value={pubPageId}
                      onChange={(event) => setPubPageId(event.target.value)}
                      className={fieldClassName}
                      aria-label="Facebook page for schedule"
                    >
                      <option value="">Select a page</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField
                    htmlFor="cal-fb-schedule"
                    label="Schedule"
                    tooltip="At least 10 minutes from now (Facebook)."
                  >
                    <input
                      id="cal-fb-schedule"
                      type="datetime-local"
                      value={pubScheduledAt}
                      onChange={(event) => setPubScheduledAt(event.target.value)}
                      className={fieldClassName}
                      aria-label="Schedule"
                    />
                  </FormField>
                </div>
                {!pages.length ? (
                  <p className="text-xs text-muted">
                    Connect Facebook on Social to choose a page.
                  </p>
                ) : null}
                {publishError ? (
                  <p className="text-sm text-red-200" role="alert">
                    {publishError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleScheduleFacebook()}
                  disabled={publishing || !pubPageId || !pubScheduledAt}
                  className="btn-solid rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  aria-label="Schedule post on Facebook"
                >
                  {publishing ? "Scheduling…" : "Schedule on Facebook"}
                </button>
              </div>
            ) : (
              <p className="rounded-xl border border-line bg-navy-soft px-3 py-2 text-sm text-ink">
                Already published / scheduled on Facebook.
              </p>
            )}
            </div>
          </div>
        ) : null}
      </Modal>
      <MediaPreview
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
