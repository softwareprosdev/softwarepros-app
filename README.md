<div align="center">

# SoftwarePros.org

### Marketing site and **AI Discovery Center** — a business problem in, an engineer-ready system definition out.

<p>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-0ea5e9?style=for-the-badge&logo=nextdotjs&logoColor=ffffff&labelColor=050508" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-38bdf8?style=for-the-badge&logo=react&logoColor=050508&labelColor=050508" />
  <img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-0284c7?style=for-the-badge&logo=typescript&logoColor=ffffff&labelColor=050508" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-0ea5e9?style=for-the-badge&logo=tailwindcss&logoColor=ffffff&labelColor=050508" />
</p>
<p>
  <img alt="Prisma 7" src="https://img.shields.io/badge/Prisma-7-38bdf8?style=for-the-badge&logo=prisma&logoColor=050508&labelColor=050508" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-14%2B-0369a1?style=for-the-badge&logo=postgresql&logoColor=ffffff&labelColor=050508" />
  <img alt="Claude" src="https://img.shields.io/badge/Claude-Anthropic-0ea5e9?style=for-the-badge&logo=anthropic&logoColor=ffffff&labelColor=050508" />
  <img alt="License: Proprietary" src="https://img.shields.io/badge/License-Proprietary-475569?style=for-the-badge&labelColor=050508" />
</p>

</div>

---

## About

SoftwarePros.org is the public-facing site for a software engineering firm working across
20 engineering disciplines and 15 industries — AI, software engineering, cybersecurity, and
cloud infrastructure. It is a full-stack Next.js 16 application: a marketing surface, a
conversational AI product, a lead pipeline, and an admin view, in one deployable.

**The conversion thesis.** Most agency sites end at a contact form, which asks a prospect to
translate their own problem into a scope before anyone has helped them think. This site
inverts that. A prospect describes a business problem in plain language — typed, spoken, or
uploaded as a document. The **AI Architect** interviews them, tracks requirements as it finds
them, and turns the conversation into an engineer-ready system definition: components,
technology stack, functional and non-functional requirements, delivery phases, and the
questions still open. That definition becomes a shareable project summary the prospect can
send to their own stakeholders — and a captured lead with real context attached, instead of a
name and a one-line message.

Every generated artefact is explicitly labelled an estimate requiring Senior Software
Architect review. The system prompt forbids prices, fixed dates, and contractual language.
That boundary is load-bearing: it is the difference between a helpful scoping tool and an
implied quote.

---

## Table of contents

