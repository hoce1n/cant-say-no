# Can't Say No — Project Roadmap

**Target outcome:** turn the current polished card prototype into a maintainable full-stack application that demonstrates useful production architecture without retaining unused template or platform code.

**Repository baseline:** `origin/main` at `6b99788`.

## 1. Product and architecture goal

The project should become a small but complete full-stack product. Users should be able to create cards, save them to an account, share public cards, return later to edit their own cards, and manage their account. The anonymous share-link experience should remain available, but it should no longer be the only persistence model.

The architecture should stay intentionally understandable. It should use one application repository and one deployable service rather than introducing microservices, queues, or multiple databases before the product needs them.

> **Architecture rule:** keep a technology only when it teaches a useful boundary or directly supports a product requirement. Remove code that exists only because the project was exported from a platform and is not used by the independent product.

## 2. Target architecture

```text
Browser
  |
  v
TanStack Start routes and server functions
  |
  +--> Authentication service: Better Auth
  |
  +--> Application services
  |      +--> Card service
  |      +--> User/profile service
  |      +--> AI draft service
  |      +--> Share/analytics service
  |
  +--> Repository layer
  |      +--> Card repository
  |      +--> User preferences repository
  |      +--> Event repository
  |
  +--> Database adapter: PostgreSQL in production, PGlite in local preview
  |
  v
Neon/PostgreSQL
```

The browser must not query the database directly. Routes and server functions must validate input, obtain the authenticated user from the server session, and call application services. Application services must call repositories rather than embedding SQL in UI code. Repositories must use parameterized SQL through the existing `getSql()` abstraction.

## 3. What stays, what changes, and what goes

| Area | Decision | Reason |
|---|---|---|
| React, TanStack Start, TanStack Router | Keep | Core application and routing architecture |
| Tailwind, Radix UI, Zod | Keep | UI system and runtime validation |
| `src/lib/db.ts` | Keep and use | Already provides Neon/PGlite parity and server-only SQL access |
| Migration runner | Keep | Teaches repeatable schema evolution |
| Better Auth | Keep and activate | Required for account ownership and private card management |
| `migrations/auth/0001_auth.sql` | Keep initially | Required Better Auth schema source |
| URL card encoding | Keep as an anonymous fallback | Preserves current low-friction sharing and backwards compatibility |
| `localStorage` recent cards | Keep temporarily, then narrow | Useful offline UX; it must not be treated as the source of truth after login |
| xAI integration | Keep behind a provider interface | AI is a product feature, but xAI must not define the whole application architecture |
| Grok PWA middleware and preview bridge | Isolate, then remove from independent runtime | Platform-specific rather than product-specific |
| Grok connector/app-data modules | Remove unless a real product feature uses them | Current card product does not need external user-data connectors |
| Multiplayer/P2P helpers | Remove if unused | No current multiplayer requirement |
| `AGENTS.md` and `.grok/` | Move to platform documentation or remove from the product branch | They describe the generator environment, not the independent application |
| App Builder screenshots and smoke tooling | Keep only in a separate platform/QA history if useful | Avoid mixing generator QA with product code |
| Microservices, Redis, background workers | Do not add yet | No current scale or workflow requirement |

## 4. Delivery rules

Each phase must produce a working application. Do not start the next phase while the current phase has failing type checks, broken routes, or undocumented environment requirements.

Every feature must leave behind four things:

1. **Application code** that implements the behavior.
2. **Tests** for the boundary and its failure cases.
3. **Documentation** explaining the architectural decision.
4. **A small commit** with one clear purpose.

Use pull requests for phase-level changes. Avoid large rewrites that combine migration, authentication, UI redesign, and platform cleanup in one commit.

## 5. Phase roadmap

### Phase 0 — Establish the baseline

**Purpose:** make the current project reproducible before changing behavior.

Complete the following work:

- Merge and verify the Vercel deployment fix.
- Keep `package-lock.json` as the only active package-manager lockfile.
- Confirm CI runs install, typecheck, lint, test, and build.
- Keep `README.md`, `environment.md`, and `.env.example` accurate.
- Add a short architecture section to the README linking to this roadmap.
- Record the current known failures in an issue instead of hiding them.
- Make the package name and public metadata consistently use the product name.

**Exit criteria:** a clean install, `npm run typecheck`, `npm run lint`, and `npm run build` pass locally and in CI. The application can be opened on Vercel with no runtime error.

**Architecture learned:** reproducible builds, CI gates, environment separation, and deployment configuration.

### Phase 1 — Define domain contracts

**Purpose:** stop UI components from being the implicit business layer.

Create a domain module with:

- `CardInput` and `Card` schemas using Zod;
- normalization and length-limit rules;
- a stable card status model;
- an explicit `UserId` and `CardId` type policy;
- a domain error model for validation, authorization, and not-found cases.

