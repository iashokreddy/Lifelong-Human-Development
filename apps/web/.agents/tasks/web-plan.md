# Implementation Plan — @lhd/web (Next.js + TypeScript web app)

Build the Next.js App Router web application for the Lifelong Human Development platform under
`apps/web`. It consumes the existing, unmodified API at `http://localhost:3001/api`
(configurable via `NEXT_PUBLIC_API_BASE_URL`), imports types from `@lhd/shared`, and honours the
non-negotiable philosophy: teach HOW to think not what; the platform **strengthens and never
replaces** parents, teachers, doctors, or human relationships; health/safety/wellbeing questions
route to humans. This copy and the AI-assistant surface must reflect that.

## Design decisions (grounded in the repo)

- **Framework:** Next.js 15 App Router + React 19 + TypeScript. App Router is the stated web
  stack in `docs/architecture.md`/README and gives server components for cheap, no-JS-needed HTML
  that satisfies the runtime HTML probe.
- **Shared types:** `@lhd/shared` is raw ESM TypeScript exported from `src/index.ts` (no build
  step). Next must transpile it, so set `transpilePackages: ["@lhd/shared"]` in `next.config.mjs`
  and keep `transpilePackages` out of lint/type friction by adding a path to it. Import types
  only (`import type { Phase, CatalogEntry, DevelopmentDomainKey, ... } from "@lhd/shared"`);
  never duplicate or diverge. Do NOT edit `packages/shared`.
- **Data fetching:** server components call the API with `fetch(..., { cache: "no-store" })` at
  request time. All fetches go through `lib/api.ts`, which returns typed results or a typed
  error/empty value rather than throwing, so `next build` never fails when the API is down.
  Pages render an empty-state/retry panel on error.
- **Styling:** plain CSS Modules + a small global stylesheet with CSS custom properties for a
  calm, readable theme. No network-dependent design dependencies (buildable offline). Meets the
  accessibility requirement via semantic HTML, a single h1 per page, labelled controls, focus
  styles, and sufficient contrast.
- **Domain labels:** the `DevelopmentDomainKey` enum values are kebab-case; a pure
  `lib/domain-labels.ts` maps each of the 15 keys to a human-readable label with a safe fallback
  for unknown keys (future-proofing). This is unit-tested.
- **Testing:** Vitest + @testing-library/react + jsdom (fast, ESM-native, transpiles `@lhd/shared`
  with no extra config). Covers the domain-label map, the phase page section rendering for a
  sample `Phase`, and the API client URL building + failed-fetch handling.
- **Auth/AI:** the assistant page POSTs to `/api/ai/ask`. That endpoint is JWT-guarded, so the
  client supports an optional bearer token (from a login the UI may expose minimally); when no
  token is present the page still renders and shows the reassuring "routes to a human" copy, and
  surfaces the API's auth error as a calm message rather than crashing. Progress is nice-to-have
  and only attempted for a logged-in user.

## API contract consumed (confirmed from apps/api, do NOT modify apps/api)

- `GET /api/phases` -> `CatalogEntry[]` (13 entries).
- `GET /api/phases/:idOrSlug` -> full `Phase`; 404 if unknown (resolves by id `phase-01` or slug
  `0-3-years`).
- `POST /api/auth/register` `{email,password,role,displayName}` and `POST /api/auth/login`
  `{email,password}` -> `{ accessToken }`.
- `GET/PUT /api/progress/:userId` — JWT (`Authorization: Bearer <token>`).
- `POST /api/ai/ask` `{question}` — JWT -> `{ answer, routedToHuman, citations:[{phaseId,citation}] }`.
- API start: `apps/api` -> `npm run build` then `node dist/main.js` on port 3001, logs
  `Loaded 13 phase(s) of 13 catalog entries ...`.

## Constraints

Create/modify only under `apps/web`, plus ADDITIVE root `package.json` script entries
(`dev:web`, `test:web`) and adding `apps/web` to workspaces is implicit (already globbed by
`apps/*`). Keep the existing root `test` script (`content:validate`) unchanged. Do NOT modify
`packages/content`, `packages/shared`, `tools/`, `apps/api`, or `apps/mobile`. Work directly in
the workspace (no git worktree).

