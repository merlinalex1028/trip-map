---
phase: 23-auth-ownership-foundation
plan: 10
subsystem: web-auth
tags: [vue, pinia, vitest, records, auth-bootstrap]
requires:
  - phase: 23-04
    provides: auth-session bootstrap snapshots and session-boundary record reset helpers
  - phase: 23-09
    provides: auth submit/session expiry boundary handling for current-user records
provides:
  - Leaflet map startup no longer auto-fetches `/records` outside auth bootstrap
  - optimistic records write failures now surface a warning notice after rollback
  - regression coverage for auth bootstrap snapshot consumption in App and map stage
affects: [phase-23-uat, current-user-records, restore-flow]
tech-stack:
  added: []
  patterns:
    - auth-session bootstrap as the sole source of truth for records restore
    - optimistic records rollback paired with visible warning feedback
key-files:
  created: []
  modified:
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/App.spec.ts
key-decisions:
  - "LeafletMapStage 不再在 map ready 时主动请求 `/records`，records restore 只消费 auth-session 已经建立好的 bootstrap 快照。"
  - "records 写入遇到非 401 错误时，除了回滚 optimistic record，还必须写入用户可见的 warning notice。"
patterns-established:
  - "Bootstrap ownership pattern: App/auth-session 负责恢复 records 快照，地图组件只消费 store 当前边界。"
  - "Failure feedback pattern: current-user records 写入失败不能静默回滚，必须给出明确 UI 提示。"
requirements-completed: [AUTH-03, SYNC-01, SYNC-02]
duration: 4min
completed: 2026-04-12
---

# Phase 23 Plan 10: Auth Ownership Gap Closure Summary

**地图启动现已完全收口到 auth bootstrap records 快照，匿名/刷新阶段不再误打 `/records`，而 records 写入失败会给出明确 warning 而不是静默回滚。**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-12T23:45:21+08:00
- **Completed:** 2026-04-12T23:48:18+08:00
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- 去掉 `LeafletMapStage` 在地图 ready 时对 `bootstrapFromApi()` 的自动调用，恢复链路只保留 `auth-session.restoreSession()` 注入的 records 快照。
- 在 `map-points` 的 optimistic 点亮失败路径中，为非 401 错误增加明确 warning notice，避免用户只看到静默回滚。
- 补齐 App / LeafletMapStage / map-points 的回归测试，锁定匿名冷启动不再额外请求 `/records`、authenticated snapshot 可直接驱动地图层、点亮失败会出现 warning。

## Task Commits

Each task was committed atomically:

1. **Task 1: 用测试锁定 records 恢复与点亮的真实边界** - `f3a9907` (test)
2. **Task 2: 收口 records bootstrap 真源并修复 live `/records` 路径** - `23488ec` (fix)

## Files Created/Modified

- `apps/web/src/components/LeafletMapStage.vue` - 移除地图 ready 时自动 `/records` bootstrap，仅保留图层预载与快照消费。
- `apps/web/src/stores/map-points.ts` - 为非 401 的 records 写入失败增加 warning notice，同时保留 unauthorized 走 auth-session 回收。
- `apps/web/src/components/LeafletMapStage.spec.ts` - 覆盖匿名启动不 refetch `/records`、authenticated snapshot 直接驱动地图层等边界。
- `apps/web/src/stores/map-points.spec.ts` - 覆盖 anonymous session reset 不依赖 `/records` 和点亮失败 warning。
- `apps/web/src/App.spec.ts` - 覆盖 auth bootstrap snapshot 能直接驱动地图 shell，且不产生额外 `/records` fetch。

## Decisions Made

- 不新增第二条 restore 或 records bootstrap 通道，继续把 auth-session store 作为 records 恢复真源。
- live `/records` 失败反馈保持最小闭环：沿用全局 `interactionNotice` 通道，不额外引入新的 toast/store。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 尝试运行 `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts` 时，测试环境无法连接 `aws-1-ap-southeast-1.pooler.supabase.com:5432`，因此未能在本机完成 server e2e 复验；本次未修改 server records 代码。
- 工作树里存在 `.git/index.lock` 竞争，原因是并行 `git add` 与同仓库其他 git 进程冲突；执行中改为顺序暂存后恢复正常提交。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 23 的 records restore/source-of-truth 边界已闭环，后续 UAT 可以直接验证匿名冷启动、刷新恢复和已登录点亮的真实产品链路。
- 若要补 server current-user `/records` 的 live 复验，只需要在数据库可达的环境重跑既有 e2e。

## Self-Check

PASSED

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
