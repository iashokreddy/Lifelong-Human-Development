# Implementation Plan — LHD Backend API (`apps/api`)

NestJS modular monolith. Node 24, npm 11, Windows/PowerShell. Monorepo: npm workspaces
(`packages/*`, `apps/*`, `tools/*`). This plan is grounded in the actual repo: the shared
contract in `packages/shared/src/index.ts`, the content loader pattern in
`tools/pdf/lib.mjs`, `packages/content/catalog.json` (13 phases, phases 01–03 on disk), and
`docs/architecture.md`.

## Design decisions (made here, not deferred)

- **Shared types: mirror, don't import.** `@lhd/shared` ships raw ESM `.ts` (`"type":
  "module"`, `main: src/index.ts`, no build). A `nest build` (tsc, CommonJS) cannot cleanly
  consume raw sibling TS without reshaping the whole toolchain, and we must not touch
  `packages/shared`. The task explicitly allows "Import/mirror these; do not redefine
  divergent shapes." Decision: copy the type declarations verbatim into
  `apps/api/src/shared/contract.ts` with a header comment naming the source of truth. A
  structural compile-time conformance check guards drift (see FEAT-002).
- **Content path resolution.** Resolve the content root the way `tools/pdf/lib.mjs` does:
  from a known anchor up to repo root, then `packages/content`. In the compiled app the
  anchor is `__dirname` under `apps/api/dist`; walk up to repo root. Make it override-able
  with `LHD_CONTENT_ROOT` env for tests/packaging. Load `catalog.json`, then every
  `entry.file` that exists on disk (skip unauthored), so phases 02..13 appear automatically
  as the other agent lands them. Never hardcode a phase list.
- **Persistence: repository abstraction, in-memory default.** Define repository interfaces
  (`UserRepository`, `CaregiverLinkRepository`, `ProgressRepository`). Provide an in-memory
  implementation used by default and in all tests. A Prisma/Postgres implementation is
  selected only when `DATABASE_URL` is set. `npm run build` and `npm test` never require a
  live DB. Prisma schema is defined and `prisma generate` is NOT part of build/test.
- **Auth: JWT, self-contained.** `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`,
  bcrypt for password hashing. A secret from `JWT_SECRET` env with a dev default. `Roles`
  decorator + `RolesGuard` reading `UserRole` off the validated JWT user. No external IdP.
- **Caregiver access enforcement: one choke point.** A single `CaregiverAccessService`
  (used by users + progress) answers "may actor A act on subject S?" — true if A is S, or A
  is an admin, or a `CaregiverLink(caregiverId=A, learnerId=S)` exists. Guards/services call
  only this; no ad-hoc checks scattered around.
- **AI: real retrieval over curriculum only + hard guardrail.** A keyword-overlap retriever
  (lowercase tokenise, stopword-strip, TF-style scoring) indexes text drawn ONLY from loaded
  phase JSON (summary, domains, year plans, activities, parent guidance, outcomes, projects).
  The answer is composed from retrieved passages with citations; no free generation. An
  `LlmProvider` interface sits behind it with a deterministic local stub (extractive
  summary of retrieved passages) so it builds/tests without network or keys; a real provider
  can be dropped in. A guardrail runs BEFORE retrieval: if the question matches
  health/safety/wellbeing intent, return fixed guidance to seek a human/professional and do
  not answer authoritatively.
- **Global prefix `api`.** `app.setGlobalPrefix('api')` so routes are `/api/phases` etc.

## File / directory layout under `apps/api`

```
apps/api/
  package.json            # @lhd/api; nest/jest/prisma deps; build & test scripts
  tsconfig.json           # CommonJS, decorators on, outDir dist
  tsconfig.build.json     # excludes tests
  nest-cli.json
  jest.config.js          # ts-jest, unit tests (*.spec.ts)
  jest-e2e.config.js      # e2e (*.e2e-spec.ts) via supertest
  .env.example
  README.md               # run instructions, env flags, DPDP notes
  prisma/schema.prisma     # User, CaregiverLink, ProgressRecord (+ enum roles/status)
  src/
    main.ts               # bootstrap, setGlobalPrefix('api')
    app.module.ts         # wires all feature modules
    shared/contract.ts    # mirrored @lhd/shared types (single source noted in header)
    shared/contract.conformance.spec.ts  # compile-time drift guard
    config/env.ts         # typed env access (DATABASE_URL, JWT_SECRET, LHD_CONTENT_ROOT)
    content/
      content.module.ts
      content.service.ts  # loads catalog + phases at startup; getAll/getByIdOrSlug
      content.controller.ts   # GET /api/phases, GET /api/phases/:idOrSlug (404)
      content.service.spec.ts
      content.controller.spec.ts
    auth/
      auth.module.ts auth.service.ts auth.controller.ts
      jwt.strategy.ts roles.decorator.ts roles.guard.ts jwt-auth.guard.ts
      current-user.decorator.ts
      roles.guard.spec.ts auth.service.spec.ts
    users/
      users.module.ts users.service.ts users.controller.ts
      caregiver-access.service.ts
      dto/*.ts
      users.service.spec.ts caregiver-access.service.spec.ts
      data-rights.controller.ts    # export + delete a user's data (DPDP)
    progress/
      progress.module.ts progress.service.ts progress.controller.ts
      progress.service.spec.ts
    ai/
      ai.module.ts ai.controller.ts ai.service.ts
      retriever.ts llm-provider.interface.ts stub-llm.provider.ts guardrail.ts
      guardrail.spec.ts retriever.spec.ts ai.service.spec.ts
    persistence/
      persistence.module.ts
      repositories.ts        # interfaces + DI tokens
      in-memory/*.ts         # default impls
      prisma/*.ts            # prisma impls, provided only when DATABASE_URL set
      prisma.service.ts
    test/
      app.e2e-spec.ts        # boots Nest, GET /api/phases returns phase-01
```

## Ordered items

- [ ] 1. Scaffold `apps/api`: package.json (`@lhd/api`, NestJS 11, ts-jest, supertest,
      bcrypt, jwt/passport, prisma/@prisma/client as deps), tsconfig(.build).json,
      nest-cli.json, jest configs, `.env.example`, `src/main.ts` (global prefix `api`),
      `src/app.module.ts` (empty wiring), `src/config/env.ts`. Add root `package.json`
      scripts (ADD only): `test:api`, and make `dev` able to start the api. Run
      `npm install` at root so the workspace links.
      Files: all scaffold files above; root `package.json` (add scripts only).
      Verify: from `apps/api`, `npm run build` succeeds (empty app compiles); `npm test`
      runs Jest with 0 failures (a trivial placeholder spec may exist).

- [ ] 2. Mirror shared contract into `src/shared/contract.ts` verbatim from
      `packages/shared/src/index.ts` with a header naming the source of truth. Add
      `contract.conformance.spec.ts` that type-asserts key shapes (`Phase`, `Catalog`,
      `CatalogEntry`, `UserRole`, `ProgressRecord`) compile against sample literals.
      Files: `src/shared/contract.ts`, `src/shared/contract.conformance.spec.ts`.
      Verify: `npm run build` and `npm test` pass from `apps/api`.

- [ ] 3. Content module: `content.service.ts` resolves content root (repo-relative, env
      override `LHD_CONTENT_ROOT`), loads `catalog.json` + each existing `entry.file`,
      defensively validates each against the `Phase` shape (required keys present, arrays
      are arrays) and logs+skips malformed ones. `getAll()` returns catalog entries;
      `getByIdOrSlug()` returns the full phase or null. `content.controller.ts`: `GET
      /api/phases`, `GET /api/phases/:idOrSlug` (404 via NotFoundException).
      Files: `src/content/*`, specs.
      Verify: `npm test` — content.service.spec (loads phase-01, skips unauthored) and
      content.controller.spec (list + fetch + 404) pass; `npm run build` passes.

- [ ] 4. Persistence layer: repository interfaces + DI tokens in `repositories.ts`,
      in-memory implementations, `persistence.module.ts` that provides in-memory by default
      and Prisma impls only when `DATABASE_URL` is set. Add `prisma/schema.prisma` (User,
      CaregiverLink, ProgressRecord, role/status enums). Prisma generate is NOT wired into
      build/test.
      Files: `src/persistence/*`, `prisma/schema.prisma`.
      Verify: `npm run build` passes with no `DATABASE_URL`; `npm test` passes using
      in-memory repos.

- [ ] 5. Auth module: register/login with bcrypt, issue JWT (`@nestjs/jwt`), `JwtStrategy`
      validating token → user with `UserRole`, `JwtAuthGuard`, `@Roles()` decorator +
      `RolesGuard`, `@CurrentUser()` decorator.
      Files: `src/auth/*`, specs.
      Verify: `npm test` — roles.guard.spec (allows matching role, denies missing role) and
      auth.service.spec (hash/verify, bad creds rejected) pass; `npm run build` passes.

- [ ] 6. Users module + caregiver access: `caregiver-access.service.ts` is the single
      enforcement point (self OR admin OR existing CaregiverLink). `users.service.ts`
      profiles + link/unlink; `users.controller.ts` guarded by JWT+roles; minor accounts are
      caregiver-mediated. `data-rights.controller.ts`: export + delete a user's data (self or
      linked caregiver or admin), reflecting DPDP 2025 data minimisation.
      Files: `src/users/*`, specs.
      Verify: `npm test` — caregiver-access.service.spec (linked caregiver allowed, unlinked
      denied, admin allowed, self allowed) and users.service.spec pass; `npm run build`
      passes.

- [ ] 7. Progress module: `progress.service.ts` read/write `ProgressRecord` keyed by
      userId+phaseId+itemKey, status not-started|in-progress|completed; every read/write goes
      through `CaregiverAccessService`. `progress.controller.ts` JWT-guarded.
      Files: `src/progress/*`, specs.
      Verify: `npm test` — progress.service.spec (owner read/write ok; caregiver of linked
      learner ok; unrelated user denied) passes; `npm run build` passes.

- [ ] 8. AI module: `guardrail.ts` (health/safety/wellbeing intent → professional-help
      response), `retriever.ts` (keyword retrieval over loaded phase content only),
      `llm-provider.interface.ts` + `stub-llm.provider.ts` (deterministic extractive answer),
      `ai.service.ts` (guardrail → retrieve → compose grounded answer with citations),
      `ai.controller.ts` (`POST /api/ai/ask`, JWT-guarded).
      Files: `src/ai/*`, specs.
      Verify: `npm test` — guardrail.spec (a health question routes to human/professional
      help, no authoritative advice), retriever.spec (returns relevant phase passages),
      ai.service.spec (answer grounded in retrieved content) pass; `npm run build` passes.

- [ ] 9. E2E smoke + finalize: `src/test/app.e2e-spec.ts` boots the Nest app and asserts
      `GET /api/phases` returns phase-01. Write `README.md` (run/build/test, env flags,
      in-memory vs Prisma, DPDP notes). Run the full build + unit + e2e suite and the root
      content gate. Write `apps/api/.agents/tasks/review.json` only via the review loop.
      Files: `src/test/app.e2e-spec.ts`, `README.md`.
      Verify: from `apps/api`, `npm run build` passes; `npm test` passes; `npm run test:e2e`
      boots the app and `GET /api/phases` returns an entry whose id is `phase-01`; from repo
      root `npm run content:validate` still passes.

## Verification summary (must all hold)

From `apps/api`: `npm run build` (no TS errors) and `npm test` (Jest) pass, covering:
content loading + both phase endpoints; roles guard deny/allow; caregiver-only-linked-learner
access; progress read/write ownership; AI guardrail routing a health question to
human/professional help; plus a supertest e2e that boots Nest and hits `GET /api/phases`
returning phase-01. From repo root, `npm run content:validate` remains green.
