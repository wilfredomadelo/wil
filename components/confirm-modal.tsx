"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/modal";

type ConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  busyLabel?: string;
  busyTitle?: string;
  busyDescription?: string;
  busyIllustrationSrc?: string;
  isOpen: boolean;
  isBusy?: boolean;
  tone?: "default" | "danger";
  error?: string;
  children?: ReactNode;
  layer?: "base" | "overlay";
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmModal = ({
  title,
  description,
  confirmLabel,
  busyLabel = "Working…",
  busyTitle,
  busyDescription,
  busyIllustrationSrc,
  isOpen,
  isBusy = false,
  tone = "default",
  error = "",
  children,
  layer = "base",
  onClose,
  onConfirm,
}: ConfirmModalProps) => {
  const handleClose = () => {
    if (!isBusy) {
      onClose();
    }
  };

  const showBusyIllustration = isBusy && Boolean(busyIllustrationSrc);
  const heading = showBusyIllustration ? busyTitle ?? title : title;
  const body = showBusyIllustration
    ? busyDescription ?? "This can take a minute. Keep this tab open."
    : description;

  return (
    <Modal
      title={heading}
      isOpen={isOpen}
      onClose={handleClose}
      layer={layer}
      hideClose={showBusyIllustration}
    >
      {showBusyIllustration ? (
        <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
          <img
            src={busyIllustrationSrc}
            alt=""
            width={176}
            height={176}
            className="mascot-bob size-44 object-contain"
            onError={(event) => {
              event.currentTarget.src = "/brand/mascot.png";
            }}
          />
          <p className="mt-2 text-sm font-semibold text-ink">{busyLabel}</p>
          <p className="mt-1 text-sm text-muted">{body}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">{description}</p>
          {children}
        </>
      )}
      {error ? (
        <p
          className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {showBusyIllustration ? null : (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={
              tone === "danger"
                ? "rounded-full border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                : "btn-solid rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            }
          >
            {isBusy ? busyLabel : confirmLabel}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Cancel
          </button>
        </div>
      )}
    </Modal>
  );
};
