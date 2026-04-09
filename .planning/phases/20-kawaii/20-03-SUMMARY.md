---
phase: 20-kawaii
plan: 03
subsystem: ui
tags: [vue, tailwind, vitest, motion, popup]
requires:
  - phase: 20-kawaii
    provides: Popup light-shell boundary from 20-02 and app-shell spacing baseline from 20-01
provides:
  - PointSummaryCard inner cloud card contract for kawaii popup content
  - Stable primary/secondary CTA hierarchy with 300ms ease-out motion guards
affects: [20-kawaii, map-popup, app-shell, validation]
tech-stack:
  added: []
  patterns:
    - Inner cloud card owns thick border, roomy spacing, and main pastel shadow
    - CTA motion stays inside popup card surfaces with reduced-motion fallback
key-files:
  created:
    - .planning/phases/20-kawaii/20-03-SUMMARY.md
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts
key-decisions:
  - "把主云朵质感、层级 attrs 和微交互全部收口到 PointSummaryCard，保持 MapContextPopup 只做轻壳定位层。"
  - "card root 负责 hover lift，primary/secondary CTA 负责 hover + active 下压，badge/type pill/notice 维持静态。"
  - "源码合同断言改用 `?raw` 导入，避免 Vitest 运行时读取 SFC 源文件时出现 URL scheme 问题。"
patterns-established:
  - "Point summary cloud surface uses data-kawaii-surface='cloud' as the primary styling and motion contract."
  - "Reduced-motion fallback explicitly neutralizes transform on cloud/primary/secondary interactive surfaces."
requirements-completed: [STYLE-03, STYLE-04, STYLE-05, INTER-01, INTER-02, INTER-03]
duration: 18min
completed: 2026-04-09
---

# Phase 20 Plan 03: Point Summary Cloud Card Summary

**PointSummaryCard 已成为 popup 主 kawaii 表面：内层 cloud card、badge/type pill/CTA 层级，以及 300ms ease-out 微交互都已在这里锁定。**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-09T14:25:00+08:00
- **Completed:** 2026-04-09T14:38:00+08:00
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- 为 `PointSummaryCard` 新增并扩展 kawaii 合同测试，覆盖 cloud card、层级 attrs、点击高度、静态 surface 护栏与 reduced-motion 源码合同。
- 将 `PointSummaryCard.vue` 收口为厚白边、大圆角、宽松 `p-6 gap-4` 的 inner cloud card，并让主 CTA、候选确认卡接入 `transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95`。
- 明确 reduced-motion 下只移除 `cloud`、`primary-cta`、`secondary-cta` 的 transform，不把 motion 扩散到 badge / type pill / notice 或地图容器。

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): 用 Wave 0 内卡合同测试锁住 cloud card、层级 attrs 与宽松 spacing** - `e824605` (test)
2. **Task 1 / Task 2 (GREEN): 把 PointSummaryCard 收口成主云朵表面并接入 motion 合同** - `315fbdd` (feat)
3. **Task 2 (FIX): 修复源码合同测试的 Vitest 兼容性并完成验证** - `43e6b7d` (fix)

## Files Created/Modified

- `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` - 新增 cloud card、层级 attrs、motion 与 reduced-motion 合同断言。
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - 收口 inner cloud card 视觉层级、CTA motion 合同与 reduced-motion 护栏。
- `.planning/phases/20-kawaii/20-03-SUMMARY.md` - 记录本 plan 的实现、验证与收尾修复。

## Decisions Made

- 厚白边、主阴影和大圆角全部由 `PointSummaryCard` 自身承担，popup outer shell 不再重复消费同一层视觉注意力。
- `data-kawaii-role="primary-cta"` 与 `data-kawaii-role="secondary-cta"` 是唯一允许承接 hover/active transform 的按钮表面；badge、type pill、notice 继续保持稳定静态。
- 源码级 reduced-motion 合同通过 `?raw` 读取 SFC 文本，避免 Node `readFileSync(new URL(...))` 在 Vitest 环境下的 scheme 兼容问题。

## Deviations from Plan

None - plan intent was executed as written. 唯一额外修复是把源码读取方式切换为 `?raw`，用于让既定的 reduced-motion 合同测试在 Vitest 中可稳定运行。

## Issues Encountered

- 初次执行时，`PointSummaryCard.kawaii.spec.ts` 使用 `readFileSync(new URL('./PointSummaryCard.vue', import.meta.url), 'utf-8')` 读取 SFC 源码，Vitest 运行时触发 `The URL must be of scheme file`。已通过 `?raw` 导入修复。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `20-04` 现在可以直接把 App / popup / cloud card 三组 kawaii 合同测试纳入自动化门禁，并回填 `20-VALIDATION.md`。
- Wave 1 的 shell、outer shell 和 inner cloud card 已全部具备 summary 与验证证据，可进入最终 validation 闭环。

## Self-Check

PASSED

- FOUND: `.planning/phases/20-kawaii/20-03-SUMMARY.md`
- FOUND: `e824605`
- FOUND: `315fbdd`
- FOUND: `43e6b7d`

---
*Phase: 20-kawaii*
*Completed: 2026-04-09*
