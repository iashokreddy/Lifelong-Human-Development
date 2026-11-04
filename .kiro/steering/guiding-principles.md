# Guiding principles (always apply)

This project builds a platform that supports whole-person development across the entire human
lifespan. Every change, in content or code, must honour these principles.

## The philosophy

Teach people **how to think, how to question, how to understand the world, how to treat
people, and how to create something valuable** — not what to think. Build a torch-bearer, not
a follower.

## Non-negotiable product rule

The platform **strengthens and never replaces** parents, teachers, doctors, or human
relationships. No feature, AI response, or piece of content may position itself as a
substitute for professional care or a caregiver's judgement. Health, safety, and wellbeing
questions route to human and professional help.

## Content rules

- The curriculum lives in `packages/content` as JSON validated against
  `packages/content/schema/phase.schema.json`. It is the single source of truth.
- Apps read this content; PDFs are generated from it (`tools/pdf`). Never duplicate
  curriculum text in application code.
- Every phase cites real research in its `sources`. Prefer WHO, CDC, UNICEF, Harvard Center
  on the Developing Child, and official government guidance. Do not invent citations.
- Learning is **practical and hands-on**, integrated into everyday life — not textbook,
  exam, or certificate driven.
- Age ranges are indicative guides, not rigid limits.

## Engineering rules

- **Modular monolith** (NestJS), not microservices.
- Shared types in `packages/shared` are the contract across API, web, and mobile.
- **Child-data protection is structural:** data minimisation, caregiver-mediated minor
  accounts, role-based access, no behavioural ad profiling, exportable/deletable data.
  Align with India DPDP Rules 2025.
- Verify changes: run `npm run content:validate`, builds, and tests before claiming done.
