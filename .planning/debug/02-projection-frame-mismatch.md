# Debug Session: Phase 02 Projection Frame Mismatch

## Symptom

- 点击日本明显陆地区域时，识别结果落到了中国
- 点击香港区域时，识别结果落到了 Myanmar
- 海洋无效提示与边界保守提示正常，说明问题集中在点击坐标与底图地理框架不一致

## Root Cause

`src/services/map-projection.ts` 中的 `WORLD_PROJECTION_CONFIG` 约定地图实际地理绘图区为 `x=40, y=80, width=1520, height=640`。  
但当前 [world-map.svg](/Users/huangjingping/i/trip-map/src/assets/world-map.svg) 是通过 `geoEquirectangular().fitExtent([[40, 80], [1560, 720]], { type: 'Sphere' })` 生成的，受 2:1 纵横比约束，真实球面边框最终落在 `x=160` 到 `x=1440`，宽度只有 `1280`。

这导致：

- 点击反算使用的是 `40..1560` 的横向地理范围
- 实际底图陆地绘制使用的是 `160..1440` 的横向范围
- 两者之间有 `120px` 的水平偏移，足以把东亚点击整体推向中国内陆与中南半岛

## Affected Files

- [map-projection.ts](/Users/huangjingping/i/trip-map/src/services/map-projection.ts)
- [world-map.svg](/Users/huangjingping/i/trip-map/src/assets/world-map.svg)
- [WorldMapStage.vue](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue)

## Recommended Fix

1. 让 SVG 底图与 `WORLD_PROJECTION_CONFIG` 使用完全一致的绘图区
2. 重新生成 graticule / sphere / land path，保证球面框精确落在 `40..1560`
3. 增加回归测试，覆盖日本、香港这类偏移最明显的点击样本
