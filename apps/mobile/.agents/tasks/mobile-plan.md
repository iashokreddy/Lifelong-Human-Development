# Implementation Plan — @lhd/mobile (React Native + Expo)

A single coder implements this top-to-bottom in one pass on `master`, no worktree. All
paths are under `apps/mobile/` unless stated otherwise. Only `apps/mobile/**` and the two
ADDITIVE root `package.json` entries (workspace glob already covers `apps/*`, plus
`test:mobile`/`start:mobile` scripts) may be created or modified. Do NOT touch
`packages/content`, `packages/shared`, `tools/`, `apps/api`, or `apps/web`.

## Design decisions (grounded in the repo)

- **Expo SDK 51 + expo-router v3, TypeScript, React Native 0.74.5 / React 18.2.** Pinned
  because the task mandates SDK 51+ and these are the mutually compatible versions for SDK 51
  (`expo ~51.0.28`, `expo-router ~3.5.23`, `expo-constants ~16.0.2`, `expo-linking ~6.3.1`,
  `react-native 0.74.5`, `react 18.2.0`). Test runner is `jest-expo ~51.0.x` to match the SDK.
- **Jest via `jest-expo`, never Vitest.** The workspace absolute path ends in a literal `%`;
  Vite/Vitest call `decodeURI` on the project root and throw `URIError: URI malformed` (this is
  exactly why `apps/web` moved off Vitest onto Jest — see `apps/web/VERIFICATION.md`). `jest-expo`
  uses Babel, not Vite, so it is unaffected through this path, same as the API/web Jest setups.
- **Metro bundle (`npx expo export`) is a soft check, not a gate.** Metro MAY also trip on the
  `%` in the root path. The hard gates are `typecheck` (tsc --noEmit), `lint`, and `test:mobile`
  (jest-expo). The Metro bundle is run and, if it fails SPECIFICALLY with a `%`/`decodeURI`/
  `URI malformed` error, it is documented in `VERIFICATION.md` as a known environment limitation,
  NOT a failure. Any OTHER bundle failure is a real failure to fix.
- **Re-implement, do not import, the web client.** `apps/web/lib/api.ts` and
  `apps/web/lib/domain-labels.ts` are the proven patterns; mobile gets its own copies reading
  `@lhd/shared` types, differing only in the env var (`EXPO_PUBLIC_API_BASE_URL` instead of
  `NEXT_PUBLIC_API_BASE_URL`) and dropping the Next-specific `cache: 'no-store'` option.
- **`@lhd/shared` is raw ESM TS from `src/index.ts`** (its `package.json` `main`/`exports`
  point at the uncompiled source). So mobile's tsconfig must add a `paths` mapping to the source,
  Jest needs a `moduleNameMapper` + `transformIgnorePatterns` entry for it, and Babel/Metro must
  be allowed to transform it. This mirrors `apps/web/jest.config.mjs` and `apps/web/tsconfig.json`.
- **Non-throwing API client + graceful empty/error states everywhere.** Every screen that fetches
  renders a readable empty/error panel when `{ ok: false }` so an unreachable API never crashes the
  app. Mirrors the web app's discriminated `Result<T>`.
- **Philosophy is first-class UI copy.** Home and Assistant screens carry the "teaches HOW to
  think, not WHAT to think" and "strengthens and never replaces parents, teachers, doctors, human
  relationships" messaging; the Assistant makes the "health/safety questions route to a human"
  behavior visible and reassuring (surfaced from `routedToHuman` and in static copy).

## File layout

