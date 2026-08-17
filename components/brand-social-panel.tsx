"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fieldClassName, FormField } from "@/components/form-field";
import { Modal } from "@/components/modal";
import { socialAccountPlatforms } from "@/lib/brand-options";
import type { BrandSocialAccount, FacebookStatus } from "@/lib/types";

type BrandSocialPanelProps = {
  brandId: string;
  accounts: BrandSocialAccount[];
  facebook: FacebookStatus;
};

const platformLabel = (value: string) =>
  socialAccountPlatforms.find((item) => item.value === value)?.label ?? value;

const formatHandle = (handle: string) => {
  const trimmed = handle.trim();
  if (!trimmed) {
    return "—";
  }
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
};

export const BrandSocialPanel = ({
  brandId,
  accounts,
  facebook,
}: BrandSocialPanelProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platform, setPlatform] = useState("instagram");
  const [handle, setHandle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenModal = () => {
    setError("");
    setPlatform("instagram");
    setHandle("");
    setUrl("");
    setNotes("");
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/brands/${brandId}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, url, notes }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save account.");
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch {
      setError("Could not reach wil. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    setDeletingId(accountId);
    try {
      await fetch(`/api/brands/${brandId}/social/${accountId}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="auth-card rounded-3xl p-6">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Facebook connection
        </h2>
        <p className="mt-1 text-sm text-muted">
          Connect once for later publishing. Meta keys stay on FREDS.
        </p>
        {facebook.connected ? (
          <p className="mt-4 text-sm font-semibold text-ink">
            Connected{facebook.name ? ` · ${facebook.name}` : ""}
          </p>
        ) : (
          <a
            href="/api/socials/facebook/connect"
            className="btn-solid mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Log in to Facebook
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-ink">
            Social accounts
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Handles and profile URLs used in content plans.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="btn-solid rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Add account
        </button>
      </div>

      <div className="auth-card overflow-x-auto rounded-3xl">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <caption className="sr-only">Social accounts</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Platform
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Handle
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                URL
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-muted">
                  No social accounts yet. Add a handle for Instagram, TikTok, or
                  Facebook.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold text-ink">
                    {platformLabel(account.platform)}
                  </th>
                  <td className="px-5 py-4 text-muted">
                    {formatHandle(account.handle)}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {account.url || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(account.id)}
                      disabled={deletingId === account.id}
                      className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      aria-label={`Delete ${platformLabel(account.platform)} account`}
                    >
                      {deletingId === account.id ? "Removing…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal title="Add social account" isOpen={isModalOpen} onClose={handleCloseModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField htmlFor="socialPlatform" label="Platform">
            <select
              id="socialPlatform"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className={fieldClassName}
              aria-label="Social platform"
            >
              {socialAccountPlatforms.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField htmlFor="socialHandle" label="Handle">
            <input
              id="socialHandle"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              className={fieldClassName}
              placeholder="acmehomes"
            />
          </FormField>
          <FormField htmlFor="socialUrl" label="Profile URL">
            <input
              id="socialUrl"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className={fieldClassName}
              placeholder="https://"
            />
          </FormField>
          <FormField htmlFor="socialNotes" label="Notes">
            <textarea
              id="socialNotes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={fieldClassName}
              placeholder="Tone, posting windows, channel rules…"
            />
          </FormField>
          {error ? (
            <p
              className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-solid rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {isSubmitting ? "Saving…" : "Save account"}
          </button>
        </form>
      </Modal>
    </div>
  );
};
