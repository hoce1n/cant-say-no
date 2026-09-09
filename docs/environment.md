# Environment variables

None of these variables are required to run the anonymous card product locally. Cards are encoded into share URLs and recent items stay in `localStorage`.

Copy `.env.example` to `.env` if you need any of them. `.env` is gitignored. Never commit secrets.

Vite loads `.env` for the process. `VITE_`-prefixed keys are exposed to the browser. `npm run dev`, `npm run build`, and `npm run preview` also merge `VITE_*` string keys from `.grok/app-env.json` via `scripts/with-app-env.mjs`. A real process environment value always wins over that file.

## Product and runtime

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `XAI_API_KEY` | No | `src/lib/cards/inspire.ts` | Server-only. Enables the studio **Inspire** action (xAI `grok-4.5`). If unset, the handler returns a friendly error and the UI shows a toast. |
| `DATABASE_URL` | No | `src/lib/db.ts`, `scripts/migrate.mjs`, `src/lib/auth/server.ts`, `src/lib/auth/verify.server.ts` | Postgres/Neon URL. Unset or whitespace uses in-memory PGLite. Empty string is treated as unset. The card product does not query the database. With a URL and auth still off, `requireUserId()` fails closed. |
| `VITE_AUTH_ENABLED` | No | `src/lib/auth/client.ts`, `src/lib/auth/server.ts`, `src/lib/auth/gate-identity.server.ts`, `.grok/app-env.json` | Client and server. Auth is enabled unless this is exactly `"false"`. Workspace default is `"false"`. |
| `NODE_ENV` | No | `src/lib/app-data/client.server.ts` | Standard Node flag. In `production`, the app-data client ignores `GROK_CONNECTOR_ACCESS_TOKEN` from the environment. |

## Better Auth (unused while auth is off)

Used by `src/lib/auth/server.ts`. The Grok App Builder deployer injects these on platform publishes. Independent local runs do not need them.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `BETTER_AUTH_URL` | No | `src/lib/auth/server.ts` | Public origin for this app's Better Auth instance. Unset in sandbox preview: origin is derived per request. |
| `BETTER_AUTH_SECRET` | No | `src/lib/auth/server.ts` | Session signing secret. Unset in preview: a random per-process secret is generated. |
| `GROK_AUTH_ISSUER` | No | `src/lib/auth/server.ts` | Auth broker issuer. Defaults to `https://auth.grok.me`. |
| `GROK_AUTH_CLIENT_ID` | No | `src/lib/auth/server.ts` | OAuth client id for the broker. Falls back to the baked preview client. |
| `GROK_AUTH_CLIENT_SECRET` | No | `src/lib/auth/server.ts` | OAuth client secret. Falls back to the baked preview client. |

## Grok platform (preview, identity gate, connectors)

These exist because the repo still includes Grok App Builder runtime. The card UI does not call them.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `GROK_PROJECT_ID` | No | `src/lib/env.server.ts`, `src/lib/auth/gate-identity.server.ts`, `src/lib/app-data/client.server.ts` | Present on platform deploys. Absence means "workspace preview" (`isWorkspacePreview()`). Also used as the gate token audience `app:<id>`. |
| `GROK_GATE_ORIGIN` | No | `src/lib/auth/gate-identity.server.ts` | Explicit issuer/JWKS origin for the Grok identity gate. Preview default is `http://127.0.0.1:6014` when this is unset and there is no project id. |
| `GROK_CONNECTORS_URL` | No | `src/lib/app-data/client.server.ts` | Override for the viewer connectors base URL. Otherwise inferred from the public host. |
| `GROK_CONNECTOR_ACCESS_TOKEN` | No | `src/lib/app-data/client.server.ts` | Preview-only connector token. Ignored when `NODE_ENV=production`. Prefer the request header in production. |
| `VITE_PUBLIC_HOSTNAME` | No | `scripts/grok-pwa-plugin.mjs` | Hostname injected into Grok PWA/OG HTML. Empty string if unset. |
| `VITE_STUN_URLS` | No | `src/lib/multiplayer/p2p.ts` | Comma-separated STUN URLs. Defaults to Google and Cloudflare STUN if unset. The card product does not use the P2P helper. |

## QA and preview scripts

Not needed to run the app. Used by App Builder smoke/preview helpers.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `BROWSER_SMOKE_TIMEOUT_MS` | No | `scripts/browser-smoke.mjs` | Default `45000`. |
| `PREVIEW_THUMBNAIL_TIMEOUT_MS` | No | `scripts/preview-thumbnail.mjs` | Default `45000`. |
| `PREVIEW_READY_TIMEOUT_MS` | No | `scripts/preview.mjs` | Default `60000`. |
| `BROWSER_ALLOW_EXTERNAL_HOST` | No | `scripts/browser-guard.mjs` | Set to `1` to allow non-loopback hosts in browser QA. Otherwise only loopback is allowed. |

## Workspace file vs `.env`

`.grok/app-env.json` currently contains:

```json
{
  "VITE_AUTH_ENABLED": "false",
  "deploy": {
    "database": false
  }
}
```

Only `VITE_`-prefixed string keys from that file are merged into the process env. The `deploy` object is not exported to the client.

On Grok App Builder deploys, the platform sets `VITE_AUTH_ENABLED` itself; that process env value overrides the file.
