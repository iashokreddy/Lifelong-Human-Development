# @lhd/web — Verification

This records the four verification checks for the web app (FEAT-001 → FEAT-003).

> Note on the test runner: the feature spec originally mandated Vitest, but this
> workspace's absolute path ends in `%` (`…Evaluation of Human 0 to 100%\`).
> Vite 5 (used by Vitest) calls `decodeURI` on the project root, and a bare `%`
> not followed by two hex digits throws `URIError: URI malformed`, so Vitest
> cannot collect any tests here. The web app therefore uses **Jest + React
> Testing Library via `next/jest`** (jsdom environment) — the same runner the
> API already uses successfully through this exact path. `next build` is
> unaffected because its toolchain does not `decodeURI` the project root.

## 1. Offline build — `npm run build` (API NOT running) — PASS

From `apps/web` with no API server running:

```
> next build
   ▲ Next.js 15.5.28
 ✓ Compiled successfully in 2.1s
   Linting and checking validity of types ...
 ✓ Generating static pages (6/6)

Route (app)                          Size     First Load JS
┌ ƒ /                                502 B    107 kB
├ ○ /_not-found                      986 B    104 kB
├ ○ /assistant                       1.67 kB  108 kB
├ ƒ /phases                          421 B    107 kB
└ ƒ /phases/[idOrSlug]               518 B    107 kB
```

0 errors. Every data page fetches through the non-throwing `lib/api.ts` client,
so a down API yields an empty-state render instead of a crash.

## 2. Lint — `npm run lint` — PASS

```
> next lint
✔ No ESLint warnings or errors
```

(`next lint` prints a deprecation notice for Next 16; it is informational only.)

## 3. Tests — `npm run test:web` (root) / `npm test` (apps/web) — PASS

```
> jest
PASS lib/__tests__/domain-labels.test.ts
PASS lib/__tests__/api.test.ts
PASS components/__tests__/PhaseView.test.tsx

Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total
```

Coverage:

- `domain-labels.test.ts` — all 15 `DevelopmentDomainKey` values map to a
  non-empty human label distinct from the raw key, plus a title-cased fallback
  for unknown keys.
- `api.test.ts` — URL building for `getPhases` (`<base>/phases`), `getPhase`
  (`<base>/phases/phase-01`), and `askAssistant` (`POST <base>/ai/ask` with the
  bearer header and `{ question }` body); network rejection and non-2xx both
  return `{ ok: false }` without throwing.
- `PhaseView.test.tsx` — renders every major `Phase` section (overview, domains
  with readable labels, year plans, daily activity, parent guidance, milestone,
  safety, outcome, project, app feature, source link) and asserts a single `h1`
  and that domains render as `Physical & motor`, not `physical-and-motor`.

## 4. Runtime HTML probe (real API + web server) — PASS

The API (`apps/api`: `npm run build` then `node dist/main.js`, port 3001) and the
web app (`apps/web`: `npm run build` then `next start`, port 3000) were started
as background processes. The API logged
`Loaded 13 phase(s) of 13 catalog entries` before probing. A temporary
`apps/web/tmp-probe.ps1` (run via `powershell -ExecutionPolicy Bypass -File`)
fetched the HTML and asserted real content, then both servers were stopped and
the script deleted.

`GET http://localhost:3000/`:

```
PASS: home: a phase title           -> matched: 'Foundations'
PASS: home: never-replaces principle -> matched: 'strengthens and never replaces'
PASS: home: how-to-think philosophy  -> matched: 'how to think'
```

`GET http://localhost:3000/phases/phase-01`:

```
PASS: phase: title                   -> matched: 'Foundations'
PASS: phase: never-replaces principle -> matched: 'never replaces'
PASS: phase: real curriculum activity -> matched: 'Serve and return'
PASS: phase: readable domain label    -> matched: 'Physical &amp; motor'
```

```
PROBE RESULT: PASS
```

Both background servers were stopped (no listeners remain on ports 3000/3001)
and the temporary probe script was deleted.

## Summary

| Check                               | Result |
| ----------------------------------- | ------ |
| Offline `npm run build` (API down)  | PASS   |
| `npm run lint`                      | PASS   |
| `npm run test:web` / `npm test`     | PASS   |
| Runtime HTML probe (`/`, phase-01)  | PASS   |
