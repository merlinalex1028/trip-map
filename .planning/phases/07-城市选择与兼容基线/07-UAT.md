---
status: diagnosed
phase: 07-城市选择与兼容基线
source:
  - 07-01-SUMMARY.md
  - 07-02-SUMMARY.md
started: 2026-03-25T05:36:19Z
updated: 2026-03-25T05:43:58Z
---

## Current Test

[testing complete]

## Tests

### 1. 地图点击进入候选确认
expected: 点击一个存在明确城市候选的位置后，应先进入候选确认抽屉，看到“搜索城市”输入，默认最多 3 个候选，并带城市上下文与状态提示
result: issue
reported: "基本无法显示城市，搜索也没有搜索出任何城市"
severity: major

### 2. 搜索城市并确认目标
expected: 在候选确认抽屉里输入城市名后，候选列表会按输入收窄；点击搜索结果后，应进入对应城市的后续查看或保存流程，而不是走一条单独的分支
result: issue
reported: "无搜索结果"
severity: major

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
passed: 3
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "点击一个存在明确城市候选的位置后，应先进入候选确认抽屉，看到“搜索城市”输入，默认最多 3 个候选，并带城市上下文与状态提示"
  status: failed
  reason: "User reported: 基本无法显示城市，搜索也没有搜索出任何城市"
  severity: major
  test: 1
  root_cause: "geo lookup 的城市候选完全依赖覆盖极窄的静态 context 表，而抽屉搜索又只过滤当前候选池；大多数国家/地区点击时 `cityCandidates` 为空，因此候选列表和搜索结果都会一起为空。"
  artifacts:
    - path: "src/data/geo/city-candidates.ts"
      issue: "只覆盖 JP/PT/EG 少量 context 和 5 个城市，绝大多数点击没有候选。"
    - path: "src/services/geo-lookup.ts"
      issue: "候选来源仅查静态 context 表，查不到就直接返回空候选并走 fallback。"
    - path: "src/components/PointPreviewDrawer.vue"
      issue: "搜索仅过滤当前 `pendingCitySelection.cityCandidates`，候选池为空时 UI 无法自救。"
  missing:
    - "扩充离线城市候选数据覆盖面，让常见点击位置能稳定返回城市候选。"
    - "将候选展示能力与更完整的城市索引衔接，而不是完全依赖当前极小候选池。"
    - "增加覆盖真实非样例国家/地区点击的回归测试，避免只在 Kyoto/Lisbon/Cairo 上通过。"
  debug_session: ".planning/debug/phase07-city-candidates-not-showing.md"
- truth: "在候选确认抽屉里输入城市名后，候选列表会按输入收窄；点击搜索结果后，应进入对应城市的后续查看或保存流程，而不是走一条单独的分支"
  status: failed
  reason: "User reported: 无搜索结果"
  severity: major
  test: 2
  root_cause: "所谓“搜索城市”并不是真正的城市检索，只是在当前候选池上做英文字符串过滤；没有全局城市索引、中文名称或别名匹配，所以真实使用时经常完全搜不到。"
  artifacts:
    - path: "src/components/PointPreviewDrawer.vue"
      issue: "只对 `cityName/contextLabel` 做英文 `toLowerCase().includes(...)` 过滤。"
    - path: "src/components/WorldMapStage.vue"
      issue: "地图点击后只把当前 detectionResult 的候选传入，不会补充更广的可搜城市来源。"
    - path: "src/data/geo/city-candidates.ts"
      issue: "城市覆盖极少，且名称全部是英文，中文输入无法命中。"
    - path: "src/components/PointPreviewDrawer.spec.ts"
      issue: "测试只覆盖英文本地过滤，没有覆盖真实数据稀疏或中文输入场景。"
  missing:
    - "把搜索升级为基于更完整离线城市索引的检索，而不是只过滤当前候选池。"
    - "支持中文名称或别名匹配，至少覆盖当前中文界面的主要输入方式。"
    - "补上真实数据条件下的搜索 UAT 回归测试。"
  debug_session: ".planning/debug/phase07-search-no-results.md"
