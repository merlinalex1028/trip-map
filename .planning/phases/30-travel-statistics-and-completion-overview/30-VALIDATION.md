---
phase: 30
slug: travel-statistics-and-completion-overview
status: approved
nyquist_compliant: true
wave_0_complete: true
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
| 30-01-01 | 01 | 1 | STAT-01 | — | 合约定义正确的统计响应类型 | unit | `pnpm --filter @trip-map/contracts build` — 退出码 0（30-01-SUMMARY） | ✅ | ✅ green |
| 30-01-02 | 01 | 1 | STAT-01 | — | 受 GET /records/stats 认证保护，仅返回当前用户的统计 | unit | `pnpm --filter @trip-map/server exec vitest run src/modules/records/records.service.spec.ts` — 通过（30-01-SUMMARY） | ✅ | ✅ green |
| 30-02-01 | 02 | 2 | STAT-01 | — | 匿名用户不展示统计数据，由页面层 gate（restoring/anonymous 状态分流） | unit | `pnpm --filter @trip-map/web test -- src/stores/stats.spec.ts src/components/statistics/StatCard.spec.ts` — 通过（30-02-SUMMARY） | ✅ | ✅ green |
| 30-02-02 | 02 | 2 | STAT-02 | — | 统计页五种状态正确分流（restoring/anonymous/error/empty/populated），匿名态显示登录提示 | unit | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts` — 通过（30-02-SUMMARY） | ✅ | ✅ green |
| 30-03-01 | 03 | 3 | STAT-01 | — | 统计页通过已登录菜单入口可导航到达，按钮顺序 timeline → statistics → logout | manual | Browser: navigate to /statistics, verify stats display | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/server/src/modules/records/records.service.spec.ts` — stubs for STAT-01, STAT-02, STAT-03（实际路径，已在 30-01 中创建并通过）
- [x] `apps/web/src/stores/stats.spec.ts` — stubs for store state management（实际路径，已在 30-02 中创建并通过）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Statistics page renders correctly with Kawaii card style | STAT-01 | Visual regression requires browser | Navigate to `#/statistics`, verify two StatCards render with correct values and Kawaii styling |
| Navigation entry "查看统计" appears in user menu | STAT-01 | DOM interaction requires browser | Open user menu, verify "查看统计" pill button is present and navigates to `/statistics` |
| Anonymous state shows login prompt | STAT-01 | Auth state requires browser | Log out, navigate to `#/statistics`, verify anonymous state renders |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-28
