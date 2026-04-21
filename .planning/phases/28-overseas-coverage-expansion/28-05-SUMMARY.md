---
phase: 28-overseas-coverage-expansion
plan: 05
subsystem: server
tags: [server, backfill, userTravelRecord, bootstrap, sync, vitest]
requires:
  - phase: 28-04
    provides: canonical datasetVersion semantics for Phase 28 metadata
provides:
  - authoritative metadata backfill now updates persisted userTravelRecord rows
  - bootstrap migration regression from legacy overseas userTravelRecord rows
  - same-user sync migration regression for backfilled overseas metadata replay
affects: [29-timeline, 30-stats, overseas-metadata-consumers]
tech-stack:
  added: []
  patterns:
    - per-table matched/unmatched backfill auditing
    - legacy userTravelRecord -> backfill -> bootstrap/sync replay regression
key-files:
  created:
    - .planning/phases/28-overseas-coverage-expansion/28-05-SUMMARY.md
  modified:
    - apps/server/scripts/backfill-record-metadata.ts
    - apps/server/test/record-metadata-backfill.e2e-spec.ts
    - apps/server/test/auth-bootstrap.e2e-spec.ts
    - apps/server/test/records-sync.e2e-spec.ts
    - apps/server/test/phase28-overseas-cases.ts
key-decisions:
  - "保持 auth.service.ts 与 records.repository.ts 的 persisted userTravelRecord 真源不变，只通过 backfill 修正 metadata。"
  - "Tokyo 与 California 作为共享 legacy overseas migration seed，同时覆盖 bootstrap 与 same-user sync。"
patterns-established:
  - "Backfill CLI summary must expose matched/unmatched counts for every authoritative record table it touches."
  - "Migration e2e seeds legacy userTravelRecord rows, runs backfillRecordMetadata(prisma), then asserts replay output."
requirements-completed: [GEOX-02]
duration: 9min
completed: 2026-04-21
---

# Phase 28 Plan 05: overseas-coverage-expansion Summary

**Persisted userTravelRecord metadata is now backfilled authoritatively, with legacy overseas replay locked by bootstrap and same-user sync migration e2e**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-21T10:32:27Z
- **Completed:** 2026-04-21T10:41:27Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- `apps/server/scripts/backfill-record-metadata.ts` 现在会扫描并更新 `userTravelRecord`，同时把 matched/unmatched 计数输出到 CLI JSON 摘要。
- `apps/server/test/record-metadata-backfill.e2e-spec.ts` 补上 `buildUserTravelMetadataUpdate()` regression，确认 `userTravelRecord` 与 travel/smoke 共用同一份 canonical summary。
- `apps/server/test/auth-bootstrap.e2e-spec.ts` 与 `apps/server/test/records-sync.e2e-spec.ts` 新增 legacy overseas `userTravelRecord` 迁移回归，证明 backfill 后 bootstrap / same-user sync 会回放升级后的 Phase 28 metadata。

## Task Commits

Each task was committed atomically:

1. **Task 1: 扩展 authoritative metadata backfill 到 userTravelRecord，并把脚本输出显式化** - `005293f` (fix)
2. **Task 2: 补旧 userTravelRecord -> backfill -> bootstrap/sync 回放迁移 e2e** - `6ab7de9` (test)

## Files Created/Modified

- `apps/server/scripts/backfill-record-metadata.ts` - 把 backfill 覆盖范围扩展到 `userTravelRecord`，并输出新增审计计数。
- `apps/server/test/record-metadata-backfill.e2e-spec.ts` - 验证 `userTravelRecord` helper 与 canonical summary 对齐。
- `apps/server/test/auth-bootstrap.e2e-spec.ts` - 增加 legacy overseas rows 经 backfill 后的 `/auth/bootstrap` 回放迁移测试。
- `apps/server/test/records-sync.e2e-spec.ts` - 增加 same-user 双 session 的 legacy replay 迁移测试。
- `apps/server/test/phase28-overseas-cases.ts` - 提供 Tokyo / California 共享 legacy overseas seed，供两条迁移 e2e 复用。
- `.planning/phases/28-overseas-coverage-expansion/28-05-SUMMARY.md` - 记录 28-05 执行结果。

## Decisions Made

- 保持 persisted `userTravelRecord` 作为 bootstrap / sync 的真源，不在 consumer 侧补 fallback。
- 使用共享 legacy overseas seed，而不是在两个 e2e 中各自维护一套 Tokyo / California 老 metadata。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 缩短 auth bootstrap 迁移测试的注册后缀以通过现有输入校验**
- **Found during:** Task 2（补旧 userTravelRecord -> backfill -> bootstrap/sync 回放迁移 e2e）
- **Issue:** 初始测试用户名后缀过长，`POST /auth/register` 返回 400，阻塞迁移链路验证。
- **Fix:** 将测试后缀从 `legacy-overseas-migration` 缩短为 `legacy-migrate`，保持测试语义不变。
- **Files modified:** `apps/server/test/auth-bootstrap.e2e-spec.ts`
- **Verification:** `cd apps/server && pnpm test test/auth-bootstrap.e2e-spec.ts`
- **Committed in:** `6ab7de9` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** 仅修正测试夹具以适配现有校验规则，没有改变计划范围或业务实现。

## Issues Encountered

None beyond the auto-fixed test fixture validation mismatch.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 旧 overseas `userTravelRecord` 已纳入 authoritative backfill，Phase 29/30 的时间轴和统计消费者可继续读取升级后的 persisted metadata。
- bootstrap 与 same-user sync 的真实迁移路径已有自动化覆盖，本 plan 范围内未发现新的 blocker。

## Self-Check: PASSED

- Found summary file: `.planning/phases/28-overseas-coverage-expansion/28-05-SUMMARY.md`
- Found task commits: `005293f`, `6ab7de9`
