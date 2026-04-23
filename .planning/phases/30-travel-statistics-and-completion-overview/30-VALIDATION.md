---
phase: 30
slug: travel-statistics-and-completion-overview
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
---

# Phase 30 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/web/vitest.config.ts` / `apps/server/jest.config.ts` |
| **Quick run command** | `pnpm --filter web test run` |
| **Full suite command** | `pnpm --filter web test run && pnpm --filter server test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web test run`
- **After every plan wave:** Run `pnpm --filter web test run && pnpm --filter server test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 30-01-01 | 01 | 1 | STAT-01 | — | N/A | unit | `pnpm --filter server test -- stats` | ❌ W0 | ⬜ pending |
| 30-01-02 | 01 | 1 | STAT-01 | — | N/A | unit | `pnpm --filter server test -- stats` | ❌ W0 | ⬜ pending |
| 30-02-01 | 02 | 2 | STAT-01 | — | N/A | unit | `pnpm --filter web test run -- stats` | ❌ W0 | ⬜ pending |
| 30-02-02 | 02 | 2 | STAT-02 | — | N/A | unit | `pnpm --filter web test run -- stats` | ❌ W0 | ⬜ pending |
| 30-03-01 | 03 | 3 | STAT-01 | — | N/A | manual | Browser: navigate to /statistics, verify stats display | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/server/src/records/stats.service.spec.ts` — stubs for STAT-01, STAT-02, STAT-03
- [ ] `apps/web/src/stores/__tests__/stats.spec.ts` — stubs for store state management

*Existing test infrastructure (vitest + jest) covers the framework — only test stubs need creation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Statistics page renders correctly with Kawaii card style | STAT-01 | Visual regression requires browser | Navigate to `#/statistics`, verify two StatCards render with correct values and Kawaii styling |
| Navigation entry "查看统计" appears in user menu | STAT-01 | DOM interaction requires browser | Open user menu, verify "查看统计" pill button is present and navigates to `/statistics` |
| Anonymous state shows login prompt | STAT-01 | Auth state requires browser | Log out, navigate to `#/statistics`, verify anonymous state renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
