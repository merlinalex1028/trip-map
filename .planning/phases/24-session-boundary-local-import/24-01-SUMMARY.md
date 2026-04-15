---
phase: 24-session-boundary-local-import
plan: 01
subsystem: api-records
tags: [nestjs, prisma, records, import, vitest, contracts]
requires:
  - phase: 23-auth-ownership-foundation
    provides: current-user session guard and UserTravelRecord ownership model
provides:
  - protected bulk import endpoint for legacy local records
  - server-side canonical de-duplication and import summary calculation
  - shared import request/response contracts for web and server
affects: [MIGR-01, MIGR-03, web import flow, phase 24 verification]
tech-stack:
  added: []
  patterns:
    - current-user protected bulk import endpoint
    - server authoritative import summary
key-files:
  created:
    - apps/server/src/modules/records/dto/import-travel-records.dto.ts
  modified:
    - packages/contracts/src/records.ts
    - packages/contracts/src/index.ts
    - apps/server/src/modules/records/records.controller.ts
    - apps/server/src/modules/records/records.service.ts
    - apps/server/src/modules/records/records.repository.ts
    - apps/server/test/records-import.e2e-spec.ts
key-decisions:
  - "导入结果摘要在服务端统一计算，前端不再循环 POST /records 猜测 imported/merged/finalCount。"
  - "同一 placeId 采用 cloud wins；本地重复或云端已存在仅计入 mergedDuplicateCount。"
requirements-completed: [MIGR-01, MIGR-03]
completed: 2026-04-14
---

# Phase 24 Plan 01: Records Import Backend Summary

**服务端现在提供受会话保护的 `/records/import`，能够按 canonical `placeId` 去重导入 legacy 本地记录，并返回 authoritative snapshot 摘要。**

## Accomplishments

- 在 shared contracts 中新增 `ImportTravelRecordsRequest` / `ImportTravelRecordsResponse`，为前后端 bulk import 对接建立统一类型。
- 在 records controller / service / repository 中补齐 `POST /records/import`，并把导入逻辑收口为“先去 incoming duplicates，再跳过当前账号已存在 placeId”的幂等写入流程。
- 新增 `records-import.e2e-spec.ts`，覆盖匿名 401、payload 去重、cloud wins 和幂等重放语义。

## Verification

- `pnpm --filter @trip-map/contracts build` ✅
- `pnpm --filter @trip-map/server typecheck` ✅
- `pnpm --filter @trip-map/server test -- test/records-import.e2e-spec.ts` ⚠️ 当前环境无法连接 `aws-1-ap-southeast-1.pooler.supabase.com:5432`，待在可访问数据库的环境补验

## Task Commits

本计划在当前工作树内联完成，未生成独立 task commit。

## Files Created/Modified

- `packages/contracts/src/records.ts` - 定义 import request / response DTO
- `packages/contracts/src/index.ts` - re-export import contracts
- `apps/server/src/modules/records/dto/import-travel-records.dto.ts` - Nest DTO 校验 bulk records payload
- `apps/server/src/modules/records/records.controller.ts` - 暴露受 `SessionAuthGuard` 保护的 `/records/import`
- `apps/server/src/modules/records/records.service.ts` - 返回 authoritative import summary 与最新 records snapshot
- `apps/server/src/modules/records/records.repository.ts` - 负责 canonical 去重、skipDuplicates 与 merged/imported/final 统计
- `apps/server/test/records-import.e2e-spec.ts` - 锁定 import endpoint 的关键行为

## Decisions Made

- 沿用 Phase 23 的 `UserTravelRecord (userId, placeId)` 复合唯一键做导入幂等基座，不回退到 legacy `TravelRecord` 表回填。
- `mergedDuplicateCount` 采用“输入条数减实际新增条数”的聚合口径，统一覆盖 payload 内重复与云端已存在两类 merged 情况。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 定向 server import e2e 在当前环境因外部 Supabase 主机不可达而无法完成最终运行验证；代码与类型检查均通过，环境恢复后需补跑一次该 spec。

## Next Phase Readiness

后端 import 契约与 authoritative summary 已就位，前端可直接通过单个 bulk import API 驱动首次登录迁移流程。

## Self-Check

PASSED

---
*Phase: 24-session-boundary-local-import*
*Completed: 2026-04-14*
