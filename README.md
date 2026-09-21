# e!DAL-web

A [SvelteKit 5](https://svelte.dev/docs/kit) frontend for **e!DAL** (Electronic Data Archive Library, [IPK Gatersleben](https://www.ipk-gatersleben.de/)), used to publish plant genomics/phenomics datasets with DOIs.

It has two main features:

- **Faceted search** (`/search`) — a UI over the existing e!DAL search REST API, for browsing and filtering published datasets.
- **Submission wizard** (`/submit`) — a multi-step, config-driven flow that authenticates via OIDC (AAI) and uploads dataset files/metadata to the e!DAL submission backend.

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) (see `pnpm-lock.yaml` / `pnpm-workspace.yaml` for the pinned package manager)

## Getting started

```sh
pnpm install
```

`better-sqlite3`, `esbuild`, and `@tailwindcss/oxide` are native/build-script dependencies pnpm blocks by default — approve them once after a fresh install:

```sh
pnpm approve-builds
```

Copy the env template and point it at a local SQLite file:

```sh
cp .env.example .env
```

Apply the Drizzle migrations to create the `submissions`/`scorpion` tables in that SQLite file:

```sh
pnpm db:migrate
```

Then start the dev server:

```sh
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Commands

| Command            | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| `pnpm dev`         | Start the Vite dev server                                             |
| `pnpm build`       | Production build                                                      |
| `pnpm preview`     | Preview a production build                                            |
| `pnpm check`       | Sync SvelteKit types and run `svelte-check` (TS/Svelte type checking) |
| `pnpm check:watch` | Same as `check`, in watch mode                                        |
| `pnpm lint`        | `prettier --check .` followed by `eslint .`                           |
| `pnpm format`      | `prettier --write .`                                                  |
| `pnpm db:push`     | Push the Drizzle schema directly to the local SQLite DB               |
| `pnpm db:generate` | Generate a Drizzle migration from schema changes                      |
| `pnpm db:migrate`  | Apply Drizzle migrations                                              |
| `pnpm db:studio`   | Open Drizzle Studio against the local DB                              |

There is no test runner configured in this repo, and no separate `pnpm typecheck` — use `pnpm check`.

## Architecture

- **`/submit` wizard** is driven by [`src/lib/config/steps.json`](src/lib/config/steps.json) and JSON Schemas under [`src/lib/config/schemas/`](src/lib/config/schemas/), rather than hardcoded per-step components. `src/lib/stores/dataset.ts` holds the in-progress submission as a Svelte store; `Questionnaire.svelte` orchestrates steps, fields, and validation.
- **Auth** (`src/lib/js/oidc.ts`) implements OIDC Authorization Code + PKCE against the AAI endpoint in `src/lib/config/general.json`. Tokens live in `localStorage` — there's no server session.
- **Local tracking DB**: `src/routes/+server.ts` and `src/routes/submit/+server.ts` are SvelteKit endpoints backed by a local SQLite file via Drizzle ORM (`src/lib/server/db/`), used for submission tracking and scorpion analytics API tokens.
- **`/search`** talks directly (client-side) to the external e!DAL search REST API — its state lives in a plain `payload` object, not a store.

See [CLAUDE.md](CLAUDE.md) for a more detailed architecture walkthrough.

## Container build

A `Containerfile` builds a production image (Node 22 Alpine, `adapter-node`) in three stages: dependencies, build, and a minimal runtime. Build and run with Podman or Docker:

```sh
podman build -t edal-web .
podman run -p 3000:3000 -e DATABASE_URL=/data/local.db -v ./data:/data edal-web
```

The scorpion analytics API token can be seeded into the local DB with `insert-scorpion-token.js`:

```sh
SCORPION_TOKEN=... DATABASE_URL=local.db node insert-scorpion-token.js
```
