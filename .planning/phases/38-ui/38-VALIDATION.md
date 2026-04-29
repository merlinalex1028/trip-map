---
phase: 38
slug: ui
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-29
---

# Phase 38 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (项目现有) |
| **Config file** | apps/web/vitest.config.ts |
| **Quick run command** | `pnpm --filter @trip-map/web test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test -- {component}`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 38-01-01 | 01 | 1 | EDIT-04 | T-38-03 | 仅返回冲突日期范围，不暴露备注/标签等敏感数据 | unit | `pnpm --filter @trip-map/web test -- date-conflict` | ❌ W0 | ⬜ pending |
| 38-01-02 | 01 | 1 | EDIT-03 | T-38-02 | 标签输入限制最多 10 个、每个最长 20 字符、去重+trim | unit | `pnpm --filter @trip-map/web test -- TagInput` | ❌ W0 | ⬜ pending |
| 38-01-03 | 01 | 1 | EDIT-01, EDIT-02 | T-38-01, T-38-04 | 备注最长 1000 字符限制，trim 后存储 | unit | `pnpm --filter @trip-map/web test -- TimelineEditForm` | ❌ W0 | ⬜ pending |
| 38-02-01 | 02 | 2 | DEL-02, DEL-03 | T-38-05 | 弹窗由组件内部状态控制，不接受外部 DOM 注入 | unit | `pnpm --filter @trip-map/web test -- ConfirmDialog` | ❌ W0 | ⬜ pending |
| 38-02-02 | 02 | 2 | DEL-01, EDIT-01, EDIT-02, EDIT-03 | T-38-06, T-38-07, T-38-08 | 删除操作需经过确认弹窗，不可直接调用 store | unit | `pnpm --filter @trip-map/web test -- TimelineVisitCard` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/web/src/services/date-conflict.spec.ts` — Plan 01 Task 1 创建（TDD RED→GREEN）
- [x] `apps/web/src/components/timeline/TagInput.spec.ts` — Plan 01 Task 2 创建（TDD RED→GREEN）
- [x] `apps/web/src/components/timeline/TimelineEditForm.spec.ts` — Plan 01 Task 3 创建（TDD RED→GREEN）
- [x] `apps/web/src/components/timeline/ConfirmDialog.spec.ts` — Plan 02 Task 1 创建（TDD RED→GREEN）
- [x] `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — Plan 02 Task 2 创建（TDD RED→GREEN）

*说明：所有测试文件均由对应的 TDD 任务在 RED 阶段创建，无需单独 Wave 0 占位。*

---

## Manual-Only Verifications

无。所有阶段行为均有自动化验证。

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