---

# Implementation Plan

- [ ] 1. Scaffold the `@lhd/web` Next.js workspace with TypeScript, ESLint, Next config
      transpiling `@lhd/shared`, and additive root scripts.
      Create `apps/web/package.json` (name `@lhd/web`, scripts `dev`/`build`/`start`/`lint`/`test`,
      deps: next 15, react 19, react-dom 19; devDeps: typescript, @types/react, @types/node,
      eslint, eslint-config-next, vitest, @testing-library/react, @testing-library/jest-dom,
      jsdom, @vitejs/plugin-react), `apps/web/tsconfig.json` (extends Next defaults, `paths` for
      `@lhd/shared`), `apps/web/next.config.mjs` (`transpilePackages: ["@lhd/shared"]`),
      `apps/web/.eslintrc.json` (extends `next/core-web-vitals`), `apps/web/next-env.d.ts`,
      `apps/web/vitest.config.ts` (jsdom env, react plugin, setup file),
      `apps/web/vitest.setup.ts` (jest-dom). Add `dev:web` and `test:web` to root `package.json`
      scripts WITHOUT touching existing entries.
      Files: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.mjs`,
      `apps/web/.eslintrc.json`, `apps/web/next-env.d.ts`, `apps/web/vitest.config.ts`,
      `apps/web/vitest.setup.ts`, `package.json` (root, additive).
      Verify: from repo root `npm install` succeeds; from `apps/web` `npm run build` completes
      with 0 errors on the empty app shell (a placeholder root layout + page added in this step).

- [ ] 2. Build the typed API client and the domain-label utility with unit tests.
      Create `apps/web/lib/api.ts`: reads `process.env.NEXT_PUBLIC_API_BASE_URL` defaulting to
      `http://localhost:3001/api`; functions `getPhases()`, `getPhase(idOrSlug)`, `askAssistant`,
      and optional `login`/`register`; all use `fetch(url, { cache: "no-store" })`, catch network
      errors, and return a discriminated result (`{ ok: true, data } | { ok: false, error }`)
      instead of throwing. Create `apps/web/lib/domain-labels.ts` mapping all 15
      `DevelopmentDomainKey` values to readable labels with a fallback. Add
      `apps/web/lib/__tests__/api.test.ts` (mock global fetch: asserts correct URLs for phases,
      single phase, ask; asserts a thrown/failed fetch yields `{ ok:false }` and never throws) and
      `apps/web/lib/__tests__/domain-labels.test.ts` (every key maps; unknown key falls back).
      Files: `apps/web/lib/api.ts`, `apps/web/lib/domain-labels.ts`,
      `apps/web/lib/__tests__/api.test.ts`, `apps/web/lib/__tests__/domain-labels.test.ts`.
      Verify: from `apps/web` `npm test` (vitest run) passes all new tests; `npm run build` still
      clean.

- [ ] 3. Build the global layout, theme, and shared UI (header/footer carrying the
      "supports, never replaces" commitment, timeline + card components).
      Create `apps/web/app/layout.tsx` (semantic `html`/`body`, skip-link, header with the
      guiding principle, footer restating the never-replaces commitment), `apps/web/app/globals.css`
      (calm readable theme via CSS variables, focus-visible styles, accessible contrast), and
      reusable components under `apps/web/components/` (e.g. `PhaseTimeline.tsx`,
      `PhaseCard.tsx`, `PrincipleBanner.tsx`, `EmptyState.tsx`) with their CSS modules.
      Files: `apps/web/app/layout.tsx`, `apps/web/app/globals.css`,
      `apps/web/components/*.tsx`, `apps/web/components/*.module.css`.
      Verify: from `apps/web` `npm run build` and `npm run lint` complete with 0 errors.

- [ ] 4. Build the home page (`/`): vision as a lifelong journey, the 13 phases as a visual
      timeline from 0 to 40+ each linking to its phase page, and prominent guiding-principle /
      "supports, never replaces" copy. Fetch catalog via `getPhases()`; on error render the
      empty-state/retry rather than throwing.
      Files: `apps/web/app/page.tsx`, `apps/web/app/page.module.css`.
      Verify: from `apps/web` `npm run build` passes with the API NOT running (empty-state path
      must not crash the build).

