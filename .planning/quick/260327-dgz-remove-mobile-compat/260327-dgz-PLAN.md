# Quick Task 260327-dgz Plan

## Goal

不再为移动端或窄屏场景保留单独兼容逻辑，地图摘要与详情统一回归桌面端锚定 popup 交互，并同步清理页面壳层中的移动端安全区/断点适配样式。

## Tasks

### 1. 移除移动端 popup 分支

- Files: `src/components/WorldMapStage.vue`, `src/components/map-popup/MobilePeekSheet.vue`
- Action: 删除 `MobilePeekSheet` 组件及其在 `WorldMapStage` 中的导入、显示条件和窄屏判定，只保留地图内桌面 popup / deep popup。
- Verify: 选中点位或待确认点位后，摘要始终使用 `.map-context-popup`，不再出现 `.mobile-peek-sheet`。
- Done: 地图摘要交互只存在一套桌面浮层实现。

### 2. 清理桌面外兜底样式

- Files: `src/App.vue`, `src/components/WorldMapStage.vue`
- Action: 移除安全区、`100vw` 收缩和 `@media (min-width: 960px)` 之类的移动端兼容写法，让页面骨架固定服务桌面布局。
- Verify: 壳层与地图舞台不再依赖移动端断点和安全区变量。
- Done: 样式层不再保留移动端兼容语义。

### 3. 更新测试基线

- Files: `src/App.spec.ts`, `src/components/WorldMapStage.spec.ts`, `src/components/map-popup/MobilePeekSheet.spec.ts`
- Action: 删除移动端 peek 相关测试，改成断言窄屏和空间紧张时仍然走桌面 popup；移除已删除组件的测试文件。
- Verify: 定向测试通过。
- Done: 自动化测试与“仅桌面端”行为保持一致。
