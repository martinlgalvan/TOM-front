# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install: `pnpm install` (Node 22.x, pnpm; do not update lockfiles or dependencies unless the task requires it)
- Dev server: `pnpm dev` (Vite, proxies `/api` to `http://localhost:2022`)
- Production build: `pnpm build`
- Preview production build: `pnpm preview`
- Unit/fuzz test (day-edit logic): `pnpm test:dayedit` — runs `tests/day-edit-details.fuzz.test.mjs` via `node --test`. To run a single Node test file directly: `node --test tests/week-services.block-assignment.test.mjs`
- E2E tests (mocked): `pnpm test:e2e` — Playwright against a local dev server on port 4173 (auto-started)
- E2E tests (real backend): `pnpm test:e2e:real` — uses `playwright.real-localhost.config.mjs`; only run when a real local API is configured (see `e2e/real-appflow.db.mjs`)
- E2E day-edit against the real backend: `pnpm test:e2e:dayedit` — `e2e/day-edit-details.real.spec.mjs` skips itself unless it is given a student, week, day and token; this script seeds that data, runs the spec and deletes what it created

Run `pnpm build` for any application change, `pnpm test:dayedit` when touching day edit/detail editing or its services, and `pnpm test:e2e` for navigation/visible-flow changes.

## Architecture

React 18 + Vite SPA (no SSR), single `src/App.jsx` owning all routing (`react-router-dom`) and top-level auth/session state. There is no global state library (Redux/Zustand) — state is local component state, React Context for a couple of cross-cutting concerns, and `localStorage` for session/user data.

- `src/pages` — route-level screens, split into `athlete/`, `coach/`, `login/`, `competitions/`. Coach pages are the admin/trainer-facing CRUD-heavy screens (routine editing, user lists, exercise library, payments, nutrition admin); athlete pages are the read-mostly views a trainee sees.
- `src/components` — reusable UI, with `Bootstrap/` (Bootstrap-based modals), `MUI/` (MUI-based pieces), `Context/` (React Context providers, e.g. `ColorContext`), `Randomizer/`, `Users/`, `coach/`, `DeleteActions/`, `EditActions/`.
- `src/services` — all HTTP access, one file per resource (`users.services.js`, `week.services.js`, `day.services.js`, `blocks.services.js`, `exercises.services.js`, `par.services.js`, `finance.services.js`, `auth.services.js`, etc.). Every authenticated request must go through `src/services/apiFetch.js`.
- `src/helpers` — pure utilities (no HTTP, no routing).
- `src/data` — static local datasets (e.g. `saraFoods.js`).

### Auth flow (`src/services/apiFetch.js` + `src/App.jsx`)

- Token lives in `localStorage` (`token`, plus `role`, `_id`, `name`, etc. set in `App.jsx`'s `persistSession`). Requests attach it as the `auth-token` header via `authJsonHeaders`/`apiFetch`, always with `credentials: 'include'` (needed for the refresh cookie).
- `apiFetch` auto-retries once on a 401 by calling `/api/auth/refresh` (deduplicated via a shared in-flight promise), then replays the original request with the new token.
- If refresh fails, `apiFetch` dispatches a `tom-auth-expired` window event; `App.jsx` listens for it, clears `localStorage`, and redirects to `/login`.
- Backend base URL resolution (`API_BASE`/`buildApiUrl` in `apiFetch.js`): `VITE_API_BASE` env var if set, else a hardcoded prod fallback URL in production, else same-origin/dev-proxy in development. Never hardcode new backend URLs — always go through `buildApiUrl`.
- The sibling repository `TOM-APIREST` is the source of truth for the HTTP contract (request/response shapes, `week_id`/`day_id`/`exercise_id`/`source_*` identifiers). Don't change those shapes without a coordinated API change.

### Routing / role model

All routes are declared in `src/App.jsx`. Access is gated client-side by `isAdmin()` (reads `role` from `localStorage`) and by feature-flag-style helpers `canAccessNutrition`/`canAccessCompetitions` (`src/helpers/nutritionAccess.js`). There are effectively two user types: `admin` (coach) and everyone else (athlete), each seeing a different nav and route set behind `RoutePrivate`.

### UI stack

Multiple UI libraries coexist per screen area — Bootstrap/react-bootstrap, MUI, PrimeReact, AntD, RSuite. When modifying a screen, match the UI library already used on that screen rather than introducing a new one for a local change.

### Deployment

Deployed on Vercel as a static SPA with a catch-all rewrite to `/` (`vercel.json`); `api/` at the repo root is a separate serverless function directory, unrelated to `src/services`.

## Conventions (from AGENTS.md)

- Cover loading, error, empty, and success states in async flows.
- Keep interactive controls accessible; check both mobile and desktop views when UI changes.
- Never swallow network errors or report success before the corresponding request actually resolves.
- Don't touch generated files, `test-results/`, backups, or legacy code outside the task's scope.
- Add or update the closest relevant test when fixing a regression.
