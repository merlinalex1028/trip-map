---
phase: 31
slug: statistics-sync-refresh-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-24
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
| 31-01-01 | 01 | 1 | STAT-03 | T-31-01 | statistics refresh revision includes metadata fields that affect country/completion stats, not just identity fields | component | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts` | ✅ | ⬜ pending |
| 31-01-02 | 01 | 1 | STAT-03 | T-31-02 | same-user authoritative refresh triggers stats reload without forcing a session-boundary reset | component | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/auth-session.spec.ts` | ✅ | ⬜ pending |
| 31-02-01 | 02 | 2 | STAT-03 | T-31-03 | in-flight stats fetch coalesces into one follow-up refresh when metadata-only updates arrive mid-request | component | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts` | ✅ | ⬜ pending |
| 31-02-02 | 02 | 2 | STAT-03 | T-31-04 | timeline/statistics consistency hardening does not regress existing map-point or stats store semantics | integration | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts src/stores/map-points.spec.ts && pnpm --filter @trip-map/web typecheck` | ✅ | ⬜ pending |

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
