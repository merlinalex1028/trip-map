---
phase: 26-overseas-coverage-foundation
plan: 03
subsystem: ui
tags: [vue, vitest, leaflet, popup, overseas]
requires:
  - phase: 26-01
    provides: authoritative overseas support catalog and resolve scope
provides:
  - popup-first unsupported overseas feedback for OUTSIDE_SUPPORTED_DATA
  - ambiguous-only candidate-select regression coverage
  - disabled illuminate CTA accessibility contract in popup
affects: [LeafletMapStage, PointSummaryCard, overseas-coverage]
tech-stack:
  added: []
  patterns: [popup-first unsupported explanation, ambiguous-only candidate confirmation]
key-files:
  created:
    - apps/web/src/constants/overseas-support.ts
  modified:
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
key-decisions:
  - "OUTSIDE_SUPPORTED_DATA 命中海外 fallback 时，只把 unsupported 说明写入 popup fallbackNotice，不再走全局 interactionNotice 主路径。"
  - "candidate-select 继续只服务 ambiguous；单一明确 overseas resolved 命中保持正常详情与点亮入口。"
patterns-established:
  - "Pattern: unsupported overseas feedback lives in popup copy plus disabled CTA, not a separate global notice."
  - "Pattern: popup CTA accessibility is part of the contract and locked by component tests."
requirements-completed: [OVRS-01, OVRS-03]
duration: 10min
completed: 2026-04-16
---

# Phase 26 Plan 03: Overseas Popup Unsupported Feedback Summary

**海外未支持地区现在以 popup notice + disabled CTA 解释，单一 resolved 海外命中继续直达正常详情链路。**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-16T07:53:30Z
- **Completed:** 2026-04-16T08:03:33Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- 新增统一的海外支持国家 copy 常量与 unsupported notice builder，固定首批支持国家文案。
- 把 `OUTSIDE_SUPPORTED_DATA` 的海外 fallback 反馈收口到 popup `fallbackNotice`，并移除 unsupported 的全局 `interactionNotice` 主路径。
- 用组件与集成测试锁住 disabled CTA 的 `title/aria-label`、unsupported notice 顺序，以及 `ambiguous-only` 的候选确认节奏。

## Task Commits

1. **Task 1: 把 unsupported 海外反馈收敛到 popup notice，而不是全局 interactionNotice** - `a1c0ad4` (`feat`)
2. **Task 2: 锁 disabled CTA 与 ambiguous-only 候选确认契约** - `a9f741d` (`test`)
3. **Task 2: 锁 disabled CTA 与 ambiguous-only 候选确认契约** - `7e3f6fa` (`fix`)

## Files Created/Modified

- `apps/web/src/constants/overseas-support.ts` - Phase 26 首批支持国家文案与 unsupported overseas notice builder。
- `apps/web/src/components/LeafletMapStage.vue` - 把 unsupported overseas fallback 写入 popup，并移除 unsupported 的全局 notice 主路径。
- `apps/web/src/components/LeafletMapStage.spec.ts` - 覆盖 unsupported popup-only 反馈、ambiguous-only candidate-select 与 resolved overseas 正常详情链路。
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - 显式收敛 disabled CTA 的无障碍标签与 notice 渲染顺序。
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - 锁 disabled CTA `title/aria-label` 和 unsupported notice 优先级。

## Decisions Made

- `buildUnsupportedOverseasNotice()` 统一输出“已识别到… / 当前暂不支持点亮…”文案，避免 popup 与测试各自拼装 copy。
- `PointSummaryCard` 把 fallback notice 与 boundary-missing notice 组装成显式列表，减少模板顺序漂移带来的回归风险。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TDD RED 阶段新增的 ambiguous 断言最初把 `draftPoint?.placeId === null` 写得过细；实际契约是 `candidate-select` 直接切到 `pendingCanonicalSelection`，因此修正为断言 `draftPoint === null`。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 26-03 的 popup unsupported/CTA/candidate-select 契约已经稳定，可继续做人工点击验证。
- 手动验证仍需确认一个支持国家 admin1 与一个不支持海外地区的真实点击体验。

## Self-Check

PASSED

- Found summary file on disk.
- Verified task commits `a1c0ad4`, `a9f741d`, and `7e3f6fa` exist in git history.

---
*Phase: 26-overseas-coverage-foundation*
*Completed: 2026-04-16*
