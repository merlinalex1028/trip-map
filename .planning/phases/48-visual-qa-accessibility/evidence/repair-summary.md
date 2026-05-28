# Phase 48 Repair Summary

Concise D-21 closeout evidence for the five required desktop states, accessibility gap closure, reduced-motion checks, and final release gate.

## Screenshots

| Desktop state | Evidence | Final status |
|---|---|---|
| Landing entry | `.planning/phases/48-visual-qa-accessibility/evidence/desktop-landing.png` | pass |
| Authenticated map | `.planning/phases/48-visual-qa-accessibility/evidence/desktop-map.png` | pass |
| Footprint date dialog | `.planning/phases/48-visual-qa-accessibility/evidence/desktop-footprint-dialog.png` | pass |
| Travel journal | `.planning/phases/48-visual-qa-accessibility/evidence/desktop-journal.png` | pass |
| Travel memories | `.planning/phases/48-visual-qa-accessibility/evidence/desktop-memories.png` | pass |

`.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` records no overlap, unreadable text, or unresolved truncation blocker for the five desktop evidence states.

## Seed And Auth Safety

- `apps/server/scripts/seed-visual-qa.mjs` no longer contains a committed QA password. Real seeding requires `VISUAL_QA_PASSWORD`; dry-run remains password-free and DB-free.
- Real seed attempts are refused for production-like targets unless an explicit visual-QA-only override is passed, and existing QA credentials are not refreshed without `--reset-password`.
- `apps/web/src/components/auth/AuthDialog.vue` clears login/register email, username, and password state on explicit close and successful login/register.
- AuthDialog focus restoration now runs only on a real open-to-closed transition, avoiding initial mounted closed-state focus side effects.

## Accessibility

- Auth dialog focus, tab, submit-error, credential cleanup, and readable status repairs: `apps/web/src/components/auth/AuthDialog.vue`, `apps/web/src/components/auth/AuthDialog.spec.ts`.
- Authenticated sidebar destination, current-route, width, long-username, and logout repairs: `apps/web/src/components/shell/ShellSidebar.vue`, `apps/web/src/components/shell/AuthenticatedAppShell.vue`, `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts`.
- Map popup and footprint dialog focus/Calendar/date-freshness repairs: `apps/web/src/components/LeafletMapStage.vue`, `apps/web/src/components/LeafletMapStage.spec.ts`, `apps/web/src/components/map-popup/FootprintDateDialog.vue`, `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts`.
- `FootprintDateDialog` now has one accessible dialog owner through the UI DialogContent; the inner `[data-region="footprint-date-dialog"]` remains a stable focus target without `role="dialog"`.
- Memories chart names, chart-only image role, status announcements, and route error alert repairs: `apps/web/src/components/common/BaseChart.vue`, `apps/web/src/components/common/BaseChart.spec.ts`, `apps/web/src/components/memories/MemoriesChartGrid.vue`, `apps/web/src/components/memories/MemoriesChartGrid.spec.ts`, `apps/web/src/views/StatisticsPageView.vue`, `apps/web/src/views/StatisticsPageView.spec.ts`.
- `LeafletMapStage` registers the Leaflet click handler once and removes it on unmount, preventing remount/HMR duplicate recognition requests.

## Reduced Motion

- Landing reduced-motion regression coverage: `apps/web/src/views/LandingPageView.spec.ts`.
- Journal route and card hover/displacement guards: `apps/web/src/views/TimelinePageView.vue`, `apps/web/src/views/TimelinePageView.spec.ts`, `apps/web/src/components/timeline/TimelineVisitCard.vue`, `apps/web/src/components/timeline/TimelineVisitCard.spec.ts`.
- Memories route button/link motion guards: `apps/web/src/views/StatisticsPageView.vue`, `apps/web/src/views/StatisticsPageView.spec.ts`.

## Regression

- Final gate evidence: `.planning/phases/48-visual-qa-accessibility/evidence/regression-results.md`.
- Seed dry-run gate: `pnpm --filter @trip-map/server exec node scripts/seed-visual-qa.mjs --dry-run` passed.
- Focused frontend gap gate: AuthDialog, FootprintDateDialog, BaseChart, AuthenticatedAppShell, and LeafletMapStage focused specs passed with 65 tests.
- Web release gate: `pnpm --filter @trip-map/web test` passed with 58 files and 516 tests.
- Server release gate: `pnpm --filter @trip-map/server test` passed with 15 files and 110 tests.
- Contracts release gate: `pnpm --filter @trip-map/contracts test` passed with 1 file and 18 tests.

## DB Environment

The previous 2026-05-27 plan-level server rerun reported `PrismaClientInitializationError` / `P1001` against `aws-1-ap-southeast-1.pooler.supabase.com:5432`. The 2026-05-28 gap-closure rerun completed with exit 0, 15 server files passed, and 110 tests passed. No Accepted Environment Override is required for this closeout.

## Residual Risk

- No unresolved high-severity auth, route, records, journal, memories, accessibility, visual, reduced-motion, seed-safety, logout, Leaflet listener, or regression product blocker remains in the Phase 48 desktop evidence matrix.
- DB reachability remains a normal external dependency for future DB-backed server e2e reruns, but it is not an active Phase 48 blocker after the clean 2026-05-28 server pass.
