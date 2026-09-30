# TaskMaster

A premium three-column productivity workspace — dark charcoal UI, neon red accents — with a
marketing landing page, real accounts and per-user task storage.

**Stack:** React 19 · TypeScript · Tailwind CSS v4 · Vite · Lucide icons · Express 5 · SQLite
(`node:sqlite`) · JWT sessions

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
- **Real accounts** — sign-up/sign-in backed by the API, scrypt-hashed passwords, 7-day JWT sessions
- **Per-user workspaces** — each account's tasks, lists and chat history are stored server-side and cached in the browser
- Responsive: 3-column desktop → narrowed tablet → mobile drawers (sidebar + AI panel)

## Getting started

```bash
npm install

npm run dev:api   # API  → http://localhost:4000  (creates server/data.sqlite on first run)
npm run dev       # Vite → http://localhost:5173  (proxies /api → :4000)
```

Two terminals, or run `npm run dev:api` in the background and `npm run dev` in the foreground.
Open http://localhost:5173 → **Get started** → create an account → you land straight in the workspace.

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

## API

All responses are `{ ok: true, … }` or `{ ok: false, error: { code, message, fields? } }`.
Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Route                | Auth | Purpose                                            |
| ------ | -------------------- | ---- | -------------------------------------------------- |
| GET    | `/api/health`        | —    | Liveness check                                      |
| POST   | `/api/auth/register` | —    | `{ name, email, password }` → `{ token, user }`     |
| POST   | `/api/auth/login`    | —    | `{ email, password }` → `{ token, user }`           |
| GET    | `/api/auth/me`       | ✔    | Current user from the token                         |
| POST   | `/api/auth/logout`   | ✔    | Stateless acknowledgement (client drops the token)  |
| GET    | `/api/workspace`     | ✔    | `{ state, updatedAt }` for the account              |
| PUT    | `/api/workspace`     | ✔    | `{ state }` — replaces the account's workspace blob |

Error codes: `validation_error` (400, with `fields`), `invalid_credentials` (401),
`email_taken` (409), `not_authenticated` / `session_expired` (401), `too_many_attempts` (429).

### Security notes

- Passwords are hashed with **scrypt** (per-user random salt, N=16384) — no native dependencies.
- Sessions are stateless **HS256 JWTs**; "keep me signed in" stores the token in `localStorage`,
  otherwise it lives in `sessionStorage` and dies with the tab.
- Login attempts are throttled per IP + email (10 failures per 15 minutes).
- Every mutating payload is validated server-side, and workspace blobs are size-capped.

## Prototype boundaries

Honest about what is and is not wired up:

- The AI assistant is rule/template-based — no model is called.
- Social sign-in buttons are disabled (they need OAuth credentials).
- Password reset, email verification and billing are not implemented.
- Pricing on the landing page is illustrative; upgrading in-app flips a demo flag.

## Structure

```
server/                  Express API (ESM)
├── index.js             # routes, CORS, static dist, error handling
├── db.js                # node:sqlite schema + queries
├── auth.js              # scrypt hashing, JWT, requireAuth, throttling
└── validation.js        # request validation rules

src/
├── App.tsx              # providers + route map
├── api.ts               # typed API client (bearer tokens, ApiError)
├── auth.tsx             # AuthProvider / useAuth, session persistence
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

scripts/                 # headless-Chrome checks (route-check, auth-check)
```
