---
status: diagnosed
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
  root_cause: "Phase 08 currently ships only a small curated offline boundary fixture set. When the tested city is outside that set, `getBoundaryByCityId()` returns null, the point keeps `boundaryId: null`, and the map fail-closes with no boundary highlight."
  artifacts:
    - path: "src/data/geo/city-boundaries.geo.json"
      issue: "Only 6 fixture cities are covered"
    - path: "src/stores/map-points.ts"
      issue: "Boundary assignment depends on fixture-backed `getBoundaryByCityId()` lookups"
    - path: "src/components/WorldMapStage.vue"
      issue: "Render layer has no geometry to draw when boundary identity is null"
  missing:
    - "Expand offline boundary dataset coverage for cities reachable in current UAT flows"
    - "Add regression coverage for uncovered cities so missing boundary assets fail loudly in tests"
  debug_session: ".planning/debug/08-boundary-highlight-missing.md"
- truth: "重新打开一个已保存城市时，抽屉标题、城市名称和地图上的高亮边界应都指向同一座城市，不会出现标题是 A、边界却亮 B 的情况。"
  status: failed
  reason: "User reported: 目前没有边界城市块高亮"
  severity: major
  test: 3
  root_cause: "Reopen flow preserves identity correctly for covered cities, but if the originally saved city had no matching boundary asset, reopened points still carry `boundaryId: null`, so drawer text can reopen while the map shows no city boundary."
  artifacts:
    - path: "src/data/geo/city-boundaries.geo.json"
      issue: "Saved city may not exist in boundary fixture set"
    - path: "src/services/city-boundaries.ts"
      issue: "Lookup can only restore covered `cityId` values"
    - path: "src/stores/map-points.ts"
      issue: "Reopened active point only highlights when persisted point has non-null `boundaryId`"
  missing:
    - "Backfill boundary coverage for persisted cities expected to reopen with highlight"
    - "Add end-to-end UAT regression for a city outside the current boundary fixture set"
  debug_session: ".planning/debug/08-boundary-highlight-missing.md"
- truth: "对于包含多块分离区域的城市，地图应把同一城市的所有区域一起高亮，而不是只亮其中一块。"
  status: failed
  reason: "User reported: 没有高亮城市块"
  severity: major
  test: 5
  root_cause: "Multi-area rendering exists for covered fixture cities such as Tokyo, but the tested city had no boundary geometry loaded at all, so the user observed zero highlighted areas instead of a partial multi-area failure."
  artifacts:
    - path: "src/data/geo/city-boundaries.geo.json"
      issue: "Multi-area support is limited to fixture-covered cities"
    - path: "src/components/WorldMapStage.vue"
      issue: "Path rendering only occurs after successful boundary lookup"
  missing:
    - "Expand boundary geometry coverage before validating multi-area behavior in broader manual UAT"
    - "Add a manual/UAT note that multi-area verification currently requires a fixture-covered city like Tokyo"
  debug_session: ".planning/debug/08-boundary-highlight-missing.md"
