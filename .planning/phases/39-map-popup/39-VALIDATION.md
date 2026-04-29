---
phase: 39
slug: map-popup
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-29
---

# Phase 39 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (happy-dom) |
| **Config file** | apps/web/vitest.config.ts |
| **Quick run command** | `pnpm --filter @trip-map/web test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test -- --filter PopupTripRecord`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test`
- **Before `/gsd-verify-work`:** Full suite must be green (396 测试)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 39-01-01 (TDD) | 01 | 1 | EDIT-01~03, DEL-01~03 | T-39-01, T-39-02 | TimelineEditForm 验证输入；ConfirmDialog 确认后才删除 | unit | `pnpm --filter @trip-map/web test -- --filter PopupTripRecord` | ✅ | ✅ green |
| 39-01-02 | 01 | 1 | SYNC-01~04 | T-39-03, T-39-04 | Store 方法调用携带 session cookie；行级权限由后端保障 | unit | `pnpm --filter @trip-map/web test -- --filter PointSummaryCard` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/web/src/components/map-popup/PopupTripRecord.spec.ts` — TDD 创建，11 个测试用例
- [x] `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — 已有测试文件，更新了 per-record 断言
- [x] `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` — 更新了 store mock
- [x] `apps/web/src/components/map-popup/MapContextPopup.spec.ts` — 更新了 store mock
- [x] `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` — 更新了 store mock
- [x] `apps/web/src/components/LeafletMapStage.spec.ts` — 更新了 per-record 断言

---

## Manual-Only Verifications

无。所有阶段行为均有自动化验证（396 测试全部通过）。

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-29