```
apps/mobile/
  package.json              app.json            app.config.ts? (no — use app.json)
  tsconfig.json             babel.config.js     metro.config.js
  jest.config.js            jest.setup.ts       .gitignore
  README.md                 VERIFICATION.md     env.d.ts (EXPO_PUBLIC_* typing)
  app/                      # expo-router routes
    _layout.tsx             # Stack navigator + screen options
    index.tsx               # Home
    phases/
      index.tsx             # Phases list
      [idOrSlug].tsx        # Phase detail
    assistant.tsx           # Assistant
  src/
    lib/
      api.ts                domain-labels.ts
    components/
      Section.tsx  Card.tsx  Bullets.tsx  StateView.tsx  SourceLink.tsx  PhaseDetail.tsx
    theme/
      colors.ts  typography.ts
    __tests__/
      api.test.ts  domain-labels.test.ts
    components/__tests__/
      PhaseDetail.test.tsx  StateView.test.tsx
  .agents/tasks/            # this plan + the review gate file live here
```

---

- [ ] 1. Scaffold the Expo app package manifest and register it as a workspace.
      Create `apps/mobile/package.json` (name `@lhd/mobile`, `private: true`, `version 0.1.0`,
      `main: "expo-router/entry"`). Dependencies: `expo ~51.0.28`, `expo-router ~3.5.23`,
      `expo-constants ~16.0.2`, `expo-linking ~6.3.1`, `expo-status-bar ~1.12.1`,
      `react 18.2.0`, `react-dom 18.2.0`, `react-native 0.74.5`, `react-native-safe-area-context 4.10.5`,
      `react-native-screens ~3.31.1`, `react-native-web ~0.19.10`, `@lhd/shared: "*"`.
      devDependencies: `@babel/core ^7.24.0`, `jest-expo ~51.0.0`, `jest ^29.7.0`,
      `@testing-library/react-native ^12.5.1`, `@types/react 18.2.79`, `typescript ~5.3.3`,
      `@types/jest ^29.5.14`, `eslint ^8.57.0`, `eslint-config-expo ~7.1.2`.
      Scripts: `start` (`expo start`), `android` (`expo start --android`), `ios`
      (`expo start --ios`), `web` (`expo start --web`), `lint` (`eslint .`),
      `typecheck` (`tsc --noEmit`), `test` (`jest`), `bundle:check`
      (`expo export --platform android --output-dir ./.expo-export-check`).
      Files: `apps/mobile/package.json`
      Verify: `npm install` from repo root succeeds and `npm ls -w @lhd/mobile` resolves the
      workspace. (Install happens in a later step once all config exists; at minimum JSON is valid.)

- [ ] 2. Add the Expo app config, TypeScript config, Babel, Metro, and env typing.
      `app.json`: `expo` block with `name "Lifelong Human Development"`, `slug "lhd-mobile"`,
      `scheme "lhdmobile"`, `version "1.0.0"`, `orientation "portrait"`, `userInterfaceStyle
      "automatic"`, `newArchEnabled false`, `plugins: ["expo-router"]`, and
      `experiments: { typedRoutes: true }`; include `web.bundler "metro"`.
      `tsconfig.json`: `extends "expo/tsconfig.base"`, `compilerOptions.strict true`,
      `baseUrl "."`, and `paths` mapping `"@lhd/shared": ["../../packages/shared/src/index.ts"]`
      (mirrors `apps/web/tsconfig.json`); `include` the `app`, `src`, `*.d.ts`, and
      `expo-env.d.ts`.
      `babel.config.js`: `presets: ["babel-preset-expo"]` (expo-router's Babel plugin is bundled
      into babel-preset-expo for SDK 50+; no separate plugin needed).
      `metro.config.js`: start from `getDefaultConfig(__dirname)` and set
      `config.watchFolders` to include the monorepo root + `packages/shared`, and
      `config.resolver.nodeModulesPaths` to include root `node_modules` so the hoisted workspace
      deps and `@lhd/shared` source resolve under Metro.
      `env.d.ts`: declare `EXPO_PUBLIC_API_BASE_URL?: string` on `ProcessEnv`.
      Files: `apps/mobile/app.json`, `apps/mobile/tsconfig.json`, `apps/mobile/babel.config.js`,
      `apps/mobile/metro.config.js`, `apps/mobile/env.d.ts`, `apps/mobile/.gitignore`
      (ignore `.expo/`, `.expo-export-check/`, `dist/`, `node_modules/`).
      Verify: after step 11's install, `npx tsc --noEmit -p apps/mobile/tsconfig.json` runs
      without config errors (will also catch missing types — real code arrives in later steps).

