---
phase: 09
slug: popup
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-26
updated: 2026-03-27T15:39:10+08:00
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Scope Baseline

- 当前 Phase 09 按 desktop-only 主链路收口。
- `POP-03` 的正式含义是“desktop anchored popup 在靠近边缘或可用高度紧张时仍保持可读、可点与地图内锚定语义”，不再要求移动端 `peek` / safe-area fallback。
- drawer 继续只承接 deep view / edit；summary surface 保持在地图内 popup。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest` `3.2.4` + `@vue/test-utils` `2.4.6` + `happy-dom` |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts src/composables/usePopupAnchoring.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick run command above
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | POP-02 | unit | `pnpm test -- src/stores/map-points.spec.ts` | ✅ | ✅ green |
| 9-01-02 | 01 | 1 | POP-02 | component | `pnpm test -- src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ | ✅ green |
| 9-02-01 | 02 | 2 | POP-01, POP-03 | unit + component | `pnpm test -- src/composables/usePopupAnchoring.spec.ts src/components/map-popup/MapContextPopup.spec.ts` | ✅ | ✅ green |
| 9-02-02 | 02 | 2 | POP-01, POP-02 | integration | `pnpm test -- src/components/WorldMapStage.spec.ts` | ✅ | ✅ green |
| 9-03-01 | 03 | 3 | POP-03 | integration | `pnpm test -- src/components/WorldMapStage.spec.ts src/App.spec.ts` | ✅ | ✅ green |
| 9-03-02 | 03 | 3 | POP-02, POP-03 | integration | `pnpm test -- src/components/WorldMapStage.spec.ts src/App.spec.ts` | ✅ | ✅ green |
| 9-04-01 | 04 | 4 | POP-01, POP-03 | component + integration | `pnpm test -- src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts` | ✅ | ✅ green |
| 9-05-01 | 05 | 5 | POP-01, POP-03 | component + integration | `pnpm test -- src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/components/map-popup/PointSummaryCard.spec.ts` — three-state CTA copy + inline destructive confirm coverage for `POP-02`
- [x] `src/components/map-popup/MapContextPopup.spec.ts` — shell + anchor + quick-action handoff coverage for `POP-01`
- [x] `src/composables/usePopupAnchoring.spec.ts` — collision / flip / shift / size / cleanup coverage for `POP-03`
- [x] `src/App.spec.ts` — drawer no longer acts as the default primary surface and only takes over in deep mode
- [x] `src/components/WorldMapStage.spec.ts` — anchor-source switching keeps `selectedBoundaryId` / `savedBoundaryIds` semantics intact

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 桌面端 popup 跟随 marker、候选态和已保存态切换时的主舞台观感是否自然 | POP-01 | 视觉主舞台感、遮挡感与阅读节奏难以完全由自动化断言 | 桌面宽度打开应用，依次点击候选城市、已保存点位、草稿点位，观察 popup 是否始终锚定在当前地图语境中且不遮挡关键目标 |
| 桌面端靠近视口边缘或可用高度紧张时，anchored popup 的翻转 / 避让与点击是否仍自然 | POP-03 | 需要真实评估 edge-aware popup 的观感、阅读节奏和点击舒适度 | 在桌面视口下分别触发边缘锚点、低高度与长内容场景，确认 popup 仍可完整阅读、点击和关闭，不会退化成右侧抽屉 |
| popup 内删除 / 隐藏等破坏性动作的轻确认是否既防误触又不过重 | POP-02 | 交互节奏与误触风险需要人工判断 | 在 popup 中触发删除与隐藏动作，验证需要明确二次确认或等效轻确认，但不会弹出重型流程打断地图主舞台 |
| popup 长内容是否能在当前地图语境内稳定滚动到底部动作 | POP-01, POP-03 | 需要真实观察裁切、滚动手感与动作可达性 | 准备一条长描述或多候选内容，在桌面 popup 中确认内容区可滚动，底部动作按钮不会被裁切成不可达状态 |
| popup 长内容是否只在中间内容区滚动，而不是整张卡片一起滚动 | POP-01, POP-03 | 需要人工确认头部身份信息与底部动作在滚动时保持稳定 | 准备一条超长简介或候选列表，在桌面 popup 中滚动，确认 badge/标题与底部动作区不随内容整体滚走 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all required references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete
