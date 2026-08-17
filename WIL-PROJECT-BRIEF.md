# Wil — Project Brief (from FREDS)

**Product:** Wil — AI agent for content and social media  
**Platform backend:** FREDS (`fredsapp`)  
**Date captured:** 2026-08-17  

This document is a handoff so Wil can be built in a **separate repo / separate Vercel project**, while using FREDS as the engine and shared database.

---

## 1. Goal

Build **Wil** as the customer-facing AI agent product.

- Users can **create an account** and **log in** on Wil.
- Those users are stored in the **fredsapp database** as **subscribers**.
- Wil UI talks to **fredsapp HTTP APIs** (not its own Postgres, at least at first).
- **fredsapp** remains the admin + platform (brands, plans, social publish, AI pipelines).

**Do not** redeploy the full FREDS admin app twice as “Wil.”  
Wil is a different product face on top of the same platform.

---

## 2. Architecture (recommended)

```
┌─────────────────────┐         HTTPS APIs          ┌──────────────────────────┐
│  Wil (Vercel)       │  ─────────────────────────► │  fredsapp (Vercel)       │
│  - marketing / app  │     signup, login, JWT/     │  - Admin UI              │
│  - agent UI         │     session, content APIs   │  - Platform APIs         │
│  - subscriber UX    │                             │  - Auth + Prisma         │
└─────────────────────┘                             └────────────┬─────────────┘
                                                                 │
                                                                 ▼
                                                        PostgreSQL (shared)
                                                        users, brands, posts…
```

| Piece | Owns |
| --- | --- |
| **Wil** | Branding, agent UX, subscriber login/signup UI, calling FREDS APIs |
| **fredsapp** | Database, user records, auth verification, admin, content/social APIs |
| **Postgres** | Single source of truth (existing fredsapp DB) |

### What to avoid (v1)

- Giving Wil direct `DATABASE_URL` access (prefer API-only).
- Forking the whole admin UI into Wil.
- Sharing Auth.js cookies across unrelated domains without a plan — use **API auth** (token) between Wil and FREDS.
- Letting subscribers open `/admin/*`.

---

## 3. User model

Today in fredsapp, roles are roughly:

- `USER`
- `SUPER_ADMIN`

**Add a subscriber concept**, preferred options:

### Option A (cleaner) — new role

```text
UserRole: USER | SUPER_ADMIN | SUBSCRIBER
```

- Wil signups → `role = SUBSCRIBER`
- Admin staff → `SUPER_ADMIN` / internal `USER`
- APIs: subscribers can only access subscriber-scoped routes

### Option B (minimal) — tag existing USER

Keep `USER`, add fields such as:

- `source` = `"wil"` | `"freds"` | …
- optional `plan` / `subscriptionStatus`

**Recommendation:** Option A (`SUBSCRIBER`) if you want clear product boundaries.

Also plan for:

- email + password (hash with bcrypt, same as FREDS credentials flow)
- `verified` flag (email verify or admin approve — decide product rule)
- optional later: Google OAuth via FREDS, not duplicated blindly on Wil

---

## 4. Auth contract (Wil ↔ FREDS)

Auth is **owned by fredsapp**. Wil never invents a second user table.

