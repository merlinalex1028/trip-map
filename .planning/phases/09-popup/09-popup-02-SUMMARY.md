---
phase: 09-popup
plan: 02
subsystem: ui
tags: [vue, floating-ui, popup, map-stage, anchored-popup]
requires:
  - phase: 09-popup
    plan: 01
    provides: summarySurfaceState、PointSummaryCard、deep drawer handoff
provides:
  - usePopupAnchoring 定位封装
  - MapContextPopup 桌面 anchored popup 壳层
  - WorldMapStage 桌面 popup 装配与锚点优先级
affects: [09-03-popup, popup-anchor, desktop-summary-entry]
tech-stack:
  added: [@floating-ui/dom]
  patterns: [map-anchored popup, marker-pending-boundary precedence, store-driven popup actions]
key-files:
  created:
    - src/components/map-popup/MapContextPopup.vue
    - src/components/map-popup/MapContextPopup.spec.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - src/composables/usePopupAnchoring.ts
    - src/composables/usePopupAnchoring.spec.ts
    - src/components/WorldMapStage.vue
    - src/components/WorldMapStage.spec.ts
    - src/components/SeedMarkerLayer.vue
    - src/components/map-popup/PointSummaryCard.vue
requirements-completed: [POP-01, POP-02]
completed: 2026-03-26
---

# Phase 09 Plan 02: Desktop Anchored Popup Summary

## Accomplishments

- 引入 `@floating-ui/dom`，把 popup 锚点定位、碰撞感知和可用高度信号封装进 `usePopupAnchoring.ts`。
- 新增 `MapContextPopup.vue`，以 `role="dialog"`、`aria-modal="false"` 和箭头 affordance 承接桌面端 anchored popup 壳层。
- 在 `WorldMapStage.vue` 中把 summary surface 真正搬进地图舞台，并固定锚点优先级为 `marker -> pending -> boundary`。
- popup 内动作直接桥接现有 store action，包括候选确认、fallback、保存草稿、查看详情、编辑、点亮与破坏性操作。

## Verification

- `pnpm test -- src/composables/usePopupAnchoring.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts`
- `pnpm build`

## Notes

- 当前工作树存在用户自己的未提交 planning 变更，因此本次没有额外创建 plan 级 git commit，避免把无关内容打包进去。
- `WorldMapStage.spec.ts` 使用 mock anchoring，只验证地图内挂载、anchor source 语义和边界身份同步，不依赖真实定位计算。

## Next Phase Readiness

- `availableHeight` 与 `collisionState` 已经暴露给消费者，Wave 3 可以直接据此切换到底部 peek。
- popup 动作层已经复用同一张 `PointSummaryCard`，移动端只需补壳层与布局分流。
