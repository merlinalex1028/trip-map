# Quick Task 260326-qmh Summary

## Task

将 popup 弹窗的最大高度设置为地图高度的 60%。

## Outcome

- 在 `src/composables/usePopupAnchoring.ts` 中新增 popup 高度上限计算逻辑。
- 桌面端 popup 的 `maxHeight` 现在取 `availableHeight` 与地图容器高度 `60%` 的较小值。
- 当无法解析地图容器高度时，仍回退到原本的 `availableHeight`，避免影响非地图场景与测试兜底。

## Verification

- `pnpm exec vitest run src/composables/usePopupAnchoring.spec.ts`
- `pnpm exec vitest run src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts`

## Code Commit

- `ebeabf9` `fix(popup): 限制弹窗高度为地图的60%`
