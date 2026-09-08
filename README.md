# Can't Say No

A small web app for making shareable question cards with a runaway **No** button. Recipients can chase the button or press **Yes**. Cards are created in the browser and shared as an encoded URL — no account required.

This repository is an export from Grok App Builder. The product UI lives alongside platform glue (preview bridge, PWA/OG middleware, Better Auth, and Grok identity gates). Auth is **off** in the shipped app env; the card product does not use the database.

## What it does

- Home page with a default card and starter templates
- Studio at `/create` for custom question, labels, theme, difficulty, and an optional AI draft
- Template cards at `/cards/$cardId`
- Custom cards at `/c?p=...` (payload encoded in the query string)
- Recent cards and a sound preference stored in `localStorage`

There is no server-side card store. Sharing works by encoding the card into the URL (`src/lib/cards/codec.ts`). Recent cards stay on the device (`src/lib/cards/storage.ts`).

## Stack

| Layer | Current implementation |
| --- | --- |
| UI | React 19, TanStack Router / Start, Tailwind CSS v4, Radix UI, Zod |
| Bundler | Vite 8, Nitro (`vercel` preset on build/preview) |
| Language | TypeScript (strict) |
| Auth (opt-in, currently off) | Better Auth, Grok auth broker / identity gate |
| Database (infrastructure only) | Neon/Postgres when `DATABASE_URL` is set; otherwise in-memory PGLite |
| AI drafts (optional) | Server function calling xAI (`grok-4.5`) when `XAI_API_KEY` is set |
| Deploy target | Vercel (`vercel.json` framework: `tanstack-start`) |

Package name: `cant-say-no`. Node.js 22 is the intended runtime.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Landing page and default card |
| `/create` | Card studio |
| `/cards/$cardId` | Built-in template card |
| `/c?p=...` | Shared custom card |

## Requirements

- Node.js 22+
- npm, or Bun (CI installs with Bun)

## Local setup

```bash
# Install dependencies
npm install

# Start the dev server (0.0.0.0:8080)
npm run dev
```

`npm run dev` runs Vite through `scripts/with-app-env.mjs`, which loads `VITE_*` flags from `.grok/app-env.json` (currently `VITE_AUTH_ENABLED=false`). Do not start Vite directly if you want that flag to match build and preview.

Optional: copy `.env.example` to `.env` and set values you need. None are required for the anonymous card flow. See `docs/environment.md`.

The sandbox revive script `startup.sh` starts the same `npm run dev` command if port 8080 is not already healthy.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on `0.0.0.0:8080` |
| `npm run build` | Production Vite/Nitro build, then `db:migrate` |
| `npm run build:dev` | Vite build in development mode |
| `npm run preview` | Serve a Vite preview build |
| `npm run preview:restart` | Restart the loopback preview on `127.0.0.1:8081` |
| `npm run preview:stop` | Stop that preview process |
| `npm run db:migrate` | Apply `migrations/*.sql` to `DATABASE_URL` (no-op without a URL or root-level migration files) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm test` | Node test runner on script tests and selected `src/lib` tests |
| `npm run check:auth` | Compare live dev `VITE_AUTH_ENABLED` with the next build (needs a running dev server) |

## Testing

```bash
npm test
npm run typecheck
npm run lint
```

`npm test` runs:

- `scripts/**/*.test.mjs` (env wrapper, migrations, PWA plugin, preview, smoke verdict, and related helpers)
- TypeScript unit tests: app-data, auth gate identity, and sign-in gate

These are utility and platform tests. There are no product-level Playwright specs in `package.json`. Browser smoke helpers exist under `scripts/browser-smoke.mjs` for App Builder QA; they are not part of the default test script.

## Environment variables

Documented in `docs/environment.md`. A template is `.env.example`.

Shipped workspace flags (`.grok/app-env.json`):

- `VITE_AUTH_ENABLED`: `"false"`
- `deploy.database`: `false`

## Auth and database (current state)

- **Auth is off.** `.grok/app-env.json` sets `VITE_AUTH_ENABLED` to `"false"`. Sign-in UI is not part of the card product. `src/lib/auth/provider.tsx` currently mounts toasts only.
- **No application schema.** `migrations/` has no root-level `*.sql` files. The Better Auth schema lives in `migrations/auth/0001_auth.sql` and is not applied unless you opt into that path. `npm run build` still calls `db:migrate`; without `DATABASE_URL` or root-level migrations it exits cleanly.
- **`src/lib/db.ts` is unused by cards.** It is ready for Neon or PGLite if you add product tables later.

Email/password sign-in is a code flag in `src/lib/auth/email-password.ts` and is also off (`false`).

## Deployment

Configured for Vercel:

- `vercel.json` sets `"framework": "tanstack-start"`
- Production builds use Nitro with `preset: "vercel"` and `serverDir: "./server"` (PWA install middleware)
- `npm run build` is `vite build` plus the migrator

On Vercel, set any secrets in the project environment — do not commit a `.env` file. `DATABASE_URL` is only needed if you persist data in Postgres. `XAI_API_KEY` is only needed for the studio **Inspire** button.

Grok App Builder injects additional platform variables on its own deploys (`GROK_*`, `BETTER_AUTH_*`, `VITE_AUTH_ENABLED`). Independent deploys can omit those; the card product does not require them.

## Layout

```text
src/routes/           Pages (`/`, `/create`, `/c`, `/cards/$cardId`)
src/components/       Product UI and shared primitives
src/lib/cards/        Card types, templates, codec, localStorage, AI inspire
src/lib/auth/         Better Auth + Grok gate (disabled by default)
src/lib/db.ts         Postgres / PGLite helper
scripts/              Env wrapper, migrate, preview, QA, Grok PWA plugin
server/middleware/    Nitro PWA middleware
migrations/auth/      Opt-in Better Auth SQL
public/               Favicon, OG image, Grok PWA assets
```
