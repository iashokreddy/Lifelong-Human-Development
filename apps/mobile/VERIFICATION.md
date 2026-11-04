# Verification — @lhd/mobile

All commands were run from the repository root unless noted. Evidence is
summarised below so a reviewer can read the outcomes without re-running the
suites.

## Environment note (the `%` in the workspace path)

The absolute workspace path ends in a literal `%`
(`…\Evaluation of Human 0 to 100%`). Vite/Vitest call `decodeURI` on the project
root and throw `URIError: URI malformed`, which is why the whole repo uses Jest.
Mobile tests use the `jest-expo` preset (Babel-based) and are unaffected — the
smoke test confirms the runner boots through the `%` path.

## Monorepo hoisting fixes (why jest/babel config look unusual)

npm hoists several packages to the repo root to satisfy floating peer deps,
which collided with the pinned SDK 51 set. Two were resolved entirely inside
`apps/mobile` (no change to other workspaces):

1. **jest / react-native version drift.** npm hoisted a newer `react-native`
   (0.84.x) to the root to satisfy `react-native@*` peers from Expo packages.
   `jest-expo` (also at root) did `require('react-native/jest-preset')` and
   picked that newer copy, whose TypeScript jest helpers `babel-preset-expo`
   (SDK 51) cannot parse, so every suite failed to run. Fix: a local
   `jest-preset.js` that rebuilds the jest-expo preset from THIS workspace's
   SDK-51 `react-native` (0.74.5), plus a `moduleNameMapper` pinning
   `react-native` imports to the local copy.

2. **expo-router Metro bundle.** `babel-preset-expo` only enables its
   expo-router Babel plugin when it can `require.resolve('expo-router')` from its
   own (root) location; expo-router is nested in `apps/mobile`, so the plugin was
   skipped and `process.env.EXPO_ROUTER_APP_ROOT` was never inlined into the
   `require.context` call (bundle error "Invalid call … EXPO_ROUTER_APP_ROOT").
   Fix: `babel.config.js` adds the expo-router plugin explicitly, resolved from
   the hoisted preset.

3. **eslint rule drift.** The web app's `eslint-config-next` hoisted
   `@typescript-eslint@8` to the root, which dropped the `ban-types` rule that
   `eslint-config-expo` references (error "Definition for rule … not found").
   Fix: pin `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to
   `^7.4.0` as mobile devDependencies so the version expo expects nests locally.

## Hard gates (must all pass)

### 1. `npm install` — links @lhd/mobile in the workspace

`npm ls -w @lhd/mobile` resolves the workspace and its SDK-51 dependency set
(expo@51.0.39, expo-router@3.5.24, react-native@0.74.5, react@18.2.0,
jest-expo@51.0.4, @testing-library/react-native@12.5.1,
react-test-renderer@18.2.0). PASS.

`npm run content:validate` from root still passes (13 phases valid) — the
existing root gate is untouched. PASS.

### 2. `npm run typecheck -w @lhd/mobile` (tsc --noEmit)

Exit code 0, no errors. PASS.

### 3. `npm run lint -w @lhd/mobile` (eslint .)

Exit code 0, no errors. PASS. (ESLint prints a non-fatal note that the hoisted
TypeScript version is newer than `@typescript-eslint` officially supports; it is
a warning, not an error, and the run exits clean.)

### 4. `npm run test:mobile` (jest-expo + React Native Testing Library)

```
Test Suites: 5 passed, 5 total
Tests:       18 passed, 18 total
```

PASS. Coverage includes:
- `domain-labels.test.ts` — all 15 domain keys map to a non-empty label distinct
  from the raw key, and an unknown key returns the title-cased fallback.
- `api.test.ts` — the client builds the correct URLs (`/phases`,
  `/phases/:idOrSlug`, `/ai/ask`), sends/omits the bearer header, and returns a
  safe `{ ok: false }` result (never throws) on both a rejected fetch and a
  non-2xx response; the default base URL is `http://localhost:3001/api`.
- `PhaseDetail.test.tsx` — rendering a sample `Phase` shows the title, a readable
  domain label (`Physical & motor`, not `physical-and-motor`), a year-plan
  objective, a daily activity, a parent-guidance topic, a milestone, the
  indicative-guides note, a safety topic, an outcome, a project, an app feature,
  and a source title; previous/next nav renders when provided.
- `StateView.test.tsx` — error, empty, loading, and retry paths.
- `smoke.test.ts` — proves jest-expo boots through the `%` path.

## Soft gate — Metro bundle check

### 5. `npx expo export --platform web --output-dir ./.expo-export-check`

PASS. Metro bundled the app and resolved `@lhd/shared`:

```
Web Bundled … node_modules/expo-router/entry.js (587 modules)
Exporting 1 bundle for web:
  _expo/static/js/web/entry-….js (872 kB)
App exported to: ./.expo-export-check
```

Exit code 0. The generated `./.expo-export-check` directory was deleted after the
check.

Notes:
- This was NOT blocked by the `%`/decodeURI path issue — Metro bundled
  successfully through it.
- `web.output` is set to `single` (SPA). With `static` (Node static HTML
  rendering), `@expo/cli` running at the root cannot resolve
  `expo-router/build/matchers` (the same nested-vs-hoisted layout as the jest and
  babel issues above). `single` output exercises the full Metro bundle — which is
  what this check is for — without the Node static-render step, which is not
  relevant to a React Native app.

## Summary

| Gate                         | Result |
| ---------------------------- | ------ |
| `npm install` (workspace)    | PASS   |
| `content:validate` (untouched root gate) | PASS |
| `typecheck` (tsc --noEmit)   | PASS   |
| `lint` (eslint)              | PASS   |
| `test:mobile` (jest-expo)    | PASS (5 suites, 18 tests) |
| Metro bundle (`expo export`) | PASS   |
