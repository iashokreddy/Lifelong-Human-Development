# Project Status

A snapshot of what exists today and how it maps to the original vision
(`My_Original_Input_Lifelong_Human_Development_App.md`).

## What is built and verified

### Curriculum content — all 13 life stages
Every life stage from the vision is authored as structured, schema-validated content and is
the single source of truth for both the apps and the PDFs.

| Phase | Age | Focus |
|-------|-----|-------|
| 01 | 0–3 | Attachment, safety, sensory exploration |
| 02 | 3–6 | Curiosity, communication, independence |
| 03 | 6–10 | Foundational reasoning, creativity |
| 04 | 10–12 | Critical thinking, responsibility |
| 05 | 12–15 | Identity, science, technology, ethics |
| 06 | 15–17 | Advanced learning, career discovery |
| 07 | 17–20 | Applied, higher-education-level knowledge |
| 08 | 20–24 | Expertise, research, professional skills |
| 09 | 24–28 | Innovation, entrepreneurship, leadership |
| 10 | 28–35 | Building, creating, contributing |
| 11 | 35–40 | Strategic thinking, mentorship |
| 12 | 40+ | Reinvention, wisdom, lifelong contribution |
| 13 | 40+ | Legacy, giving back, lifelong learning |

Each phase includes: development domains, year-wise plans (objectives + emerging
capabilities), daily/weekly practical activities, parent/caregiver guidance (early phases),
developmental-milestone awareness, safety, measurable outcomes, hands-on projects, app
features/user journeys, and real research citations (WHO, CDC, UNICEF, Harvard, OECD,
UNESCO).

- `npm run content:validate` → 13/13 phases valid.
- `npm run pdf:build` → one PDF per phase in `dist/pdf/`.

### Backend API — `apps/api` (NestJS modular monolith)
Content, auth, users, progress, and a curriculum-grounded AI assistant. Role-based access,
caregiver-mediated minor accounts, DPDP data-rights (export/delete), in-memory persistence by
default with Prisma/Postgres selectable by `DATABASE_URL`. 53 unit tests + e2e.
The AI guardrail routes health/safety/wellbeing questions to human/professional help and
answers curriculum questions grounded in the vetted content, with citations.

### Web app — `apps/web` (Next.js + TypeScript)
Home journey (0→40+), phase browser, full phase detail for every section, and the assistant
UI. Accessible, typed against the shared contract, graceful when the API is down. 21 tests.

### Mobile app — `apps/mobile` (React Native + Expo)
Home, phases list, full phase detail, and assistant — sharing the same API and `@lhd/shared`
types. 18 tests; typecheck and lint clean; Metro bundle verified.

## How the pieces fit

```
packages/content (13 phases, JSON + schema)  ── single source of truth
        │
        ├─► tools/pdf ─► dist/pdf (13 PDFs)
        └─► apps/api (serves phases) ─► apps/web  (Next.js)
                                      └─► apps/mobile (Expo)
   packages/shared ── types shared by api, web, and mobile
```

## The guiding principle, kept
The platform teaches **how to think, question, understand, treat people, and create value**
— and it **strengthens, never replaces** parents, teachers, doctors, or human relationships.
This is enforced in content, in UI copy, and structurally in the AI guardrail.

## Honest limitations and next steps
- The 13 phases are a solid, research-grounded **starting curriculum**. Domain experts
  (educators, paediatricians, child psychologists) should review and deepen each phase before
  real-world use. The platform is designed to support that human expertise, not substitute it.
- The AI assistant uses a deterministic offline retrieval stub behind a provider interface so
  it builds and runs without keys; wiring a real LLM provider is a drop-in.
- Persistence defaults to in-memory; provisioning PostgreSQL and running Prisma migrations is
  required for durable data.
- Infrastructure (AWS) and production hardening (secrets, real JWT secret, HTTPS, rate
  limiting, full security testing) are not yet provisioned.
- Workspace path note: the folder name ends in `%`, which breaks Vite/Vitest tooling; the repo
  uses Jest throughout as a result.
