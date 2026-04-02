---
phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california
plan: 01
subsystem: api
tags: [prisma, postgres, contracts, records, vitest]
requires:
  - phase: 15-服务端记录与点亮闭环
    provides: records CRUD API baseline and canonical placeId persistence
  - phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california
    provides: 16-00 PostgreSQL preflight and DB reachability gate
provides:
  - shared SmokeRecord and TravelRecord contracts aligned on canonical metadata fields
  - nullable Prisma metadata columns plus a safe phase16 additive migration
  - authoritative placeId backfill script for legacy smoke and travel rows
  - server records DTO/repository/service and e2e coverage for DB round-trip metadata
affects: [phase-16-web-reopen, phase-16-fallback-illuminate, records-reopen-surface]
tech-stack:
  added: []
  patterns: [authoritative placeId metadata backfill, database-first response mapping, nullable schema transition]
key-files:
  created:
    - apps/server/prisma/migrations/20260402082712_phase16_record_metadata_contracts/migration.sql
    - apps/server/scripts/backfill-record-metadata.ts
    - apps/server/test/record-metadata-backfill.e2e-spec.ts
  modified:
    - packages/contracts/src/records.ts
    - apps/server/prisma/schema.prisma
    - apps/server/src/modules/records/dto/create-travel-record.dto.ts
    - apps/server/src/modules/records/records.repository.ts
    - apps/server/src/modules/records/records.service.ts
    - apps/server/test/records-smoke.e2e-spec.ts
    - apps/server/test/records-travel.e2e-spec.ts
key-decisions:
  - "Phase 16 metadata columns stay nullable in Prisma and SQL migration, while all new writes must still provide full canonical metadata."
  - "Legacy record metadata is backfilled only by authoritative canonical placeId lookup; unmatched rows are logged and never inferred from display text."
  - "Records service responses now map from persisted DB columns instead of echoing request metadata back to clients."
patterns-established:
  - "Authoritative backfill: derive regionSystem/adminType/typeLabel/parentLabel/subtitle from canonicalPlaceCatalogBase keyed by placeId."
  - "DB-first records mapping: smoke and travel HTTP payloads should be shaped from stored Prisma rows, not temporary request echoes."
requirements-completed: [REQ-16-03, REQ-16-04]
duration: 28min
completed: 2026-04-02
---

# Phase 16 Plan 01: Canonical Record Metadata Summary

**SmokeRecord and TravelRecord now persist canonical metadata end-to-end with a safe additive Prisma migration, authoritative placeId backfill, and DB-verified reopen round-trip coverage**

## Performance

- **Duration:** 28 min
- **Started:** 2026-04-02T08:15:30Z
- **Completed:** 2026-04-02T08:43:45Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Extended shared records contracts so `TravelRecord` and `CreateTravelRecordRequest` carry `regionSystem`, `adminType`, `typeLabel`, `parentLabel`, and `subtitle`.
- Added nullable Phase 16 Prisma metadata columns plus `phase16_record_metadata_contracts` migration and an authoritative `placeId` backfill script for legacy rows.
- Updated records DTO/repository/service and server e2e coverage so smoke/travel round-trip metadata comes from DB rows and legacy travel reopen restores canonical labels after backfill.

## Task Commits

Each task was committed atomically:

1. **Task 1: 扩展 shared records contract、可迁移 Prisma schema 与旧记录 backfill 入口** - `7191620`, `f580719` (test, feat)
2. **Task 2: 更新 records DTO/repository/service 与 e2e，锁定 DB round-trip 和 legacy reopen backfill** - `e4d2450`, `35d5126`, `3358828` (test, feat, fix)

## Files Created/Modified
- `packages/contracts/src/records.ts` - 扩展 shared travel record/request canonical metadata 合同。
- `apps/server/prisma/schema.prisma` - 为 SmokeRecord/TravelRecord 增加 nullable canonical metadata 列。
- `apps/server/prisma/migrations/20260402082712_phase16_record_metadata_contracts/migration.sql` - 只做 additive `ADD COLUMN` 的 Phase 16 migration。
- `apps/server/scripts/backfill-record-metadata.ts` - 基于 authoritative fixture catalog 的 `placeId` metadata backfill 脚本与 helper。
- `apps/server/src/modules/records/dto/create-travel-record.dto.ts` - 让 travel DTO 强制接收新增 canonical metadata 字段。
- `apps/server/src/modules/records/records.repository.ts` - 在 smoke/travel Prisma create data 中持久化完整 metadata。
- `apps/server/src/modules/records/records.service.ts` - 从数据库行映射 smoke/travel canonical metadata 返回值。
- `apps/server/test/record-metadata-backfill.e2e-spec.ts` - 锁定 authoritative lookup 与 unmatched placeId 行为的 Task 1 TDD spec。
- `apps/server/test/records-smoke.e2e-spec.ts` - 显式断言 smoke response 与 DB row 的五个 canonical metadata 字段。
- `apps/server/test/records-travel.e2e-spec.ts` - 覆盖 travel create/list DB round-trip 与 legacy row backfill/reopen 回归。

## Decisions Made
- 保持 Phase 16 新增 metadata 列为 nullable 过渡列，避免 migration 在已有旧数据上直接失败。
- 旧记录只允许按 authoritative `placeId` 回填 metadata；未知 `placeId` 保持 unmatched 并记录，不创建“从文案反推标签”的兼容路径。
- 服务端 records response 一律从 Prisma 已存字段映射，避免 HTTP response 与 DB row 继续分叉。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `tsx scripts/backfill-record-metadata.ts` 在 sandbox 内因 IPC pipe 权限失败，改为受权执行真实数据库 backfill。
- Task 2 提交阶段出现一次 `.git/index.lock` 竞争，原因是并发 git 操作；改为串行 `git add`/`git commit` 后完成提交，不影响代码结果。
- Phase 16 backfill 摘要中保留了历史 `phase11-demo-place` smoke unmatched rows；该 placeId 不在 authoritative catalog 内，脚本按计划记录 unmatched 而不伪造 metadata。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Web reopen/fallback 后续修复现在可以直接依赖 TravelRecord/SmokeRecord 已持久化的 canonical metadata，不需要再从 subtitle 或 displayName 猜标签。
- Phase 16 后续计划可复用 `backfillRecordMetadata()` 做 legacy reopen 验证；当前无新增 blocker。

## Self-Check: PASSED

- FOUND: `.planning/phases/16-uat-gap-fallback-smoke-record-schema-typelabel-california/16-01-SUMMARY.md`
- FOUND: `7191620`
- FOUND: `f580719`
- FOUND: `e4d2450`
- FOUND: `35d5126`
- FOUND: `3358828`

---
*Phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california*
*Completed: 2026-04-02*
