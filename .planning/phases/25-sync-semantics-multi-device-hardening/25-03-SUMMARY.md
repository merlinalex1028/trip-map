---
phase: 25-sync-semantics-multi-device-hardening
plan: 03
subsystem: ui
tags: [vue, pinia, leaflet, notices, sync-feedback, vitest]
requires:
  - phase: 25-sync-semantics-multi-device-hardening
    provides: idempotent delete semantics and same-user foreground refresh
provides:
  - explicit illuminate success notice
  - explicit unilluminate success/failure notice split
  - popup-level coverage for mutation feedback semantics
affects: [SYNC-03, SYNC-05, map-points, popup notices]
tech-stack:
  added: []
  patterns:
    - optimistic mutation success/failure routes through shared map-ui notice surface
    - stale delete success is handled as a normal success branch instead of frontend special-casing
key-files:
  created: []
  modified:
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/components/LeafletMapStage.spec.ts
key-decisions:
  - "点亮成功与取消点亮成功都继续复用现有 info notice，不额外引入新的 toast/sync center。"
  - "取消点亮普通失败时恢复完整 previousRecords 快照，而不是只把单条记录 append 回末尾。"
requirements-completed: [SYNC-03, SYNC-05]
completed: 2026-04-15
---

# Phase 25 Plan 03: Sync Feedback Summary

**地图点亮交互现在能明确区分同步成功、普通失败和 stale delete 成功收敛，不再出现取消点亮静默失败。**

## Accomplishments

- 为 `illuminate()` 增加成功提示，为 `unilluminate()` 增加成功提示和普通失败 warning，统一走 `map-ui` notice surface。
- 将取消点亮失败回滚从“追加单条旧记录”升级为“恢复完整 previousRecords 快照”，避免顺序与快照状态漂移。
- 在 `map-points.spec.ts` 与 `LeafletMapStage.spec.ts` 中补齐成功、失败、popup 交互的 notice 断言。

## Verification

- `pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts` ✅
- `pnpm --filter @trip-map/web typecheck` ✅

## Task Commits

本计划在当前工作树内联完成，未生成独立 task commit。

## Files Created/Modified

- `apps/web/src/stores/map-points.ts` - 增加 illuminate/unilluminate success/failure notices
- `apps/web/src/stores/map-points.spec.ts` - 锁定 success/warning/stale delete regression
- `apps/web/src/components/LeafletMapStage.spec.ts` - 验证 popup action 能把 success notice 传到 app shell

## Decisions Made

- stale delete 不在前端另写猜测逻辑，而是依赖服务端 Phase 25 Plan 01 的 204 幂等语义自然进入 success 分支。
- success notice 使用短文案，减少与地图主交互的视觉竞争。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

Phase 25 的同步语义已经完成从 server contract 到 foreground refresh 再到用户反馈的全链路闭环，Phase 26 可以直接在这一基线上扩展海外覆盖。

## Self-Check

PASSED

---
*Phase: 25-sync-semantics-multi-device-hardening*
*Completed: 2026-04-15*