- [ ] 3. Configure jest-expo so it transforms app code and the raw-TS `@lhd/shared`.
      `jest.config.js`: `module.exports = { preset: 'jest-expo', setupFilesAfterEnv:
      ['<rootDir>/jest.setup.ts'], moduleNameMapper: { '^@lhd/shared$':
      '<rootDir>/../../packages/shared/src/index.ts' }, transformIgnorePatterns:
      ['node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@lhd/shared))'] }`
      (extends the jest-expo default ignore list with `@lhd/shared`, same intent as
      `apps/web/jest.config.mjs`).
      `jest.setup.ts`: empty for now (placeholder for future RTL matchers); keep the file so the
      path in config is valid.
      Files: `apps/mobile/jest.config.js`, `apps/mobile/jest.setup.ts`
      Verify: covered by step 10's `npm run test:mobile` (a trivial smoke test in step 4 proves
      the runner boots through the `%` path).

- [ ] 4. Add a theme and a jest smoke test to prove the runner works through the `%` path.
      `src/theme/colors.ts` and `src/theme/typography.ts`: exported constants (accessible
      contrast pairs — dark text on light surfaces, a readable base font size >= 16, section
      heading scale). `src/__tests__/smoke.test.ts`: a single `expect(1 + 1).toBe(2)` test.
      Files: `apps/mobile/src/theme/colors.ts`, `apps/mobile/src/theme/typography.ts`,
      `apps/mobile/src/__tests__/smoke.test.ts`
      Verify: `npm run test:mobile` from repo root (after install) runs jest-expo to green,
      confirming jest boots despite the `%` in the path.

- [ ] 5. Implement the non-throwing API client.
      `src/lib/api.ts`: re-implement `apps/web/lib/api.ts` using `@lhd/shared` types
      (`CatalogEntry`, `Phase`, `UserRole`). Export the discriminated `Result<T>` union, the
      `AskResult` interface (`answer`, `routedToHuman`, `citations: {phaseId; citation}[]`), and
      `getPhases()`, `getPhase(idOrSlug)`, `askAssistant(question, token?)`, `login`, `register`.
      Read base URL from `process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api'`.
      The private `request<T>()` wraps `fetch` in try/catch and returns `{ ok:false, error }` on
      reject or non-2xx — NEVER throws. Drop the Next `cache: 'no-store'` option; keep bearer-token
      support on `askAssistant`.
      Files: `apps/mobile/src/lib/api.ts`
      Verify: `npm run test:mobile` (test added in step 7) passes.

- [ ] 6. Implement the domain-labels map.
      `src/lib/domain-labels.ts`: copy `apps/web/lib/domain-labels.ts` verbatim in behavior — the
      `DOMAIN_LABELS: Record<DevelopmentDomainKey,string>` with all 15 keys, the `titleCase`
      fallback, and `labelForDomain(key)`.
      Files: `apps/mobile/src/lib/domain-labels.ts`
      Verify: `npm run test:mobile` (test added in step 7) passes.

- [ ] 7. Add unit tests for the API client and domain labels (port the web suites).
      `src/__tests__/api.test.ts`: mirror `apps/web/lib/__tests__/api.test.ts` — assert
      `getPhases()` hits `<base>/phases`, `getPhase('phase-01')` hits `<base>/phases/phase-01`,
      `askAssistant('q','tok')` POSTs `<base>/ai/ask` with `Authorization: Bearer tok` and body
      `{question:'q'}`, Authorization omitted without a token, and that both a rejected fetch and a
      non-2xx response yield `{ ok:false }` without throwing (mock `global.fetch`).
      `src/__tests__/domain-labels.test.ts`: assert all 15 keys map to a non-empty label distinct
      from the raw key, and an unknown key returns the title-cased fallback.
      Files: `apps/mobile/src/__tests__/api.test.ts`,
      `apps/mobile/src/__tests__/domain-labels.test.ts`
      Verify: `npm run test:mobile` — both suites pass.