- [Feature highlights](#feature-highlights)
- [Tech stack](#tech-stack)
- [Routes](#routes)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Deploying to Coolify](#deploying-to-coolify)
- [Project structure](#project-structure)
- [How the AI works](#how-the-ai-works)
- [Security notes](#security-notes)
- [Scripts](#scripts)
- [Contributing and conventions](#contributing-and-conventions)
- [License](#license)

---

## Feature highlights

**Marketing site**

- Homepage with hero, 20 disciplines, delivery pipeline, security section, 15 industries, and engagement models
- `/solutions` — all 20 disciplines grouped into five categories, driven from a single content constant
- `/solutions/cybersecurity` — deep-dive with a live SOC dashboard, threat ticker, case studies, and compliance coverage
- `/industries` — the 15 sectors served and what gets built for each
- Legal surface: privacy, terms, and cookie policy (the cookie policy is generated from the same constants the runtime uses, so it cannot go stale)
- Dark-only palette by intent, animated particle field, glassmorphic surfaces, Font Awesome icons tree-shaken through an explicit map

**AI Discovery Center**

- Streaming chat over newline-delimited JSON — no SSE library on the client
- Voice input via a dedicated modal, reachable from anywhere through a floating action button
- File uploads: PDFs and images handed to Claude natively, text formats stored as extracted text (10 MB cap)
- Live analysis panel that refreshes after each assistant turn — industry, scale, complexity, clarity score, requirements found vs. target, confirmed and unclear modules, open clarifications, and suggested next replies
- Per-browser session ownership via an `httpOnly` owner-token cookie, so the "recent sessions" list never leaks across visitors

**Project summaries**

- One-click generation of a structured, schema-validated project summary from a conversation
- Components, tech stack, requirements (functional / non-functional / AI opportunities / clarifications), and phased delivery plan
- Shareable capability URL, print-to-PDF friendly, with the estimate disclosure above the fold

**Lead capture and admin**

- Lead forms on the contact page, the summary page, and inline CTAs; the contact page adapts to `?intent=assessment|schedule|project`
- Honeypot field — hits are accepted and silently dropped
- Idempotent newsletter subscription
- `/admin/leads` behind HTTP Basic auth with a timing-safe comparison, `noindex`, enforced in both the proxy and each route handler
- In-memory fixed-window rate limiting on every public write endpoint

**SEO / AEO / GEO layer**

- A single schema.org `@graph` per page — one Organization, one WebSite, one WebPage, breadcrumbs, and Service nodes linked by stable `@id` URLs rather than a pile of disconnected blocks
- `FAQPage` schema backed by standalone answers written to be quoted out of context by an answer engine
- `/llms.txt` — llmstxt.org-style markdown index of the whole site, generated from the route table
- `/ai.txt` — entity and brand record for generative engines, including an explicit "what you will not find here" section so a model does not invent prices
- `/.well-known/security.txt` — RFC 9116, with a rolling `Expires` so it can never read as unmaintained
- `sitemap.xml` and `robots.txt` generated from the same route table, with explicit allow rules for 19 named search and AI crawlers and disallows on every capability URL
- Generated favicon, Apple touch icon, OpenGraph image, Twitter image, and web app manifest — all rendered at request time via `next/og`, no static asset pipeline

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3.0 — App Router, RSC, Route Handlers, proxy |
| UI | React 19.2.8, Tailwind CSS v4 (`@theme` tokens in `globals.css`) |
| Icons | Font Awesome 7 (free solid + brands) via an explicit map in `Icon.tsx` |
| Fonts | Inter + JetBrains Mono, self-hosted through `next/font/google` |
| Data | PostgreSQL 14+ via Prisma 7.9 — `prisma-client` generator → `src/generated/prisma` |
| DB driver | `@prisma/adapter-pg` (Prisma 7 connects through a driver adapter, not a bundled engine) |
| AI | `@anthropic-ai/sdk` 0.116 — `claude-opus-5`, streaming chat + structured outputs |
| Validation | Zod 4 on every request body |
| Language | TypeScript 5, strict |
| Lint | ESLint 9 with `eslint-config-next` |

---

## Routes

### Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage — hero, 20 disciplines, pipeline, security, 15 industries, engagement |
| `/solutions` | All 20 engineering disciplines grouped by category |
| `/solutions/cybersecurity` | Cybersecurity deep-dive — live SOC dashboard, case studies, compliance |
| `/industries` | The 15 industries served |
| `/discovery` | Mints a session and redirects to `/discovery/{id}`; accepts `?q=` to seed the first message |
| `/discovery/{id}` | **AI Discovery Center** — streaming chat, voice, uploads, live analysis panel |
| `/summary/{id}` | AI-generated project summary (printable to PDF) |
| `/contact` | Lead capture; adapts to `?intent=assessment\|schedule\|project` |
| `/legal/privacy` | Privacy policy |
| `/legal/terms` | Terms of service |
| `/legal/cookies` | Cookie policy, generated from `src/lib/cookie-names.ts` |
| `/admin/leads` | Captured leads — **HTTP Basic auth, `noindex`, `no-store`** |

> **Declared but not yet on disk.** `src/lib/routes.ts` also lists `/about`, `/careers`,
> `/legal/accessibility`, and `/legal/security`. Those entries already drive the footer,
> sitemap, `llms.txt`, and `ai.txt`; the page files are still landing. Until they exist the
> sitemap advertises four URLs that 404 — either ship the pages or comment the entries out of
> the route table before a production deploy.

### API

| Endpoint | Purpose |
| --- | --- |
| `POST /api/sessions` | Create a discovery session (optionally seeded with a first message) |
| `GET /api/sessions` | List the caller's recent sessions, scoped by the owner-token cookie |
| `POST /api/chat` | Streaming architect reply (NDJSON) + live-analysis refresh |
| `POST /api/upload` | Attach a PDF, image, or text document to a session (10 MB max) |
| `POST /api/summary` | Generate a project summary from a conversation |
| `POST /api/leads` | Capture a lead (honeypot-protected, rate limited) |
| `POST /api/newsletter` | Newsletter subscribe (idempotent) |
| `PATCH /api/admin/leads/{id}` | Update lead status (auth required) |

### Generated metadata routes

| Route | Source file | Notes |
| --- | --- | --- |
| `/robots.txt` | `src/app/robots.ts` | Wildcard + 19 named search / AI crawler groups |
| `/sitemap.xml` | `src/app/sitemap.ts` | Generated from `PUBLIC_ROUTES` |
| `/llms.txt` | `src/app/llms.txt/route.ts` | Also served at `/.well-known/llms.txt` via rewrite |
| `/ai.txt` | `src/app/ai.txt/route.ts` | Also served at `/.well-known/ai.txt` via rewrite |
| `/security.txt` | `src/app/security.txt/route.ts` | Canonical at `/.well-known/security.txt` via rewrite |
| `/manifest.webmanifest` | `src/app/manifest.ts` | Theme colours for Android browser chrome |
| `/icon` | `src/app/icon.tsx` | 64×64 favicon rendered with `next/og` |
| `/apple-icon` | `src/app/apple-icon.tsx` | 180×180 touch icon |
| `/opengraph-image` | `src/app/opengraph-image.tsx` | Social card |
| `/twitter-image` | `src/app/twitter-image.tsx` | `summary_large_image` card |

Error and loading boundaries: `not-found.tsx`, `error.tsx`, `global-error.tsx` at the root,
plus `loading.tsx` for `/discovery/{id}` and `/summary/{id}` and a scoped `not-found.tsx`
for `/summary/{id}`.

---

## Quick start

### Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | **≥ 20.9.0** (required by Next 16; there is no `engines` field or `.nvmrc` in this repo) |
| npm | 10+ (ships with Node 20) |
| PostgreSQL | 14+ — or use `npx prisma dev` below |

### 1. Install

```bash
npm install
```

`postinstall` runs `prisma generate`, which writes the client to `src/generated/prisma`.
That directory is git-ignored, so generation is not optional — every fresh checkout and every
CI/CD build needs it.

### 2. Environment

```bash
cp .env.example .env
```

Then fill in the values described in [Environment variables](#environment-variables).

### 3. Database

Any PostgreSQL 14+ instance works. For a zero-setup local one:

```bash
npx prisma dev --name softwarepros    # starts Postgres, prints a DATABASE_URL
```

Paste the printed URL into `DATABASE_URL`, then apply the schema:

```bash
npx prisma migrate dev
```

### 4. Run

```bash
npm run dev        # http://localhost:3000
```

---

## Environment variables

Every variable in `.env.example`. `.env` is git-ignored; `.env.example` is the only env file
that is committed, and it must never contain a real value.

| Variable | Required | Purpose | Example / Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string for Prisma. Read by `src/lib/prisma.ts` and by `prisma.config.ts` for migrations. | `postgresql://user:password@host:5432/softwarepros?schema=public` — the app throws on startup if it is missing. |
| `ANTHROPIC_API_KEY` | **Yes** in any environment where the AI Discovery Center is used | Credentials for `@anthropic-ai/sdk`. Without it, chat, live analysis, and summary generation all fail. | `sk-ant-…`. The SDK also accepts `ANTHROPIC_AUTH_TOKEN`; `hasAnthropicCredentials()` in `src/lib/ai/client.ts` treats either as configured. |
| `ADMIN_USER` | No | HTTP Basic username for `/admin/*` and `/api/admin/*`. | Defaults to `admin` when unset. |
| `ADMIN_PASSWORD` | **Yes** if you want an admin area at all | HTTP Basic password, compared timing-safely in `src/lib/auth.ts`. | A long random string. **See the fail-closed note below.** |
| `NEXT_PUBLIC_SITE_URL` | **Yes** in production | The site's canonical public origin, with no trailing slash. | `https://softwarepros.org`. Falls back to `https://softwarepros.org` if unset — which silently produces wrong URLs on any other host. **See the note below.** |
| `ELEVENLABS_API_KEY` | No | ElevenLabs text-to-speech, so the AI Architect speaks its replies. Read by `src/lib/ai/voice.ts` and called server-side from `/api/speech`. | Leave empty and the feature stays inert — replies arrive as text, the orb still reacts to the microphone, nothing throws. **See the note below.** |
| `ELEVENLABS_VOICE_ID` | No | Which voice to speak in. | Defaults to `21m00Tcm4TlvDq8ikWAM` (Rachel, a stock voice) so voice works the moment a key is present. |
| `ELEVENLABS_MODEL_ID` | No | Which synthesis model to use. | Defaults to `eleven_flash_v2_5` — the low-latency model, chosen because time-to-first-sound matters more than fidelity in conversation. |

### `ADMIN_PASSWORD` fails closed

If `ADMIN_PASSWORD` is unset or empty, **every** `/admin` and `/api/admin` request is rejected
with a `401` — there is no default credential to fall back to. That is deliberate: `/admin`
exposes captured lead PII (names, emails, phone numbers, free-text project details), so a
deployment that forgot to configure it must be locked rather than open.

The check runs twice — once in `src/proxy.ts` (matched on `/admin/:path*` and
`/api/admin/:path*`) and again inside each admin route handler — so a proxy misconfiguration
cannot become an authorisation bypass.

### `NEXT_PUBLIC_SITE_URL` must be the real public origin

`src/lib/site.ts` exports `SITE_URL` from this variable, and it is the single source of truth
for every absolute URL the site emits:

- `metadataBase` and every per-page `canonical`
- `sitemap.xml` — every `<loc>`
- `robots.txt` — the `Sitemap:` and `Host:` directives
- `llms.txt` and `ai.txt` — every link and both entity `@id`s
- `.well-known/security.txt` — `Canonical:` and `Policy:`
- The schema.org `@graph` — `@id` values for the Organization, WebSite, and every WebPage node

Getting this wrong does not throw. It quietly publishes a sitemap and an entity graph
pointing at the wrong host, which is significantly worse than a crash. Set it to the exact
origin you will serve on, including the scheme and no trailing slash.

Because it is a `NEXT_PUBLIC_*` variable it is **inlined at build time** — changing it in a
running container has no effect until the app is rebuilt.

### Voice output is optional and degrades silently

`ELEVENLABS_API_KEY` is the only switch. Leave it empty and the whole feature stays inert:
the architect still replies in text, the orb still animates from the microphone, and nothing
throws. `hasElevenLabsCredentials()` in `src/lib/ai/voice.ts` is the single check.

The key never reaches the browser. The client posts text to `/api/speech`, which calls
ElevenLabs server-side and streams the audio back. That is deliberate — a direct browser call
would require widening the `connect-src 'self'` CSP in `next.config.ts`, which is a bad trade
for saving one hop.

Billing is per character, so `/api/speech` caps request length at 2500 characters — a spend
control as much as a validation rule — and rate limits to 20 requests per minute per client.

---

## Deploying to Coolify

Two supported paths. **Docker Compose** is the recommended one, because it is the only one
where migrations cannot be forgotten: `coolify-compose.yaml` runs them in a `migrate` service
and the app is not started until that service exits `0`. **Nixpacks** still works if the app
is already deployed that way — it just needs the migration step wired in by hand (see
[Migrations](#4-migrations)).

### 1. Create the application

1. In Coolify: **Projects → New Resource → Application → Private Repository (with GitHub App
   or deploy key)**. Point it at this repo and pick the branch you deploy from.
2. **Build pack:** `Docker Compose`
3. **Docker Compose location:** `/coolify-compose.yaml`
4. **Connect To Predefined Network:** on, if `DATABASE_URL` points at a Postgres resource
   managed by Coolify. Without it the stack gets its own network and cannot resolve that
   hostname — the app then fails with `ref: db_unreachable`.
5. **Domain:** set your public hostname on the `app` service (port `3000`). Coolify provisions
   and renews TLS via Let's Encrypt — no cert handling needed in the app.

<details>
<summary>Nixpacks instead</summary>

**Build pack:** `Nixpacks` · **Install:** `npm ci` · **Build:** `npm run build` ·
**Start:** `npm start` · **Port:** `3000`. Then set the pre-deployment command described under
[Migrations](#4-migrations) — nothing else applies the schema on this path.

</details>

### 2. Attach a database

Either add a **PostgreSQL** resource inside the same Coolify project (then use its internal
connection string, which avoids exposing the database publicly), or point `DATABASE_URL` at an
external managed Postgres. PostgreSQL 14+.

### 3. Set environment variables

Add every variable from the [table above](#environment-variables) in Coolify's
**Environment Variables** UI.

| Variable | Needed at build | Needed at runtime |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Yes — inlined into the bundle** | Yes |
| `DATABASE_URL` | Yes (migrations run on deploy; also read during any static generation) | **Yes** |
| `ANTHROPIC_API_KEY` | No | **Yes** |
| `ADMIN_USER` | No | Yes |
| `ADMIN_PASSWORD` | No | **Yes** |
| `ELEVENLABS_API_KEY` | No | Only if you want voice output |
| `ELEVENLABS_VOICE_ID` | No | Optional |
| `ELEVENLABS_MODEL_ID` | No | Optional |

> Coolify exposes a "Build Variable" toggle per variable. `NEXT_PUBLIC_SITE_URL` **must** be
> available at build time — a `NEXT_PUBLIC_*` value set only at runtime will not appear in the
> client bundle, and the deploy will ship canonical URLs pointing at the fallback origin.

### 4. Migrations

`postinstall` already runs `prisma generate`, so the Prisma client is built for you — you do
not need a separate generate step.

Applying the schema is `scripts/db-migrate.sh`. It waits for the database to accept
connections (12 attempts, 5s apart by default — override with `MIGRATE_MAX_ATTEMPTS` and
`MIGRATE_RETRY_SECONDS`), runs `prisma migrate deploy`, and exits non-zero if it cannot
finish. It never prints `DATABASE_URL`, because deploy logs are not a secret store.

- **Docker Compose:** already wired. The `migrate` service runs the script, and `app` declares
  `depends_on: { migrate: { condition: service_completed_successfully } }`. A failed migration
  therefore keeps the *old* container serving traffic rather than promoting a broken one. The
  `migrate` container sitting in `Exited (0)` after a deploy is the healthy state.
- **Nixpacks:** set `./scripts/db-migrate.sh` as the **pre-deployment command**.

Skipping this is what produces "The AI Architect is offline" with `ref: db_not_migrated`: the
app is running fine, the database just has no tables for it. `ref: db_unreachable` is the
neighbouring failure — wrong `DATABASE_URL`, or the predefined network is off.

`migrate deploy`, **never** `migrate dev` — `migrate dev` is interactive, can prompt to reset
the database, and will happily generate new migration files against production.

### 5. Post-deploy checklist

Each of these should return `200` with the correct content type and your real domain baked in:

```bash
SITE=https://your-domain.example

for path in /robots.txt /sitemap.xml /llms.txt /ai.txt /.well-known/security.txt /icon /opengraph-image; do
  printf '%-32s %s\n' "$path" "$(curl -s -o /dev/null -w '%{http_code}' "$SITE$path")"
done
```

Then verify by eye:

- `robots.txt` — `Sitemap:` and `Host:` point at your domain, not `softwarepros.org`
- `sitemap.xml` — every `<loc>` resolves (see the note about `/about`, `/careers`, `/legal/accessibility`, `/legal/security`)
- `/.well-known/security.txt` — `Expires` is roughly a year out and `Canonical` matches your domain
- `/admin/leads` — prompts for Basic auth, and returns `401` if you cancel
- Response headers include `Content-Security-Policy`, `Strict-Transport-Security`, and `X-Frame-Options: DENY`
- Start a discovery session and send one message — this is the only end-to-end check that `ANTHROPIC_API_KEY` and `DATABASE_URL` are both live

---

## Project structure

```text
softwarepros-app/
├── prisma/
│   ├── schema.prisma            # DiscoverySession, Message, Attachment,
│   │                            # ProjectSummary, Lead, NewsletterSubscriber
│   └── migrations/              # applied with `prisma migrate deploy` in prod
├── prisma.config.ts             # Prisma 7 config — schema path + datasource URL
├── scripts/db-migrate.sh        # waits for Postgres, applies migrations, fails loudly
├── Dockerfile                   # one image, two commands: migrate and `next start`
├── coolify-compose.yaml         # migrate runs to completion before app starts
├── next.config.ts               # CSP, security headers, .well-known rewrites, image hosts
├── src/
│   ├── proxy.ts                 # Basic-auth gate, matched on /admin + /api/admin only
│   ├── app/
│   │   ├── layout.tsx           # metadataBase, fonts, providers, cookie notice
│   │   ├── globals.css          # Tailwind v4 @theme tokens + shared surface classes
│   │   ├── api/                 # sessions, chat, upload, summary, leads,
│   │   │                        # newsletter, admin/leads/[id]
│   │   ├── discovery/[id]/      # AI Discovery Center
│   │   ├── summary/[id]/        # generated project summary
│   │   ├── admin/leads/         # Basic-auth lead inbox
│   │   ├── legal/               # privacy, terms, cookies
│   │   ├── robots.ts · sitemap.ts · manifest.ts
│   │   ├── llms.txt/ · ai.txt/ · security.txt/    # route handlers, text/plain
│   │   └── icon.tsx · apple-icon.tsx · opengraph-image.tsx · twitter-image.tsx
│   ├── components/
│   │   ├── discovery/           # workspace, message list, composer, analysis panel
│   │   ├── security/            # SOC dashboard, threat ticker, TOC
│   │   ├── seo/                 # FaqSection, AnswerBlock (AEO answer surfaces)
│   │   ├── home/ · summary/ · contact/ · admin/ · legal/
│   │   ├── Icon.tsx             # the explicit Font Awesome map
│   │   └── JsonLd.tsx           # the one controlled dangerouslySetInnerHTML
│   ├── lib/
│   │   ├── ai/                  # client.ts, prompts.ts, schemas.ts, analysis.ts
│   │   ├── routes.ts            # PUBLIC_ROUTES — sitemap + footer + llms + ai.txt
│   │   ├── schema.ts            # schema.org @graph assembly
│   │   ├── org.ts               # the single description of who the company is
│   │   ├── faq.ts               # AEO answer content
│   │   ├── content.ts           # 20 services, 15 industries, copy constants
│   │   ├── site.ts              # SITE_URL, derived from NEXT_PUBLIC_SITE_URL
│   │   ├── prisma.ts · auth.ts · rate-limit.ts · ids.ts
│   │   └── session-owner.ts · cookie-names.ts · security-content.ts
│   └── generated/prisma/        # git-ignored; written by `prisma generate`
└── .github/                     # PR and issue templates
```

---

## How the AI works

**Chat** (`src/app/api/chat/route.ts`) streams from `client.messages.stream()` and relays
newline-delimited JSON events (`text` / `analysis` / `done` / `error`), so the client needs no
SSE library — just a reader and a line split. Adaptive thinking is left on — the Opus 5
default — at `effort: "low"`, which keeps a chat turn responsive without the failure modes
that come from disabling thinking outright.

**Structured extraction** (`src/lib/ai/analysis.ts`) uses `client.messages.parse()` with
`zodOutputFormat`, so the live-analysis panel and the project summary are schema-validated
rather than parsed out of prose. Schemas live in `src/lib/ai/schemas.ts`; component icons and
priorities are enums, so the UI can never receive a value it cannot render.

**Attachments** are handed to Claude natively — PDFs as `document` blocks, images as `image`
blocks — with no client-side text extraction. Text-ish formats (plain text, markdown, CSV,
JSON, XML, HTML) are stored as extracted text instead.

**Analysis extraction is non-fatal by design.** If a structured pass fails, the chat turn
still completes and the analysis panel keeps its previous values. A degraded sidebar is a far
better outcome than a dropped conversation.

### Guardrails

The system prompt (`src/lib/ai/prompts.ts`) forbids quoting prices, fixed dates, and
contractual commitments, and every generated artefact is labelled as an estimate requiring
Senior Software Architect review. The summary page carries that disclosure above the fold.
Keep it there — it is the difference between a helpful scoping tool and an implied quote.

The same rule governs the static content: `src/lib/faq.ts` and `src/lib/org.ts` may only
contain verifiable facts, because everything in them lands in structured data where an
invented claim is not a typo but a policy violation.

---

## Security notes

- **Input validation.** Every request body is validated with Zod. No handler trusts client input.
- **One controlled `dangerouslySetInnerHTML`.** `src/components/JsonLd.tsx` uses it to emit the
  schema.org `@graph` — and it is unavoidable there, because React escapes text nodes and that
  escaping corrupts the JSON a crawler parses. What makes it safe is the serializer: `JSON.stringify`
  output has every `<`, `>`, and `&` rewritten to its unicode-escape form (U+003C, U+003E,
  U+0026), along with U+2028 and U+2029 — legal in JSON, but they terminate a JavaScript string
  literal and break any consumer that evaluates the block rather than parsing it. Because a raw `<`
  cannot survive into the document, no value in the graph can close the `<script>` element early
  and start an injection, regardless of where that value came from. Everything fed to it today is
  build-time constant, but the escaping is not conditional on that staying true. **Nothing else in
  the codebase uses `dangerouslySetInnerHTML`** — all model- and user-generated content renders as
  React text nodes, so stored XSS has no vector.
- **Capability URLs.** Session and summary ids are 14-char random strings from
  `crypto.getRandomValues` (`src/lib/ids.ts`). They are the only thing protecting a visitor's
  conversation — treat them as secrets. `robots.ts` disallows `/discovery`, `/summary/`, `/admin`,
  and `/api/` for every agent, and those routes are `private, no-store` via `next.config.ts` so no
  intermediary cache retains them.
- **Session ownership.** An opaque `httpOnly` owner token (`sp_owner`, 30-day max age) scopes the
  recent-sessions list, so one visitor can never enumerate another's conversations.
- **Uploads** are capped at 10 MB and restricted to images (JPEG/PNG/GIF/WebP), PDFs, and a fixed
  set of text formats.
- **Admin auth** is HTTP Basic with a SHA-256-then-`timingSafeEqual` comparison (hashing first
  keeps both buffers 32 bytes, so a length mismatch cannot leak the secret's length through a
  throw). Both halves of the credential are always compared — no short-circuit reveals which was
  wrong. It is enforced in `src/proxy.ts` **and** re-checked inside each admin route handler, and
  it fails closed when `ADMIN_PASSWORD` is unset.
- **Rate limiting.** `src/lib/rate-limit.ts` applies in-memory fixed windows per client — chat and
  upload at 20/min, leads at 10/min — bounded to 10,000 keys. It is a speed bump against casual
  abuse and runaway model spend, not an access control: `x-forwarded-for` is spoofable unless a
  trusted proxy sets it. **It does not survive restarts and does not coordinate across instances —
  put a shared store behind the same interface before scaling past one replica.**
- **Honeypot.** Lead forms carry a hidden field; hits are accepted and dropped silently.
- **Response headers** (`next.config.ts`, applied to every path): a strict CSP
  (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`;
  `unsafe-eval` only in development for React Refresh), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), geolocation=(), microphone=(self)`, and a two-year HSTS with
  `includeSubDomains; preload`.
- **Secrets** never enter the repo. `.env*` is git-ignored except `.env.example`, which holds
  placeholders only.

---

## Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `next dev` | Dev server on :3000 |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start` | Serve the production build |
| `npm run lint` | `eslint` | ESLint 9 flat config |
| `npm run typecheck` | `tsc --noEmit` | Strict type check |
| `npm run typegen` | `next typegen` | Regenerate Next's route types |
| `npm run db:migrate` | `prisma migrate dev` | Create and apply a migration (local only) |
| `npm run db:generate` | `prisma generate` | Regenerate the Prisma client |
| `npm run db:studio` | `prisma studio` | Browse the database |
| `postinstall` | `prisma generate` | Runs automatically after every install |

Production migrations go through `scripts/db-migrate.sh` (`prisma migrate deploy` with a
wait-for-database retry), run by the `migrate` service in `coolify-compose.yaml`. There is no
npm script wrapping it, so nobody runs `db:migrate` against production by muscle memory.

---

## Contributing and conventions

**Before every commit, both of these must be clean:**

```bash
npm run typecheck
npm run lint
```

TypeScript is strict. Do not reach for `any` or `@ts-expect-error` to get a build through — if
the types are fighting you, the model is usually wrong.

**Styling.** Tailwind utility-first. Design tokens (colours, fonts, keyframes) live in `@theme`
in `src/app/globals.css`. Shared surface treatments (`.glass`, `.service-card`, `.soc-grid`,
`.msg-ai`, …) are plain CSS classes there rather than a repeated utility string in twelve
files. The palette is dark-only by intent — there is no light theme to swap to.

**Icons.** Add them to the explicit map in `src/components/Icon.tsx`. That map is what keeps
the Font Awesome bundle to only what the site actually uses. Where the comps referenced Font
Awesome Pro icons (`fa-radar`, `fa-siren`), the closest Free equivalent is substituted in the
map.

**Content.** Copy constants — the 20 services, the 15 industries, category labels — live in
`src/lib/content.ts`. Organisation identity lives in `src/lib/org.ts` and only accepts
verifiable facts, because it feeds the JSON-LD entity graph, `llms.txt`, and `ai.txt`. FAQ
answers live in `src/lib/faq.ts` and must each stand alone when quoted out of context.

**New public routes must be added to `src/lib/routes.ts`.** That table drives the sitemap, the
site footer, `llms.txt`, and `ai.txt`. Before it existed the same list was maintained in four
places, which is exactly the drift that ends with a page in the footer but not the sitemap.
Adding the entry and the `page.tsx` in the same change keeps the two honest.

**Pages should stay Server Components.** Push `"use client"` down to the leaf that actually
needs interactivity — see how `VoiceModalProvider` wraps server children as a slot in
`layout.tsx`.

---

## License

**Proprietary — all rights reserved.**

Copyright © SoftwarePros.org. This source code is confidential and is not open source. No
licence, express or implied, is granted to use, copy, modify, distribute, or create derivative
works from it. Access to this repository does not confer any right to reuse its contents.
