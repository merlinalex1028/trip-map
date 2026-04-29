---
phase: 37
slug: store-api
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-29
---

# Phase 37 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | apps/web/vitest.config.ts |
| **Quick run command** | `pnpm --filter @trip-map/web vitest run` |
| **Full suite command** | `pnpm --filter @trip-map/web vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web vitest run`
- **After every plan wave:** Run `pnpm --filter @trip-map/web vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 37-01-01 | 01 | 1 | SYNC-01 | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ | ✅ green |
| 37-01-02 | 01 | 1 | SYNC-02 | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ | ✅ green |
| 37-01-03 | 01 | 1 | SYNC-03 | unit | `pnpm --filter @trip-map/web test src/views/StatisticsPageView.spec.ts` | ✅ | ✅ green |
| 37-01-04 | 01 | 1 | SYNC-04 | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/web/src/services/api/records.spec.ts` — API 函数测试文件已创建并通过

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 乐观更新回滚视觉效果 | SYNC-04 | 需要网络断开模拟 | 编辑记录后断网，验证 UI 回滚到原始状态 |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-29
