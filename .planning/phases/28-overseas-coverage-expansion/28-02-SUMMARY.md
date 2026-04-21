---
phase: 28-overseas-coverage-expansion
plan: 02
subsystem: api
tags: [server, overseas, authoritative-metadata, backfill, e2e]
requires:
  - phase: 28-01
    provides: Phase 28 v3 geometry manifest, expanded overseas coverage, and normalized label policy
provides:
  - Server-side authoritative overseas guard wording no longer references Phase 26
  - Backfill now overwrites persisted overseas metadata from current canonical summaries
  - Shared 13-country Phase 28 server regression matrix sourced from the live manifest
  - Resolve/create/import/bootstrap/sync regressions locked to Phase 28 overseas labels
affects: [records-create, records-import, auth-bootstrap, records-sync, timeline, statistics]
tech-stack:
  added: []
  patterns: [manifest-backed metadata overwrite backfill, shared case-matrix e2e verification]
key-files:
  created: [apps/server/test/phase28-overseas-cases.ts]
  modified:
    - apps/server/src/modules/records/records.service.ts
    - apps/server/scripts/backfill-record-metadata.ts
    - apps/server/test/canonical-resolve.e2e-spec.ts
    - apps/server/test/records-travel.e2e-spec.ts
    - apps/server/test/records-import.e2e-spec.ts
    - apps/server/test/auth-bootstrap.e2e-spec.ts
    - apps/server/test/records-sync.e2e-spec.ts
    - apps/server/test/record-metadata-backfill.e2e-spec.ts
key-decisions:
  - "Backfill for matched travel/smoke rows now overwrites datasetVersion, displayName, regionSystem, adminType, typeLabel, parentLabel, and subtitle from canonical summaries."
  - "Phase 28 server regressions share one manifest-derived 13-country matrix instead of hand-written placeId and boundaryId guesses."
patterns-established:
  - "Manifest-backed case definitions fail fast when a planned Phase 28 country no longer resolves to exactly one canonical summary."
  - "Server write/import/bootstrap/sync tests validate persisted text fields against canonical summaries, not consumer-side re-derivation."
requirements-completed: [GEOX-01, GEOX-02]
duration: 51min
completed: 2026-04-21
---

# Phase 28 Plan 02: Overseas Coverage Expansion Summary

**Manifest-backed overseas backfill now overwrites persisted labels, and a shared 13-country server regression matrix locks Phase 28 resolve/create/import/bootstrap/sync metadata.**

## Performance

- **Duration:** 51 min
- **Started:** 2026-04-21T06:00:00Z
- **Completed:** 2026-04-21T06:51:03Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- 移除了 records authoritative guard 里的旧 `Phase 26` 文案，并把海外 catalog 错误提示收敛为稳定表述。
- backfill 现在会对命中的 travel/smoke 记录无条件覆盖 `datasetVersion`、`displayName`、`typeLabel`、`parentLabel`、`subtitle` 等 authoritative 字段。
- 新增 `PHASE28_NEW_COUNTRY_CASES` 共享矩阵，并用它覆盖 13 国 `/places/resolve`、`/records`、`/records/import`、`/auth/bootstrap`、same-user `/records` sync 的全链路回归。

## Task Commits

Each task was committed atomically:

1. **Task 1: 修正 authoritative server/backfill 逻辑，让 Phase 28 label policy 真正回填旧记录** - `5ac7138` (`fix`)
2. **Task 2: 更新 server e2e，覆盖新国家 resolve/save/import/bootstrap/sync 与旧标签拒绝** - `de310ba` (`test`)

## Files Created/Modified

