---
phase: 32
slug: route-deep-link-and-acceptance-closure
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-28
---

# Phase 32 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 + Vue Test Utils 2.4.6 |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts src/stores/auth-session.spec.ts src/router/index.spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web typecheck` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts src/stores/auth-session.spec.ts src/router/index.spec.ts`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web typecheck`
- **Before `$gsd-verify-work`:** Full suite must be green, and preview/staging manual deep-link proof must be captured
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 32-01-01 | 01 | 1 | TRIP-04 | T-32-01 | Authenticated user can still navigate to `/timeline`, while anonymous direct-open resolves to `/` instead of staying on the timeline shell | component + router | `pnpm --filter @trip-map/web exec vitest run src/components/auth/AuthTopbarControl.spec.ts src/router/index.spec.ts` — 6/6 router tests ✅（32-01-SUMMARY） | ✅ | ✅ green |
| 32-01-02 | 01 | 1 | TRIP-05 | T-32-01 | Authenticated `/timeline` renders the existing independent page shell; anonymous direct-open does not settle on the timeline anonymous shell | router + shell | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts` — router tests 6/6 ✅, App.spec 19/19 ✅（32-01-SUMMARY） | ✅ | ✅ green |
| 32-01-03 | 01 | 1 | STAT-01 | T-32-01 | Authenticated `/statistics` stays accessible and anonymous direct-open resolves to `/` without breaking the statistics shell | router + shell | `pnpm --filter @trip-map/web exec vitest run src/router/index.spec.ts src/views/StatisticsPageView.spec.ts src/App.spec.ts` — router tests 6/6 ✅, App.spec 19/19 ✅（32-01-SUMMARY） | ✅ | ✅ green |
| 32-01-04 | 01 | 2 | STAT-02 | T-32-02 | Preview/staging direct-open and refresh for `/statistics` and `/timeline` succeed with production-like SPA fallback | manual | `N/A — preview/staging browser verification` | ✅ | ✅ green |
| 32-01-05 | 01 | 2 | TRIP-04, TRIP-05, STAT-01, STAT-02 | T-32-03 | Phase 29/30 HUMAN-UAT, VERIFICATION, and ROADMAP route notation align with clean URLs and final acceptance state | doc audit | `rg -n \"#/timeline|#/statistics\" .planning/ROADMAP.md .planning/phases/29-timeline-page-and-account-entry .planning/phases/30-travel-statistics-and-completion-overview` — 无残留 ✅（32-03-SUMMARY） | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/web/src/router/index.spec.ts` — ✅ 在 32-01 创建：commit b504fc2 / 25e2f0a
- [x] `apps/web/src/App.spec.ts` — ✅ 在 32-01 更新：commit 2f068d9
- [x] Phase 32 manual acceptance artifact — ✅ Task 2 (32-02) 和 Task 2 (32-03) 的 human-verify checkpoint 均已 approved（per 32-02-SUMMARY 和 32-03-SUMMARY）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Preview/staging direct-open `/timeline` | TRIP-04, TRIP-05 | Repo cannot prove host-level SPA fallback for the real deploy target | Open preview/staging URL directly at `/timeline` while authenticated; verify page loads without 404, topbar remains, map stage absent, and timeline content/readability is intact on desktop and mobile widths |
| Preview/staging refresh `/timeline` | TRIP-04, TRIP-05 | Refresh behavior depends on host rewrite/fallback configuration | Refresh the authenticated `/timeline` page in preview/staging; verify route shell restores correctly and does not fall back to a 404 or stale anonymous shell |
| Preview/staging direct-open `/statistics` | STAT-01, STAT-02 | Repo cannot prove host-level SPA fallback for the real deploy target | Open preview/staging URL directly at `/statistics` while authenticated; verify stats page loads without 404, three cards remain readable, and topbar/return-map controls are usable on desktop and mobile widths |
| Preview/staging refresh `/statistics` | STAT-01, STAT-02 | Refresh behavior depends on host rewrite/fallback configuration | Refresh the authenticated `/statistics` page in preview/staging; verify route shell restores correctly, stats remain available, and no stable anonymous shell or 404 appears |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-28
