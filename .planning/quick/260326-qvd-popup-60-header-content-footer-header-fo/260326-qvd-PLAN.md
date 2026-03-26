# Quick Task 260326-qvd Plan

## Goal

修复 popup 在最大高度为地图 60% 时的内部滚动问题，确保 popup 明确分为 `header / content / footer` 三部分，其中 `header`、`footer` 固定，只有 `content` 可滚动。

## Tasks

### 1. 收紧 popup 三段式布局

- Files: `src/components/map-popup/PointSummaryCard.vue`, `src/components/map-popup/MapContextPopup.vue`
- Action: 调整 popup/card 的容器布局，避免依赖 `height: 100%` 在 `max-height` 场景下失效；确保 content 区独立承担滚动，header/footer 保持固定。
- Verify: 超长描述和候选列表场景下，footer 仍可见且不进入滚动区。
- Done: popup 内部布局在受限高度下仍稳定。

### 2. 补充回归测试

- Files: `src/components/map-popup/PointSummaryCard.spec.ts`, `src/components/map-popup/MapContextPopup.spec.ts`, `src/components/WorldMapStage.spec.ts`
- Action: 增加对三段式结构和“仅 content 可滚动”的断言。
- Verify: 定向 popup 相关测试通过。
- Done: 回归测试覆盖受限高度下的结构预期。
