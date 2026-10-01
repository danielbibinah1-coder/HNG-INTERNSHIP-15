# TaskMaster

A premium three-column productivity workspace — dark charcoal UI, neon red accents — with a
marketing landing page, real accounts and per-user task storage.

**Stack:** React 19 · TypeScript · Tailwind CSS v4 · Vite · Lucide icons · Supabase Auth ·
Express 5 · SQLite (`node:sqlite`) · JWT sessions

## Authentication

Identity is handled by **Supabase Auth** (`@supabase/supabase-js`):

| Control                    | Supabase call                                     |
| -------------------------- | ------------------------------------------------- |
| Sign Up                    | `auth.signUp` (email + password, `full_name` metadata) |
| Sign In                    | `auth.signInWithPassword`                         |
| Continue with Google       | `auth.signInWithOAuth({ provider: 'google' })`    |
| Forgot Password            | `auth.resetPasswordForEmail`                      |
| Resend verification        | `auth.resend({ type: 'signup' })`                 |
| Sign Out                   | `auth.signOut`                                    |

- **Any email address works.** Sign-up is plain email + password: Gmail, Outlook, Yahoo, iCloud, a
  company domain, anything Supabase accepts. There is no provider allow-list, no Gmail-only rule and
  no Google account requirement anywhere in the codebase. The Google button is one optional extra
  way in, not a requirement.
- **Email verification.** Turn it on once in Supabase → Authentication → Sign In / Providers →
  Email → enable **Confirm email**. New accounts then get no session until they click the link, and
  BetterTasks shows a "Check your email" screen (`src/components/auth/CheckEmailScreen.tsx`) with
  the address they typed, a resend button and a route back to sign in. Signing in before verifying
  returns "Confirm your email address before signing in." With confirmation off, sign-up logs the new
  user straight in and the screen is skipped.
- The session is persisted by Supabase (`persistSession: true`), so a refresh keeps the visitor signed in.
- `src/lib/supabase.ts` owns the single shared client; `src/services/auth-service.ts` wraps every auth
  call and translates Supabase error codes into the messages the forms already know how to display;
  `useAuth()` in `src/auth.tsx` is the only hook UI code should use.
- No credentials are hardcoded. Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` the app still
  boots and renders every screen, but the auth controls stay disabled rather than faking a session.
- The API verifies the Supabase access token it receives (`auth.getUser`) before serving a workspace.

### Per-user data isolation

Everything a user creates stays theirs:

- **Server side** — `requireAuth` resolves the token to a user id (`server/auth.js`) and every
  workspace read/write is keyed by that id only (`getWorkspace(req.user.id)` / `saveWorkspace(req.user.id, …)`).
  There is no endpoint parameter that can name another user, and a Supabase identity is matched by its
  Supabase id and **never** by email, so a new account can never inherit an existing row's workspace.
- **Browser side** — the local cache lives under `taskmaster.state.v1.<supabase-user-id>`, and
  `src/store.tsx` swaps buckets whenever the signed-in identity changes, so signing in as someone else
  on the same browser shows that person's workspace, not the previous one's.
- `node scripts/isolation-check.mjs` proves this against a throwaway API + temp database: user B
  cannot read, alter or overwrite user A's tasks, and forged/absent/tampered tokens are rejected.

## Routes

| Route     | What it is                                                                     |
| --------- | ------------------------------------------------------------------------------ |
| `/`       | Marketing landing page (hero, features, workflow, pricing, FAQs, footer)         |
| `/signin` | Sign in — email + password, "keep me signed in", redirects to `/app`            |
| `/signup` | Create an account — name, email, password strength meter, terms                 |
| `/app`    | **The workspace** — protected; signed-out visitors are redirected to `/signin`   |

Hash routing is used so deep links survive static hosts such as GitHub Pages (`/HNG-INTERNSHIP-15/`).

## Layout

- **Left** — navigation, project lists, upgrade card, theme switcher, account menu
- **Center** — greeting, workspace info, **Today Task** dashboard
- **Right** — **AI Assist** chat panel with suggested prompts

## Features

- Full task management: create, inline edit (✎ / double-click), delete, complete, priority cycling (High/Medium/Low)
- Filters `All · High · Medium · Low · Completed`, live search, sort by priority, clear completed, reset demo data
- Projects/lists: create (`+`), rename, delete (with confirm), expand/collapse groups, scope the dashboard by selecting a list
- **Focus Mode** — dims secondary UI, promotes one active task, “Complete & next” loop, Esc to exit
- **AI Assist** — suggested prompt pills, typing indicator, mocked context-aware replies, conversation history
- Light/Dark theme switcher (device-local preference), collapsible sidebar, navigation views (Share, Analytics, Leaderboard, Invites, FAQs, Profile)
- **Real accounts** — Supabase Auth: email + password, Google OAuth, password reset, session persisted across refreshes
- **Per-user workspaces** — each account's tasks, lists and chat history are stored server-side and cached in the browser
- Responsive: 3-column desktop → narrowed tablet → mobile drawers (sidebar + AI panel)

## Getting started

```bash
npm install

