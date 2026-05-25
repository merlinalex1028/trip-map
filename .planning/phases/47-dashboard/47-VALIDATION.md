---
phase: 47
slug: dashboard
status: ready
nyquist_compliant: true
wave_0_complete: true
plans: 4
waves: 4
tasks: 9
created: 2026-05-22
updated: 2026-05-25
---

# Phase 47 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Final Plan Set

| Property | Value |
|----------|-------|
| **Plans** | 4 (`47-01-PLAN.md` through `47-04-PLAN.md`) |
| **Waves** | 4 sequential waves: 1, 2, 3, 4 |
| **Tasks** | 9 total tasks: Plan 01 = 2, Plan 02 = 2, Plan 03 = 2, Plan 04 = 3 |
| **Nyquist status** | Compliant: every task has at least one `<automated>` verify command |

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 with Vue Test Utils in `apps/web`; Vitest node environment in `apps/server` and `packages/contracts` |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts/vitest.config.ts` |
| **Quick run command** | Run the focused automated command for the current task from the Per-Task Verification Map below |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run the focused automated verify command listed for that task.
- **After every plan wave:** Run all automated verify commands for the completed wave before moving to the next wave.
- **Wave order:** Wave 1 = Plan 47-01; Wave 2 = Plan 47-02; Wave 3 = Plan 47-03; Wave 4 = Plan 47-04.
- **Before `$gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 120 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 47-01-01 | 01 | 1 | MEM-02, MEM-03, MEM-04, MEM-05, MEM-06 | T-47-05, T-47-06 | Shared contract names the real dashboard payload, the fourth overview metric, Top 5 ranking, and postcard seeds without fake/filter/upload fields. | contract unit | `pnpm --filter @trip-map/contracts test -- src/contracts.spec.ts` | ✅ | ⬜ pending |
| 47-01-02 | 01 | 1 | MEM-02, MEM-03, MEM-04, MEM-05, MEM-06 | T-47-01, T-47-05, T-47-06, T-47-07 | Stats aggregates stay scoped by server-derived current user id and enforce trend, distribution, profile, ranking, and postcard semantics. | server unit | `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts` | ✅ | ⬜ pending |
| 47-02-01 | 02 | 2 | MEM-03, MEM-06, MEM-07 | T-47-02 | Chart option builders map only typed aggregate arrays and keep empty inputs empty. | helper unit | `pnpm --filter @trip-map/web test -- src/services/memories/memory-chart-options.spec.ts` | planned by task | ⬜ pending |
| 47-02-02 | 02 | 2 | MEM-03, MEM-06, MEM-07 | T-47-02, T-47-08, T-47-09 | Four chart panels render through `BaseChart` with truthful sparse states and no raw `VChart` or HTML tooltip path. | component + helper | `pnpm --filter @trip-map/web test -- src/services/memories/memory-chart-options.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/components/common/BaseChart.spec.ts` | planned by task | ⬜ pending |
| 47-03-01 | 03 | 3 | MEM-02, MEM-06 | T-47-10, T-47-11 | Four overview cards read real stats fields including `visitedAdministrativeAreas` and avoid fake deltas or badges. | component | `pnpm --filter @trip-map/web test -- src/components/memories/MemoriesOverviewGrid.spec.ts src/components/statistics/StatCard.spec.ts` | planned by task | ⬜ pending |
| 47-03-02 | 03 | 3 | MEM-01, MEM-02, MEM-03, MEM-06, MEM-07 | T-47-03, T-47-10, T-47-11 | `/memories` keeps auth/session/record-revision refresh protections while composing overview and charts from expanded stats. | store + view + router | `pnpm --filter @trip-map/web test -- src/stores/stats.spec.ts src/views/StatisticsPageView.spec.ts src/router/index.spec.ts src/components/memories/MemoriesOverviewGrid.spec.ts src/components/memories/MemoriesChartGrid.spec.ts` | ✅ | ⬜ pending |
| 47-04-01 | 04 | 4 | MEM-04, MEM-06, MEM-07 | T-47-04, T-47-13 | Visual Top 5 ranking foregrounds place, repeat count, and latest date without table, sort, or expansion controls. | component | `pnpm --filter @trip-map/web test -- src/components/memories/PopularFootprintsList.spec.ts` | planned by task | ⬜ pending |
| 47-04-02 | 04 | 4 | MEM-05, MEM-06, MEM-07 | T-47-12, T-47-13 | Real-record postcard strip is deterministic, decorative, horizontally browseable, and free of upload/viewer/link semantics. | component | `pnpm --filter @trip-map/web test -- src/components/memories/MemoryPostcardStrip.spec.ts src/components/timeline/journal-thumbnails.spec.ts` | planned by task | ⬜ pending |
| 47-04-03 | 04 | 4 | MEM-04, MEM-05, MEM-06, MEM-07 | T-47-04, T-47-12, T-47-13 | Final populated route mounts ranking and postcard modules from `stats.memories`, while empty dashboards omit all populated sections. | view + build | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/components/common/BaseChart.spec.ts src/components/memories/MemoriesOverviewGrid.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/components/memories/PopularFootprintsList.spec.ts src/components/memories/MemoryPostcardStrip.spec.ts`<br>`pnpm --filter @trip-map/web build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No separate Wave 0 plan is scheduled in the final plan set. The prior Wave 0 gaps are assigned to normal plan tasks with explicit automated verifies:

- [x] Extend stats-contract/server stats assertions for the new memories payload and fourth overview metric: `47-01-01`, `47-01-02`.
- [x] Add ranking coverage that fixes Top 5, repeat-count ordering, and latest-visit tie break: `47-01-02`, `47-04-01`.
- [x] Add memories chart option/helper spec for extracted chart options: `47-02-01`, `47-02-02`.
- [x] Add memories postcard strip coverage for real record association, decorative-image semantics, horizontal browse UI, and absence of upload/viewer links: `47-04-02`, `47-04-03`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| High-fidelity dashboard layout remains readable with populated chart panels and postcard strip on target viewports. | MEM-01, MEM-03, MEM-04, MEM-05 | Phase 48 owns screenshot-level visual QA across desktop and mobile. | During later QA, open `/memories` with records and confirm overview cards, chart panels, ranking, and postcard strip have no overlap or unreadable text. |

---

## Validation Sign-Off

- [x] All 9 tasks have `<automated>` verify commands
- [x] Sampling continuity: no consecutive task is missing automated verify
- [x] Wave 0 gaps are assigned to task-level tests; no MISSING verify references remain
- [x] No watch-mode flags
- [x] Feedback latency < 120s target preserved
- [x] `nyquist_compliant: true` set in frontmatter
- [x] `wave_0_complete: true` set in frontmatter

**Approval:** ready for execution
