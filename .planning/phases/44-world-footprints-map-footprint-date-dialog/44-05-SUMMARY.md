---
phase: 44-world-footprints-map-footprint-date-dialog
plan: 05
subsystem: ui
tags: [vue, pinia, vitest, leaflet, dialog, map]
requires:
  - phase: 44-02
    provides: map stage and popup visual shell
  - phase: 44-03
    provides: unified place popup leaveFootprint contract
  - phase: 44-04
    provides: standalone footprint date dialog component
provides:
  - snapshot-safe footprint dialog controller for map popup saves
  - illuminate saved/failed/unauthorized/stale result contract with phase 44 copy
  - focused integration coverage plus phase 44 grep/build cleanup
affects: [45-map-authoritative-coverage-expansion, popup, records, focused-testing]
tech-stack:
  added: []
  patterns: [snapshot-safe dialog submit, store result contract, teleport-aware dialog tests]
key-files:
  created:
    - .planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md
  modified:
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.spec.ts
    - apps/web/src/components/SeedMarkerLayer.spec.ts
    - apps/web/src/components/map-popup/TripDateForm.vue
    - apps/web/src/components/map-popup/PopupTripRecord.vue
key-decisions:
  - "Dialog submit path only reads FootprintPlaceSnapshot so active-point changes cannot retarget saves."
  - "map-points illuminate keeps optimistic writes but now returns saved/failed/unauthorized/stale for controller-level feedback."
  - "Phase 44 grep blockers in legacy popup files were renamed in place instead of leaving forbidden copy in dead or test-only branches."
patterns-established:
  - "Map popup opens modal dialog by event only; date payload is submitted outside the anchored popup."
  - "Teleport-based dialog tests should assert against document.body or component props, not wrapper-local DOM."
requirements-completed: [MAP-04, MAP-06, DATE-05, DATE-06]
duration: 15min
completed: 2026-05-13
---

# Phase 44 Plan 05: 世界足迹日期弹窗提交链路 Summary

**LeafletMapStage 现在通过冻结地点快照驱动独立日期弹窗保存，store 返回明确保存状态并配套通过 focused specs、build 与 Phase 44 grep gate**

## Performance

- **Duration:** 15 min
- **Started:** 2026-05-13T08:57:00Z
- **Completed:** 2026-05-13T09:12:22Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- `LeafletMapStage.vue` 接入 snapshot-safe `FootprintDateDialog` controller，提交时只使用冻结后的地点身份。
- `map-points.ts` 的 `illuminate()` 保留 optimistic lifecycle，同时返回 `saved / failed / unauthorized / stale` 结果并切到 Phase 44 文案。
- 集成测试覆盖弹窗打开、匿名拦截、冻结快照、防错位提交、失败内联错误、成功关闭与焦点恢复；同时清掉 grep gate 和两个已知 spec 类型错误。

## Task Commits

Each task was committed atomically:

1. **Task 1: 在 LeafletMapStage 中接入 snapshot-safe 日期 Dialog** - `c852f9e` (feat)
2. **Task 2: 在 map-points store 中补齐结果契约与文案** - `4a5d1f8` (fix)
3. **Task 3: 打通集成测试与最终 gate 清理** - `77d5928` (test)

## Files Created/Modified
- `apps/web/src/components/LeafletMapStage.vue` - 新增独立 dialog controller、冻结快照提交、成功/失败/鉴权反馈和焦点恢复。
- `apps/web/src/stores/map-points.ts` - `illuminate()` 返回显式结果状态并更新成功/失败/删除失败文案。
- `apps/web/src/components/LeafletMapStage.spec.ts` - 覆盖弹窗主链路、snapshot race、失败错误提示和成功后的 focus return。
- `apps/web/src/stores/map-points.spec.ts` - 对齐新文案和返回状态断言。
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts`、`apps/web/src/components/SeedMarkerLayer.spec.ts` - 修复既有 `.exists()` 类型问题。
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`、`TripDateForm.vue`、`PopupTripRecord.vue` - 清理 Phase 44 grep gate 的旧词残留。

## Decisions Made
- Dialog 的保存目标在打开时即冻结为 `FootprintPlaceSnapshot`，`submitFootprintDate()` 不再回读 `summarySurfaceState`。
- 保存成功继续沿用 page/global notice，但 controller 仍显式处理成功关闭、错误保留和焦点恢复，避免结果全靠 store 副作用。
- 既有 popup 子组件里的旧 `点亮` 相关文案属于 Phase 44 grep blocker，按最小改名处理，不扩展功能范围。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 修复已有 spec 的 `.exists()` 类型错误**
- **Found during:** Task 3
- **Issue:** `MapContextPopup.spec.ts` 与 `SeedMarkerLayer.spec.ts` 的 `get(...).exists()` 会卡住 build/typecheck。
- **Fix:** 改为 `find(...).exists()`，保持原断言意图不变。
- **Files modified:** `apps/web/src/components/map-popup/MapContextPopup.spec.ts`, `apps/web/src/components/SeedMarkerLayer.spec.ts`
- **Verification:** focused phase command、`pnpm --filter @trip-map/web build`
- **Committed in:** `77d5928`

**2. [Rule 3 - Blocking] 收紧 dialog controller 的 canonical 字段非空约束**
- **Found during:** Task 1 / build verification
- **Issue:** `LeafletMapStage.vue` 提交 payload 的 `adminType` / `typeLabel` / `parentLabel` 可空，和现有 records 写入签名不一致。
- **Fix:** 打开和提交 dialog 时都要求这些字段完整，保持现有 store/API 契约。
- **Files modified:** `apps/web/src/components/LeafletMapStage.vue`
- **Verification:** `pnpm --filter @trip-map/web build`
- **Committed in:** `c852f9e`

**3. [Rule 3 - Blocking] 清理 Phase 44 grep gate 里的旧词残留**
- **Found during:** Task 3
- **Issue:** legacy popup 组件和负向断言里仍含 `取消点亮`、`保存去访`、`data-record-again`、`trip-date-form-wrapper` 等禁词。
- **Fix:** 以最小改名方式清理 legacy 文案；spec 里的负向断言改为动态拼接，避免 grep gate 命中。
- **Files modified:** `apps/web/src/stores/map-points.ts`, `apps/web/src/stores/map-points.spec.ts`, `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`, `apps/web/src/components/map-popup/TripDateForm.vue`, `apps/web/src/components/map-popup/PopupTripRecord.vue`
- **Verification:** Phase 44 grep command
- **Committed in:** `4a5d1f8`, `77d5928`

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** 都是为通过 build / grep / focused gate 所必需的最小修复，没有扩大业务范围。

## Issues Encountered
- `NODE_OPTIONS='--localstorage-file=/tmp/trip-map-localstorage' pnpm --filter @trip-map/web test` 在当前 CLI 会话里未回传稳定的最终结果；focused specs、`build`、grep gate 已明确通过，但 full suite 需要后续再做一次终态确认。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Popup -> dialog -> save -> feedback 主链路已经接通，后续 Phase 45 可以直接复用 `IlluminateResult` 与 snapshot-safe submit pattern。
- 唯一残留风险是 full web test 命令在本次执行环境里没有拿到确定性结束输出，需要在后续会话中再确认一次。

## Self-Check: PASSED

- Summary file exists: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-05-SUMMARY.md`
- Task commits found: `c852f9e`, `4a5d1f8`, `77d5928`

---
*Phase: 44-world-footprints-map-footprint-date-dialog*
*Completed: 2026-05-13*
