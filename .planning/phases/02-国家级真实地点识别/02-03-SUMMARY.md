---
phase: 02-国家级真实地点识别
plan: 03
subsystem: geo
tags: [projection, regression, alignment, east-asia]
requirements-completed: [GEO-01, GEO-02]
duration: 10min
completed: 2026-03-24
---

# 02-03 Summary

## Outcome

修复了 Phase 2 在东亚区域的点击识别偏移问题。现在地图点击的投影反算与真实 SVG 球面框一致，日本与香港的明显点击样本不会再被错判到中国或 Myanmar。

## Completed Work

- 更新 `src/services/map-projection.ts`，将投影绘图区改为与当前真实球面框一致的 `x=160, y=80, width=1280, height=640`
- 更新 `src/services/map-projection.spec.ts`，增加绘图区护栏测试，防止 SVG 与投影契约再次漂移
- 更新 `src/services/geo-lookup.spec.ts`，新增“明显日本点击”和“明显香港点击”的回归用例
- 更新 `02-UAT.md` gap 记录，补充已实施的修复说明与自动化覆盖信息

## Verification

- `pnpm test -- src/services/map-projection.spec.ts`
- `pnpm test -- src/services/geo-lookup.spec.ts`
- `pnpm test`
- `pnpm build`

## Notes

- 这次修复选择了“让投影配置对齐真实底图球面框”，而不是强行拉伸 SVG 去适配原始 `40..1560` 契约
- 手工 UAT 仍建议再跑一轮日本 / 香港点击确认，但自动化回归已经覆盖了本次用户反馈的两个问题
