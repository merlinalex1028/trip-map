---
phase: 04-可用性打磨与增强能力
plan: 03
subsystem: ui
tags: [geo, city, regression, gap-closure, uat]
requires:
  - phase: 04-可用性打磨与增强能力
    provides: 城市增强、国家级回退与 UAT 诊断结果
provides:
  - 世界地图尺度感知的城市命中容差
  - near-city 与 near-but-not-on 回归测试
  - 带 resolution 的 Phase 4 UAT gap 记录
affects: [城市增强命中体验, 国家级回退稳定性, 后续 verify-work]
tech-stack:
  added: []
  patterns: [scale-aware hit tolerance, interaction-level geo regression]
key-files:
  created: [.planning/phases/04-可用性打磨与增强能力/04-03-SUMMARY.md]
  modified: [src/services/geo-lookup.ts, src/services/geo-lookup.spec.ts, src/components/WorldMapStage.spec.ts, .planning/phases/04-可用性打磨与增强能力/04-UAT.md]
key-decisions:
  - "城市增强容差基于当前世界地图交互尺度设置最小像素下限，而不是只靠几十公里的真实半径"
  - "UAT gap 修复优先通过 service + stage 双层回归覆盖来锁定真实点击行为"
patterns-established:
  - "城市候选匹配在无缩放世界地图上使用尺度感知容差"
  - "城市命中与国家级回退都通过 near-city 点击样本回归保护"
requirements-completed: [GEO-04, UX-03]
duration: 18min
completed: 2026-03-24
---

# Phase 04: 可用性打磨与增强能力 Summary

**城市增强命中区已从几乎不可点中调整为符合整张世界地图手动点击尺度，并补上对应回归保护**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-24T08:34:00Z
- **Completed:** 2026-03-24T08:51:01Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- 为城市命中逻辑引入世界地图尺度感知的最小交互容差
- 新增 near-city 与 near-but-not-on city 的服务层和交互层回归测试
- 在 `04-UAT.md` 中为两个已诊断 gap 补齐 resolution，保留后续复验上下文

## Task Commits

本次 Codex 执行未创建 git commit；改动已通过测试与构建验证并保留在工作区。

## Files Created/Modified
- `src/services/geo-lookup.ts` - 用当前投影尺度推导城市命中的最小像素容差
- `src/services/geo-lookup.spec.ts` - 覆盖 near-city 命中与 near-but-not-on 回退样本
- `src/components/WorldMapStage.spec.ts` - 通过真实点击路径验证城市增强与回退流
- `.planning/phases/04-可用性打磨与增强能力/04-UAT.md` - 为已诊断 gap 添加 resolution 说明

## Decisions Made
- 不直接把城市基础半径扩大到任意大，而是基于当前 `WORLD_PROJECTION_CONFIG` 推导最小交互半径
- 让交互回归样本围绕京都这类内陆点位建立，避免把测试误差混进海岸线命中问题

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

`WorldMapStage.spec.ts` 在 `vue-tsc` 下出现过一次 mock 签名过窄的问题，已通过给 mock 显式标注真实函数签名解决。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 4 的 gap closure 已完成，建议重新运行 `$gsd-verify-work 4` 做一次简短复验，重点确认城市增强与国家级回退在手动点击下的体感是否符合预期。

---
*Phase: 04-可用性打磨与增强能力*
*Completed: 2026-03-24*
