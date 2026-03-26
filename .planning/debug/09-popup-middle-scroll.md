---
status: investigating
trigger: "当前是整个popup滚动了，我想要的是仅中间的简介区域滚动"
created: 2026-03-26T09:56:52Z
updated: 2026-03-26T09:56:52Z
---

## Current Focus

hypothesis: popup / peek 虽然新增了 body scroll container，但 body 内包住了整个 PointSummaryCard，导致 header、描述、动作区作为一个整体一起滚动，而不是只有中间简介区滚动
test: 检查 PointSummaryCard 的结构与样式，确认 actions 是否仍在 scroll container 内；再对照 PointPreviewDrawer 的 scroll-region 结构看差异
expecting: 如果 PointSummaryCard 整体被放进 `.map-context-popup__body` / `.mobile-peek-sheet__body`，就会出现用户感知上的“整个 popup 滚动”
next_action: 检查 usePopupAnchoring 与 WorldMapStage，只确认它们提供的是高度约束，而不是造成整卡滚动的根因

## Symptoms

expected: 当 popup 或 peek 中的描述文本、候选列表或通知内容超过当前可用高度时，仅内容区保持可滚动，底部动作按钮可触达，头部/外壳不整体滚动。
actual: 当前是整个 popup 滚动了，用户想要的是仅中间的简介区域滚动。
errors: 无显式报错；UAT Test 6 失败。
reproduction: 运行 .planning/phases/09-popup/09-UAT.md 中 Test 6，制造长描述文本、长候选列表或长通知内容，观察 popup / peek 的滚动行为。
started: UAT 阶段发现，时间点为 plan 04 scroll fix 之后。

## Eliminated

## Evidence

- timestamp: 2026-03-26T09:56:52Z
  checked: .planning/phases/09-popup/09-UAT.md
  found: Test 6 的失败现象明确是“整个 popup 滚动”，目标行为是“仅中间简介区域滚动”。
  implication: 问题不仅是有没有滚动，还包括滚动区域的边界划分错误。

- timestamp: 2026-03-26T09:56:52Z
  checked: .planning/phases/09-popup/09-04-PLAN.md
  found: 04 计划把目标定义成给 popup / peek 新增 `__body` 容器，并让该容器承担 `overflow-y: auto`。
  implication: 该计划默认把“shell body 可滚动”等同于“用户感知的内容区可滚动”，这可能是需求理解层面的偏差。

- timestamp: 2026-03-26T09:56:52Z
  checked: src/components/map-popup/MapContextPopup.vue 与 src/components/map-popup/MobilePeekSheet.vue
  found: 两个 shell 都已经是 `display:flex` + `overflow:hidden`，且滚动被放在 `.map-context-popup__body` / `.mobile-peek-sheet__body` 上，不在最外层 aside 上。
  implication: 当前现象不是“最外层 aside 还在滚动”，而是 shell 内部 body 容器包裹范围过大。

- timestamp: 2026-03-26T09:56:52Z
  checked: src/components/map-popup/PointSummaryCard.vue
  found: `PointSummaryCard` 是单个 `article`，内部按顺序包含 header、候选/描述 section、actions、confirm row；没有单独的中部 scroll section，动作区也在同一棵内容树里。
  implication: 只要 shell 的 body 把整个 `PointSummaryCard` 包进去，滚动时就会连同按钮区一起移动，形成“整个 popup 滚动”的体验。

- timestamp: 2026-03-26T09:56:52Z
  checked: src/components/PointPreviewDrawer.vue
  found: Drawer 采用外层固定 header/内容布局，并显式提供 `point-preview-drawer__scroll-region` 作为独立滚动层。
  implication: 代码库里已经存在正确的“固定框架 + 中间滚动区”范式，popup / peek 没有沿用这个分层。

## Resolution

root_cause:
fix:
verification:
files_changed: []
