---
phase: 09-popup
plan: 03
subsystem: ui
tags: [vue, mobile, peek, popup, drawer-handoff]
requires:
  - phase: 09-popup
    plan: 02
    provides: desktop popup、anchoring signals、anchor precedence
provides:
  - MobilePeekSheet 移动端/unsafe fallback shell
  - WorldMapStage popup/peek 分流
  - App deep-drawer-only 布局让位
affects: [mobile-peek, popup-handoff, drawer-layout, boundary-stability]
tech-stack:
  added: []
  patterns: [capability-based peek fallback, deep-drawer-only layout, summary surface handoff]
key-files:
  created:
    - src/components/map-popup/MobilePeekSheet.vue
    - src/components/map-popup/MobilePeekSheet.spec.ts
  modified:
    - src/components/WorldMapStage.vue
    - src/components/WorldMapStage.spec.ts
    - src/App.vue
    - src/App.spec.ts
    - src/composables/usePopupAnchoring.ts
requirements-completed: [POP-03, POP-02]
completed: 2026-03-26
---

# Phase 09 Plan 03: Mobile Peek And Deep Drawer Layout Summary

## Accomplishments

- 新增 `MobilePeekSheet.vue`，在窄屏或 unsafe 场景下承接 summary surface，并保留 `关闭` 按钮、safe-area padding 与共享 `PointSummaryCard`。
- 在 `WorldMapStage.vue` 中加入 `shouldUsePeek` 分流，按 `viewportWidth < 960 || collisionState === 'unsafe' || availableHeight < 260` 切换 popup / peek。
- 将 `App.vue` 的布局让位逻辑收紧为 deep-drawer-only：只有 `drawerMode !== null` 时才为抽屉预留空间。
- 补齐 popup、peek、drawer 三态切换的回归，确认 `selectedBoundaryId` 与强/弱边界高亮语义在 handoff 后保持稳定。

## Verification

- `pnpm test -- src/components/map-popup/MobilePeekSheet.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts`
- `pnpm build`

## Notes

- `App.spec.ts` 中对 anchoring 进行了 mock；这些回归只验证布局与 handoff，不依赖真实 DOM 浮层观察器，避免测试进程被无关定位监听拖住。
- 构建仍会提示主 bundle 体积较大，这是现有应用的既有警告，本次未额外处理 code splitting。

## Outcome

- Phase 09 的三个 plan 已全部完成，summary surface 现在以地图内 popup / 底部 peek 作为主入口，drawer 只承接 deep view / edit。
