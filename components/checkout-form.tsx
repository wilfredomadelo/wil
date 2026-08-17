"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppHref } from "@/components/app-base-path";
import { fieldClassName } from "@/components/form-field";
import { formatPhpAmount } from "@/lib/billing-format";
import type { WilCheckoutSession } from "@/lib/types";

type CheckoutFormProps = {
  plan: "STARTER" | "PRO";
  planName: string;
  userName: string;
  userEmail: string;
  publicKey: string;
};

type PaymongoErrorBody = {
  errors?: Array<{ detail?: string }>;
};

const publicAuth = (publicKey: string) => `Basic ${btoa(`${publicKey}:`)}`;

const paymongoPublicPost = async (
  path: string,
  publicKey: string,
  body: unknown,
): Promise<{ status: number; data: Record<string, unknown> }> => {
  const response = await fetch(`https://api.paymongo.com/v1${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: publicAuth(publicKey),
    },
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return { status: response.status, data };
};

const errorFromPaymongo = (data: Record<string, unknown>): string => {
  const errors = (data as PaymongoErrorBody).errors;
  return errors?.[0]?.detail ?? "Payment failed. Try another card or Maya.";
};

export const CheckoutForm = ({
  plan,
  planName,
  userName,
  userEmail,
  publicKey,
}: CheckoutFormProps) => {
  const router = useRouter();
  const href = useAppHref();
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [amountLabel, setAmountLabel] = useState("");

  const handleStartCheckout = async (): Promise<WilCheckoutSession | null> => {
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, phone: phone.trim() || undefined }),
    });
    const data = (await response.json()) as {
      checkout?: WilCheckoutSession;
      error?: string;
    };
    if (!response.ok || !data.checkout) {
      setError(data.error ?? "Could not start checkout.");
      return null;
    }
    setAmountLabel(
      `${formatPhpAmount(data.checkout.amount)} ${data.checkout.currency}`,
    );
    return data.checkout;
  };

  const handleAttach = async (
    checkout: WilCheckoutSession,
    paymentMethodId: string,
  ) => {
    const { status, data } = await paymongoPublicPost(
      `/payment_intents/${checkout.paymentIntentId}/attach`,
      publicKey,
      {
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: checkout.clientKey,
            return_url: checkout.returnUrl,
          },
        },
      },
    );

    if (status >= 400) {
      setError(errorFromPaymongo(data));
      return;
    }

    const payload = data.data as
      | {
          attributes?: {
            status?: string;
            next_action?: { redirect?: { url?: string } };
          };
        }
      | undefined;
    const intentStatus = payload?.attributes?.status ?? "";
    const redirectUrl = payload?.attributes?.next_action?.redirect?.url;

    if (intentStatus === "awaiting_next_action" && redirectUrl) {
      window.location.assign(redirectUrl);
      return;
    }

    if (intentStatus === "succeeded" || intentStatus === "processing") {
      router.push(href("/billing/return"));
      return;
    }

    setError("Payment needs another step. Try Maya or a different card.");
  };

  const handleCardPay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!publicKey) {
      setError("PayMongo public key is not set on wil.");
      return;
    }

    setIsBusy(true);
    try {
      const checkout = await handleStartCheckout();
      if (!checkout) {
        return;
      }

      const number = cardNumber.replace(/\s+/g, "");
      const { status, data } = await paymongoPublicPost(
        "/payment_methods",
        publicKey,
        {
        data: {
          attributes: {
            type: "card",
            details: {
              card_number: number,
              exp_month: Number(expMonth),
              exp_year: Number(expYear),
              cvc,
            },
            billing: {
              name: userName,
              email: userEmail,
              phone: phone.trim() || undefined,
            },
          },
        },
      });

      if (status >= 400) {
        setError(errorFromPaymongo(data));
        return;
      }

      const methodId = (data.data as { id?: string } | undefined)?.id;
      if (!methodId) {
        setError("Could not save the card.");
        return;
      }

      await handleAttach(checkout, methodId);
    } catch {
      setError("Could not reach PayMongo. Try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleMayaPay = async () => {
    setError("");
    if (!publicKey) {
      setError("PayMongo public key is not set on wil.");
      return;
    }

    setIsBusy(true);
    try {
      const checkout = await handleStartCheckout();
      if (!checkout) {
        return;
      }

      const { status, data } = await paymongoPublicPost(
        "/payment_methods",
        publicKey,
        {
        data: {
          attributes: {
            type: "paymaya",
            billing: {
              name: userName,
              email: userEmail,
              phone: phone.trim() || undefined,
            },
          },
        },
      });

      if (status >= 400) {
        setError(errorFromPaymongo(data));
        return;
      }

      const methodId = (data.data as { id?: string } | undefined)?.id;
      if (!methodId) {
        setError("Could not start Maya.");
        return;
      }

      await handleAttach(checkout, methodId);
    } catch {
      setError("Could not reach PayMongo. Try again.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {amountLabel ? (
        <p className="text-sm text-muted">Charge: {amountLabel}</p>
      ) : null}
      <form onSubmit={handleCardPay} className="space-y-4">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">
            Mobile (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClassName}
            placeholder="09xxxxxxxxx"
            autoComplete="tel"
          />
        </div>
        <div>
          <label
            htmlFor="cardNumber"
            className="mb-1.5 block text-sm font-semibold"
          >
            Card number
          </label>
          <input
            id="cardNumber"
            name="cardNumber"
            inputMode="numeric"
            autoComplete="cc-number"
            required
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            className={fieldClassName}
            placeholder="4343 4343 4343 4345"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="expMonth"
              className="mb-1.5 block text-sm font-semibold"
            >
              Month
            </label>
            <input
              id="expMonth"
              name="expMonth"
              inputMode="numeric"
              autoComplete="cc-exp-month"
              required
              maxLength={2}
              value={expMonth}
              onChange={(event) => setExpMonth(event.target.value)}
              className={fieldClassName}
              placeholder="12"
            />
          </div>
          <div>
            <label
              htmlFor="expYear"
              className="mb-1.5 block text-sm font-semibold"
            >
              Year
            </label>
            <input
              id="expYear"
              name="expYear"
              inputMode="numeric"
              autoComplete="cc-exp-year"
              required
              maxLength={4}
              value={expYear}
              onChange={(event) => setExpYear(event.target.value)}
              className={fieldClassName}
              placeholder="2028"
            />
          </div>
          <div>
            <label htmlFor="cvc" className="mb-1.5 block text-sm font-semibold">
              CVC
            </label>
            <input
              id="cvc"
              name="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              required
              maxLength={4}
              value={cvc}
              onChange={(event) => setCvc(event.target.value)}
              className={fieldClassName}
              placeholder="123"
            />
          </div>
        </div>
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
          disabled={isBusy}
          className="btn-solid inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {isBusy ? "Processing…" : `Pay with card · ${planName}`}
        </button>
      </form>
      <button
        type="button"
        onClick={handleMayaPay}
        disabled={isBusy}
        className="inline-flex w-full items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Pay with Maya
      </button>
    </div>
  );
};
