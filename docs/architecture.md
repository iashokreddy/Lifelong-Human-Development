# Architecture

## Principles

1. **Modular monolith first.** A single deployable NestJS backend with clear internal
   module boundaries (auth, users, content, progress, ai). Split into services only if and
   when scale demands it — not before.
2. **Content is data.** The curriculum lives in `packages/content` as JSON validated against
   a shared schema. It is the single source of truth: apps read it, PDFs are generated from
   it. No curriculum text is duplicated in code.
3. **Shared contract.** `packages/shared` holds the TypeScript types that mirror the content
   schema and the API contract, imported by API, web, and mobile.
4. **Safety by design.** Minimal data collection, role-based access, and child-data
   protection are structural, not add-ons.

## Component map

```
packages/content ──► packages/shared (types) ──► apps/api ──► apps/web
        │                                            │            └─► apps/mobile
        └──────────────► tools/pdf ──► dist/pdf      └─► PostgreSQL
```

## Backend (apps/api — NestJS modular monolith)

Modules:
- **content** — loads and serves phases from `packages/content`; read-only.
- **auth** — identity, sessions, role-based access (learner / parent / guardian / educator / admin).
- **users** — profiles and the learner↔caregiver relationship.
- **progress** — per-user progress against phase outcomes, projects, and activities.
- **ai** — RAG over the reviewed knowledge base (the curriculum content itself), so answers
  are grounded in vetted material rather than open-ended generation. Guardrails enforce the
  "support, never replace" principle.

Database: PostgreSQL. ORM: chosen by the API implementation step (Prisma recommended).

## Web (apps/web — Next.js + TypeScript)

- Journey browser across the 13 phases.
- Per-phase views: domains, year plans, activities, milestones, safety, outcomes, projects.
- Parent/caregiver guidance surfaced for early phases.
- Progress tracking for signed-in users.

## Mobile (apps/mobile — React Native + Expo)

Shares `packages/shared` types and the same API. Implements the core journeys (phases,
activities, progress).

## AI and the "support, never replace" rule

The AI assistant is **retrieval-augmented over the vetted curriculum**. It explains,
suggests activities, and points to guidance — it does not diagnose, prescribe, or stand in
for a parent, teacher, or doctor. Any health, safety, or wellbeing question is routed to the
human-relationship and professional-help guidance, never answered as authoritative advice.

## Testing

- **Unit / integration:** Jest (API and shared logic).
- **Content:** schema validation gate (`npm run content:validate`).
- **E2E:** Playwright (web critical journeys).
- **Security:** automated dependency and basic auth-flow checks.
