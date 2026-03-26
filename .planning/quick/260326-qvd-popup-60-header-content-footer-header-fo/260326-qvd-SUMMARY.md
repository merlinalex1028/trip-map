# Quick Task 260326-qvd Summary

## Task

修复 popup 在最大高度 60% 下的内部滚动问题，将其稳定为 `header / content / footer` 三段布局，`header` 与 `footer` 固定，只有 `content` 可滚动。

## Outcome

- 在 `src/components/map-popup/PointSummaryCard.vue` 中把卡片主布局改为三行网格结构，避免 `max-height` 场景下 `height: 100%` 失效导致整卡溢出。
- 为 `header`、`content`、`footer` 增加明确的 `data-popup-section` 标记，便于结构断言与后续回归测试。
- 在 `src/components/map-popup/MapContextPopup.vue` 中为 popup body 增加 `overflow: hidden`，把滚动约束收敛到中间内容区。

## Verification

- `pnpm exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/WorldMapStage.spec.ts src/components/map-popup/MobilePeekSheet.spec.ts`

## Code Commit

- `2980403` `fix(popup): 固定头尾并限制中间内容滚动`
