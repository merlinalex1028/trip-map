---
phase: 11-monorepo
plan: 08
subsystem: testing
tags: [vue, vitest, pinia, testing]
requires:
  - phase: 11-07
    provides: apps/web-local services, data, and web-only types consumed by the migrated non-UI specs
  - phase: 11-09
    provides: apps/web-local Pinia stores and popup anchoring composable used by the moved store/composable specs
provides:
  - Package-local non-UI regression specs under apps/web/src for services, data, composables, and stores
  - Package-local mountComposable helper under apps/web/src/test-utils
  - Explicit-file vitest filtering that keeps targeted apps/web regression commands scoped to requested specs
affects: [11-10, 12]
tech-stack:
  added: []
  patterns: [package-local regression specs can migrate independently from UI suites, explicit vitest spec filters preserve mixed discovery while scoping targeted runs]
key-files:
  created:
    - apps/web/src/test-utils/mountComposable.ts
    - apps/web/src/services/map-projection.spec.ts
    - apps/web/src/services/point-storage.spec.ts
    - apps/web/src/services/city-boundaries.spec.ts
    - apps/web/src/services/geo-lookup.spec.ts
    - apps/web/src/services/city-search.spec.ts
    - apps/web/src/data/geo/city-candidates.spec.ts
    - apps/web/src/composables/usePopupAnchoring.spec.ts
    - apps/web/src/stores/map-points.spec.ts
  modified:
    - apps/web/vitest.config.ts
key-decisions:
  - "11-08 只把 non-UI regression specs 与 composable test helper 迁入 apps/web，不提前触碰 App.spec、组件 UI specs、styles/assets 或 legacy-entry cleanup。"
  - "apps/web/vitest.config.ts 在显式传入 .spec.ts 文件时只执行这些文件，默认 apps/web mixed-suite 发现规则保持不变，避免把 11-10 的 UI spec 清理提前吞进来。"
patterns-established:
  - "Pattern 1: non-UI regression surface can move into apps/web by复制现有 spec 内容并直接改为消费 package-local services/data/stores/composables。"
  - "Pattern 2: package-local targeted regression commands should be isolated through explicit Vitest file filters instead of依赖 repo-root spec 存在与否。"
requirements-completed: [ARC-01]
duration: 4min
completed: 2026-03-30
---

# Phase 11 Plan 08: Non-UI Spec Migration Summary

**apps/web 现已拥有 package-local 的 non-UI regression suite 与 composable mount helper，且定向 Vitest 命令会只执行请求的 package-local specs**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T06:20:32Z
- **Completed:** 2026-03-30T06:24:00Z
- **Tasks:** 1
- **Files modified:** 10

## Accomplishments

- 在 `apps/web/src/services`、`apps/web/src/data/geo`、`apps/web/src/composables`、`apps/web/src/stores` 下补齐 package-local non-UI regression specs，覆盖 service/data/composable/store 面。
- 在 `apps/web/src/test-utils` 新建 `mountComposable.ts`，让 `usePopupAnchoring.spec.ts` 不再依赖 repo-root helper。
- 收口 `apps/web/vitest.config.ts` 的显式文件过滤行为，使计划中的定向回归命令只执行这 8 个 package-local spec 文件。

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Rehome non-UI specs into `apps/web` as failing package-local tests** - `1a49b8b` (test)
2. **Task 1 (GREEN): Add package-local `mountComposable` helper** - `6878fd8` (feat)
3. **Task 1 (verification fix): Scope explicit web spec runs to requested files** - `70639b2` (fix)

## Files Created/Modified

- `apps/web/src/test-utils/mountComposable.ts` - package-local composable test helper。
- `apps/web/src/services/map-projection.spec.ts` - package-local map projection regression spec。
- `apps/web/src/services/point-storage.spec.ts` - package-local storage regression spec。
- `apps/web/src/services/city-boundaries.spec.ts` - package-local city boundary regression spec。
- `apps/web/src/services/geo-lookup.spec.ts` - package-local geo lookup regression spec。
- `apps/web/src/services/city-search.spec.ts` - package-local city search regression spec。
- `apps/web/src/data/geo/city-candidates.spec.ts` - package-local city candidate catalog regression spec。
- `apps/web/src/composables/usePopupAnchoring.spec.ts` - package-local popup anchoring composable spec。
- `apps/web/src/stores/map-points.spec.ts` - package-local Pinia store regression spec。
- `apps/web/vitest.config.ts` - 显式 `.spec.ts` 参数下只执行请求文件，默认 mixed-suite 发现保持不变。

## Decisions Made

- 保持范围只覆盖 non-UI specs 与 `mountComposable` helper，避免把 `App.spec`、组件 UI specs、styles/assets、backend smoke panel 或 legacy-entry cleanup 提前拉入这份计划。
- 不在本计划删除 repo-root 旧 spec 文件；当前目标是先让 `apps/web` 拥有稳定可跑的 package-local regression surface，root UI/test cleanup 继续留给后续计划。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scoped explicit vitest runs to requested package-local spec files**
- **Found during:** Task 1 verification
- **Issue:** `apps/web/vitest.config.ts` 的 `include` 会让计划里的定向验证命令顺带执行 repo-root 旧 specs，无法证明 targeted regression command 真正隔离在 `apps/web`。
- **Fix:** 在显式传入 `.spec.ts` 参数时，把 `include` 改为这些参数本身；无显式参数时仍保留 `src/**/*.spec.ts` 和 `../../src/**/*.spec.ts` 的 mixed discovery。
- **Files modified:** `apps/web/vitest.config.ts`
- **Verification:** `pnpm -C apps/web test -- ...` 只执行 8 个 package-local spec 文件并全部通过。
- **Committed in:** `70639b2`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 该修正直接服务于计划验收，未扩大到 UI spec cleanup 或 bootstrap 收尾。

## Issues Encountered

- 初始 RED 验证按预期因缺少 `apps/web/src/test-utils/mountComposable.ts` 失败；补齐 helper 后通过。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/web` 已具备 package-local 的 non-UI regression surface，`11-10` 可以继续处理剩余 UI regression、styles/assets 与 legacy bridge cleanup。
- 当前 repo-root 旧 non-UI spec 文件仍保留，属于后续 broader cleanup 决策，不影响本计划的 package-local 验收目标。

## Self-Check: PASSED

- Verified summary file exists at `.planning/phases/11-monorepo/11-08-SUMMARY.md`.
- Verified task commits `1a49b8b`, `6878fd8`, and `70639b2` are present in git history.
- Verified stub scan across the created/modified apps/web spec/helper files found no placeholder markers blocking the plan goal.

---
*Phase: 11-monorepo*
*Completed: 2026-03-30*
