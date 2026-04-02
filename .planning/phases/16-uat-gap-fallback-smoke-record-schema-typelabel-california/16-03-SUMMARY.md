---
phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california
plan: 03
subsystem: api
tags: [canonical, fixtures, california, nestjs, vitest, contracts]
requires:
  - phase: 16-00
    provides: "DB preflight gate and executable server e2e baseline"
  - phase: 16-01
    provides: "canonical metadata round-trip through records/contracts"
  - phase: 16-02
    provides: "web surfaces consume persisted canonical labels and fallback states"
provides:
  - "server-authoritative California bbox resolve for real clicks inside the admin1 bounds"
  - "shared contracts fixtures aligned to server fixture placeId/datasetVersion/typeLabel"
  - "Phase 12 UAT wording aligned to authoritative California canonical semantics"
affects: [phase-12-canonical, web, server, contracts, uat]
tech-stack:
  added: []
  patterns:
    - "California resolve uses bbox-first authoritative matching before legacy representative-click tolerance"
    - "Shared fixtures and historical UAT docs mirror server-authoritative canonical IDs and labels"
key-files:
  created:
    - .planning/phases/16-uat-gap-fallback-smoke-record-schema-typelabel-california/16-03-SUMMARY.md
  modified:
    - packages/contracts/src/fixtures.ts
    - packages/contracts/src/contracts.spec.ts
    - apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts
    - apps/server/src/modules/canonical-places/canonical-places.service.ts
    - apps/server/test/canonical-resolve.e2e-spec.ts
    - .planning/phases/12-canonical/12-UAT.md
key-decisions:
  - "California authoritative resolve 改为 bbox 优先，再回退 legacy representative click，避免改坏北京/香港/阿坝与 ambiguous fixture"
  - "contracts fixtures 与历史 UAT 文案全部跟随 server-authoritative placeId、datasetVersion 和 typeLabel，不保留 contracts-only alias"
patterns-established:
  - "Server-owned canonical fixture metadata is the single truth; shared fixtures only mirror it"
  - "Overseas admin1 regions may use coarse bbox metadata when a single representative click is insufficient for real-world map interaction"
requirements-completed: [REQ-16-05]
duration: 5min
completed: 2026-04-02
---

# Phase 16 Plan 03: California Authoritative Fixture Alignment Summary

**California 现在通过 server-owned bbox authoritative 命中，shared fixtures 与 Phase 12 UAT 文案同步到同一组 canonical IDs、datasetVersion 和 admin1 标签。**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-02T09:20:22Z
- **Completed:** 2026-04-02T09:25:29Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- 把 `packages/contracts` 中 Beijing、Hong Kong、Aba、California 及 ambiguous candidates 的 `placeId` 与 `datasetVersion` 对齐到 server fixture 真源。
- 把 Phase 12 历史 UAT 中 California 的期待与 gap 描述改为跟随 server-authoritative `一级行政区` 语义，而不是继续保留 `State`/contracts-only alias。
- 为 California 增加 server-owned bbox 元数据，并让 resolver 在 `findFixture()` 中先做 bounds 匹配，再回退现有 representative click 逻辑。
- 补齐 canonical resolve e2e，覆盖 Los Angeles、San Francisco 与 California bbox 外点，证明 California 不再依赖单个精确坐标点击。

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: 锁定 shared/server fixture 对齐断言** - `cc35760` (test)
2. **Task 1 GREEN: 对齐 shared canonical fixtures 与 Phase 12 UAT 文案** - `3174f69` (fix)
3. **Task 2 RED: 增加 California bbox resolve 回归** - `91e3c37` (test)
4. **Task 2 GREEN: 以 authoritative bbox 解析 California** - `be182ce` (fix)

## Files Created/Modified

- `packages/contracts/src/fixtures.ts` - shared canonical fixtures 改为复用 server-authoritative IDs、datasetVersion 与 California label。
- `packages/contracts/src/contracts.spec.ts` - 增加 fixture parity 断言，锁定 shared fixtures 与 server 真源一致。
- `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` - 为 California resolved fixture 增加 bbox bounds 元数据。
- `apps/server/src/modules/canonical-places/canonical-places.service.ts` - `findFixture()` 改为先做 bounds 命中，再回退 legacy click 容差匹配。
- `apps/server/test/canonical-resolve.e2e-spec.ts` - 覆盖 Los Angeles / San Francisco / bbox 外点的 California authoritative resolve 回归。
- `.planning/phases/12-canonical/12-UAT.md` - 把 California 历史 UAT 期待与 gap 文案改成与 server-authoritative 口径一致。

## Decisions Made

- California authoritative resolve 采用 bbox-first 策略，因为单点 ±0.0001° 容差无法覆盖真实地图点击；同时保留 legacy representative click 回退，避免影响 Beijing/Hong Kong/Aba 与 ambiguous fixture。
- `packages/contracts` fixtures 与 Phase 12 历史 UAT 不再保留旧 alias 或英文 `State` 文案，统一跟随 server fixture 的 `us-california / phase12-canonical-fixture-v1 / 一级行政区` 口径。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 补齐 contracts spec 缺失导入**
- **Found during:** Task 1 (统一 shared/server fixture 口径，并修正 Phase 12 UAT 文案)
- **Issue:** 新增 authoritative parity 断言后，`contracts.spec.ts` 漏导入 `PHASE12_RESOLVED_ABA`，导致 contracts test 因 `ReferenceError` 中断。
- **Fix:** 在 spec 顶部补充 `PHASE12_RESOLVED_ABA` 导入，保持断言覆盖完整。
- **Files modified:** `packages/contracts/src/contracts.spec.ts`
- **Verification:** `pnpm --filter @trip-map/contracts test`
- **Committed in:** `3174f69`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 仅修复当前任务引入的测试阻塞项，无额外范围膨胀。

## Issues Encountered

- 并行 `git add`/`git commit` 两次触发 `.git/index.lock` 竞争；已改为串行重试提交，不影响代码结果。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 16 的最后一个 requirement 已满足；California 真实区域点击现在会返回 server-authoritative canonical 结果。
- `contracts`、`web`、`server` 的相关回归均已通过，可进入 Phase 16 收尾归档。

## Self-Check

PASSED

---
*Phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california*
*Completed: 2026-04-02*
