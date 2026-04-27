---
phase: 31
slug: statistics-sync-refresh-hardening
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-24
updated: 2026-04-27
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts src/stores/map-points.spec.ts && pnpm --filter @trip-map/web typecheck` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts`
- **After every plan wave:** Run `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts src/stores/map-points.spec.ts && pnpm --filter @trip-map/web typecheck`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | STAT-03 | T-31-01, T-31-03 | statistics refresh revision includes `parentLabel`, `displayName`, `typeLabel`, and `subtitle`; metadata-only in-flight updates queue exactly one follow-up refresh | component | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts` | ✅ | ⬜ pending |
| 31-01-02 | 01 | 1 | STAT-03 | T-31-04 | same-user authoritative metadata refresh applies records without forcing a session-boundary reset | store | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| metadata-only authoritative refresh 后统计页文案在真实浏览器中及时更新 | STAT-03 | 需要真实页面确认 stats 卡片与时间轴在同一账号数据下的可感知一致性 | 登录真实账号，触发 same-user sync 或 bootstrap 后检查 statistics 页面是否无需整页刷新即可显示新的国家/完成度数据 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved — aligned with single-plan Phase 31 structure in `31-01-PLAN.md`
