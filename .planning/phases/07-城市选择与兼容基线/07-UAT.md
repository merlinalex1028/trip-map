---
status: diagnosed
phase: 07-城市选择与兼容基线
source:
  - 07-01-SUMMARY.md
  - 07-02-SUMMARY.md
  - 07-03-SUMMARY.md
started: 2026-03-25T05:36:19Z
updated: 2026-03-25T06:29:42Z
---

## Current Test

[testing complete]

## Tests

### 1. 地图点击进入候选确认
expected: 点击一个存在明确城市候选的位置后，应先进入候选确认抽屉，看到“搜索城市”输入，默认最多 3 个候选，并带城市上下文与状态提示
result: issue
reported: "地点过少，没有明确的可获取城市，建议可以通过某些接口获取城市实际位置然后判断"
severity: major

### 2. 搜索城市并确认目标
expected: 在候选确认抽屉里输入城市名后，候选列表会按输入收窄；点击搜索结果后，应进入对应城市的后续查看或保存流程，而不是走一条单独的分支
result: pass

### 3. 已记录城市的复用提示
expected: 当你点击或搜索到一个已经记录过的城市时，系统应直接打开旧记录，并给出以“已打开你记录过的”开头的轻提示，而不是新建重复记录
result: pass

### 4. 无可靠城市时回退到国家或地区
expected: 当系统不能可靠确认城市时，抽屉里应出现“按国家/地区继续记录”主动作，并显示“未能可靠确认城市，已提供国家/地区继续记录”；点击后仍可继续保存流程
result: pass

### 5. 旧点位兼容查看与编辑
expected: 之前没有 `cityId` 的旧本地点位仍应能正常打开、查看和编辑，不会被强制带回候选确认流程
result: pass

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "点击一个存在明确城市候选的位置后，应先进入候选确认抽屉，看到“搜索城市”输入，默认最多 3 个候选，并带城市上下文与状态提示"
  status: failed
  reason: "User reported: 地点过少，没有明确的可获取城市，建议可以通过某些接口获取城市实际位置然后判断"
  severity: major
  test: 1
  root_cause: "07-03 只是把最初的 demo 级候选表扩成了一个仍然很小的离线静态索引；当前只覆盖 43 个城市、21 个国家，而边界识别覆盖 238 个国家/地区，所以真实点击仍会大量落在无候选或候选过少的区域。"
  artifacts:
    - path: "src/data/geo/city-candidates.ts"
      issue: "城市库规模仍是小样例库，不足以覆盖真实常见点击分布。"
    - path: "src/services/geo-lookup.ts"
      issue: "候选池完全依赖静态索引，没有第二数据源或最近城市补全。"
    - path: "src/services/city-search.ts"
      issue: "搜索仍然只在同一份 43 城离线索引里检索，无法弥补未覆盖国家/城市。"
    - path: "src/components/PointPreviewDrawer.vue"
      issue: "UI 链路正常，但默认和搜索结果都被上游稀疏数据限制。"
  missing:
    - "引入更完整的城市数据源或最近城市索引，而不是继续手工补少量样例城市。"
    - "若离线数据成本过高，则把在线 reverse geocoding / nearest-city 接口纳入正式修复范围。"
    - "补充能证明覆盖规模提升的统计或回归验证，而不只是少数样例城市。"
  debug_session: ".planning/debug/phase07-remaining-city-coverage-gap.md"
