---
phase: 12-canonical
plan: 03
subsystem: ui
tags: [vue, pinia, canonical, persistence, api]
requires:
  - phase: 12-canonical
    provides: 12-01 canonical resolve union、place summary 与 Phase 12 fixtures/contracts
provides:
  - web canonical resolve/confirm API client
  - canonical summary driven map-point store and local snapshot contract
  - WorldMapStage server-authoritative resolve flow
affects: [Phase 12 UI summary, Phase 14 Leaflet map flow, Phase 15 records api]
tech-stack:
  added: [none]
  patterns: [canonical summary persistence, server-authoritative resolve orchestration, placeId-based reuse]
key-files:
  created:
    - apps/web/src/services/api/canonical-places.ts
    - apps/web/src/shims-vue.d.ts
  modified:
    - apps/web/src/components/WorldMapStage.vue
    - apps/web/src/services/point-storage.ts
    - apps/web/src/stores/map-points.ts
    - apps/web/src/types/map-point.ts
    - apps/web/src/types/geo.ts
key-decisions:
  - "web 继续复用现有 candidate-select popup 结构，但把 server candidate 的 placeId 投影到兼容的 UI candidate id 上，避免再生成本地 authoritative 候选。"
  - "canonical pending/saved 复用以 placeId 为主键，cityId 只保留兼容字段，不再作为唯一身份来源。"
  - "为满足计划要求的 `tsc --noEmit`，apps/web 补 package-local `.vue` shim，而不是修改 monorepo 根级 TypeScript 配置。"
patterns-established:
  - "Pattern 1: WorldMapStage 点击后先调 `/places/resolve`，resolved/ambiguous/failed 都以 contracts union 分支处理。"
  - "Pattern 2: point-storage v2 只接受 canonical snapshot，version !== 2 直接 incompatible，不迁移旧 v1 本地快照。"
requirements-completed: [ARC-02, PLC-03, PLC-05]
duration: 12min
completed: 2026-03-30
---

# Phase 12 Plan 03: Web Canonical Summary Summary

**apps/web 现在以 server canonical resolve/confirm 为点击真源，并把 placeId、boundaryId、placeKind、datasetVersion 与原始点击坐标贯穿到 store 和 v2 本地快照**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-30T10:02:38Z
- **Completed:** 2026-03-30T10:14:18Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- `point-storage` 升级到 `trip-map:point-state:v2`，只持久化 canonical identity 与原始点击坐标，不再迁移旧 `version: 1` 快照。
- `map-points` store 新增 `PendingCanonicalSelection`，pending / active / saved 全部围绕 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 派生。
- `WorldMapStage` 移除运行时本地 authoritative geo resolve，改为调用 `/places/resolve` 与 `/places/confirm`。

## Task Commits

1. **Task 1: 升级 web store 与 point-storage 的 canonical persistence 合同** - `c2c2d31` (feat)
2. **Task 2: 把地图点击链路改为 server authoritative resolve client** - `9c26e2a` (feat)
3. **Verification blocker fix: 收尾 `tsc --noEmit` 通过所需的 package-local 类型修正** - `33e9f29` (fix)

## Files Created/Modified

- `apps/web/src/services/api/canonical-places.ts` - web 侧 canonical resolve / confirm API client
- `apps/web/src/components/WorldMapStage.vue` - server-authoritative 地图点击、候选确认与失败反馈编排
- `apps/web/src/components/WorldMapStage.spec.ts` - resolved / ambiguous / failed 三分支与 confirm API mock 回归
- `apps/web/src/stores/map-points.ts` - canonical pending/saved 状态、placeId 复用与 snapshot persist
- `apps/web/src/stores/map-points.spec.ts` - canonical pending / active / saved / incompatible snapshot 测试
- `apps/web/src/services/point-storage.ts` - v2 canonical snapshot 合同与 incompatible 判定
- `apps/web/src/services/point-storage.spec.ts` - canonical identity 与 click 坐标持久化测试
- `apps/web/src/types/map-point.ts` - canonical summary 字段扩展
- `apps/web/src/types/geo.ts` - UI candidate hint 改为接受 server canonical prompt 文案
- `apps/web/src/shims-vue.d.ts` - package-local `tsc --noEmit` 的 `.vue` 声明

## Decisions Made

- 继续复用现有 popup candidate-select UI 表面，但 server ambiguous candidates 通过兼容投影进入旧 UI candidate 结构，避免在本计划里同时重写 popup 组件。
- canonical reopened/reuse 链路统一使用 `placeId` 复用已有保存点，`cityId` 只作为旧 UI/测试兼容字段保留。
- 本计划按要求保留 `types/geo.ts` 作为 UI projection 类型入口；server 文案通过放宽 `GeoCityCandidate.statusHint` 为一般字符串承接。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 补齐 apps/web package-local `.vue` shim 与 candidate hint 类型，打通 `tsc --noEmit`**
- **Found during:** 最终 verification
- **Issue:** `apps/web` 缺少 `.vue` 模块声明，且 canonical candidate hint 不再符合旧的字面量联合类型，导致 `pnpm --dir apps/web exec tsc --noEmit` 失败。
- **Fix:** 新增 `apps/web/src/shims-vue.d.ts`，并把 `GeoCityCandidate.statusHint` 放宽为 `string`，同时修正 canonical store spec 的类型窄化。
- **Files modified:** `apps/web/src/shims-vue.d.ts`, `apps/web/src/types/geo.ts`, `apps/web/src/stores/map-points.spec.ts`
- **Verification:** `pnpm --dir apps/web exec tsc --noEmit`
- **Committed in:** `33e9f29`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 该偏差只用于收口计划要求的 typecheck，不改变 canonical 主链路范围。

## Issues Encountered

- 现有 popup candidate UI 仍沿用旧的 `GeoCityCandidate` 结构，因此本计划通过兼容投影接住 server candidates，而不是同步重写 12-04 负责的 popup 组件。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- popup / drawer / 已保存记录现在已经能消费同一组 canonical identity 字段，12-04 可以专注做类型展示与 UI 语义统一。
- `WorldMapStage` 已结束本地 authoritative resolve 角色，后续 Leaflet 或 records API 只需要沿用 canonical API client 和 placeId 主链路。

## Self-Check: PASSED

---
*Phase: 12-canonical*
*Completed: 2026-03-30*
