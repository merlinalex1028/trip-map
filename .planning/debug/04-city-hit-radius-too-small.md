# Debug Session: Phase 04 city hit radius too small

**Created:** 2026-03-24T08:30:09Z
**Phase:** 04-可用性打磨与增强能力
**Source:** `.planning/phases/04-可用性打磨与增强能力/04-UAT.md`

## Symptoms

- UAT Test 4: 用户反馈“基本很难选中城市”
- UAT Test 5: 用户在尝试验证国家级回退时，仍反馈“基本很难选中城市”
- 现象并不是完全无法识别国家，而是城市增强和城市/国家回退路径都很难通过手动点击稳定复现

## Investigation

### Files inspected

- `src/services/geo-lookup.ts`
- `src/data/geo/city-candidates.ts`
- `src/services/map-projection.ts`
- `src/components/WorldMapStage.vue`

### Findings

1. `geo-lookup.ts` 使用 `calculateDistanceKm()` 把点击坐标和候选城市做真实地理距离比较，并要求：
   - `highRadiusKm` 命中后才返回 `city-high`
   - `possibleRadiusKm` 命中后才返回 `city-possible`
2. 日本候选城市的阈值当前只有：
   - Tokyo: `highRadiusKm = 45`
   - Kyoto / Osaka: `highRadiusKm = 35`
3. 当前世界地图实际绘图区是 `1280 x 640`，映射整张地球：
   - 横向每像素约 `0.28125°`
   - 在日本纬度附近，每像素经向约 `25.57 km`
   - 每像素纬向约 `31.22 km`
4. 这意味着高置信城市命中区大约只有：
   - `35 km ≈ 1.12 - 1.37 px`
   - `45 km ≈ 1.44 - 1.76 px`

## Root Cause

城市候选的命中半径按“真实城市附近几十公里”来设定，但当前产品是无缩放的整张世界地图交互，用户手动点击误差远大于 1 到 2 像素。结果是城市增强在代码层存在，但在真实 UAT 中几乎不可操作，导致“高置信城市命中”和“非城市命中国家级回退”都难以被用户稳定验证。

## Evidence

- `src/data/geo/city-candidates.ts` 中的 `highRadiusKm` / `possibleRadiusKm` 阈值普遍偏小
- `src/services/geo-lookup.ts` 完全以公里阈值判断，没有引入和当前地图交互尺度匹配的最小容差
- 基于 `src/services/map-projection.ts` 的固定世界投影，当前阈值折算后仅约 1 到 2 像素

## Files Involved

- `src/data/geo/city-candidates.ts`
  - issue: 候选城市命中半径使用了过于保守的真实公里数
- `src/services/geo-lookup.ts`
  - issue: 命中逻辑没有做世界地图交互尺度下的容差下限
- `src/services/geo-lookup.spec.ts`
  - issue: 现有测试覆盖了精确命中，但没有覆盖“用户可操作半径”这一交互现实
- `src/components/WorldMapStage.spec.ts`
  - issue: 有城市增强路径覆盖，但缺少“较接近城市但不必精确到像素”的交互断言

## Suggested Fix Direction

- 给城市候选匹配引入“世界地图交互尺度下的最小命中容差”，不要只依赖几十公里的真实半径
- 优先把高置信和可能命中的阈值调到用户在当前地图尺度下能够手动点中的范围
- 增加一组更贴近真实点击误差的 service / stage 回归测试
