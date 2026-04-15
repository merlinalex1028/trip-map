---
status: partial
phase: 25-sync-semantics-multi-device-hardening
source:
  - 25-01-SUMMARY.md
  - 25-02-SUMMARY.md
  - 25-03-SUMMARY.md
started: 2026-04-15T03:53:40Z
updated: 2026-04-15T05:53:58Z
---

## Current Test

[testing paused — 2 items outstanding]

## Tests

### 1. 双窗口新增记录最终一致
expected: 使用同一账号打开两个窗口或两个设备。在 A 窗口点亮一个当前未点亮的地点后，切到 B 窗口并让页面重新获得焦点。B 窗口应该自动刷新并显示同一个地点已点亮，不需要手动整页刷新，也不应该出现“已切换到某账号”的提示。
result: issue
reported: "A窗口点亮失败"
severity: blocker

### 2. 双窗口取消点亮最终一致
expected: 使用同一账号打开两个窗口或两个设备。确保某个地点在两个窗口里都处于已点亮状态。在 A 窗口取消点亮后，切到 B 窗口并让页面重新获得焦点。B 窗口应该自动刷新并显示该地点已取消点亮；如果 B 本来还保留旧状态，再次取消点亮也不应出现假失败。
result: blocked
blocked_by: prior-phase
reason: "因为上一个问题暂时没有已点亮点地点无法校验"

### 3. 点亮与取消点亮成功提示
expected: 在已登录状态下，点亮一个地点时应该看到“已同步到当前账号”之类的成功提示；随后取消点亮同一地点时，应该看到“已从当前账号移除”之类的成功提示。两次操作后地图状态都应与提示一致。
result: blocked
blocked_by: prior-phase
reason: "同上无法验证"

### 4. 普通失败与会话失效提示区分
expected: 模拟一次普通网络失败时，界面应提示同步或刷新失败，但保留当前已显示的数据；模拟一次会话失效时，界面应明确提示需要重新登录，并回到匿名边界。两类提示不能混成一种文案。
result: pass

## Summary

total: 4
passed: 1
issues: 1
pending: 0
skipped: 0
blocked: 2

## Gaps

- truth: "使用同一账号打开两个窗口或两个设备。在 A 窗口点亮一个当前未点亮的地点后，切到 B 窗口并让页面重新获得焦点。B 窗口应该自动刷新并显示同一个地点已点亮，不需要手动整页刷新，也不应该出现“已切换到某账号”的提示。"
  status: failed
  reason: "User reported: A窗口点亮失败"
  severity: blocker
  test: 1
  artifacts: []
  missing: []