- [ ] 8. Build the shared presentational components (one coherent unit).
      `src/components/StateView.tsx`: renders loading, empty, and error states from a non-throwing
      result (props: `loading`, `error`, `empty`, plus retry callback); readable copy, accessible
      roles. `src/components/Section.tsx`: titled section with an `accessibilityRole="header"`
      heading. `src/components/Card.tsx`: bordered content container. `src/components/Bullets.tsx`:
      maps a string[] to an accessible list. `src/components/SourceLink.tsx`: a `Pressable`/`Text`
      that opens `source.url` via `expo-linking`'s `openURL`, with `accessibilityRole="link"` and
      an `accessibilityLabel` naming the source.
      `src/components/PhaseDetail.tsx`: the mobile analogue of `apps/web/components/PhaseView.tsx` —
      a `ScrollView` rendering EVERY `Phase` section: age range + title + primaryObjective header,
      summary + guidingPrinciple, development domains (via `labelForDomain`), year plans
      (objectives + capabilities), daily & weekly activities (title, description, materials),
      parentGuidance when present, milestones (with the "indicative guides, not rigid limits"
      note), safety, outcomes, projects (with skillsPractised), appFeatures (with audience), and
      sources as tappable `SourceLink`s. Accepts `previous?`/`next?` `CatalogEntry` and renders
      prev/next nav using expo-router `Link`/`router`.
      Files: `apps/mobile/src/components/StateView.tsx`, `Section.tsx`, `Card.tsx`, `Bullets.tsx`,
      `SourceLink.tsx`, `PhaseDetail.tsx` (all under `apps/mobile/src/components/`)
      Verify: `npm run typecheck -w @lhd/mobile` passes; component tests in step 9 pass.

- [ ] 9. Add component tests for PhaseDetail and StateView.
      `src/components/__tests__/PhaseDetail.test.tsx`: render `PhaseDetail` with a fixture Phase
      (build it from the shape of `packages/content/phases/phase-01/phase.json`, defined inline in
      the test — do not import content) and assert it shows the title, a readable domain label
      (`Physical & motor`, not `physical-and-motor`), a year-plan objective, a daily activity, a
      parent-guidance topic, a milestone, a safety topic, an outcome, a project, an app feature,
      and a source title. `src/components/__tests__/StateView.test.tsx`: assert the error message
      renders when `error` is set and the empty copy renders when `empty` is true.
      Files: `apps/mobile/src/components/__tests__/PhaseDetail.test.tsx`,
      `apps/mobile/src/components/__tests__/StateView.test.tsx`
      Verify: `npm run test:mobile` — all suites pass.

- [ ] 10. Build the expo-router screens (one coherent unit).
      `app/_layout.tsx`: a `Stack` with titled screens (Home, Phases, Phase detail, Assistant) and
      a `SafeAreaProvider`; set accessible header titles.
      `app/index.tsx` (Home): static hero copy stating the platform teaches HOW to think (not WHAT
      to think) and STRENGTHENS and NEVER REPLACES parents, teachers, doctors, and human
      relationships; a short note that it spans the lifelong journey 0→40+; a primary
      `Link`/button navigating to `/phases` (accessibilityRole="link"/"button").
      `app/phases/index.tsx` (Phases list): on mount call `getPhases()`; render a `FlatList` of the
      13 `CatalogEntry` items (title, ageLabel, primaryObjective), each a `Pressable` navigating to
      `/phases/{slug}`. Use `StateView` for loading/empty/error (never crash on `{ok:false}`).
      `app/phases/[idOrSlug].tsx` (Phase detail): read the param via `useLocalSearchParams`, call
      `getPhase(idOrSlug)` AND `getPhases()` (to compute previous/next by `order`), render
      `PhaseDetail`; `StateView` with a retry for the error/empty path; a 404/not-found path shows
      a friendly "phase not found" message.
      `app/assistant.tsx` (Assistant): a `TextInput` + submit that calls `askAssistant(question)`;
      render the grounded `answer` and `citations` (each citation shown with its `phaseId`); ALWAYS
      show static reassurance that health, safety, and wellbeing questions are routed to a human and
      professional help, and when `routedToHuman` is true surface that prominently. Optional bearer
      token is supported by the client but UI auth wiring is out of scope; if the API returns a 401
      the `StateView`/inline error explains the assistant needs sign-in without crashing.
      Files: `apps/mobile/app/_layout.tsx`, `apps/mobile/app/index.tsx`,
      `apps/mobile/app/phases/index.tsx`, `apps/mobile/app/phases/[idOrSlug].tsx`,
      `apps/mobile/app/assistant.tsx`
      Verify: `npm run typecheck -w @lhd/mobile` passes (and `test:mobile` still green).

