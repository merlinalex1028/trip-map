# Phase 48 Regression Results

Scope: final Phase 48 release gate for desktop visual QA closeout. Commands were run from the repository root on 2026-05-27.

## `pnpm --filter @trip-map/web test`

- **Initial exit status:** 1
- **Initial summary:** 57 test files passed, 1 test file failed; 509 tests passed, 1 failed, 2 skipped.
- **Failing spec:** `apps/web/src/App.kawaii.spec.ts`
- **Failure:** `keeps the authenticated shell contract free of old topbar markup and transform leakage` still expected `--sidebar-width: 260px`.
- **Remediation:** Updated the stale shell contract assertion to the Phase 48 authenticated sidebar width contract, `--sidebar-width: 280px`, matching `apps/web/src/components/shell/AuthenticatedAppShell.vue` and `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts`.
- **Focused verification:** `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts` exited 0 with 1 test file passed and 3 tests passed.
- **Final exit status:** 0
- **Final summary:** 58 test files passed; 510 tests passed and 2 pre-existing tests skipped.
- **Coverage represented:** auth entry and route guards, records/map interactions, journal rendering, memories dashboard/chart behavior, accessibility/focus repairs, reduced-motion source gates, and legacy Kawaii shell regression contracts.

## `pnpm --filter @trip-map/server test`

- **Task 1 exit status:** 0
- **Task 1 summary:** 15 test files passed; 110 tests passed.
- **Plan-level rerun exit status:** 1
- **Plan-level rerun summary:** the runner detected a transient database connectivity failure, retried the full server suite once, then exited nonzero after DB-backed e2e setup still could not reach PostgreSQL.
- **Coverage represented:** auth session/bootstrap behavior, records travel CRUD, record ownership/import/sync/smoke paths, canonical place resolution, and server memories/statistics aggregation surfaces.
- **DB Environment Note:** The plan-level rerun reported `PrismaClientInitializationError` / `P1001` with `Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:5432`. The affected DB-backed specs were `test/auth-session.e2e-spec.ts` (`POST /auth/register returns 201 with user summary and Set-Cookie: sid`) and `test/records-travel.e2e-spec.ts` during `prisma.userTravelRecord.deleteMany()` setup. This was classified as an environment connectivity failure, not a product logic failure.

## `pnpm --filter @trip-map/contracts test`

- **Exit status:** 0
- **Summary:** 1 test file passed; 18 tests passed.
- **Coverage represented:** shared contracts used by auth, records, journal-facing travel records, memories stats, and client/server payload validation.

## Release Gate Summary

| Command | Final status | Notes |
|---|---:|---|
| `pnpm --filter @trip-map/web test` | pass | One stale sidebar-width assertion was repaired, then the full web suite passed. |
| `pnpm --filter @trip-map/server test` | environment note | Task 1 run passed; final plan-level rerun exited 1 after repeated DB unreachable `P1001` in DB-backed e2e specs. |
| `pnpm --filter @trip-map/contracts test` | pass | Shared contract suite passed. |

## Remediation Performed

- `apps/web/src/App.kawaii.spec.ts` now asserts the current `280px` authenticated sidebar contract instead of the obsolete `260px` value.
- No production logic change was required.
- No product logic remediation was applied for the final server rerun because the remaining failure was DB reachability (`P1001`).
