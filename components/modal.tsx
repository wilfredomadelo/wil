"use client";

import type { KeyboardEvent, ReactNode } from "react";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "default" | "tall";
  hideTitle?: boolean;
  hideClose?: boolean;
  layer?: "base" | "overlay";
};

export const Modal = ({
  title,
  isOpen,
  onClose,
  children,
  size = "default",
  hideTitle = false,
  hideClose = false,
  layer = "base",
}: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const handleBackdropKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center p-4 sm:items-center ${
        layer === "overlay" ? "z-[70]" : "z-50"
      }`}
    >
      {hideClose ? (
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      ) : (
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Close dialog"
          onClick={onClose}
          onKeyDown={handleBackdropKeyDown}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`auth-card relative z-10 w-full rounded-3xl shadow-xl ${
          size === "tall"
            ? "max-h-[90vh] max-w-3xl overflow-y-auto"
            : "max-w-lg"
        } ${hideTitle ? "p-0" : "p-6"}`}
      >
        {hideTitle ? (
          hideClose ? null : (
            <div className="flex items-center justify-end border-b border-line px-3 py-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3 py-1 text-sm font-semibold text-muted hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          )
        ) : (
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>
            {hideClose ? null : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3 py-1 text-sm font-semibold text-muted hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Close"
              >
                Close
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
