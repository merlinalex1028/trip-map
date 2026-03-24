---
phase: 02-国家级真实地点识别
plan: 01
subsystem: geo
tags: [projection, geo, svg, vue]
requirements-completed: [GEO-01]
duration: 20min
completed: 2026-03-24
---

# 02-01 Summary

## Outcome

完成了 Phase 2 的地理基础层，把地图从装饰性海报升级成“可反算真实坐标”的固定投影舞台。

## Completed Work

- 新增 `src/types/geo.ts`，统一 `GeoCoordinates`、`NormalizedPoint`、`ProjectionConfig`、`GeoLookupStatus`
- 新增 `src/services/map-projection.ts`，落地 `WORLD_PROJECTION_CONFIG` 与 `x/y <-> lng/lat` 双向换算
- 新增 `src/services/map-projection.spec.ts`，覆盖中心点、边界点、clamp 和 round-trip
- 用真实 `lat/lng` 重写 `src/data/seed-points.ts`，并统一通过投影服务计算 `x/y`
- 扩展 `src/types/map-point.ts`，为后续识别链路补齐 `countryCode`、`lat`、`lng`
- 扩展 `src/stores/map-ui.ts`，增加 `pendingGeoHit`、`isRecognizing` 以及识别状态动作
- 更新 `src/components/WorldMapStage.vue`，支持地图点击采样、待识别脉冲点和点击坐标转换
- 替换 `src/assets/world-map.svg` 为与投影契约一致的真实世界地图底图

## Verification

- `pnpm test`
- `rg 'WORLD_PROJECTION_CONFIG' src/services/map-projection.ts`
- `rg 'pendingGeoHit|isRecognizing' src/stores/map-ui.ts`

## Notes

- 地图显示与坐标反算现在共享同一套 `1600 x 800` / `40,80,1520,640` 投影框架
- 识别中的轻量脉冲反馈已经接好，后续国家识别可直接复用这条 pending 状态链路
