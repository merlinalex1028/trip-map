---
phase: 12-canonical
plan: 02
subsystem: api
tags: [nest, fastify, canonical-resolve, e2e, vitest]
requires:
  - phase: 12-canonical
    provides: canonical place taxonomy, resolve unions, shared fixtures/contracts
provides:
  - authoritative /places/resolve and /places/confirm endpoints in apps/server
  - fixture-backed canonical catalog with resolved, ambiguous, and failed branches
  - server e2e regression covering canonical resolve and candidate confirmation
affects: [12-canonical, apps/web, records]
tech-stack:
  added: []
  patterns: [nest validation dto, fixture-backed authoritative resolver, inject-based fastify e2e]
key-files:
  created:
    - apps/server/src/modules/canonical-places/canonical-places.module.ts
    - apps/server/src/modules/canonical-places/canonical-places.controller.ts
    - apps/server/src/modules/canonical-places/canonical-places.service.ts
    - apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts
    - apps/server/src/modules/canonical-places/dto/confirm-canonical-place.dto.ts
    - apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts
    - apps/server/test/canonical-resolve.e2e-spec.ts
  modified:
    - apps/server/src/app.module.ts
    - apps/server/src/modules/records/dto/create-smoke-record.dto.ts
    - apps/server/src/modules/records/records.service.ts
key-decisions:
  - "Phase 12 server resolve stays fixture-backed inside apps/server so Phase 13 can swap the data source without changing HTTP contracts."
  - "/places/confirm always replays the same click against the authoritative candidate set and rejects out-of-set candidatePlaceId with CANDIDATE_MISMATCH."
patterns-established:
  - "Canonical resolve endpoints use per-route ValidationPipe DTOs that mirror @trip-map/contracts field names exactly."
  - "Server e2e uses createApp() plus app.inject() to validate resolved, ambiguous, failed, and confirm branches without starting an external server."
requirements-completed: [ARC-02, PLC-01, PLC-02, PLC-04]
duration: 10 min
completed: 2026-03-30
---

# Phase 12 Plan 02: Canonical Server Resolve Summary

**Nest authoritative canonical resolve/confirm endpoints with fixture-backed candidate ranking and e2e-locked resolved, ambiguous, and failed semantics**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-30T09:54:00Z
- **Completed:** 2026-03-30T10:03:58Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added `CanonicalPlacesModule` and wired `/places/resolve` plus `/places/confirm` into `apps/server`.
- Implemented a temporary authoritative fixture catalog covering Beijing, Hong Kong, Aba, California, and an ambiguous Jing-Jin-Ji candidate set capped at 3 options.
- Locked the HTTP boundary with e2e coverage for resolved, ambiguous, strict failed, legal confirm, and `CANDIDATE_MISMATCH` behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: 搭建 authoritative canonical resolve 模块与临时 resolver catalog** - `f0f1739` (feat)
2. **Task 2: 用 e2e 锁定 resolved / ambiguous / failed 行为** - `75b2af1` (test)

## Files Created/Modified

- `apps/server/src/app.module.ts` - imports `CanonicalPlacesModule` into the Nest app.
- `apps/server/src/modules/canonical-places/canonical-places.module.ts` - registers the canonical places controller and service.
- `apps/server/src/modules/canonical-places/canonical-places.controller.ts` - exposes `POST /places/resolve` and `POST /places/confirm` with DTO validation.
- `apps/server/src/modules/canonical-places/canonical-places.service.ts` - maps authoritative fixture clicks to resolved, ambiguous, and failed responses.
- `apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts` - validates `lat` and `lng`.
- `apps/server/src/modules/canonical-places/dto/confirm-canonical-place.dto.ts` - validates `lat`, `lng`, and `candidatePlaceId`.
- `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` - defines the temporary canonical place catalog and resolve scenarios.
- `apps/server/test/canonical-resolve.e2e-spec.ts` - covers canonical resolve and confirm regression scenarios.
- `apps/server/src/modules/records/dto/create-smoke-record.dto.ts` - aligns the smoke DTO with Phase 12 canonical summary fields.
- `apps/server/src/modules/records/records.service.ts` - returns the full canonical summary payload required by the updated contracts.

## Decisions Made

- Kept authoritative resolve logic fixture-backed and fully server-local instead of pulling in Phase 13 geometry manifests early.
- Treated `/places/confirm` as a re-validation step over the same click, so only current authoritative candidates can be confirmed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Rebuilt stale @trip-map/contracts dist exports before server typecheck**
- **Found during:** Task 1 (搭建 authoritative canonical resolve 模块与临时 resolver catalog)
- **Issue:** `apps/server` typecheck still consumed a stale `@trip-map/contracts` dist that did not export the new Phase 12 resolve types.
- **Fix:** Rebuilt `packages/contracts` locally so server type imports matched the already-shipped Phase 12 source contracts.
- **Files modified:** none tracked
- **Verification:** `pnpm --dir apps/server exec tsc --noEmit`
- **Committed in:** `f0f1739` (task commit context)

**2. [Rule 3 - Blocking] Aligned records smoke DTO/response with canonical summary contract**
- **Found during:** Task 1 (搭建 authoritative canonical resolve 模块与临时 resolver catalog)
- **Issue:** `CreateSmokeRecordDto` and `RecordsService` still matched the pre-Phase-12 summary shape, which broke `apps/server` typecheck after contracts were refreshed.
- **Fix:** Added the missing canonical summary fields to the DTO validators and echoed them from `RecordsService`.
- **Files modified:** `apps/server/src/modules/records/dto/create-smoke-record.dto.ts`, `apps/server/src/modules/records/records.service.ts`
- **Verification:** `pnpm --dir apps/server exec tsc --noEmit`
- **Committed in:** `f0f1739`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required to keep the server compile and validation path consistent with the Phase 12 contracts. No scope creep.

## Issues Encountered

- `@trip-map/contracts` source and built declarations were temporarily out of sync; rebuilding the package exposed a smaller server-side DTO drift that was then fixed in place.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/server` now owns the canonical resolve/confirm HTTP boundary that `apps/web` can consume in 12-03.
- The authoritative response semantics are stable enough for 12-03 and 12-04 to reuse without redefining fallback or candidate ranking logic.

## Self-Check: PASSED

- Summary file exists at `.planning/phases/12-canonical/12-02-SUMMARY.md`.
- Task commits `f0f1739` and `75b2af1` are present in git history.
- Stub scan found no placeholder or TODO markers in the files modified by this plan.

---
*Phase: 12-canonical*
*Completed: 2026-03-30*
