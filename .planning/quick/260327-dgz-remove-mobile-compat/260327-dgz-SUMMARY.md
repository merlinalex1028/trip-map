# Quick Task 260327-dgz Summary

## Task

不再考虑移动端，彻底清除移动端兼容。

## Outcome

- 删除 `MobilePeekSheet` 组件及其测试，地图摘要层只保留 `MapContextPopup` 和深层 `PointPreviewDrawer` 两套桌面浮层。
- 清理 `WorldMapStage.vue` 中的 `viewportWidth`、`shouldUsePeek`、resize 监听和移动端兜底分支，窄屏或空间紧张时也不再切换为移动端 sheet。
- 收口 `App.vue` 与 `WorldMapStage.vue` 的安全区、`100vw` 收缩和 `@media (min-width: 960px)` 样式，让页面骨架直接服务桌面布局。
- 更新 `WorldMapStage` 回归测试，确认摘要层在窄视口与空间受限场景下仍保持桌面 popup 行为。

## Verification

- `pnpm exec vitest run src/App.spec.ts src/components/WorldMapStage.spec.ts src/components/PointPreviewDrawer.spec.ts src/components/map-popup/MapContextPopup.spec.ts`
- `pnpm exec vitest run src/components/WorldMapStage.spec.ts`
- `pnpm build`

## Code Commit

- `62524de` `refactor(popup): 移除移动端兼容分支`