- [ ] 5. Build the phases index (`/phases`): a grid of all phases from `getPhases()`, each card
      showing order, age label, title, primary objective, linking to `/phases/[idOrSlug]`;
      empty-state on error.
      Files: `apps/web/app/phases/page.tsx`, `apps/web/app/phases/page.module.css`.
      Verify: from `apps/web` `npm run build` clean with API down.

- [ ] 6. Build the phase detail page (`/phases/[idOrSlug]`) rendering EVERY section of the `Phase`
      object: age range, primary objective, summary, guiding principle, development domains (using
      `lib/domain-labels.ts` for readable labels), year plans (objectives + capabilities),
      daily/weekly activities, parent/caregiver guidance (when present), milestones, safety,
      outcomes, projects, app features, and research sources as clickable links; plus previous/next
      phase navigation computed from the catalog `order`. Fetch via `getPhase`; render a friendly
      not-found/empty-state on 404 or fetch error.
      Files: `apps/web/app/phases/[idOrSlug]/page.tsx`,
      `apps/web/app/phases/[idOrSlug]/page.module.css`, plus a `PhaseView` component if the page
      grows large (`apps/web/components/PhaseView.tsx` + css module).
      Verify: from `apps/web` `npm run build` clean; add/confirm the component test in step 8
      renders all major sections.

- [ ] 7. Build the assistant page (`/assistant`): a labelled question form that POSTs to
      `askAssistant`, rendering the grounded answer and citations (each citation linking to its
      phase), and copy that makes the "health/safety/wellbeing routes to a human" behaviour visible
      and reassuring. Handle the JWT-guarded endpoint gracefully: when unauthenticated, show the
      calm routing message and the API error without crashing. (Client component for the form;
      uses `lib/api.ts`.)
      Files: `apps/web/app/assistant/page.tsx`, `apps/web/app/assistant/page.module.css`.
      Verify: from `apps/web` `npm run build` and `npm run lint` clean.

- [ ] 8. Add component tests for the phase view and domain labels in context.
      Create `apps/web/components/__tests__/PhaseView.test.tsx` (render a sample `Phase` object —
      reuse the shape of phase-01 — and assert each major section renders: a domain shows its
      human label not the enum key, a year-plan objective, a daily activity, a safety item, an
      outcome, a project, an app feature, and a source link with correct href; assert the
      never-replaces principle text appears in layout). Ensure accessible structure (one h1,
      section headings).
      Files: `apps/web/components/__tests__/PhaseView.test.tsx`.
      Verify: from repo root `npm run test:web` (or `apps/web` `npm test`) shows all tests pass.

- [ ] 9. Full offline verification + runtime HTML probe, recorded in `apps/web/VERIFICATION.md`.
      (1) From `apps/web` `npm run build` completes 0 errors with the API NOT running. (2)
      `npm run lint` clean of errors. (3) `npm run test:web` output shows pass. (4) RUNTIME HTML
      CHECK: build+start the API (`apps/api`: `npm run build` then `node dist/main.js` on 3001,
      wait for `Loaded 13 phase(s)`) and the web app (`apps/web`: `npm run build` then
      `npm run start` on 3000) as BACKGROUND processes; via a small probe `.ps1` run with
      `powershell -ExecutionPolicy Bypass -File`, GET `http://localhost:3000/` and
      `http://localhost:3000/phases/phase-01` and confirm the HTML contains real content (a phase
      title like "Foundations", the "never replaces"/"supports" principle text, and real phase-01
      curriculum text such as a development domain focus or an activity title); then STOP both
      servers and delete the temp probe script.
      Files: `apps/web/VERIFICATION.md` (+ temporary probe `.ps1`, deleted after).
      Verify: `apps/web/VERIFICATION.md` records all four checks passing with the captured probe
      output snippets; no stray background processes or temp scripts remain.

## Gaps / assumptions

- The login/register UI is optional per the brief; the plan wires the client methods and a minimal
  token-aware assistant path but does not build full auth screens. If the reviewer wants visible
  login, it is an additive follow-up.
- Progress endpoints need a logged-in user; a progress affordance is treated as nice-to-have and,
  if added, is gated behind a present bearer token.
