# Web E2E verification (Playwright)

End-to-end suite for the `@lhd/web` app that exercises the **full live stack**:

```
Next.js web (prod server, :3000)  ->  NestJS API (:3001)  ->  curriculum content (packages/content)
```

No mocks or fixtures — the assertions run against the real curriculum the API
serves from `packages/content`.

## How to run (from cold)

The suite is self-contained. From the repo root:

```powershell
npm run e2e:web
```

or, equivalently, from `apps/web`:

```powershell
npm run e2e
```

Both resolve to:

```
npm --workspace @lhd/api run build && npm run build && playwright test
```

That is: build the API, build the web app, then run Playwright. Playwright's
`webServer` (see `playwright.config.ts`) then starts **both** servers via
`e2e/start-stack.mjs` and waits for `http://localhost:3000` before the specs
run. `reuseExistingServer` is enabled locally, so if you already have the stack
running the suite will attach to it instead of launching a second copy.

First-time browser install (Chromium only):

```powershell
npm --workspace @lhd/web run e2e:install
```

## What is covered

- **Home `/`** — guiding philosophy ("how to think", "torch-bearer") and the
  non-negotiable rule that the platform *strengthens and never replaces*
  parents, teachers, doctors; plus the 0 -> 40+ lifelong journey rendered from
  the live catalog (13 phases).
- **`/phases`** — lists all **13** phases (Foundations, Innovation &
  Leadership, Legacy & Lifelong Learning all visible).
- **`/phases/phase-01`** (by id) — real curriculum from the API: Foundations,
  a `Physical` development-domain label, the "Serve and return" activity, and
  the "Nurturing Care" cited source.
- **`/phases/0-3-years`** (by slug) — resolves to the same Foundations phase.
- **`/assistant`** — the standing reassurance note stating that health/safety/
  wellbeing questions route to a human or qualified professional, and that the
  assistant strengthens and never replaces a parent, teacher, or doctor.
  Submitting an unauthenticated health question is tolerated at the auth
  boundary: the `/api/ai/ask` endpoint is **JWT-guarded by design**, so the UI
  shows its human-routing reassurance fallback. The suite asserts a
  human-routing cue is visible either way and does **not** fail on the guard.

## Last verified run

Command: `npm run e2e` (from `apps/web`), Windows / PowerShell, Node v24.

```
Running 7 tests using 1 worker
  ok 1 assistant.spec.ts  communicates that health/safety questions route to a human
  ok 2 assistant.spec.ts  a health question surfaces human-routing (auth boundary tolerated)
  ok 3 home.spec.ts       renders the guiding philosophy and the never-replace commitment
  ok 4 home.spec.ts       shows the 0 -> 40+ lifelong journey from the live catalog
  ok 5 phases.spec.ts     /phases lists all 13 phases
  ok 6 phases.spec.ts     /phases/phase-01 (by id) shows real curriculum from the API
  ok 7 phases.spec.ts     /phases/0-3-years (by slug) resolves to the same Foundations phase
  7 passed (8.1s)
```

Result: **7 passed, 0 failed.**

The API log line `Loaded 13 phase(s) of 13 catalog entries from ...\packages\content`
confirms the suite ran against the real content loader.

## Environment note: the `%` in the workspace path

The repo root ends in a literal `%`
(`...\Evaluation of Human 0 to 100%`). Tooling that runs `decodeURI()` on the
project root throws here (this is why the repo uses Jest, not Vitest, for unit
tests). **Playwright is not affected** — it is not Vite-based, and the suite
above ran green from this path with no `%`/`decodeURI` errors. If a future
Playwright/Next upgrade regresses on this, capture the exact error here rather
than renaming the folder (the name is deliberate and renaming breaks git and
all paths).

## Manual fallback (if you prefer to drive the servers yourself)

```powershell
# terminal 1
npm --workspace @lhd/api run build; npm --workspace @lhd/api run start   # :3001
# terminal 2
npm --workspace @lhd/web run build; npm --workspace @lhd/web run start   # :3000
# terminal 3
npm --workspace @lhd/web exec playwright test
```

With both servers already up, `reuseExistingServer` means `npm run e2e` attaches
to them instead of starting new ones.
