# @lhd/mobile — React Native + Expo app for the Lifelong Human Development platform

A new Expo (SDK 51) + expo-router app under `apps/mobile` that gives the platform a
mobile face: a Home screen carrying the guiding philosophy, a scrollable Phases list fed
by `GET /api/phases`, a full Phase-detail screen rendering every section of a `Phase`, and
a grounded Assistant that posts to `/api/ai/ask`. Data types come from `@lhd/shared`; the
API client is a typed, never-throwing `Result` client mirroring the web app. The change is
confined to `apps/mobile` plus two additive root scripts, and the verification evidence
(typecheck, lint, 18 Jest tests, Metro bundle) is recorded in `VERIFICATION.md`.

Watch for: nothing blocking. A few low-severity observations — string-fragment detection of
HTTP 401/404 in the screens (`possible`), a dead `?? key` fallback branch in
`labelForDomain` (`confirmed`, cosmetic), and a locally-defined `AskResult` type that is not
in `@lhd/shared` (`confirmed`, justified). None gate shipping.

**Verdict**: APPROVED

## High-level view

The guiding philosophy is present where the task demands it. Home states "teach how to
think, not what to think" and "strengthens and never replaces parents, teachers, doctors, or
human relationships," and the Assistant screen repeats the "supports you, never replaces" /
"health, safety, and wellbeing route to a real person" promise both as a standing banner and
as a `routedToHuman` alert when the API flags a question. This satisfies the non-negotiable
product rule.

The contract is shared, not duplicated. Every screen and component imports `Phase`,
`CatalogEntry`, `Source`, `Activity`, `UserRole` etc. from `@lhd/shared`, and `packages/shared`
is untouched in the diff. The only locally-defined response shape is `AskResult`, which
mirrors the API's AI service and is deliberately kept out of the cross-app import path.

The API client is the web app's `Result` pattern faithfully ported: `EXPO_PUBLIC_API_BASE_URL`
with a `http://localhost:3001/api` default, optional bearer header, and a `request()` helper
that converts both network rejections and non-2xx responses into `{ ok: false, error }` so
nothing throws into the UI. `domain-labels.ts` maps all 15 keys and title-cases unknown keys.

The Phase-detail screen renders every section the task enumerates — age range, objective,
summary, guiding principle, development domains with readable labels, year plans
(objectives + capabilities), daily/weekly activities, parent/caregiver guidance (conditional),
milestones with the "indicative guides" note, safety, outcomes, projects, app features, and
sources as tappable links — plus previous/next navigation derived from catalog order. Empty,
loading, error, and not-found states are handled by a shared `StateView` and a dedicated
not-found panel, so an unreachable API degrades gracefully instead of crashing.

Verification is recorded and credible: typecheck 0 errors, lint clean, 5 suites / 18 tests
passing, and the Metro `expo export` bundle passing (the `%`-path/decodeURI limitation is
documented as not affecting the Metro bundle, with the SPA-vs-static-render nuance explained
honestly rather than hand-waved). Scope is clean — only `apps/mobile` and additive root
scripts changed, and the root `test` script still equals `content:validate`.

<details>
<summary>Issues (3)</summary>

1. **HTTP-status detection via string match** — `assistant.tsx` and `[idOrSlug].tsx` detect
   401/404 with `error.includes('401')` / `includes('404')`. Works because the client embeds
   the status in the message, but it is coupled to that message format. Consider threading the
   numeric status through the `Result` error so the UI branches on a field, not a substring.
   (possible, non-blocking)
2. **Dead fallback branch** — `labelForDomain` ends in `titleCase(key) ?? key`; `titleCase`
   never returns nullish, so `?? key` is unreachable. Cosmetic; drop it for clarity.
   (confirmed, non-blocking)
3. **`AskResult` defined outside the shared contract** — the AI response shape lives in
   `src/lib/api.ts` rather than `@lhd/shared`. Justified today (it mirrors the API service and
   avoids a cross-app import), but if web and mobile both need it, promoting it to
   `@lhd/shared` would prevent drift. (confirmed, informational)

</details>

<details>
<summary>Details</summary>

### Guiding philosophy and the "supports, never replaces" promise

