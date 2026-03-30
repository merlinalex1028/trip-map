---
phase: 12-canonical
plan: 01
subsystem: contracts
tags: [typescript, contracts, canonical-place, vitest]
requires:
  - phase: 11-monorepo
    provides: thin shared contract package and single-entry exports for web/server
provides:
  - canonical place taxonomy for China admin semantics and overseas admin1
  - discriminated resolve and confirm request/response contracts
  - Phase 12 resolved, ambiguous, and failed fixtures with regression coverage
affects: [12-02, 12-03, 12-04, apps/server, apps/web]
tech-stack:
  added: []
  patterns: [thin contracts package, discriminated union resolve result, stable identity separated from display metadata]
key-files:
  created: [packages/contracts/src/resolve.ts]
  modified:
    - packages/contracts/src/place.ts
    - packages/contracts/src/fixtures.ts
    - packages/contracts/src/index.ts
    - packages/contracts/src/contracts.spec.ts
key-decisions:
  - "CanonicalPlaceSummary keeps stable identity fields separate from display metadata through regionSystem, adminType, typeLabel, parentLabel, and subtitle."
  - "Canonical resolve contracts use resolved/ambiguous/failed discriminated unions so failed results never carry fallback place payloads."
patterns-established:
  - "Place contracts expose coarse placeKind plus explicit admin semantics instead of encoding type labels into displayName."
  - "Shared fixtures pin China municipality/SAR semantics and overseas admin1 semantics before server/web wiring."
requirements-completed: [PLC-01, PLC-02, PLC-04, UIX-04]
duration: 4min
completed: 2026-03-30
---

# Phase 12 Plan 01: Canonical 合同 Summary

**Canonical place taxonomy、resolve discriminated union 与 Phase 12 fixtures 已在 `@trip-map/contracts` 固定下来，明确区分中国正式行政类型与海外一级行政区语义。**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T17:45:18+08:00
- **Completed:** 2026-03-30T09:48:52Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- 在 `packages/contracts/src/place.ts` 固定 `CN_ADMIN | OVERSEAS_ADMIN1` taxonomy，并为 canonical summary 增加真实类型与副标题字段。
- 新增 `packages/contracts/src/resolve.ts`，把 authoritative resolve/confirm 请求、候选类型、失败 reason 和三分支响应合同收口到薄契约层。
- 在 `packages/contracts/src/fixtures.ts` 与 `packages/contracts/src/contracts.spec.ts` 增加 Phase 12 resolved / ambiguous / failed fixtures 与回归断言，锁住候选上限和失败分支边界。

## Task Commits

Each task was committed atomically:

1. **Task 1: 定义 canonical place taxonomy 与 resolve union**
   `3d5e92c` (test), `0bab8bf` (feat)
2. **Task 2: 补充 Phase 12 fixtures 与 contracts 回归断言**
   `296ccfb` (test), `21da7f7` (feat)

Plan metadata: created in the final docs commit for this plan.

## Files Created/Modified

- `packages/contracts/src/place.ts` - 扩展 canonical place taxonomy、China admin subtype 与展示元数据字段。
- `packages/contracts/src/resolve.ts` - 定义 resolve / confirm 请求、候选类型、失败 reason 与 discriminated union 响应。
- `packages/contracts/src/fixtures.ts` - 提供 Phase 11 smoke fixture 元数据兼容与 Phase 12 canonical fixtures。
- `packages/contracts/src/index.ts` - 从单一入口补充导出 `resolve` 合同。
- `packages/contracts/src/contracts.spec.ts` - 锁定 PlaceKind、CanonicalResolveResponse、Phase 12 fixtures 和候选上限断言。

## Decisions Made

- 保持 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 作为稳定 identity；展示语义统一通过 `displayName`、`typeLabel`、`parentLabel`、`subtitle` 暴露。
- resolve 结果固定为 `resolved | ambiguous | failed` 三分支，`failed` 只返回 `reason` 与 `message`，不再携带 fallback place。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 同步修复 Phase 11 smoke fixture 的 canonical summary 字段**
- **Found during:** Task 1 (定义 canonical place taxonomy 与 resolve union)
- **Issue:** `CanonicalPlaceSummary` 扩展后，现有 `PHASE11_SMOKE_RECORD_REQUEST` 不再满足共享合同，导致 Task 1 回归无法稳定通过。
- **Fix:** 在 `packages/contracts/src/fixtures.ts` 为现有 smoke fixture 补充 `regionSystem`、`adminType`、`typeLabel`、`parentLabel`、`subtitle`。
- **Files modified:** `packages/contracts/src/fixtures.ts`
- **Verification:** `pnpm --dir packages/contracts exec vitest run src/contracts.spec.ts`
- **Committed in:** `0bab8bf`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 仅修复新合同直接打破的既有 fixture，无额外 scope 扩张。

## Issues Encountered

- `packages/contracts` 的 `tsconfig.json` 排除了 `*.spec.ts`，所以 TDD 的 RED 阶段改用运行期 fixture 断言来证明缺失字段，而不是依赖 spec 类型检查失败。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/server` 可以直接消费 `CanonicalResolveResponse`、`CanonicalResolveFailedReason` 和 `ResolveCanonicalPlaceRequest`/`ConfirmCanonicalPlaceRequest` 落地 authoritative resolve 接口。
- `apps/web` 后续可以基于 `CanonicalPlaceSummary` 的 `typeLabel`、`parentLabel`、`subtitle` 统一 popup / drawer / saved-state 展示，不必再自己发明 place subtype 字段。

## Self-Check: PASSED

---
*Phase: 12-canonical*
*Completed: 2026-03-30*