### Suggested endpoints on FREDS

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/wil/auth/register` | Create subscriber (name, email, password) |
| `POST` | `/api/wil/auth/login` | Validate credentials → return session/JWT |
| `POST` | `/api/wil/auth/logout` | Invalidate token/session if applicable |
| `GET` | `/api/wil/auth/me` | Current subscriber profile |

### Token approach (recommended for cross-domain)

1. Wil posts email/password to FREDS.
2. FREDS returns a **JWT** (or opaque access token) scoped to that user.
3. Wil stores it (httpOnly cookie on Wil domain, or secure client storage pattern you choose).
4. Wil sends `Authorization: Bearer <token>` on every FREDS API call.
5. FREDS middleware validates token + requires `SUBSCRIBER` (or tagged Wil user).

### Cookie approach (only if same-site / carefully configured)

Possible later if Wil and FREDS share a parent domain (e.g. `wil.example.com` + `api.example.com`). Harder across totally separate domains — prefer JWT for v1.

---

## 5. Product surface (Wil v1)

Minimum useful Wil:

1. **Landing** — “Wil” brand, AI agent for content & social.
2. **Create account** — registers subscriber in FREDS DB.
3. **Login / logout**
4. **Agent shell** — chat-style UI that can ask FREDS for help (content ideas, captions, plan actions).
5. **Basic workspace** — list / open the subscriber’s brands or content (via FREDS APIs).

Defer:

- Full FREDS admin clone
- Super-admin tools
- Direct Facebook App credentials in Wil (keep Meta connect on FREDS unless you deliberately split it)

---

## 6. FREDS APIs Wil should eventually use

Start small; expand as needed. Group by domain:

### Identity

- register / login / me (above)

### Brands & social (subscriber-scoped)

- list my brands
- get brand
- social accounts CRUD
- content plans / posts (read + generate + publish where allowed)

### Agent

- content assistant / chat endpoint (FREDS already has content assistant patterns)
- wrap tools so the agent can “create plan”, “draft caption”, etc. **through FREDS**, not by inventing DB writes in Wil

**Important:** every endpoint must filter by `userId` from the token. Subscribers only see their own data.

---

## 7. Vercel / repo setup

### FREDS (existing)

- Keep current Vercel project.
- Add Wil-facing API routes + CORS allowlist for Wil origin(s).
- Add env for Wil JWT secret / issuer if separate from `AUTH_SECRET` (or document shared secret carefully).

### Wil (new)

- New Git repo (or monorepo package later).
- New Vercel project named **Wil**.
- Env examples:

```bash
NEXT_PUBLIC_APP_NAME=Wil
NEXT_PUBLIC_FREDS_API_URL=https://<your-fredsapp-domain>
# server-only if Wil proxies:
FREDS_API_URL=https://<your-fredsapp-domain>
# do NOT put DATABASE_URL on Wil in v1 unless you consciously change architecture
```

### CORS on FREDS

Allow:

- `https://wil.<your-domain>`
- local Wil origin for dev

Only for Wil API routes (or global with care).

---

## 8. Security checklist

- [ ] Subscribers cannot access `/admin` or `SUPER_ADMIN` APIs
- [ ] Password hashing on FREDS only
- [ ] Rate-limit register/login
- [ ] Email uniqueness
- [ ] Verification policy decided (block unverified vs soft-allow)
- [ ] CORS locked to Wil origins
- [ ] No FREDS service secrets in Wil client bundle
- [ ] Meta / Gemini / GCS keys stay on FREDS server

---

## 9. Suggested build order

1. **FREDS:** add `SUBSCRIBER` (or source tag) + register/login/me APIs + auth middleware for Wil routes.
2. **Wil:** scaffold Next app, branding, login + signup pages calling FREDS.
3. **Wil:** authenticated home + `/me` check.
4. **FREDS + Wil:** first real feature (e.g. list brands or agent caption assist).
5. Expand agent tools + content/social workflows.
6. Only then consider monorepo packaging or shared types package.

---

## 10. Decisions still open

Answer these before coding Wil deeply:

1. Domain plan: same parent domain vs fully separate?
2. Role model: `SUBSCRIBER` enum vs tagged `USER`?
3. Must email be verified before login?
4. Is Wil chat the primary UI, or a dashboard with an agent panel?
5. Which FREDS features are in Wil v1 (brands only? plans? Facebook publish?)?
6. Billing later — Stripe on Wil or on FREDS?

---

## 11. Context from product discussion

- FREDS already has brands, content plans, social accounts, Facebook Page publishing, influencers, stories, etc.
- Facebook Business Portfolio discovery was added on FREDS (`business_management` + owned/client pages).
- Brand Social tab was improved to table + “Create Social Media account”.
- Wil should **consume** those capabilities through APIs, not re-implement admin screens.

---

## 12. One-line north star

> **Wil is the subscriber AI agent product. FREDS is the platform and admin. One database. Clear roles. API boundary between them.**

---

## 13. Optional prompt for the other repo’s AI / Cursor

Copy-paste when starting the Wil repo:

```text
Build Wil: a Next.js app (Vercel) that is an AI agent for content and social media.
It must NOT use its own database in v1.
All users register/login via FREDS APIs and are stored as SUBSCRIBER users in the fredsapp Postgres.
Wil calls FREDS with Bearer tokens. No /admin UI. Start with landing, signup, login, me, and an agent shell.
Follow the architecture in WIL-PROJECT-BRIEF.md.
```
