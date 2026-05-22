---
phase: 47
slug: dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-22
---

# Phase 47 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 with Vue Test Utils in `apps/web`; Vitest node environment in `apps/server` and `packages/contracts` |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts` and `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run the focused web or server spec for the layer changed.
- **After every plan wave:** Run `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/components/common/BaseChart.spec.ts` plus `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts`.
- **Before `$gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 120 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 47-01-01 | 01 | 1 | MEM-02, MEM-03, MEM-04, MEM-06 | T-47-01 | Stats aggregates stay scoped by server-derived current user id. | server unit + contract | `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts` | ✅ | ⬜ pending |
| 47-02-01 | 02 | 1 | MEM-03, MEM-07 | T-47-02 | Charts render only real aggregate payload or explicit empty states. | component + helper | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts src/components/common/BaseChart.spec.ts` | ✅ | ⬜ pending |
| 47-03-01 | 03 | 2 | MEM-01, MEM-02, MEM-03, MEM-06, MEM-07 | T-47-03 | Memories route preserves auth/session refresh protections. | store + view | `pnpm --filter @trip-map/web test -- src/stores/stats.spec.ts src/views/StatisticsPageView.spec.ts` | ✅ | ⬜ pending |
| 47-04-01 | 04 | 2 | MEM-04, MEM-05 | T-47-04 | Ranking and postcards expose real record associations without upload/viewer semantics. | component + helper | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Extend stats-contract/server stats assertions for the new memories payload and fourth overview metric.
- [ ] Add ranking coverage that fixes Top 5, repeat-count ordering, and latest-visit tie break.
- [ ] Add a memories chart option/helper spec if chart options move out of the route view.
- [ ] Add memories postcard strip coverage for real record association, decorative-image semantics, horizontal browse UI, and absence of upload/viewer links.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| High-fidelity dashboard layout remains readable with populated chart panels and postcard strip on target viewports. | MEM-01, MEM-03, MEM-04, MEM-05 | Phase 48 owns screenshot-level visual QA across desktop and mobile. | During later QA, open `/memories` with records and confirm overview cards, chart panels, ranking, and postcard strip have no overlap or unreadable text. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