- `apps/server/src/modules/records/records.service.ts` - 稳定化 overseas authoritative catalog 错误文案。
- `apps/server/scripts/backfill-record-metadata.ts` - 从 canonical summary 回填完整 metadata 字段并无条件覆盖旧 subtitle。
- `apps/server/test/record-metadata-backfill.e2e-spec.ts` - 对齐 backfill helper 的新字段集与 Phase 28 标签期望。
- `apps/server/test/phase28-overseas-cases.ts` - 13 国 Phase 28 authoritative regression matrix，运行时从 manifest 解析真实 `placeId`/`boundaryId`。
- `apps/server/test/canonical-resolve.e2e-spec.ts` - 覆盖 California/Tokyo/Gangwon/Dubai 新标签与 13 国 resolve 表驱动验证。
- `apps/server/test/records-travel.e2e-spec.ts` - 让 `/records` create 用例消费 Phase 28 summary，并锁住 legacy label rejection。
- `apps/server/test/records-import.e2e-spec.ts` - 批量导入 13 国 authoritative records，并验证数据库持久化字段完全匹配 canonical summary。
- `apps/server/test/auth-bootstrap.e2e-spec.ts` - 验证 bootstrap 对 13 国 persisted metadata 的直接回放。
- `apps/server/test/records-sync.e2e-spec.ts` - 验证同一用户跨 session 回放 13 国 authoritative text fields 不发生回退。

## Decisions Made

- 使用 `buildCanonicalMetadataLookup()` 驱动 `PHASE28_NEW_COUNTRY_CASES`，避免测试里手写 slug 或 boundary guessing。
- 在 server 回归里彻底移除旧 `一级行政区` 字面量，旧标签拒绝通过动态构造 legacy payload 验证，避免测试文本重新固化过时 policy。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 同步 backfill helper spec 到新的 authoritative 字段集**
- **Found during:** Task 1
- **Issue:** `backfill-record-metadata.ts` 增加 `datasetVersion` / `displayName` 并无条件覆盖 subtitle 后，`record-metadata-backfill.e2e-spec.ts` 仍按旧字段集断言，导致 Task 1 验证无法通过。
- **Fix:** 更新 helper spec，显式断言 Beijing/California/Tokyo 的 Phase 28 datasetVersion、displayName 与新 typeLabel/subtitle。
- **Files modified:** `apps/server/test/record-metadata-backfill.e2e-spec.ts`
- **Verification:** `cd apps/server && pnpm test test/record-metadata-backfill.e2e-spec.ts`
- **Committed in:** `5ac7138`

**2. [Rule 1 - Bug] 替换已经变成已支持国家的旧 unsupported probes**
- **Found during:** Task 2
- **Issue:** Phase 28 之后 Canada/British Columbia 已经进入 authoritative catalog，旧的 “unsupported overseas click/payload” 样本会错误命中 supported path。
- **Fix:** 把 resolve/create 的 unsupported probes 改到 Mexico City / Jalisco，同时保留同样的 out-of-catalog 行为断言。
- **Files modified:** `apps/server/test/canonical-resolve.e2e-spec.ts`, `apps/server/test/records-travel.e2e-spec.ts`
- **Verification:** `cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts && pnpm test test/records-travel.e2e-spec.ts`
- **Committed in:** `de310ba`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** 两项偏差都是为了让计划中的 authoritative 现实与测试基线一致，不引入额外 scope。

## Issues Encountered

- `record-metadata-backfill.e2e-spec.ts` 在 Task 1 阶段先于 Task 2 暴露出旧断言，需要提前对齐到当前 manifest 输出。
- 扩容后部分旧 unsupported 样本失效，必须更换到仍未进入 authoritative support 的国家/地区才能维持预期语义。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 服务端 authoritative metadata 写入、回填和回放链路已经切到 Phase 28 标签政策，后续 web/timeline/statistics consumer 可以直接复用持久化字段。
- 13 国新增覆盖已在 resolve/create/import/bootstrap/sync 全链路回归中锁定，下一阶段无需再为 server 侧 metadata 一致性补兜底。

## Self-Check: PASSED

- Found `.planning/phases/28-overseas-coverage-expansion/28-02-SUMMARY.md`
- Found `apps/server/test/phase28-overseas-cases.ts`
- Found commit `5ac7138`
- Found commit `de310ba`

---
*Phase: 28-overseas-coverage-expansion*
*Completed: 2026-04-21*