Home (`app/index.tsx`) leads with "Grow a torch-bearer, not a follower" and a philosophy card
that says the platform helps people "learn how to think, how to question, how to understand
the world, how to treat people, and how to create something valuable — not what to think." A
second card, "Supports, never replaces," states the platform "strengthens and never replaces
parents, teachers, doctors, or human relationships" and that "health, safety, and wellbeing
questions always route to a real person and professional help." Both the philosophy and the
product rule are visible on the first screen, as required.

The Assistant (`app/assistant.tsx`) carries the same commitment as a standing reassurance
banner above the input ("it never replaces parents, teachers, or doctors… routed to a real
person and professional help"), and when the API returns `routedToHuman: true` it renders an
`accessibilityRole="alert"` panel telling the user the question is best answered by a trusted
person or professional. The reassurance is present whether or not a question has been asked,
so the promise is not conditional on the backend flag — a good failure-safe design.

### Shared contract, no duplication

`PhaseDetail.tsx`, both phase screens, `SourceLink.tsx`, and `api.ts` all import their data
types from `@lhd/shared` (`Phase`, `CatalogEntry`, `Source`, `Activity`, `UserRole`). The
field access in `PhaseDetail` (`phase.ageRange.label`, `developmentDomains[].domain/focus`,
`yearPlans[].objectives/capabilities`, `activities.daily/weekly`, `parentGuidance`,
`milestones[].typicalBy`, `safety`, `outcomes`, `projects[].skillsPractised`,
`appFeatures[].audience`, `sources`, `guidingPrinciple`) lines up exactly with the interfaces
in `packages/shared/src/index.ts`, which is why the typecheck is green. `packages/shared` does
not appear in the diff.

The sole locally-defined shape is `AskResult` (`answer`, `routedToHuman`, `citations[]`) in
`api.ts`, documented as mirroring the API's `ai.service.ts`. This is a reasonable call — it is
not a `Phase`-family type and promoting it to shared is optional — but it is the one place
where a future divergence between API and mobile could go unnoticed.

### Non-throwing API client

`src/lib/api.ts` reads `process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api'`
and routes every call through a single `request<T>()` helper. A non-ok response resolves to
`{ ok: false, error: 'Request to … failed with status N' }`; a rejected fetch resolves to
`{ ok: false, error }`. The embedded status string in the error message is what the screens
later pattern-match against (see below). `askAssistant` adds the bearer header only when a
token is supplied.

The api test suite covers the behavioral contract: correct URLs for `/phases`,
`/phases/:idOrSlug`, and `/ai/ask`; bearer header present with a token and absent without one;
`{ question }` body; the default base URL; and `{ ok: false }` (never a throw) on both a
rejected fetch and a 503.

### Phase detail renders every section

`PhaseDetail.tsx` renders the full `Phase`: header (age range, title, objective), Overview
(summary + optional guiding principle), Development domains (each mapped through
`labelForDomain` so the UI shows "Physical & motor", not `physical-and-motor`), Year plans
(objectives and capabilities), Activities (daily and weekly, each section rendered only when
present), Parent & caregiver guidance (conditional on the optional field), Milestones (with
the "Age ranges are indicative guides, not rigid limits" note honoring the content rule),
Safety, Learning outcomes, Projects (with skills practised), How the platform helps
(app features), and Sources as tappable `SourceLink`s. Previous/next navigation is rendered
when neighbors exist.

`[idOrSlug].tsx` loads the phase and the catalog in parallel, computes `previous`/`next` from
catalog order by matching `entry.id === phase.id`, and shows a dedicated "Phase not found"
panel on a 404 and the shared `StateView` otherwise. The `PhaseDetail.test.tsx` render test
asserts the title, overview, a readable domain label (and the *absence* of the raw kebab key),
a year-plan objective, a daily activity, a parent-guidance topic, a milestone plus the
indicative-guides note, a safety topic, an outcome, a project, an app feature, and a source
title — plus the next-phase nav label. That is a genuine major-sections assertion, not a
smoke render.

The `[idOrSlug]` 404 branch and the Assistant 401 branch both rely on `error.includes('404')`
/ `includes('401')` against the client's error string (see the API-client and states sections).

### Graceful empty / error / not-found states

`StateView.tsx` centralizes loading, error (with a retry button and a "check the API is
running" hint), and empty rendering, returning `null` when there is nothing to report so the
caller shows real content. The phases list shows it when loading, on error, or when the list
is empty; the detail screen shows it for loading/error/empty and a separate not-found panel
for a missing id/slug. Because the client never throws, an unreachable API surfaces as the
error state rather than a crash. `StateView.test.tsx` exercises error/empty/loading/retry.

The two screens detect specific HTTP statuses with `error.includes('401')` and
`includes('404')`. It works because `request()` embeds the status in the message, but it
couples the UI to that string format; a numeric status on the `Result` error would be sturdier.
Low severity and non-blocking.

### Accessibility

Interactive elements carry roles and labels throughout: Home links use `accessibilityRole="link"`
with descriptive labels; the Assistant input has `accessibilityLabel`, the Ask button has a
role, label, and `accessibilityState.disabled`, and the routed-to-human panel is an
`accessibilityRole="alert"`; list cards describe the phase and age; `SourceLink` announces
"Open source: …"; pager links announce previous/next with the target title; headers use
`accessibilityRole="header"`. Text sizes come from a shared `typography` scale and colors from
a `colors` theme, which keeps sizing and contrast consistent. Full contrast-ratio and
assistive-technology validation still needs manual testing, but the structural affordances are
in place.

### Verification evidence and the `%`-path limitation

`VERIFICATION.md` records typecheck (0 errors), lint (clean, with a non-fatal note that the
hoisted TypeScript version is newer than `@typescript-eslint` supports), and `test:mobile`
(5 suites, 18 tests passing), and explains the unusual jest-preset/babel/eslint pinning as
monorepo-hoisting fixes kept inside `apps/mobile`. The Metro bundle check (`expo export
--platform web`) is recorded as PASS with the honest nuance that the `%`/decodeURI path issue
does *not* block the Metro bundle (it affected Vitest, which is why the repo uses Jest), and
that `web.output: single` exercises the full bundle while `static` would hit the same
nested-vs-hoisted resolution issue in the Node static-render step. This is documented rather
than silently skipped or falsely claimed, which is what the task asked for. The recorded
evidence is internally consistent with the code read above; no spot-check re-run was warranted.

### Scope

The diff touches only `apps/mobile/**` plus two additive root `package.json` scripts
(`test:mobile`, `start:mobile`) and the resulting `package-lock.json` churn. The root `test`
script still equals `content:validate`. `packages/content`, `packages/shared`, `tools/`,
`apps/api`, and `apps/web` are untouched (confirmed by an empty `git diff` over those paths).

</details>

<details>
<summary>File map</summary>

- `app/_layout.tsx` — expo-router stack layout.
- `app/index.tsx` — Home: journey, philosophy, "supports never replaces", nav links.
- `app/phases/index.tsx` — Phases list from `GET /api/phases` with empty/error/loading states.
- `app/phases/[idOrSlug].tsx` — Phase detail loader; parallel phase+catalog fetch, prev/next, not-found.
- `app/assistant.tsx` — Assistant: posts to `/api/ai/ask`, answer + citations, routed-to-human reassurance.
- `src/lib/api.ts` — typed non-throwing `Result` client; `EXPO_PUBLIC_API_BASE_URL`; bearer token.
- `src/lib/domain-labels.ts` — 15 domain-key → label map + title-case fallback.
- `src/components/PhaseDetail.tsx` — renders every Phase section + prev/next.
- `src/components/{Card,Section,Bullets,SourceLink,StateView}.tsx` — presentational + state helpers.
- `src/theme/{colors,typography}.ts` — shared color and type scales.
- `src/**/__tests__/*` — api, domain-labels, PhaseDetail, StateView, smoke tests.
- `jest-preset.js`, `jest.config.js`, `jest.setup.ts`, `babel.config.js`, `metro.config.js`,
  `app.json`, `tsconfig.json`, `.eslintrc.js`, `env.d.ts` — SDK-51-pinned tooling/config.
- `README.md`, `VERIFICATION.md`, `.agents/tasks/mobile-plan.md` — docs and recorded evidence.
- root `package.json` — additive `test:mobile` / `start:mobile`; `test` still `content:validate`.

Full diff: `git diff 43a3144^ 43a3144`.

</details>
