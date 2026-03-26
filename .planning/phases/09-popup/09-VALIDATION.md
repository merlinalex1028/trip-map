---
phase: 9
slug: popup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest` `3.2.4` + `@vue/test-utils` `2.4.6` + `happy-dom` |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts src/composables/usePopupAnchoring.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts src/components/map-popup/MobilePeekSheet.spec.ts src/App.spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts src/composables/usePopupAnchoring.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts src/components/map-popup/MobilePeekSheet.spec.ts src/App.spec.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | POP-02 | unit | `pnpm test -- src/stores/map-points.spec.ts` | ✅ existing + extension | ⬜ pending |
| 9-01-02 | 01 | 1 | POP-02 | component | `pnpm test -- src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts` | ❌ W0 + ✅ existing | ⬜ pending |
| 9-02-01 | 02 | 2 | POP-01, POP-03 | unit + component | `pnpm test -- src/composables/usePopupAnchoring.spec.ts src/components/map-popup/MapContextPopup.spec.ts` | ❌ W0 | ⬜ pending |
| 9-02-02 | 02 | 2 | POP-01, POP-02 | integration | `pnpm test -- src/components/WorldMapStage.spec.ts` | ✅ existing + extension | ⬜ pending |
| 9-03-01 | 03 | 3 | POP-03 | component + integration | `pnpm test -- src/components/map-popup/MobilePeekSheet.spec.ts src/components/WorldMapStage.spec.ts` | ❌ W0 + ✅ existing | ⬜ pending |
| 9-03-02 | 03 | 3 | POP-02, POP-03 | integration | `pnpm test -- src/App.spec.ts src/components/WorldMapStage.spec.ts` | ✅ existing + extension | ⬜ pending |
| 9-04-01 | 04 | 4 | POP-01, POP-03 | component + integration | `pnpm test -- src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/MobilePeekSheet.spec.ts src/components/WorldMapStage.spec.ts` | ✅ existing + extension | ✅ green |
| 9-05-01 | 05 | 5 | POP-01, POP-03 | component + integration | `pnpm test -- src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/MobilePeekSheet.spec.ts src/components/WorldMapStage.spec.ts` | ✅ existing + extension | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/map-popup/PointSummaryCard.spec.ts` — three-state CTA copy + inline destructive confirm coverage for `POP-02`
- [ ] `src/components/map-popup/MapContextPopup.spec.ts` — shell + anchor + quick-action handoff stubs for `POP-01` / `POP-02`
- [ ] `src/composables/usePopupAnchoring.spec.ts` — collision / flip / shift / size / cleanup coverage for `POP-03`
- [ ] `src/components/map-popup/MobilePeekSheet.spec.ts` — mobile / unsafe fallback shell coverage for `POP-03`
- [ ] `src/App.spec.ts` — assert drawer is no longer the default primary surface and only takes over in deep mode
- [ ] `src/components/WorldMapStage.spec.ts` — assert anchor-source switching keeps `selectedBoundaryId` / `savedBoundaryIds` semantics intact

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 桌面端 popup 跟随 marker、候选态和已保存态切换时的主舞台观感是否自然 | POP-01 | 视觉主舞台感、遮挡感与阅读节奏难以完全由自动化断言 | 桌面宽度打开应用，依次点击候选城市、已保存点位、草稿点位，观察 popup 是否始终锚定在当前地图语境中且不遮挡关键目标 |
| 移动端从锚定 popup 回退到底部 `peek` 的时机是否可理解、可操作 | POP-03 | 需要真实评估小屏可读性、点击命中和安全区占位 | 在窄屏视口下依次进入 `candidate-select`、草稿摘要和已保存摘要，确认 peek 不遮挡主要地图反馈，且 CTA 触达稳定 |
| popup 内删除 / 隐藏等破坏性动作的轻确认是否既防误触又不过重 | POP-02 | 交互节奏与误触风险需要人工判断 | 在 popup 中触发删除与隐藏动作，验证需要明确二次确认或等效轻确认，但不会弹出重型流程打断地图主舞台 |
| popup / peek 长内容是否能在当前地图语境内稳定滚动到底部动作 | POP-01, POP-03 | 需要真实观察裁切、滚动手感与 safe-area 可达性 | 准备一条长描述或多候选内容，在桌面 popup 与移动端 peek 中分别确认内容区可滚动，底部动作按钮不会被裁切成不可达状态 |
| popup / peek 长内容是否只在中间内容区滚动，而不是整张卡片一起滚动 | POP-01, POP-03 | 需要人工确认头部身份信息与底部动作在滚动时保持稳定 | 准备一条超长简介或候选列表，在桌面 popup 与移动端 peek 中滚动，确认 badge/标题与底部动作区不随内容整体滚走 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
