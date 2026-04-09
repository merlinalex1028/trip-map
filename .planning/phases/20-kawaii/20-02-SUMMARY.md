---
phase: 20-kawaii
plan: 02
subsystem: ui
tags: [vue, tailwind, vitest, leaflet, popup]
requires:
  - phase: 19-tailwind-token
    provides: Tailwind v4 token baseline and popup thin-shell guardrails
provides:
  - MapContextPopup light outer shell contract for anchored popup placement
  - Pointer-safe popup arrow contract and body slot coverage
affects: [20-kawaii, map-popup, point-summary-card]
tech-stack:
  added: []
  patterns:
    - Light outer popup shell with utility-class contract
    - Inner cloud card remains owned by PointSummaryCard
key-files:
  created:
    - .planning/phases/20-kawaii/20-02-SUMMARY.md
  modified:
    - apps/web/src/components/map-popup/MapContextPopup.vue
    - apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts
key-decisions:
  - "Popup anchored shell only keeps light border/shadow chrome; heavy cloud styling stays in PointSummaryCard."
  - "Arrow stays decorative and pointer-safe via data contract plus `pointer-events-none`."
patterns-established:
  - "Map popup outer shell must not carry hover/active transform classes."
  - "Popup title keeps aria-labelledby via text interpolation, not raw HTML injection."
requirements-completed: [STYLE-04]
duration: 2m
completed: 2026-04-09
---

# Phase 20 Plan 02: Popup 轻壳合同 Summary

**MapContextPopup 现在只承担轻量 anchored shell 与 pointer-safe arrow，厚白边和主云朵视觉继续留在内层 PointSummaryCard。**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-09T14:23:06+08:00
- **Completed:** 2026-04-09T14:25:18+08:00
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- 为 `MapContextPopup` 新增 kawaii 合同测试，锁定 light shell、arrow 和内层 card slot 责任边界。
- 将 popup 外层从 scoped heavy chrome 收口为 Tailwind utility 轻壳，不再承担厚白边与重投影。
- 保留 `aria-labelledby`、标题文本插值、`focusEntryPoint()`、`defineExpose({ getPopupElement })` 与 `PointSummaryCard` 直连装配。

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): 用 Wave 0 popup 合同测试锁住轻壳 outer shell 与 pointer-safe 箭头** - `23e0a40` (test)
2. **Task 1 (GREEN): 用轻壳 utility contract 实现 outer shell / arrow / body slot** - `a4392fb` (feat)

## Files Created/Modified
- `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` - 新增 light shell、arrow pointer-safety、inner card slot 与标题插值合同测试。
- `apps/web/src/components/map-popup/MapContextPopup.vue` - 将 popup 外层改为轻壳 utility class，并给箭头和 body 增加 kawaii data contract。
- `.planning/phases/20-kawaii/20-02-SUMMARY.md` - 记录本 plan 的实现、验证与风险。

## Decisions Made
- Popup 外层只保留 `border border-white/70`、轻阴影和 blur，避免重复消费 `STYLE-04` 的厚白边云朵视觉。
- 箭头只负责 anchored 定位提示，不承接点击；壳层本身不引入 hover / active scale，避免 popup anchor drift。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `pnpm --filter @trip-map/web test -- src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts` 通过，但完整 `pnpm --filter @trip-map/web typecheck` 被仓库内已存在的 `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` 类型错误阻塞，和本 plan 改动无关。
- `RED` 提交时工作区里已有已暂存的 `apps/web/src/App.kawaii.spec.ts`，因此 `23e0a40` 一并带上了该文件；本 plan 未修改该文件内容。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Popup outer shell 的职责边界已固定，后续可继续在 `PointSummaryCard.vue` 内层推进 cloud card 与 motion 细节。
- 若要把本阶段验证完全收口，需先处理 `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` 的现存 typecheck 错误。

## Self-Check

PASSED

- FOUND: `.planning/phases/20-kawaii/20-02-SUMMARY.md`
- FOUND: `23e0a40`
- FOUND: `a4392fb`

---
*Phase: 20-kawaii*
*Completed: 2026-04-09*
