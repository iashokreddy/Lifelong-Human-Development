# @lhd/mobile — Lifelong Human Development (Expo)

The React Native + Expo (SDK 51, expo-router, TypeScript) mobile client for the
Lifelong Human Development platform.

## Philosophy

This app helps people learn **how to think, how to question, how to understand
the world, how to treat people, and how to create something valuable — not what
to think.** It **strengthens and never replaces** parents, teachers, doctors, or
human relationships. Health, safety, and wellbeing questions always route to a
real person and professional help.

## Screens

- **Home** — the lifelong journey (0 → 40+), the guiding philosophy, and the
  "supports, never replaces" commitment.
- **Phases** — the full catalogue from `GET /api/phases`, each navigating to a
  detail screen.
- **Phase detail** (`/phases/[idOrSlug]`) — every section of a phase: age range,
  primary objective, summary & guiding principle, development domains (readable
  labels), year plans, daily/weekly activities, parent/caregiver guidance,
  milestones, safety, outcomes, projects, app features, tappable sources, and
  previous/next navigation.
- **Assistant** — posts to `POST /api/ai/ask`, shows the grounded answer and its
  citations, and always makes the "health/safety questions go to a human"
  promise visible (and prominent when the API flags `routedToHuman`).

## Running

```bash
# from the repo root
npm install
npm run start:mobile      # expo start — then press a/i/w, or scan the QR code
```

Platform shortcuts (run inside `apps/mobile`):

```bash
npm run android
npm run ios
npm run web
```

## API configuration

The client talks to the NestJS API. The base URL comes from
`EXPO_PUBLIC_API_BASE_URL` and defaults to `http://localhost:3001/api`.

| Environment            | Value                                |
| ---------------------- | ------------------------------------ |
| iOS simulator / web    | `http://localhost:3001/api` (default) |
| Android emulator       | `http://10.0.2.2:3001/api`           |
| Physical device        | `http://<your-machine-LAN-IP>:3001/api` |

Android emulators cannot reach the host's `localhost`; they reach it as
`10.0.2.2`. Set the variable before starting Expo, e.g.:

```bash
# PowerShell
$env:EXPO_PUBLIC_API_BASE_URL = "http://10.0.2.2:3001/api"; npm run android
```

All API calls are non-throwing: a network failure or non-2xx response resolves
to a typed error result, and every screen renders a readable empty/error panel
instead of crashing when the API is unreachable.

## Scripts

| Script       | What it does                                  |
| ------------ | --------------------------------------------- |
| `start`      | `expo start`                                  |
| `android`    | `expo start --android`                        |
| `ios`        | `expo start --ios`                            |
| `web`        | `expo start --web`                            |
| `lint`       | `eslint .`                                    |
| `typecheck`  | `tsc --noEmit`                                |
| `test`       | `jest` (jest-expo preset)                     |
| `bundle:check` | `expo export --platform web` (Metro bundle) |

From the repo root: `npm run test:mobile` and `npm run start:mobile`.

## Why jest, not Vitest

The repository's absolute path ends in a literal `%`. Vite/Vitest call
`decodeURI` on the project root and throw `URIError: URI malformed` — the same
reason `apps/web` moved off Vitest onto Jest. Tests here use the `jest-expo`
preset (Babel-based), which is unaffected by the `%` path.

See `VERIFICATION.md` for the recorded verification runs and the monorepo
hoisting notes that shaped the jest and babel config.
