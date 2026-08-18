# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

e!DAL-web is a SvelteKit 5 frontend for e!DAL (Electronic Data Archive Library, IPK Gatersleben), used to publish plant genomics/phenomics datasets with DOIs. It has two main features: a **faceted search** UI over an existing e!DAL search backend, and a **multi-step dataset submission wizard** that authenticates via OIDC and uploads files/metadata to a submission backend.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`).

- `pnpm dev` — start the Vite dev server
- `pnpm build` — production build
- `pnpm preview` — preview a production build
- `pnpm check` — sync SvelteKit types and run `svelte-check` (TypeScript/Svelte type checking)
- `pnpm check:watch` — same, in watch mode
- `pnpm lint` — `prettier --check .` followed by `eslint .`
- `pnpm format` — `prettier --write .`

There is no test runner configured in this repo. There is no separate `pnpm typecheck` — use `pnpm check`.

`pnpm-workspace.yaml` marks `better-sqlite3`, `esbuild`, and `@tailwindcss/oxide` as built dependencies requiring `pnpm approve-builds` / `onlyBuiltDependencies` — relevant after a fresh `pnpm install`.

## Architecture

### Data-driven submission wizard

The submission flow (`/submit`) is entirely config-driven rather than hardcoded per step:

- **`src/lib/config/steps.json`** defines the wizard: each step has a title/help text, and either a `fields` array (simple form fields bound via JSON path) or a `component` (a more complex custom component) plus a `jsonPath` denoting where in the dataset object its value lives. Steps can declare `hooks` that run on entry (e.g. initializing a sub-object from a JSON Schema default).
- **`src/lib/config/schemas/*.json`** are JSON Schemas (`dataset-schema.json`, `metadata-schema.json`, `person-schema.json`, `s3-connection-details.json`) describing the shape of the submitted dataset object. `$lib/js/index.ts` (`Schemas.getObjectFromSchema`) walks a schema and produces an empty default object of the matching shape — used to initialize/reset parts of the dataset store.
- **`src/lib/stores/dataset.ts`** holds the single source of truth: `datasetObj` (a Svelte store wrapping the whole in-progress submission) and `datasetStr` (its JSON-stringified mirror, kept in sync). `datasetObj.keyed(path)` (via `@humanspeak/svelte-keyed`) derives a writable sub-store scoped to a dot-path inside the object — this is how individual form fields/components read and write into the shared dataset object without prop-drilling. `currentStep` tracks wizard position.
- **`Questionnaire.svelte`** is the orchestrator: it maps `steps.json` field `type`s (`string`, `textarea`, `license`, `onto-autocomplete`) to components in `src/lib/components/submission/fields/`, and `component` names (`people`, `files`, `dla`, `preview`) to components in `src/lib/components/submission/components/`. Per-step validation (required fields, author/ORCID rules, DLA acceptance, file/S3 requirements) lives inline in `Questionnaire.svelte`'s `next()`/`finish()`.
- **`wrapper/FieldWrapper.svelte`** and **`wrapper/ComponentWrapper.svelte`** are thin adapters: they resolve a `jsonPath` to a keyed store via `datasetObj.keyed(...)` and bind it into the target component as `value`, so field/component implementations stay decoupled from the store shape.
- When adding a new step or field type, add the config entry to `steps.json`, add the component to the relevant `fieldTypes`/`componentTypes` map in `Questionnaire.svelte`, and (if it holds structured data) add/extend a schema under `src/lib/config/schemas/`.

### Submission finish flow

On finishing local uploads, `Questionnaire.svelte` uploads files individually with a bounded concurrency queue (10 parallel connections) to an external submission backend (`https://dmz-web-169.ipk-gatersleben.de/submission`), then POSTs final metadata to `/publication/publish`. S3-mode submissions instead POST connection details + metadata to `/upload/s3upload` in one request. Author `affiliation`/`city` fields are folded into a combined `address` string before either upload — keep that transform in sync if the author schema changes.

### Auth (OIDC / AAI)

`src/lib/js/oidc.ts` implements an OIDC Authorization Code + PKCE flow against the endpoint in `src/lib/config/general.json` (`aai.openid-configuration`, `aai.client-id`). Tokens are stored in `localStorage` (`access_token`, `refresh_token`) rather than a server session — auth state is entirely client-side. `checkTokenValidity`/`renewToken` decode the JWT payload locally to check expiry.

### Local submission-tracking DB

`src/routes/+server.ts` and `src/routes/submit/+server.ts` are SvelteKit server endpoints backed by a local SQLite file (`better-sqlite3`, `edal-submissions.db` at the repo root, gitignored). `submit/+server.ts`'s `submissions` table (created lazily via `CREATE TABLE IF NOT EXISTS` on first POST) tracks submission metadata (gitlab token, ROCrate link, user/arc IDs). The root `+server.ts` GET endpoint proxies usage statistics from an external "scorpion" analytics API, reading an API token out of a `scorpion` table in the same DB. Note: these DB connections are opened at module load with no request-scoped teardown.

### Faceted search

`/search` (`src/routes/search/+page.svelte` plus `src/lib/components/search/{FacetedSearch,Filter,SearchBar,Table}.svelte`) talks directly (client-side) to an external e!DAL search REST API (`https://doi.ipk-gatersleben.de/rest/extendedSearch/*`: `search`, `drillDown`, `parsequery`). Search/filter/pagination state is held in a single `payload` object shaped for that API, not in a Svelte store.

## Svelte/tooling conventions

- Svelte 5 with runes (`$state`, `$props`, `$bindable`, `$derived`, etc.) is used consistently throughout — no `export let`, `<script context="module">`, or `<svelte:component>` remain. Keep new/modified code in runes idioms.
- Styling is Tailwind CSS v4 (via `@tailwindcss/vite`) + daisyUI component classes; the Tailwind stylesheet is `src/app.css`, referenced from `.prettierrc`'s `tailwindStylesheet` for class sorting.
- Prettier config: tabs, single quotes, no trailing commas, 100 print width; always run `pnpm format`/`pnpm lint` before considering Svelte/TS changes done, since CI-style checks rely on `prettier --check` passing exactly.
- ESLint flat config (`eslint.config.js`) layers `@eslint/js`, `typescript-eslint`, `eslint-plugin-svelte`, and `eslint-config-prettier`; `no-undef` is disabled in favor of TS's own checks.
- When creating or editing any `.svelte` or `.svelte.ts`/`.svelte.js` file, use the Svelte MCP server tools (`svelte-autofixer`, docs lookup) to validate against Svelte 5 idioms before finishing.
- Use the daisyUI plugin/skill when styling or laying out components — prefer its component classes over hand-rolled Tailwind utility styling to stay consistent with the rest of the UI.