# 1. point the app at your Supabase project (Supabase → Project Settings → API)
copy .env.example .env      # then fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

# 2. run both processes (two terminals)
npm run dev:api   # API  → http://localhost:4000  (creates server/data.sqlite on first run)
npm run dev       # Vite → http://localhost:5173  (proxies /api → :4000)
```

Open http://localhost:5173 → **Get started** → create an account → you land straight in the workspace.

In Supabase, also add `http://localhost:5173/#/` under **Authentication → URL Configuration → Redirect
URLs** so Google and password-reset callbacks land back in the app, and turn on the **Google** provider
under **Authentication → Providers** to enable "Continue with Google".

## Scripts

| Script                          | Purpose                                                 |
| ------------------------------- | ------------------------------------------------------- |
| `npm run dev`                   | Vite dev server with the `/api` proxy                   |
| `npm run dev:api`               | Express API with `--watch` reload                        |
| `npm run api`                   | Express API (no watcher)                                |
| `npm run build`                 | `tsc` type-check + production build → `dist/`            |
| `npm run preview`               | Serve the build on :4173                                 |
| `npm run typecheck`             | `tsc --noEmit`                                          |
| `node scripts/route-check.mjs`  | Headless-Chrome render check for every route             |
| `node scripts/auth-check.mjs`   | End-to-end sign-up → workspace → sign-out check          |
| `node scripts/supabase-check.mjs` | Supabase wiring check (and the real sign-in flow with credentials) |

Both scripts need the API **and** the dev server running; they drive real Chrome over the DevTools
protocol and fail on any uncaught page error.

## Configuration

Copy `.env.example` to `.env` (git-ignored). Everything has a working default for local development.

| Variable       | Default                | Notes                                                   |
| -------------- | ---------------------- | ------------------------------------------------------- |
| `PORT`         | `4000`                 | API port (change the Vite proxy target to match)         |
| `JWT_SECRET`   | generated              | Falls back to `server/.jwt-secret`; set it in production |
| `JWT_TTL`      | `7d`                   | Session lifetime                                        |
| `DATABASE_FILE`| `server/data.sqlite`   | SQLite location                                         |
| `CORS_ORIGIN`  | `http://localhost:5173`| Comma-separated allow-list; empty allows any origin      |
| `VITE_API_URL` | *(empty)*              | Set only when the API is on a different origin           |
| `VITE_SUPABASE_URL` | *(empty)*         | Supabase project URL (browser)                            |
| `VITE_SUPABASE_ANON_KEY` | *(empty)*    | Supabase anon / publishable key (browser)                 |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | *(empty)* | Same project, read by the API so it can verify tokens |

> Only the **anon / publishable** key belongs in the client — it is meant to be public and is kept safe by
> Row Level Security. Never put the `service_role` key in a `VITE_` variable: those are inlined into the
> built bundle.

