---
phase: 25-sync-semantics-multi-device-hardening
plan: 02
subsystem: auth
tags: [vue, pinia, auth, bootstrap, foreground-sync, vitest]
requires:
  - phase: 24-session-boundary-local-import
    provides: auth-session bootstrap restore flow and session-boundary reset semantics
provides:
  - same-user lightweight refresh action
  - foreground-triggered bootstrap refresh on focus/visibility resume
  - refresh failure vs session-expired notice split
affects: [SYNC-04, SYNC-05, auth-session, app-shell]
tech-stack:
  added: []
  patterns:
    - authenticated foreground refresh reuses bootstrap as the authoritative snapshot source
    - same-user refresh replaces records without resetTravelRecordsForSessionBoundary
key-files:
  created: []
  modified:
    - apps/web/src/stores/auth-session.ts
    - apps/web/src/stores/auth-session.spec.ts
    - apps/web/src/App.vue
    - apps/web/src/App.spec.ts
key-decisions:
  - "foreground refresh 只在 authenticated 状态触发，并通过 in-flight promise 去抖，避免焦点切换风暴。"
  - "同 user refresh 成功时不清空地图边界，也不落 `已切换到 ...` notice；只有真正 session 失效才回到 anonymous。"
requirements-completed: [SYNC-04, SYNC-05]
completed: 2026-04-15
---

# Phase 25 Plan 02: Foreground Refresh Summary

**前端现在会在同账号回到前台时轻量刷新 authoritative bootstrap snapshot，并把普通刷新失败与会话失效清晰分流。**

## Accomplishments

- 在 `auth-session` 中新增 `refreshAuthenticatedSnapshot()`，同 user 成功时只替换 `travelRecords`，不再误走 switch-account 清场。
- 在 `App.vue` 中接入 `window focus` 与 `document.visibilitychange` 的 foreground sync trigger，并在组件卸载时清理监听器。
- 为 same-user refresh 成功、普通失败、401 session expired 三条路径补齐 store / App 级回归测试。

## Verification

- `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/App.spec.ts` ✅
- `pnpm --filter @trip-map/web typecheck` ✅

## Task Commits

本计划在当前工作树内联完成，未生成独立 task commit。

## Files Created/Modified

- `apps/web/src/stores/auth-session.ts` - 增加 same-user refresh action 与 refresh failure notice
- `apps/web/src/stores/auth-session.spec.ts` - 锁定 same-user refresh success / network failure / 401 paths
- `apps/web/src/App.vue` - 注册 foreground refresh 监听器
- `apps/web/src/App.spec.ts` - 验证 focus / visibility resume trigger 与 anonymous/restoring guard

## Decisions Made

- foreground refresh 不新增 loading overlay，保持静默轻刷新，避免打断地图主舞台。
- 刷新成功不主动弹 success notice，避免与点亮/取消点亮成功提示互相冲掉。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

`App.vue` 在 `setup` 里先解构 store 方法，导致测试里必须在挂载前就 spy `refreshAuthenticatedSnapshot`；已调整 spec 写法并完成回归。

## Next Phase Readiness

多设备最终一致的轻刷新路径已经建立，后续只需要把 mutation 成功/失败反馈补齐即可完成 Phase 25 的前端闭环。

## Self-Check

PASSED

---
*Phase: 25-sync-semantics-multi-device-hardening*
*Completed: 2026-04-15*
