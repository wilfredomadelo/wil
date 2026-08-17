import Link from "next/link";

const linkClassName =
  "font-semibold text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export const AboutCopy = () => (
  <>
    <p>
      wil is an AI agent for content and social media. It helps teams draft
      captions, plan posts, and keep brand channels moving without cloning a
      full admin console.
    </p>
    <p>
      The product sits on the FREDS platform: subscribers sign up on wil,
      while FREDS stores accounts, brands, and publishing tools.
    </p>
  </>
);

export const SubscriptionCopy = () => (
  <>
    <p>
      wil has a Free plan plus paid Starter and Pro plans billed monthly in
      PHP through PayMongo. Cards and Maya are supported for recurring
      billing.
    </p>
    <p>
      Compare limits on{" "}
      <Link href="/pricing" className={linkClassName}>
        Pricing
      </Link>
      . Read how payments work on{" "}
      <Link href="/billing" className={linkClassName}>
        Billing
      </Link>
      .
    </p>
  </>
);

export const DocumentationCopy = () => (
  <>
    <p>
      Create an account, then add a unique username. Until a username is set,
      wil will not open the app.
    </p>
    <p>
      After that your workspace is{" "}
      <code className="rounded bg-navy-soft px-1.5 py-0.5 text-ink">
        /your-username
      </code>
      . Brands, personas, socials, plan selection, and account billing live
      there.
    </p>
    <p>
      Public plan details are on{" "}
      <Link href="/pricing" className={linkClassName}>
        Pricing
      </Link>
      . How PayMongo billing works is on{" "}
      <Link href="/billing" className={linkClassName}>
        Billing
      </Link>
      .
    </p>
  </>
);

export const SupportCopy = () => (
  <>
    <p>
      Start with the{" "}
      <Link href="/documentation" className={linkClassName}>
        documentation
      </Link>{" "}
      for signup, usernames, brands, and billing.
    </p>
    <p>
      If something is broken, go to{" "}
      <Link href="/contact" className={linkClassName}>
        Contact us
      </Link>{" "}
      with the page URL and what you expected to happen.
    </p>
  </>
);

export const ContactCopy = () => (
  <>
    <p>
      For product questions, billing, or account help, email{" "}
      <a
        href="mailto:support@example.com"
        className={linkClassName}
      >
        support@example.com
      </a>
      .
    </p>
    <p>
      Include the email on your wil account and a short description of what
      you need. We typically reply on business days.
    </p>
  </>
);

export const PrivacyCopy = () => (
  <>
    <p>
      wil collects the account details you submit (name, email, username, and
      password hash stored by FREDS) so we can create your subscriber login
      and keep you signed in.
    </p>
    <p>
      Brand kits, content plans, and generated media are stored to run the
      product. Payment details are handled by PayMongo. Card numbers are not
      stored on wil or FREDS.
    </p>
    <p>
      We use session cookies to keep you logged in. We do not sell your
      personal data. Contact support if you want an account deleted.
    </p>
  </>
);

export const TermsCopy = () => (
  <>
    <p>
      By creating a wil account you agree to use the service for lawful
      content and social workflows. You are responsible for the brands,
      captions, and media you generate or publish.
    </p>
    <p>
      Paid plans are billed monthly through PayMongo. Cancelling stops future
      invoices; access stays through the current paid period when applicable.
    </p>
    <p>
      Usernames must be unique. Reserved words and impersonation are not
      allowed. We may suspend accounts that abuse AI generation, publishing,
      or other subscribers.
    </p>
  </>
);
