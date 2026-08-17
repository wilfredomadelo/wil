"use client";

import { useEffect } from "react";
import type { BrandPostMedia } from "@/lib/types";

type MediaPreviewProps = {
  media: BrandPostMedia | null;
  onClose: () => void;
};

export const MediaPreview = ({ media, onClose }: MediaPreviewProps) => {
  useEffect(() => {
    if (!media) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [media, onClose]);

  if (!media) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={media.fileName || media.type}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Close full view"
      >
        Close
      </button>
      <div
        className="flex max-h-[92vh] max-w-[96vw] flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        {media.type === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.fileName || "Full view"}
            className="max-h-[88vh] max-w-[96vw] rounded-lg object-contain shadow-2xl"
          />
        ) : media.type === "VIDEO" ? (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-h-[88vh] max-w-[96vw] rounded-lg bg-black shadow-2xl"
            aria-label={media.fileName || "Video"}
          />
        ) : (
          <p className="rounded-xl bg-panel px-4 py-3 text-sm text-ink">
            {media.fileName || media.type}
          </p>
        )}
        {media.fileName ? (
          <p className="max-w-md truncate text-center text-sm text-white/80">
            {media.fileName}
          </p>
        ) : null}
      </div>
    </div>
  );
};