Move card construction rules from components into domain functions. Keep the existing codec as a compatibility layer for anonymous share URLs.

Add tests for valid cards, invalid cards, maximum lengths, malformed share payloads, and backward-compatible decoding.

**Exit criteria:** the studio and routes use the shared domain schema. No route trusts raw client input. Existing share links still render.

**Architecture learned:** domain modeling, runtime validation, compatibility boundaries, and typed error handling.

### Phase 2 — Add the real card database

**Purpose:** replace browser-only persistence with durable server-side persistence.

Add `migrations/0002_cards.sql` with a table similar to:

```sql
create table cards (
  id text primary key,
  slug text not null unique,
  question text not null,
  yes_label text not null,
  no_label text not null,
  success_message text not null,
  theme text not null,
  difficulty text not null,
  owner_id text references "user" ("id") on delete set null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cards_owner_id_idx on cards (owner_id);
create index cards_public_created_at_idx on cards (is_public, created_at desc);
```

Implement:

- `src/server/cards/card-repository.ts`;
- `src/server/cards/card-service.ts`;
- server functions for create and read;
- public route `/cards/$slug`;
- ownership-aware update and delete functions, but do not expose destructive controls in the UI until auth is active;
- migration tests and repository tests.

Use generated opaque IDs or secure random IDs. Do not use the question text as an identifier. Keep the encoded URL route working and allow it to be converted into a database card later.

**Exit criteria:** a created card survives a server restart, is readable through a short URL, and is not lost when browser storage is cleared. Production migration runs only through the migration runner.

**Architecture learned:** relational schema design, migrations, repository pattern, service layer, indexes, and server-only data access.

### Phase 3 — Activate authentication

**Purpose:** make cards ownable without coupling product code to Grok identity.

Use Better Auth with an independent configuration:

- a stable `BETTER_AUTH_URL`;
- a strong `BETTER_AUTH_SECRET` in Vercel;
- a supported OAuth provider or email/password flow selected intentionally;
- server-side session verification;
- route-level sign-in and sign-out UI;
- protected account and dashboard routes.

The authenticated user ID must come from the verified server session. It must never come from a client-supplied `user_id` field.

Add an explicit auth policy:

| Operation | Anonymous visitor | Authenticated user |
|---|---|---|
| View public card | Allowed | Allowed |
| Create public card | Allowed, optionally rate-limited | Allowed and owned |
| Save card to account | Not allowed | Allowed |
| Edit own card | Not allowed | Allowed |
| Edit another user's card | Not allowed | Not allowed |
| Delete own card | Not allowed or require sign-in conversion | Allowed |
| Delete another user's card | Not allowed | Not allowed |

**Exit criteria:** sign-in, sign-out, session refresh, protected dashboard access, and ownership checks work in both local preview and Vercel. Auth tests cover missing sessions, expired sessions, and cross-user access.

**Architecture learned:** authentication versus authorization, session cookies, protected server functions, and multi-tenant data isolation.

### Phase 4 — Build the account and card dashboard

**Purpose:** make authentication valuable to the user.

Implement:

- `/dashboard` for the current user's cards;
- create-card flow that associates a card with the session user;
- edit and delete actions with confirmation;
- public/unlisted visibility control;
- migration of anonymous local cards into the account after sign-in;
- clear empty, loading, and error states.

The dashboard should use server-loaded data and mutations. Do not load the entire card collection into the browser and filter it there.

**Exit criteria:** a user can create, edit, publish/unpublish, and delete only their own cards. A second test user cannot access those cards through guessed IDs or slugs.

**Architecture learned:** protected CRUD, authorization policies, server rendering, mutation invalidation, and optimistic UI boundaries.

### Phase 5 — Decouple AI from Grok

**Purpose:** keep the “Inspire me” feature without making xAI a structural dependency.

Define a provider-neutral interface:

```ts
export interface CardDraftProvider {
  generate(input: CardDraftInput): Promise<CardDraft>;
}
```

Implement separate adapters for:

- xAI, using `XAI_API_KEY` and the current model;
- a deterministic local fallback for development and tests;
- a disabled provider that returns a safe user-facing error when no key exists.

The route must enforce input limits, rate limiting, timeout handling, response validation, and provider error mapping. The client must never receive or import provider secrets.

**Exit criteria:** tests can run without an API key. Replacing xAI requires changing configuration, not product components.

**Architecture learned:** ports and adapters, dependency inversion, external API boundaries, timeouts, and secret handling.

### Phase 6 — Remove unused Grok platform code

**Purpose:** make the independent application clean without destroying useful product behavior.

Proceed only after Phases 0–5 are working.

