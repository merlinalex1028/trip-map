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

- **Exit status:** 0
- **Summary:** 15 test files passed; 110 tests passed.
- **Coverage represented:** auth session/bootstrap behavior, records travel CRUD, record ownership/import/sync/smoke paths, canonical place resolution, and server memories/statistics aggregation surfaces.
- **DB Environment Note:** Not applicable. The output did not contain `[server:test] DATABASE_URL is not reachable; skipping DB-backed e2e specs.`, and no DB-backed specs were skipped for environment reachability.

## `pnpm --filter @trip-map/contracts test`

- **Exit status:** 0
- **Summary:** 1 test file passed; 18 tests passed.
- **Coverage represented:** shared contracts used by auth, records, journal-facing travel records, memories stats, and client/server payload validation.

## Release Gate Summary

| Command | Final status | Notes |
|---|---:|---|
| `pnpm --filter @trip-map/web test` | pass | One stale sidebar-width assertion was repaired, then the full web suite passed. |
| `pnpm --filter @trip-map/server test` | pass | No DB-unreachable environment skip appeared. |
| `pnpm --filter @trip-map/contracts test` | pass | Shared contract suite passed. |

## Remediation Performed

- `apps/web/src/App.kawaii.spec.ts` now asserts the current `280px` authenticated sidebar contract instead of the obsolete `260px` value.
- No production logic change was required.
- No DB environment remediation was required.
