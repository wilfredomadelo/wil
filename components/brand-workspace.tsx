"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppHref } from "@/components/app-base-path";
import { BrandCreateForm } from "@/components/brand-create-form";
import { BrandDeleteButton } from "@/components/brand-delete-button";
import { Modal } from "@/components/modal";
import { DEFAULT_WIL_BILLING, type BrandSummary, type WilSubscriberBilling } from "@/lib/types";

type BrandWorkspaceProps = {
  brands: BrandSummary[];
  billing?: WilSubscriberBilling;
};

export const BrandWorkspace = ({ brands, billing }: BrandWorkspaceProps) => {
  const href = useAppHref();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limits = billing?.limits ?? DEFAULT_WIL_BILLING.limits;
  const canCreate = brands.length < limits.maxBrands;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Brands
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
            Brands
          </h1>
          <p className="mt-2 text-sm text-muted">
            {brands.length} of {limits.maxBrands} brands used.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={!canCreate}
          className="btn-solid rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Add
        </button>
      </div>

      <div className="auth-card overflow-x-auto rounded-3xl">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Your brands</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Name
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Type
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Industry
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Tagline
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-muted">
                  No brands yet. Click Add to create one.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold text-ink">
                    <Link
                      href={href(`/brands/${brand.id}`)}
                      className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      {brand.name}
                    </Link>
                  </th>
                  <td className="px-5 py-4 capitalize text-muted">{brand.kind}</td>
                  <td className="px-5 py-4 text-muted">{brand.industry || "—"}</td>
                  <td className="px-5 py-4 text-muted">{brand.tagline || "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={href(`/brands/${brand.id}`)}
                        className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        Edit
                      </Link>
                      <BrandDeleteButton
                        brandId={brand.id}
                        brandName={brand.name}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!canCreate ? (
        <p className="text-sm text-muted">
          Brand limit reached on your {billing?.plan === "PRO" ? "Pro" : billing?.plan === "STARTER" ? "Starter" : "Free"} plan.{" "}
          <Link
            href={href("/pricing")}
            className="font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Upgrade
          </Link>{" "}
          to add another brand.
        </p>
      ) : null}

      <Modal title="Add brand" isOpen={isModalOpen} onClose={handleCloseModal}>
        <BrandCreateForm onSuccess={handleCloseModal} />
      </Modal>
    </div>
  );
};