Move platform-specific code into a clearly named `platform/grok/` area temporarily. Classify every file as **required**, **optional adapter**, or **unused**. Remove unused modules in small pull requests.

The likely removal candidates are:

- connector/app-data code;
- multiplayer/P2P code;
- Grok preview bridge code;
- Grok auth gate and popup code;
- Grok PWA install middleware;
- Grok-specific public assets;
- builder smoke scripts that are not used by CI or deployment.

Retain ordinary PWA functionality through a product-owned manifest and metadata implementation. Retain Vercel/Nitro integration because it is part of the chosen deployment architecture, not because it is Grok-specific.

**Exit criteria:** no product route imports Grok connector, identity, or preview code. The application runs independently with documented environment variables. All remaining platform adapters are isolated and named as such.

**Architecture learned:** strangler migration, dependency graph cleanup, adapter isolation, and deletion with confidence.

### Phase 7 — Security and operational quality

**Purpose:** make public database-backed publishing safe enough for real use.

Add:

- rate limiting for card creation and AI generation;
- maximum request body sizes;
- slug collision handling;
- abuse reporting;
- basic moderation or an unlisted-by-default policy;
- security headers and CSRF review for mutations;
- structured server error logging;
- database health checks;
- privacy documentation;
- backup and restore procedure for the production database.

Do not store private card text in analytics events. Keep analytics events separate from card content.

**Exit criteria:** public mutation endpoints are rate-limited, authorization is tested, errors are observable, and the recovery procedure has been exercised in a non-production database.

**Architecture learned:** threat modeling, operational visibility, privacy boundaries, and recovery planning.

### Phase 8 — Product polish and learning artifacts

**Purpose:** finish the product and preserve the architecture as a learning resource.

Add:

- accessibility tests for keyboard and screen-reader interaction;
- reduced-motion support;
- mobile end-to-end tests;
- share preview metadata for database cards;
- a short architecture decision record for every major technology;
- diagrams for request flow, authentication, and persistence;
- a troubleshooting guide for local development and Vercel deployment.

Create an `docs/architecture/` directory with documents such as:

- `001-monolith-and-tanstack-start.md`;
- `002-database-and-migrations.md`;
- `003-authentication-and-authorization.md`;
- `004-repository-and-service-layers.md`;
- `005-ai-provider-adapter.md`;
- `006-platform-extraction.md`;

**Exit criteria:** a new developer can explain how a request moves from the browser to the database, how ownership is enforced, how migrations are deployed, and which code is product code versus platform code.

**Architecture learned:** technical communication, decision records, maintainability, and system-level reasoning.

## 6. Recommended implementation order for the next work

Do not work on all features simultaneously. Use this sequence:

| Order | Deliverable | Why it comes next |
|---:|---|---|
| 1 | Domain schemas and error model | Gives database and auth code one stable contract |
| 2 | `cards` migration and repository | Makes persistence real before adding account complexity |
| 3 | Card create/read server functions | Proves the server/data boundary |
| 4 | Better Auth activation | Adds ownership only after cards exist |
| 5 | Dashboard and protected CRUD | Makes auth useful and demonstrates authorization |
| 6 | AI provider adapter | Removes xAI coupling without blocking core product work |
| 7 | Grok/platform extraction | Safe after independent product behavior is tested |
| 8 | Rate limiting, moderation, observability | Required before serious public usage |

## 7. Definition of done for the target project

The project is complete when all of the following are true:

- Public cards can be created and shared without an account.
- Authenticated users can save, edit, publish, unpublish, and delete their own cards.
- All authenticated data access is scoped by the verified session user ID.
- Card data is stored in PostgreSQL in production and uses the existing PGlite-compatible development path.
- Schema changes are represented by migrations and can be applied repeatedly without corruption.
- AI generation is optional, validated, rate-limited, and provider-neutral.
- No secret is exposed to the browser.
- The product no longer depends on Grok preview, identity, connector, or branding code.
- CI validates installation, type safety, linting, tests, and production build.
- The repository contains architecture decision records and a current README.
- Unused dependencies, routes, scripts, assets, and environment variables have been removed.

## 8. What not to build yet

Avoid the following until the target architecture is working:

- a separate backend repository;
- microservices;
- GraphQL;
- a message queue;
- real-time collaboration;
- a mobile application;
- complex roles and organization management;
- a recommendation engine;
- a custom ORM replacement;
- a second database for analytics.

These features may be valid later, but they would increase surface area before the current boundaries are proven.

## References

[1]: https://tanstack.com/start/latest/docs/framework/react/overview "TanStack Start documentation"

[2]: https://www.better-auth.com/docs "Better Auth documentation"

[3]: https://www.postgresql.org/docs/current/ddl-constraints.html "PostgreSQL constraints documentation"

[4]: https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel "Deploy a TanStack Start app to Vercel"
