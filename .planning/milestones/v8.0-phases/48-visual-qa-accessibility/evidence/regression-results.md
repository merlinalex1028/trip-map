# Phase 48 Regression Results

Scope: Phase 48 gap-closure release gate for desktop visual QA, accessibility, reduced-motion, and regression closeout. Commands were run from the repository root on 2026-05-28.

## Gap Closure Seed Gate

### `pnpm --filter @trip-map/server exec node scripts/seed-visual-qa.mjs --dry-run`

- **Exit status:** 0
- **Summary:** dry-run validated the visual QA account and 4 fixture records without requiring `VISUAL_QA_PASSWORD`, connecting to Prisma, or mutating the database.
- **Coverage represented:** reproducible QA-01 / QA-02 seed harness remains available for screenshots, map markers, and memories charts.

### Real seed validation assertions

- **Missing secret assertion:** real seed without `VISUAL_QA_PASSWORD` fails before any Prisma write and reports that `VISUAL_QA_PASSWORD` must be set.
- **Production guard assertion:** real seed with `NODE_ENV=production` is refused before any Prisma write and reports production seeding refusal.
- **Sandbox note:** both assertion-wrapped negative checks were rerun with elevated command approval after sandboxed `pnpm exec` surfaced `[ERROR] fetch failed`; the elevated reruns observed the intended validation failures.
- **Safety controls represented:** `--reset-password` is required for intentional password refresh, and `--allow-non-local-visual-qa-seed` is required for explicitly approved non-local visual QA seeding.

## Focused Gap Tests

### `pnpm --filter @trip-map/web test -- src/components/auth/AuthDialog.spec.ts`

- **Exit status:** 0
- **Summary:** 1 test file passed; 12 tests passed.
- **Coverage represented:** AuthDialog clears login/register credential state on close and successful submit, preserves submit-error behavior, and restores focus only after a real open-to-closed transition.

### `pnpm --filter @trip-map/web test -- src/components/map-popup/FootprintDateDialog.spec.ts src/components/common/BaseChart.spec.ts src/components/shell/AuthenticatedAppShell.spec.ts src/components/LeafletMapStage.spec.ts`

- **Exit status:** 0
- **Summary:** 4 test files passed; 53 tests passed.
- **Coverage represented:** FootprintDateDialog recomputes current local dates on open/shortcut click and has no nested dialog role; BaseChart exposes `role="img"` only for rendered chart state; authenticated logout is active and covered; Leaflet click cleanup is covered on unmount.

### Source debt assertion

- **Command:** `node -e "const fs=require('fs'); const shell=fs.readFileSync('apps/web/src/components/shell/AuthenticatedAppShell.spec.ts','utf8'); const dialog=fs.readFileSync('apps/web/src/components/map-popup/FootprintDateDialog.vue','utf8'); if(shell.includes('TODO: re-enable logout')) process.exit(1); if(/data-region=['\\\"]footprint-date-dialog['\\\"][^>]*role=/.test(dialog)) process.exit(1);"`
- **Exit status:** 0
- **Coverage represented:** the old skipped logout TODO marker is gone, and the inner footprint date region no longer owns a nested `role="dialog"`.

## Release Gate Reruns

### `pnpm --filter @trip-map/web test`

- **Exit status:** 0
- **Summary:** 58 test files passed; 516 tests passed.
- **Coverage represented:** auth entry and route guards, records/map interactions, journal rendering, memories dashboard/chart behavior, accessibility/focus repairs, reduced-motion source gates, and legacy Kawaii shell regression contracts.

### `pnpm --filter @trip-map/server test`

- **Exit status:** 0
- **Summary:** 15 test files passed; 110 tests passed.
- **Coverage represented:** auth session/bootstrap behavior, records travel CRUD, record ownership/import/sync/smoke paths, canonical place resolution, and server memories/statistics aggregation surfaces.
- **DB Environment Note:** the previous 2026-05-27 plan-level server evidence recorded transient `PrismaClientInitializationError` / `P1001` reachability against `aws-1-ap-southeast-1.pooler.supabase.com:5432`. The 2026-05-28 rerun exited cleanly with all server tests passing, so no Accepted Environment Override is required for the current closeout.

### `pnpm --filter @trip-map/contracts test`

- **Exit status:** 0
- **Summary:** 1 test file passed; 18 tests passed.
- **Coverage represented:** shared contracts used by auth, records, journal-facing travel records, memories stats, and client/server payload validation.

## Release Gate Summary

| Command | Final status | Notes |
|---|---:|---|
| `pnpm --filter @trip-map/server exec node scripts/seed-visual-qa.mjs --dry-run` | pass | Dry-run validates 4 visual QA records without password or DB mutation. |
| Focused Phase 48 gap specs | pass | 5 focused spec files passed; 65 tests passed across AuthDialog, FootprintDateDialog, BaseChart, shell logout, and Leaflet cleanup. |
| `pnpm --filter @trip-map/web test` | pass | 58 test files passed; 516 tests passed. |
| `pnpm --filter @trip-map/server test` | pass | 15 test files passed; 110 tests passed; previous `P1001` note superseded by clean rerun. |
| `pnpm --filter @trip-map/contracts test` | pass | 1 test file passed; 18 tests passed. |

## Remediation Performed

- `apps/server/scripts/seed-visual-qa.mjs` now requires `VISUAL_QA_PASSWORD` only for real seeding, refuses production-like real seed targets, keeps dry-run DB-free, and requires `--reset-password` for credential refresh.
- `apps/web/src/components/auth/AuthDialog.vue` now clears credential fields on close/success and restores focus only after an actual modal close transition.
- `apps/web/src/components/map-popup/FootprintDateDialog.vue` now recomputes shortcut dates from the current local date and removes the nested dialog role.
- `apps/web/src/components/common/BaseChart.vue` now scopes `role="img"` to rendered chart state instead of wrapping loading, empty, or error states.
- `apps/web/src/components/shell/ShellSidebar.vue` now exposes an accessible logout path with active regression coverage.
- `apps/web/src/components/LeafletMapStage.vue` now registers Leaflet click handling idempotently and unregisters it on unmount.
