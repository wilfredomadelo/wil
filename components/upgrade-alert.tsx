"use client";

import Link from "next/link";
import { useAppHref } from "@/components/app-base-path";

type UpgradeAlertProps = {
  error: string;
  code?: string;
};

export const UpgradeAlert = ({ error, code }: UpgradeAlertProps) => {
  const href = useAppHref();

  return (
    <p
      className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
      role="alert"
    >
      {error}
      {code === "upgrade_required" ? (
        <>
          {" "}
          <Link
            href={href("/pricing")}
            className="font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            See plans
          </Link>
        </>
      ) : null}
    </p>
  );
};
