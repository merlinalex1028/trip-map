---
status: testing
phase: 44-world-footprints-map-footprint-date-dialog
source:
  - 44-01-SUMMARY.md
  - 44-02-SUMMARY.md
  - 44-03-SUMMARY.md
  - 44-04-SUMMARY.md
  - 44-05-SUMMARY.md
started: 2026-05-13T09:20:00+08:00
updated: 2026-05-13T09:20:00+08:00
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: 地图页世界足迹视觉与导航
expected: |
  登录后进入 `/map` 时，左侧导航只显示“世界足迹 / 旅途手账 / 旅途回忆”三项，没有“我的收藏”。地图主舞台呈现 world-footprints 风格，点位是星形足迹 marker，不是旧的小圆点样式。
awaiting: user response

## Tests

### 1. 地图页世界足迹视觉与导航
expected: 登录后进入 `/map` 时，左侧导航只显示“世界足迹 / 旅途手账 / 旅途回忆”三项，没有“我的收藏”。地图主舞台呈现 world-footprints 风格，点位是星形足迹 marker，不是旧的小圆点样式。
result: pending

### 2. 点击地点后的统一地点卡片
expected: 在地图上点击一个可识别地点后，popup 会显示统一地点信息卡片：地点名、类型标签、地区信息，以及“留下足迹”按钮；不会出现旧的 inline 日期表单，也不会出现旧的旅行记录管理面板。
result: pending

### 3. 已保存地点的提示文案
expected: 点击一个已经保存过足迹的地点时，仍然使用同一套地点信息卡片布局，只会额外看到“这里已经留下过足迹”的提示；不会显示历史记录列表，也不会出现“再留一次足迹”之类旧分支。
result: pending

### 4. 独立日期弹窗
expected: 点击 popup 里的“留下足迹”后，会打开独立日期弹窗，而不是在 popup 内展开表单。弹窗会展示地点快照、四个快捷日期按钮（今天、明天、本周末、其他日期）、完整日历、取消按钮和保存按钮。
result: pending

### 5. 未登录提交时的登录拦截
expected: 在未登录状态下，如果从地点 popup 进入日期弹窗并尝试保存，不会直接写入足迹记录，而是打开登录弹窗或登录流程。
result: pending

### 6. 保存成功与地点快照冻结
expected: 登录状态下，从地点 A 打开日期弹窗后，就算地图当前高亮切换成地点 B，最终保存也应该仍然写入地点 A。保存成功后弹窗关闭，并出现“足迹已保存。”反馈。
result: pending

### 7. 保存失败时的内联错误
expected: 如果保存失败，日期弹窗会保持打开，已选日期不会丢失，并在弹窗内看到“足迹暂时没有保存成功，请检查网络后重试。”错误提示。
result: pending

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

none yet