- [ ] 11. Wire the root package.json ADDITIVELY and install.
      In root `package.json`, ADD `"test:mobile": "npm --workspace @lhd/mobile test"` and
      `"start:mobile": "npm --workspace @lhd/mobile run start"` to `scripts`. Do NOT remove or
      change any existing script; root `"test"` stays `npm run content:validate`. The `apps/*`
      workspace glob already includes `apps/mobile`, so no workspaces change is needed.
      Then run `npm install` from the repo root to hoist/link the new workspace.
      Files: root `package.json` (`d:\repos\Sample Projects\Evaluation of Human 0 to 100%\package.json`)
      Verify: `npm install` succeeds from repo root; `npm run content:validate` from root still
      passes (proves the existing gate is untouched).

- [ ] 12. Add an eslint config and lint the app.
      `.eslintrc.js`: `module.exports = { extends: 'expo', ignorePatterns:
      ['/dist', '/.expo', '/.expo-export-check'] }`.
      Files: `apps/mobile/.eslintrc.js`
      Verify: `npm run lint -w @lhd/mobile` reports no errors.

- [ ] 13. Run the full hard-gate verification pass and the soft Metro bundle check.
      Run, from repo root: `npm run typecheck -w @lhd/mobile`, `npm run lint -w @lhd/mobile`,
      and `npm run test:mobile`. All three MUST pass (hard gates). Then run the Metro bundle check
      `npm run bundle:check -w @lhd/mobile` (`expo export`). If it FAILS with an error mentioning
      `%`, `decodeURI`, or `URI malformed`, treat it as the known env limitation. Any other failure
      is real and must be fixed. Delete the generated `.expo-export-check/` afterward.
      Files: none (verification only)
      Verify: the three hard gates are green; bundle result recorded for step 14.

- [ ] 14. Write README.md and VERIFICATION.md.
      `README.md`: how to run (`npm run start:mobile`), the `EXPO_PUBLIC_API_BASE_URL` env var and
      its default `http://localhost:3001/api`, the Android-emulator note that localhost is reached
      as `http://10.0.2.2:3001/api`, and that tests use jest-expo (not Vitest) because of the `%`
      path. `VERIFICATION.md`: record the four checks (typecheck, lint, test:mobile, Metro bundle)
      with their outcomes exactly as observed in step 13, documenting the Metro `%`/decodeURI result
      as a known environment limitation if it tripped.
      Files: `apps/mobile/README.md`, `apps/mobile/VERIFICATION.md`
      Verify: both files exist and the recorded commands match the real scripts in
      `apps/mobile/package.json`.

## Gaps / assumptions

- The task says the review gate file is `apps/mobile/.agents/tasks/mobile-review.json`
  (jsonPath `verdict` == `APPROVED`). This plan does not restructure the workflow, so the
  existing implement→review loop drives it; the reviewer writes that gate file.
- Exact patch versions above are the known-compatible SDK 51 set; if `npm install` surfaces a
  peer-dependency conflict, prefer `npx expo install <pkg>` to let Expo pick the SDK-aligned
  version rather than hand-editing, keeping within SDK 51.
- Auth UI is intentionally out of scope (task says wiring auth into UI is optional); the client
  supports a bearer token for a future step.
```
