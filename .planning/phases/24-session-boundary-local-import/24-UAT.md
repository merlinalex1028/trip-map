---
status: complete
phase: 24-session-boundary-local-import
source: [24-01-SUMMARY.md, 24-02-SUMMARY.md, 24-03-SUMMARY.md, 24-04-SUMMARY.md, 24-VERIFICATION.md, 24-HUMAN-UAT.md]
started: 2026-04-15T02:23:43Z
updated: 2026-04-15T02:50:43Z
---

## Current Test

[testing complete]

## Tests

### 1. 匿名点亮会打开登录弹层但保留地图上下文
expected: 以未登录状态点击地图里的点亮动作后，应只出现登录弹层；当前地图位置、识别结果和 summary popup 仍保持在刚才的上下文里，用户不需要重新点图。
result: pass

### 2. 首次登录的本地导入决策只出现一次
expected: 检测到 `trip-map:point-state:v2` 时只展示两个主 CTA；选择 cloud-wins 后 legacy key 被清理，刷新后不再重复弹出。
result: pass

### 3. 导入成功后的 authoritative summary 文案准确
expected: 导入完成后，对话框中能看到 imported / merged duplicate / final count，且这些数字与实际导入结果一致。
result: pass

### 4. 在数据库可达环境重跑 server import e2e
expected: `pnpm --filter @trip-map/server test -- test/records-import.e2e-spec.ts` 全部通过。
result: pass
reported: "2026-04-15 在数据库可达环境补跑后通过"

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None yet.
