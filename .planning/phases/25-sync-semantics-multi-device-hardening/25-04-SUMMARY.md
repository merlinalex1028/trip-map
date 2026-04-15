---
phase: 25-sync-semantics-multi-device-hardening
plan: 04
subsystem: ui
tags: [vue, pinia, vitest, foreground-sync, optimistic-mutation]
requires:
  - phase: 25-sync-semantics-multi-device-hardening
    provides: same-user foreground refresh trigger and sync feedback notice semantics
provides:
  - pending-aware authoritative refresh coordination for same-user overlap flows
  - overlap regression coverage for auth-session, map-points, and App foreground refresh
  - authoritative create/delete convergence after concurrent refresh
affects: [SYNC-03, SYNC-04, SYNC-05, auth-session, map-points, app-shell]
tech-stack:
  added: []
  patterns:
    - same-user foreground refresh applies authoritative records by preserving in-flight placeId mutations
    - create/delete mutation completion reasserts final place state after overlap refresh
key-files:
  created: []
  modified:
    - apps/web/src/stores/auth-session.ts
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/auth-session.spec.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/App.spec.ts
key-decisions:
  - "same-user refresh 继续保持轻刷新，但改走 `applyAuthoritativeTravelRecords()` 以避开 in-flight placeId 的竞态覆盖。"
  - "点亮成功路径改为按 `placeId` upsert authoritative record，避免 optimistic row 被并发 refresh 移除后无法写回。"
  - "取消点亮成功后再次按 `placeId` 过滤本地列表，确保 stale refresh 重叠后仍收敛为未点亮。"
patterns-established:
  - "Foreground overlap coordination: authoritative snapshot only replaces non-pending placeIds."
  - "Mutation convergence: successful create/delete must restate final local truth after overlap refresh."
requirements-completed: [SYNC-03, SYNC-04, SYNC-05]
duration: 6m
completed: 2026-04-15
---

# Phase 25 Plan 04: Foreground Overlap Hardening Summary

**same-user foreground refresh 现在会避让 in-flight 点亮/取消点亮，并在 overlap 场景下稳定写回 authoritative 结果。**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-15T06:46:00Z
- **Completed:** 2026-04-15T06:52:20Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- 先补齐 overlap / concurrent / foreground refresh 回归，直接锁住 UAT blocker 的 A/B 窗口并发路径。
- 在 `map-points` 中新增 pending-aware authoritative refresh 协调，并修补 create/delete 在 overlap 下的最终写回。
- 让 `auth-session.refreshAuthenticatedSnapshot()` 对 same-user 改走轻量协调入口，继续保留普通失败与 `401` 的分流语义。

## Verification

- `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` ✅
- `pnpm --filter @trip-map/web typecheck` ✅
- 手动双窗口 UAT：未由 agent 在本轮重新执行

## Task Commits

Each task was committed atomically:

1. **Task 1: 先把 refresh 与点亮/取消点亮重叠的竞态回归锁住** - `611201e` (test)
2. **Task 2: 建立 pending-aware refresh 协调并修补 authoritative 写回** - `5a68760` (fix)

## Files Created/Modified

- `apps/web/src/stores/auth-session.ts` - same-user foreground refresh 改走 pending-aware authoritative snapshot 协调
- `apps/web/src/stores/map-points.ts` - 新增 placeId 维度的 authoritative refresh 协调，并修补 create/delete overlap 收敛
- `apps/web/src/stores/auth-session.spec.ts` - 增加 same-user overlap refresh 不清场、不复活 stale record 的回归
- `apps/web/src/stores/map-points.spec.ts` - 增加 illuminate/unilluminate overlap 与失败语义分流回归
- `apps/web/src/App.spec.ts` - 增加 focus-triggered foreground refresh overlap 的 App shell 回归

## Decisions Made

- 保持协调粒度只在 canonical `placeId`，没有引入 tombstone、冲突弹窗或新的同步中心。
- `replaceTravelRecords()` 继续保留整表替换语义，same-user foreground refresh 单独使用新的 pending-aware 协调入口。
- overlap 修复只改变 store 协调与 authoritative 写回，不改 `App.vue` 的 focus / visibility 触发契约。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `git add` 过程中短暂遇到遗留 `.git/index.lock` 报错；复查时锁文件已消失，重试后正常提交。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 25 的 foreground refresh overlap blocker 已在自动化回归中封住，适合重新执行双窗口同账号 UAT。
- 若人工 UAT 通过，Phase 25 可以按既有基线收口，不需要额外同步架构扩展。

## Self-Check

PASSED

---
*Phase: 25-sync-semantics-multi-device-hardening*
*Completed: 2026-04-15*