## API

All responses are `{ ok: true, … }` or `{ ok: false, error: { code, message, fields? } }`.
Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Route                | Auth | Purpose                                            |
| ------ | -------------------- | ---- | -------------------------------------------------- |
| GET    | `/api/health`        | —    | Liveness check                                      |
| POST   | `/api/auth/register` | —    | Legacy local sign-up (Supabase handles the app)      |
| POST   | `/api/auth/login`    | —    | Legacy local sign-in (Supabase handles the app)      |
| GET    | `/api/auth/me`       | ✔    | Current user from the token                         |
| POST   | `/api/auth/logout`   | ✔    | Stateless acknowledgement (client drops the token)  |
| GET    | `/api/workspace`     | ✔    | `{ state, updatedAt }` for the account              |
| PUT    | `/api/workspace`     | ✔    | `{ state }` — replaces the account's workspace blob |

Error codes: `validation_error` (400, with `fields`), `invalid_credentials` (401),
`email_taken` (409), `not_authenticated` / `session_expired` (401), `too_many_attempts` (429).

The bearer token on authenticated routes may be either a **Supabase access token** (the path the app
uses — verified with Supabase, then the matching user row is created on first sight) or one of this
server's own JWTs.

### Security notes

- Passwords are hashed with **scrypt** (per-user random salt, N=16384) — no native dependencies.
- Sessions are stateless **HS256 JWTs**; "keep me signed in" stores the token in `localStorage`,
  otherwise it lives in `sessionStorage` and dies with the tab.
- Login attempts are throttled per IP + email (10 failures per 15 minutes).
- Every mutating payload is validated server-side, and workspace blobs are size-capped.

## Prototype boundaries

Honest about what is and is not wired up:

- Supabase needs your project's URL and anon key in `.env`; without them the auth controls stay
  disabled on purpose rather than faking a login.
- "Continue with Google" requires enabling the Google provider in Supabase; GitHub sign-in is not
  wired to a provider yet (the button stays disabled).
- Email confirmation, email-change and MFA flows follow whatever your Supabase project settings say —
  the app handles the "check your inbox" case when sign-up returns no session.
- The AI assistant is rule/template-based — no model is called.
- Billing is not implemented; the pricing page is illustrative and upgrading in-app flips a demo flag.

## Structure

```
server/                  Express API (ESM)
├── index.js             # routes, CORS, static dist, error handling
├── db.js                # node:sqlite schema + queries
├── auth.js              # scrypt hashing, JWT, requireAuth, throttling
└── validation.js        # request validation rules

src/
├── App.tsx              # providers + route map
├── api.ts               # typed API client (workspace endpoints)
├── auth.tsx             # useAuth() — the only auth hook UI code should use
├── lib/supabase.ts      # single shared Supabase client + config guard
├── services/
│   └── auth-service.ts  # Supabase Auth calls + friendly error mapping
├── theme.tsx            # ThemeProvider / useTheme (device-local)
├── store.tsx            # workspace state, actions, per-account sync, mocked AI
├── pages/               # LandingPage, SignInPage, SignUpPage, WorkspacePage
└── components/
    ├── ProtectedRoute.tsx   # session guard for /app
    ├── auth/                # AuthLayout, FormField, SocialButtons
    ├── landing/             # SiteNav, HeroSection, FeaturesSection, Workflow,
    │                        # SocialProof, Pricing, Faq, SiteFooter
    ├── Sidebar.tsx          # + sidebar/ sections
    ├── Dashboard.tsx        # + dashboard/ cards
    ├── AIAssistant.tsx      # + ai/ chat
    ├── SimpleView.tsx       # secondary navigation views
    └── UpgradeModal.tsx

scripts/                 # headless-Chrome checks
├── lib/cdp.mjs          #   shared DevTools-protocol helper
├── route-check.mjs      #   every route renders
├── auth-check.mjs       #   sign-up → workspace → sign-out
└── supabase-check.mjs   #   Supabase wiring + real sign-in
```
