# Quick Task 260326-qmh Plan

## Goal

将桌面端地图 popup 的最大高度限制为地图容器高度的 60%，同时继续受可用摆放空间约束。

## Tasks

### 1. 调整 popup 锚定高度上限

- Files: `src/composables/usePopupAnchoring.ts`
- Action: 在 Floating UI 的 `size()` 中间件里读取地图容器高度，并将 `maxHeight` 收敛为 `min(availableHeight, mapHeight * 0.6)`。
- Verify: popup 仍保留现有宽度约束，且在地图高度足够时高度上限会被 60% 规则截断。
- Done: `maxHeight` 不再直接等于 `availableHeight`。

### 2. 补充回归测试

- Files: `src/composables/usePopupAnchoring.spec.ts`
- Action: 增加“地图高度 60% 上限”单测，覆盖可用空间大于上限时的截断行为。
- Verify: 定向测试通过，原有锚定行为不回退。
- Done: 测试断言明确验证 `maxHeight` 采用 60% 规则。
