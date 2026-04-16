---
phase: 26-overseas-coverage-foundation
plan: 01
subsystem: api
tags: [geometry, natural-earth, canonical-resolve, overseas-admin1, vitest]
requires:
  - phase: 25-sync-semantics-multi-device-hardening
    provides: canonical placeId/boundaryId authoritative persistence and resolve semantics
provides:
  - build-time overseas admin1 support catalog for the first 8 priority countries
  - filtered overseas geometry assets and generated manifest shared by web and server
  - canonical resolve regressions for supported and unsupported overseas clicks
affects: [canonical-places, geo-pipeline, overseas-coverage, contracts]
tech-stack:
  added: []
  patterns: [build-time support scoping, manifest-backed overseas resolve regression]
key-files:
  created:
    - apps/web/scripts/geo/overseas-admin1-support.mjs
  modified:
    - apps/web/scripts/geo/build-geometry-manifest.mjs
    - apps/web/public/geo/2026-04-02-geo-v2/manifest.json
    - apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json
    - packages/contracts/src/generated/geometry-manifest.generated.ts
    - apps/server/test/canonical-resolve.e2e-spec.ts
key-decisions:
  - "海外 authoritative 支持面只在 build 阶段通过 8 国 catalog 收口，不新增前端单独判断支持范围的第二真源。"
  - "Australia 采用州/领地 ISO allowlist 加 `gadm_level === 1` 守卫，显式排除 Lord Howe、Macquarie Island 与 `AU-X..` 噪声条目。"
  - "resolve 回归直接锁定 Tokyo、Gangwon、Dubai、Macquarie Island 与 Vancouver 的真实点击坐标。"
patterns-established:
  - "Pattern 1: overseas admin1 support is declared in one catalog file and consumed by geometry build before manifest publication."
  - "Pattern 2: overseas resolve coverage uses real coordinate e2e assertions instead of fixture-only smoke checks."
requirements-completed: [OVRS-01]
duration: 10min
completed: 2026-04-16
---

# Phase 26 Plan 01: Overseas Coverage Foundation Summary

**8 国海外 admin1 authoritative catalog、过滤后的 overseas geometry manifest，以及 Tokyo/Gangwon/Dubai/unsupported 点击回归**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-16T07:28:13Z
- **Completed:** 2026-04-16T07:37:44Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- 新增 `apps/web/scripts/geo/overseas-admin1-support.mjs`，把 `JP / KR / TH / SG / MY / AE / AU / US` 收口成显式 support catalog。
- `build-geometry-manifest.mjs` 现在会在写 overseas layer 和 generated manifest 前过滤 feature，运行时资产与 contracts manifest 已同步收口到 8 国 authoritative 支持面。
- `canonical-resolve.e2e-spec.ts` 增加 Tokyo、Gangwon、Dubai、Macquarie Island、Vancouver 的真实点击回归，锁定 supported / unsupported 语义。

## Task Commits

1. **Task 1: 建立 Phase 26 的海外 priority-country support catalog 与 build 过滤规则** - `b685fe3` (feat)
2. **Task 2: 用真实 resolve regression 锁住支持样例与支持面外失败语义** - `8a4daa9` (test)

## Files Created/Modified

- `apps/web/scripts/geo/overseas-admin1-support.mjs` - Phase 26 海外 admin1 priority-country catalog 与国家级 allowlist/denylist。
- `apps/web/scripts/geo/build-geometry-manifest.mjs` - 在 overseas layer 写出前应用 support catalog 过滤。
- `apps/web/public/geo/2026-04-02-geo-v2/manifest.json` - 运行时 manifest 已同步过滤，只保留 8 国 overseas 条目。
- `apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json` - 运行时 overseas geometry layer 已移除 `AE-X..` / `AU-X..` 与外岛噪声条目。
- `packages/contracts/src/generated/geometry-manifest.generated.ts` - server/web 共用的 authoritative geometry manifest 已同步收口。
- `apps/server/test/canonical-resolve.e2e-spec.ts` - 锁定 Tokyo、Gangwon、Dubai、Macquarie Island、Vancouver 的 canonical resolve 回归。

## Decisions Made

- 用 build-time catalog 直接约束 authoritative manifest，而不是新增前端单独 gate，保证 server/web 继续消费同一份支持面真源。
- 对 `AE` 使用显式 emirate allowlist，对 `AU` 额外叠加 `gadm_level === 1` 守卫，避免同 ISO code 的外岛噪声误入支持面。
- 支持面外回归同时覆盖非优先国家点击与 `AU-X..` 噪声点，保证 `/places/resolve` 一律返回 `OUTSIDE_SUPPORTED_DATA` 且不携带 `place`。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Task 2 标记为 TDD，但新增回归在第一次执行时已全部通过；原因是 Task 1 的 authoritative manifest 收口已经把运行时 resolve 行为一并带绿，因此无需额外修改 `CanonicalPlacesService`。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 26 的海外 authoritative 支持面已经具备单一 catalog 真源，后续计划可以继续沿这条产物链推进 records metadata 稳定性与 unsupported popup 语义。
- 当前无阻塞项；下一计划可直接复用新的 manifest 和 resolve regression 基线。

## Self-Check: PASSED

- FOUND: `.planning/phases/26-overseas-coverage-foundation/26-01-SUMMARY.md`
- FOUND commit: `b685fe3`
- FOUND commit: `8a4daa9`

---
*Phase: 26-overseas-coverage-foundation*
*Completed: 2026-04-16*
