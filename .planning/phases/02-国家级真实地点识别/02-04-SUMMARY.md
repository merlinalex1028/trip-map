---
phase: 02-国家级真实地点识别
plan: 04
subsystem: geo
tags: [projection, regression, overlay, interaction]
requirements-completed: [GEO-01, GEO-02]
duration: 15min
completed: 2026-03-24
---

# 02-04 Summary

## Outcome

修复了 Phase 2 剩余的“点击结果在全图偏左上”的问题方向，把检测点渲染从 HTML 百分比定位切换到与底图共享 `viewBox` 的 SVG 叠层，并补上了真正走页面点击路径的交互级回归测试。

## Completed Work

- 更新 `src/components/WorldMapStage.vue`，让待识别点与检测结果点位改用 SVG overlay 渲染，并与底图共享 `1600 x 800` 的坐标系
- 更新 `src/components/WorldMapStage.vue`，点击定位改为优先读取真实地图图片元素的边界，而不是仅依赖外层容器
- 更新 `src/services/map-projection.ts`，补充 `normalized <-> viewBox` 转换工具，显式暴露渲染坐标契约
- 更新 `src/services/map-projection.spec.ts`，增加 viewBox 对齐护栏测试
- 新增 `src/components/WorldMapStage.spec.ts`，覆盖真实点击后检测点与点击位置保持对齐的组件级回归
- 更新 `02-UAT.md`，记录最终实现方向与后续人工回归说明

## Verification

- `pnpm test`
- `pnpm build`

## Notes

- 这次修复的重点不是再调经纬度常量，而是让“用户看到的底图坐标系”和“点位渲染坐标系”彻底统一
- `geo-lookup` 大 chunk 体积问题仍存在，但不影响这次点击对齐修复
