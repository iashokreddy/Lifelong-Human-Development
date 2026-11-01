# @lhd/api — Lifelong Human Development backend

A NestJS **modular monolith** that serves the Lifelong Human Development
platform. It loads the vetted curriculum (from `packages/content`), manages
identity and access, tracks ownership-scoped learner progress, and answers
questions with a curriculum-grounded AI assistant that **supports, never
replaces**, parents, teachers, and doctors.

Modules: `content`, `auth`, `users`, `progress`, `ai`, with a shared
`persistence` layer.

## Requirements

- Node 24+
- npm (run from the repo root workspaces, or from `apps/api`)

Builds and tests require **no database and no network/API keys**.

## Build

```bash
cd apps/api
npm run build        # nest build (tsc -> dist/)
```

## Test

```bash
cd apps/api
npm test             # unit specs (*.spec.ts under src/)
npm run test:e2e     # e2e smoke (boots Nest, GET /api/phases)
```

The e2e smoke boots the whole app via `@nestjs/testing` + supertest and asserts
`GET /api/phases` returns an entry with id `phase-01`.

From the repo root, the content gate still applies:

```bash
npm run content:validate   # validates packages/content against the schema
```

## Run

```bash
cd apps/api
npm run build && npm start   # production: node dist/main.js
npm run start:dev            # watch mode
```

The API mounts every route under the global `api` prefix (e.g.
`GET /api/phases`).

## Environment flags

| Variable            | Default                         | Purpose                                                                 |
| ------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| `PORT`              | `3001`                          | HTTP port.                                                              |
| `DATABASE_URL`      | _unset_                         | **Unset selects the in-memory repositories.** Set it to use Prisma/Postgres. |
| `JWT_SECRET`        | dev-only insecure default       | Secret for signing/verifying JWTs. **Set a real secret in any deployment.** |
| `LHD_CONTENT_ROOT`  | resolved `packages/content`     | Override the curriculum content root.                                   |

### In-memory vs Prisma persistence

Persistence is chosen at startup by `DATABASE_URL`:

- **Unset** → in-memory repositories. This is what builds, unit tests, and the
  e2e smoke use, so nothing external is needed.
- **Set** → the Prisma/Postgres implementation. Generate the client with
  `prisma generate` (from `apps/api`) before running against a real database.
  Prisma generation is intentionally **not** part of build or test.

## Child-data protection & India DPDP Rules 2025

Child-data protection is structural, not bolted on. The API aligns with the
India DPDP Rules 2025:

- **Data minimisation** — minor accounts store only what is needed; no
  behavioural or advertising profiling is collected.
- **Caregiver-mediated minor accounts** — a minor account can only be created by
  a caregiver actor (parent/guardian/educator/admin) and is auto-linked to that
  caregiver.
- **Role-based access on every read/write** — every route that touches another
  user's data is authorised through the single `CaregiverAccessService` choke
  point (self, a linked caregiver, or admin). There are no ad-hoc checks.
- **Exportable and deletable data** — `GET /api/users/:id/export` returns a
  user's profile and progress as a JSON bundle; `DELETE /api/users/:id` erases
  the user, their caregiver links, and their progress. Both are authorised
  through the same choke point.

## AI assistant — support, never replace

The `ai` module answers questions **only** from the vetted curriculum:

- **Guardrail first.** Every question runs through a health/safety/wellbeing
  guardrail before anything else. Matching questions (symptoms, illness, injury,
  medication, mental health, self-harm, emergencies, abuse, etc.) are routed to a
  parent/teacher/doctor or professional/emergency help. The assistant never
  diagnoses, prescribes, or gives authoritative medical advice.
- **Grounded retrieval.** A real keyword retriever indexes passages extracted
  from the loaded phases (summaries, domain focuses, year-plan
  objectives/capabilities, activities, parent guidance, outcomes, projects) and
  returns the most relevant passages with citations.
- **Swappable LLM behind an interface.** Generation goes through the
  `LlmProvider` interface (token `LLM_PROVIDER`). The default is a deterministic
  local stub that composes an extractive answer from the retrieved passages — no
  network, no keys, no randomness — so builds and tests are self-contained. A
  real provider can be dropped in by swapping the binding.

`POST /api/ai/ask` is JWT-protected and returns the answer, whether it was routed
to human help, and the source citations.
