# Lifelong Human Development Platform

A platform that supports a person's whole-life development — from birth (age 0) through
adulthood and beyond — focused on **practical, hands-on learning** and **whole-person
growth**, not certificates or rote academics.

> The goal is not merely to educate a person. The goal is to help a person become capable
> of learning, living, creating and contributing throughout their entire life.

## Guiding philosophy

Build something that teaches people **how to think, how to question, how to understand the
world, how to treat people, and how to create something valuable** — not what to think.

**The platform never replaces parents, teachers, doctors or human relationships. It
strengthens them.**

## What this repository contains

```
.
├── docs/                     Vision, architecture, and research notes
├── packages/
│   ├── content/              The curriculum: 13 life-stage phases as structured data
│   │   ├── schema/           JSON Schema for all curriculum content
│   │   ├── phases/           One folder per phase (phase-01 … phase-13)
│   │   └── catalog.json      Index of all phases
│   └── shared/               Shared TypeScript types used by web, mobile, and API
├── apps/
│   ├── api/                  NestJS backend (modular monolith) + PostgreSQL
│   ├── web/                  Next.js + TypeScript web application
│   └── mobile/               React Native + Expo mobile application
├── tools/
│   └── pdf/                  Generates a PDF per phase from the structured content
└── dist/pdf/                 Generated phase PDFs (build output)
```

## The 13 life stages

| Phase | Age range | Primary objective |
|-------|-----------|-------------------|
| 01 | 0–3 | Attachment, safety, sensory exploration |
| 02 | 3–6 | Curiosity, communication, independence |
| 03 | 6–10 | Foundational knowledge, reasoning, creativity |
| 04 | 10–12 | Critical thinking, responsibility |
| 05 | 12–15 | Identity, science, technology, ethics |
| 06 | 15–17 | Advanced learning, career discovery |
| 07 | 17–20 | Higher-education-level practical knowledge |
| 08 | 20–24 | Expertise, research, professional skills |
| 09 | 24–28 | Innovation, entrepreneurship, leadership |
| 10 | 28–35 | Building, creating, contributing |
| 11 | 35–40 | Strategic thinking, mentorship |
| 12 | 40+ | Reinvention, wisdom, lifelong contribution |
| 13 | 40+ (cont.) | Legacy, giving back, lifelong learning |

> Age ranges are indicative, not rigid. The structure follows the person's development and
> life journey, not formal education milestones.

## Technology stack

- **Web:** Next.js + TypeScript
- **Mobile:** React Native + Expo
- **Backend:** NestJS (modular monolith — not microservices, deliberately)
- **Database:** PostgreSQL
- **AI:** LLM integration with a reviewed knowledge base and retrieval-augmented generation (RAG)
- **Infrastructure:** AWS
- **Auth:** Secure identity + role-based access (learner / parent / guardian / educator)
- **Testing:** Jest, Playwright, automated security testing

## Content-as-data

The curriculum lives in `packages/content` as structured JSON validated against a shared
schema. This content is the single source of truth: the **apps consume it directly** and
the **PDFs are generated from it**. There is no duplicated curriculum text.

## Getting started

```bash
npm install
npm run content:validate   # validate all phase content against the schema
npm run pdf:build          # generate a PDF per phase into dist/pdf
npm run dev                # run web + api together
npm test                   # run all tests
```

## Safety and child protection

This platform handles data about children. It is designed to comply with child-data
protection requirements (e.g. India's DPDP Rules 2025) and to minimise data collection.
See `docs/privacy-and-child-protection.md`.
