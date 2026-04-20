---
phase: 27-multi-visit-record-foundation
plan: 03
subsystem: frontend
tags: [frontend, vue, pinia, vitest, legacy-migration]
requires:
  - phase: 27-multi-visit-record-foundation
    provides: TravelRecord contracts、Prisma schema 与 records/auth 后端链路已升级到多次旅行记录和 nullable 日期字段
provides:
  - map-points store 支持同一 placeId 多条 trip 记录与日期字段透传
  - displayPoints place 级去重视图与 tripsByPlaceId 聚合摘要
  - legacy-point-storage 将旧记录统一迁移为未知日期
affects: [27-04-trip-date-ui, timeline, stats]
tech-stack:
  added: []
  patterns:
    - Pinia store 继续以 trip-level `travelRecords` 作为唯一真源，place 级视图全部由 computed 派生
    - optimistic write 以唯一 pending id 跟踪单次 illuminate，请求完成后按 record id 替换或回滚
    - legacy localStorage 迁移显式输出 `startDate: null` / `endDate: null`，禁止从旧字段推断旅行日期
key-files:
  created:
    - .planning/phases/27-multi-visit-record-foundation/27-03-SUMMARY.md
    - apps/web/src/services/legacy-point-storage.spec.ts
  modified:
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/services/legacy-point-storage.ts
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/App.spec.ts
    - apps/web/src/stores/auth-session.spec.ts
key-decisions:
  - "保持 `travelRecords` 为唯一状态源，`tripsByPlaceId` 仅作为 place 级摘要视图，避免新增第二套聚合 state"
  - "authoritative merge 以 `record.id` 作为主键，同时保留 pending delete 对陈旧快照的屏蔽，避免回归既有并发删除语义"
  - "在 Plan 04 UI 日期表单落地前，现有地图点亮入口显式传 `startDate: null` / `endDate: null`，先完成 store 契约升级与类型对齐"
patterns-established:
  - "`illuminate` 的调用方现在必须显式传 `startDate` / `endDate`，即使当前值为 `null`"
  - "同一 placeId 的多条记录只在 store / stats / timeline 层展开，地图 marker 继续按 place 级唯一表达"
requirements-completed: [TRIP-01, TRIP-02, TRIP-03]
duration: 15m 40s
completed: 2026-04-20
---

# Phase 27 Plan 03: Multi-Visit Record Foundation Summary

**map-points store 已升级为 trip-level 多条记录模型，legacy 迁移统一输出未知日期，并为后续日期 UI 准备好 `tripsByPlaceId` 与日期入参契约**

## Performance

- **Duration:** 15m 40s
- **Started:** 2026-04-20T06:13:34Z
- **Completed:** 2026-04-20T06:29:14Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- `apps/web/src/stores/map-points.ts` 现在支持同一地点多次 `illuminate`，并把 `startDate` / `endDate` 透传到 `createTravelRecord`
- `displayPoints` 改为按 `placeId` 去重取最新记录，`tripsByPlaceId` 对外暴露 `Map<string, TravelRecord[]>` 供后续 UI / 统计读取次数摘要
- `apps/web/src/services/legacy-point-storage.ts` 把旧记录统一归一为 `startDate: null` / `endDate: null`，保持 D-08 的“未知而非推测”语义
- `@trip-map/web` 全量测试与 `vue-tsc --noEmit` 已通过，前端测试工厂和现有调用点全部对齐新契约

## Store 与 Legacy 变更概览

- `map-points.ts`
  - `illuminate(summary)` 增加 `startDate` / `endDate`
  - 移除“同 placeId 已点亮即 return”的旧短路，改为允许追加 trip
  - 乐观记录 id 采用 `pending-${placeId}-${Date.now()}-${random}`，并按该 id 执行成功替换 / 失败回滚
  - `applyAuthoritativeTravelRecords` 改为按 `record.id` 合并，同时继续屏蔽 pending delete 的陈旧 snapshot
  - `displayPoints` 以最新 `createdAt` 记录代表同一地点，避免重复 marker
  - 新增 `tripsByPlaceId`，可通过 `store.tripsByPlaceId.get(placeId)` 读取某地点全部 `TravelRecord[]`
- `legacy-point-storage.ts`
  - `normalizeLegacyTravelRecord` 现在总是显式返回 `startDate: null`、`endDate: null`
  - 未新增任何基于 `createdAt` 或其它旧字段的日期推断逻辑

## 测试结果

- `pnpm --filter @trip-map/web test --run src/stores/map-points.spec.ts`
  - 35/35 通过
  - 覆盖日期透传、同地点多次点亮、按 id 合并、display 去重、`tripsByPlaceId`、地点级删除、失败回滚
- `pnpm --filter @trip-map/web test --run src/services/legacy-point-storage.spec.ts`
  - 4/4 通过
  - 覆盖 D-08 空日期迁移、拒绝 `createdAt` 伪装、畸形快照过滤与空快照返回
- `pnpm --filter @trip-map/web test`
  - 28 个 spec / 239 个测试全部通过
