"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";

type BrandDeleteButtonProps = {
  brandId: string;
  brandName: string;
  redirectTo?: string;
};

export const BrandDeleteButton = ({
  brandId,
  brandName,
  redirectTo,
}: BrandDeleteButtonProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    setError("");
    setIsOpen(true);
  };
  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not delete brand.");
        return;
      }

      setIsOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        aria-label={`Delete ${brandName}`}
      >
        Delete
      </button>
      <Modal title="Delete brand" isOpen={isOpen} onClose={handleClose}>
        <p className="text-sm text-muted">
          Delete <span className="font-semibold text-ink">{brandName}</span>? This
          also removes its social handles, plans, and posts.
        </p>
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
            onClick={handleDelete}
            disabled={isSubmitting}
            className="rounded-full border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {isSubmitting ? "Deleting…" : "Delete brand"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
};
