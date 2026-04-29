---
phase: 38
slug: ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-29
---

# Phase 38 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | apps/web/vitest.config.ts |
| **Quick run command** | `pnpm --filter @trip-map/web test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 38-01-01 | 01 | 1 | EDIT-01 | — | N/A | unit | `vitest run TimelineVisitCard` | ❌ W0 | ⬜ pending |
| 38-01-02 | 01 | 1 | EDIT-02 | — | N/A | unit | `vitest run TimelineEditForm` | ❌ W0 | ⬜ pending |
| 38-01-03 | 01 | 1 | EDIT-03 | — | N/A | unit | `vitest run TagInput` | ❌ W0 | ⬜ pending |
| 38-01-04 | 01 | 1 | EDIT-04 | — | N/A | unit | `vitest run date-conflict` | ❌ W0 | ⬜ pending |
| 38-02-01 | 02 | 1 | DEL-01 | — | N/A | unit | `vitest run TimelineVisitCard` | ❌ W0 | ⬜ pending |
| 38-02-02 | 02 | 1 | DEL-02 | — | N/A | unit | `vitest run ConfirmDialog` | ❌ W0 | ⬜ pending |
| 38-02-03 | 02 | 1 | DEL-03 | — | N/A | unit | `vitest run ConfirmDialog` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/components/timeline/TimelineEditForm.spec.ts` — 编辑表单测试
- [ ] `apps/web/src/components/timeline/TagInput.spec.ts` — 标签输入测试
- [ ] `apps/web/src/components/timeline/ConfirmDialog.spec.ts` — 确认弹窗测试
- [ ] `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — 卡片编辑/删除测试
- [ ] `apps/web/src/services/date-conflict.spec.ts` — 日期冲突检查逻辑测试

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 编辑表单内联展开动画 | EDIT-01 | 视觉效果 | 在时间轴页面点击编辑按钮，观察卡片展开动画 |
| 删除确认弹窗交互 | DEL-02 | 用户体验 | 点击删除按钮，确认弹窗出现且需确认后才执行 |
| 最后一条记录提示 | DEL-03 | 业务逻辑边界 | 删除某地点最后一条记录，观察点亮状态取消提示 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
