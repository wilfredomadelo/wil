"use client";

import type { ReactNode } from "react";
import type { BrandPost, BrandPostMedia } from "@/lib/types";

type BrandPostFeedProps = {
  post: BrandPost;
  onPreview: (media: BrandPostMedia) => void;
  footer?: ReactNode;
};

const formatFeedWhen = (value: string | null) => {
  if (!value) {
    return "Unscheduled";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const imageTileClass = (count: number, index: number) => {
  if (count === 1) {
    return "aspect-[4/5] max-h-80 w-full";
  }
  if (count === 3 && index === 0) {
    return "col-span-2 aspect-[16/9] max-h-48";
  }
  return "aspect-square max-h-48";
};

export const BrandPostFeed = ({
  post,
  onPreview,
  footer,
}: BrandPostFeedProps) => {
  const pageName = post.pageName?.trim() || "Brand page";
  const images = (post.media ?? []).filter((item) => item.type === "IMAGE");
  const otherMedia = (post.media ?? []).filter((item) => item.type !== "IMAGE");
  const hashtags = (post.hashtags ?? []).map((tag) => `#${tag}`).join(" ");
  const hasCopy = Boolean(post.title?.trim() || post.caption?.trim() || hashtags);

  return (
    <article>
      <div className="flex items-start gap-3 px-4 pt-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-[color:var(--button-ink)]"
          aria-hidden="true"
        >
          {(pageName[0] || "B").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{pageName}</p>
          <p className="text-xs text-muted">
            {formatFeedWhen(post.plannedAt)} · {post.platform} · {post.status}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-navy-soft px-2 py-0.5 text-[11px] font-semibold uppercase text-muted">
          {post.kind}
        </span>
      </div>

      {hasCopy ? (
        <div className="space-y-1 px-4 pt-3">
          {post.title?.trim() ? (
            <p className="text-sm font-semibold text-ink">{post.title}</p>
          ) : null}
          {post.caption?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {post.caption}
            </p>
          ) : null}
          {hashtags ? (
            <p className="text-sm text-accent">{hashtags}</p>
          ) : null}
        </div>
      ) : (
        <p className="px-4 pt-3 text-sm text-muted">No caption</p>
      )}

      {images.length ? (
        <div
          className={`mx-auto mt-3 grid max-w-md gap-0.5 bg-navy-soft ${
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPreview(item)}
              aria-label={`View ${item.fileName || "image"} full size`}
              className={`relative overflow-hidden bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${imageTileClass(images.length, index)}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.fileName || post.title || "Post image"}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {otherMedia.length ? (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {otherMedia.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPreview(item)}
              className="rounded bg-navy-soft px-2 py-1 text-xs font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {item.type}
            </button>
          ))}
        </div>
      ) : null}

      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
          {footer}
        </div>
      ) : null}
    </article>
  );
};
