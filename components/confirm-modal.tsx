"use client";

import { Modal } from "@/components/modal";

type ConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  busyLabel?: string;
  isOpen: boolean;
  isBusy?: boolean;
  tone?: "default" | "danger";
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmModal = ({
  title,
  description,
  confirmLabel,
  busyLabel = "Working…",
  isOpen,
  isBusy = false,
  tone = "default",
  error = "",
  onClose,
  onConfirm,
}: ConfirmModalProps) => {
  const handleClose = () => {
    if (!isBusy) {
      onClose();
    }
  };

  return (
    <Modal title={title} isOpen={isOpen} onClose={handleClose}>
      <p className="text-sm text-muted">{description}</p>
      {error ? (
        <p
          className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}
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
    </Modal>
  );
};