- `pnpm --filter @trip-map/web typecheck`
  - 退出码 0

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: 扩展 map-points store 多次记录 / 日期字段失败测试** - `09e8294` (test)
2. **Task 1 GREEN: 实现 map-points 多次记录聚合与日期透传** - `a10e597` (feat)
3. **Task 2 RED: 新增 legacy unknown-date 迁移失败测试** - `a3236b6` (test)
4. **Task 2 GREEN: 实现 legacy 记录 `startDate/endDate = null` 归一化** - `a553fc5` (feat)
5. **Verification deviation: 对齐 web 调用点与测试工厂到新 contracts** - `25b9d34` (fix)

## Files Created/Modified

- `apps/web/src/stores/map-points.ts` - 多条 trip 记录 store、按 id authoritative merge、place 级 display 去重、`tripsByPlaceId`
- `apps/web/src/stores/map-points.spec.ts` - Phase 27 多次记录与日期字段回归用例
- `apps/web/src/services/legacy-point-storage.ts` - 旧记录迁移明确输出未知日期
- `apps/web/src/services/legacy-point-storage.spec.ts` - D-08 legacy migration 单测
- `apps/web/src/components/LeafletMapStage.vue` - 现有点亮入口显式传递 `startDate` / `endDate`
- `apps/web/src/components/LeafletMapStage.spec.ts` - 地图舞台 fixture 对齐新 `TravelRecord` / `illuminate` 契约
- `apps/web/src/App.spec.ts` - app shell fixture 对齐新 `TravelRecord` / `illuminate` 契约
- `apps/web/src/stores/auth-session.spec.ts` - auth-session 导入与 bootstrap fixture 对齐日期字段

## Decisions Made

- 继续让 `recordToDisplayPoint` 使用 `placeId` 作为 marker id，配合 `displayPoints` 的 place 级去重保持现有地图选中逻辑不变。
- `findSavedPointByPlaceId` 改为从 `tripsByPlaceId` 读取首条记录，兼容既有“该地点是否已点亮”的 place 级查询口径。
- 现有 `LeafletMapStage` 在没有日期 UI 的情况下显式传 `null` 日期，而不是依赖默认值或在 store 内补默认值，确保调用方契约提前固定。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 恢复 pending delete 与 authoritative refresh 重叠时的旧删除语义**
- **Found during:** Task 1 GREEN 验证
- **Issue:** 仅按计划草案把 `applyAuthoritativeTravelRecords` 改成 `snapshotById + pendingRecords` 后，待删除地点在 refresh overlap 时会被陈旧 snapshot 重新塞回 `travelRecords`
- **Fix:** 在 id 合并基础上额外过滤掉“位于 `pendingPlaceIds` 且没有 pending optimistic record”的 snapshot 记录，区分 pending add 与 pending delete
- **Files modified:** `apps/web/src/stores/map-points.ts`
- **Verification:** `pnpm --filter @trip-map/web test --run src/stores/map-points.spec.ts` 全绿，原有并发删除用例恢复通过
- **Committed in:** `a10e597`

**2. [Rule 3 - Blocking] 计划级 typecheck 暴露旧调用点与测试 fixture 仍使用旧 contracts**
- **Found during:** Final verification
- **Issue:** `App.spec.ts`、`LeafletMapStage.spec.ts`、`auth-session.spec.ts` 与 `LeafletMapStage.vue` 仍缺少 `TravelRecord.startDate/endDate` 或按旧签名调用 `illuminate`，导致 `vue-tsc --noEmit` 失败
- **Fix:** 为前端测试工厂补齐默认 `startDate: null` / `endDate: null`，并让现有 `illuminate` 调用点显式传空日期
- **Files modified:** `apps/web/src/App.spec.ts`, `apps/web/src/components/LeafletMapStage.spec.ts`, `apps/web/src/components/LeafletMapStage.vue`, `apps/web/src/stores/auth-session.spec.ts`, `apps/web/src/stores/map-points.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web typecheck` 退出码 0；`pnpm --filter @trip-map/web test` 28 个 spec / 239 个测试通过
- **Committed in:** `25b9d34`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** 两处偏差都直接服务于多次记录契约的正确性和计划级验证闭环，没有扩大功能范围。

## Issues Encountered

- 在一次并发 `git add` 中触发了 `.git/index.lock`，随后改为顺序暂存解决，没有影响提交内容或工作树状态。

## User Setup Required

None - no external service configuration required.

## Known Stubs

- `apps/web/src/components/LeafletMapStage.vue:520` 当前仍向 `illuminate` 传 `startDate: null` / `endDate: null`。这是为保持现有 popup 主链路可用而保留的过渡调用点，实际日期输入将由 Plan 04 的 TripDate UI 替换。

## Next Phase Readiness

- Plan 04 可以直接消费 `store.tripsByPlaceId.get(placeId)`，其返回值为 `TravelRecord[]`，其中每条记录都已稳定包含 `startDate` / `endDate`
- `LeafletMapStage` 和相关测试已经接受新的 `illuminate` 入参形状，后续 UI 只需把当前 `null` 替换为表单采集值
- legacy 导入路径已与账号端 records 契约对齐，不会再把旧记录日期伪装成 `createdAt`

## Self-Check: PASSED

- Found: `.planning/phases/27-multi-visit-record-foundation/27-03-SUMMARY.md`
- Found commits: `09e8294`, `a10e597`, `a3236b6`, `a553fc5`, `25b9d34`
