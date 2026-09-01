# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Reuse what
possible. Use all necessary tools for the best result. Test your code thoroughly. Never commit code. Do not use
functions that do not exist. Always test with the local server by using npm run dev:local. Never use npm run dev alone
as it connects to the production server.

## Project

Vue 3 + TypeScript frontend for the MORE Study Manager (MMB — Management & Monitoring Backend), used by researchers to
create, configure and monitor studies. Stack: Vite, Tailwind CSS 4, PrimeVue 4, Pinia, Vue Router 4, Vue I18n, TanStack
Vue Query, axios, Keycloak (OIDC auth).

## Commands

```
nvm use                    # match required Node version (see .nvmrc / engines in package.json)
npm i                       # install dependencies
npm run generate:api        # (re)generate src/generated-sources from openapi/StudyManagerAPI.yaml — requires Java 17 on PATH
npm run dev                 # dev server on localhost:3000, proxies /api to the test platform backend
npm run dev:local           # same, but proxies /api to a local backend on :8080 (VITE_LOCAL_BACKEND=true)
npm run test:unit           # run vitest in watch mode (jsdom env)
npm run test:unit:once      # single run, writes JUnit XML to target/testResults.xml (used in CI)
npm run coverage            # vitest with coverage
npm run lint                # eslint, zero warnings allowed
npm run lint:fix            # eslint --fix
npm run prettier            # format src/** and tests/**
npm run package              # generate:api + vue-tsc --noEmit + vite build (full production build)
npm run package:quick        # generate:api + vite build (skips type-check, faster local sanity build)
npm run lint:test:package    # lint + test:unit:once + package — what CI effectively runs
```

Run a single test file: `npx vitest run tests/utils/dateUtils.spec.ts` (or drop `run` to watch).

The backend and gateway (`more-data-gateway`, `more-studymanager-backend`) must be running for the dev server /
e2e-style manual testing; see `vite.config.ts` for the proxied port.

`npm run generate:api` deletes and regenerates `src/generated-sources` from `openapi/StudyManagerAPI.yaml`. Never
hand-edit files under `src/generated-sources` — they are build output (also excluded from eslint and vitest coverage).
When editing the enum-producing part of the OpenAPI spec, keep the structure where a property references a shared enum
schema (e.g. `unit: { $ref: '#/components/schemas/DurationUnit' }`) rather than inlining the enum, or the generator
produces duplicate enum types.

## Architecture

**API layer**: `src/composable/useApi.ts` exposes one `use<X>Api()` composable per generated OpenAPI client
(`StudiesApi`, `ParticipantsApi`, `ObservationsApi`, etc., all under the `@gs` alias → `src/generated-sources`), each
lazily instantiating and memoizing a singleton client against a shared `Configuration` (`basePath: /api/v1`). Auth is
injected globally instead of per-client: `src/main.ts` registers an axios request interceptor that attaches the Keycloak
bearer token to every outgoing request, plus global interceptors for error handling (`useErrorHandling`) and a loading
indicator (`useLoader`). `src/api/*Queries.ts` wraps some of these API calls with TanStack Vue Query for
caching/reactivity; most feature state instead goes through Pinia stores.

**State (Pinia, `src/stores/`)**: stores are the primary data layer for studies — `studyStore`, `studyGroupStore`,
`observationGroupStore`, `userStore`, `globalStore`. Stores call the API composables directly, hold the resulting state
in refs, and cross-reference each other (e.g. `studyStore` pulls in `studyGroupStore` and `observationGroupStore`). All
Pinia stores use the setup-function style (`defineStore('name', () => {...})`), not the options style.

**Routing (`src/router/index.ts`)**: nested under `/studies/:studyId`, with a `studyResolver` navigation guard that
loads the study/study-group/observation-group stores for the current `studyId` before entering any child route. Most
feature views (`Participants`, `Observations`, `Goals`, `Interventions`, `Timeline`, `MonitoringData`, `Integrations`,
`StudyOverview`) assume this resolver has already populated the relevant stores.

**App bootstrap (`src/main.ts`)**: before mounting, it fetches backend build info and remote `FrontendConfiguration`
(title, Keycloak server/realm/clientId) from the backend, falling back to Vite-injected build-time constants
(`__APP_VERSION__`, `__KEYCLOAK_URL__`, etc. — defined in `vite.config.ts`) if the backend is unreachable. Keycloak auth
(`src/service/AuthService.ts`) then runs `login-required` init and self-refreshes the token on an interval before the
app is mounted; a failed login triggers a full page reload rather than an in-app redirect.

**Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`) plus a custom PrimeVue theme preset
(`src/styles/more-light/theme-preset.ts`) passed to `app.use(PrimeVue, ...)`. CSS layer order is explicit:
`theme, primevue, tailwind, more-styles, app-styles`. Component-scoped styles live in the SFC; shared styles live under
`src/styles`.

**i18n**: `src/i18n/{en,de}.json` + `src/i18n/i18n.ts`, loaded via `@intlify/unplugin-vue-i18n` (composition-only API,
`strictMessage: false`). Add new UI strings to both locale files.

**Path aliases**: `@` → `src/`, `@gs` → `src/generated-sources` (see `vite.config.ts` / `vitest.config.ts`).

## Conventions

- License header (Apache 2.0 / LBI-DHP) is required at the top of source files under `src/` except the types excluded in
  `nwa_config.yml` (json, yaml, md, svg, pcss, etc.) — regenerate/check headers with the `nwa` tool (see
  `nwa_config.yml`, `nwa.txt`).
- ESLint enforces `@typescript-eslint/explicit-function-return-type` and `eqeqeq`; `console.log` is disallowed (`warn`/
  `error`/`info` are allowed). Formatting is Prettier-driven (including Tailwind class sorting via
  `prettier-plugin-tailwindcss`) — don't hand-format, run `npm run prettier` / `lint:fix`.
- Tests live under `tests/` (not colocated with source) and use the `*.spec.ts` naming convention, split roughly into
  `tests/component`, `tests/utils`, `tests/common`. Uses `@testing-library/vue` and `@vue/test-utils` with vitest in
  jsdom mode.
- `npm run license:check` validates production dependency licenses against the SPDX allowlist in `.licensee.json`; check
  this before adding a new runtime dependency with a non-standard license.
