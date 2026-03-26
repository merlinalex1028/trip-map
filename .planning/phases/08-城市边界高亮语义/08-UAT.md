---
status: complete
phase: 08-城市边界高亮语义
source:
  - 08-01-SUMMARY.md
  - 08-02-SUMMARY.md
  - 08-03-SUMMARY.md
started: 2026-03-26T02:45:28Z
updated: 2026-03-26T03:09:41Z
---

## Current Test

[testing complete]

## Tests

### 1. 当前选中城市边界成为主表达
expected: 在地图上打开一个已保存或刚确认的城市后，真实城市边界应成为主视觉；当前选中城市边界比其他已保存城市更强。
result: issue
reported: "没有以边界为边的内容全高亮块"
severity: major

### 2. 国家或地区 fallback 不误亮城市边界
expected: 当识别结果回退到国家或地区并继续记录时，抽屉仍能正常展示文本信息，但地图上不应出现任何城市边界高亮。
result: pass

### 3. 重新打开已保存城市时抽屉与边界身份一致
expected: 重新打开一个已保存城市时，抽屉标题、城市名称和地图上的高亮边界应都指向同一座城市，不会出现标题是 A、边界却亮 B 的情况。
result: issue
reported: "目前没有边界城市块高亮"
severity: major

### 4. 切换城市或关闭抽屉后不会残留错误强高亮
expected: 从城市 A 切到城市 B 时，A 的强高亮应立即消失或退回弱高亮；关闭抽屉后不应保留一层额外的强高亮记忆态。
result: pass

### 5. 多面域城市会整组一起点亮
expected: 对于包含多块分离区域的城市，地图应把同一城市的所有区域一起高亮，而不是只亮其中一块。
result: issue
reported: "没有高亮城市块"
severity: major

## Summary

total: 5
passed: 2
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "在地图上打开一个已保存或刚确认的城市后，真实城市边界应成为主视觉；当前选中城市边界比其他已保存城市更强。"
  status: failed
  reason: "User reported: 没有以边界为边的内容全高亮块"
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "重新打开一个已保存城市时，抽屉标题、城市名称和地图上的高亮边界应都指向同一座城市，不会出现标题是 A、边界却亮 B 的情况。"
  status: failed
  reason: "User reported: 目前没有边界城市块高亮"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "对于包含多块分离区域的城市，地图应把同一城市的所有区域一起高亮，而不是只亮其中一块。"
  status: failed
  reason: "User reported: 没有高亮城市块"
  severity: major
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
