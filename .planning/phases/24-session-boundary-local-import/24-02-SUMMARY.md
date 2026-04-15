---
phase: 24-session-boundary-local-import
plan: 02
subsystem: web-session
tags: [vue3, pinia, localstorage, auth-session, vitest]
requires:
  - phase: 24-01
    provides: bulk import API and import summary contract
provides:
  - read-only legacy local snapshot reader
  - auth-session import decision state machine
  - cloud-wins and import summary handling in store layer
affects: [MIGR-01, MIGR-02, MIGR-03, app-level import UI]
tech-stack:
  added: []
  patterns:
    - one-time legacy snapshot gate in auth-session
    - localStorage reader separated from UI decisions
key-files:
  created:
    - apps/web/src/services/legacy-point-storage.ts
    - apps/web/src/services/legacy-point-storage.spec.ts
  modified:
    - apps/web/src/services/api/records.ts
    - apps/web/src/stores/auth-session.ts
    - apps/web/src/stores/auth-session.spec.ts
key-decisions:
  - "legacy snapshot 只做只读解析，不恢复旧 localStorage 主链路。"
  - "迁移 gate 完全收口到 auth-session；组件只消费 pending decision 与 summary。"
requirements-completed: [MIGR-01, MIGR-02]
completed: 2026-04-14
---

# Phase 24 Plan 02: Legacy Import State Machine Summary

**前端现在能在 authenticated bootstrap 后识别 `trip-map:point-state:v2`，并把首次登录导入决策、cloud-wins 和 import summary 全部收口到 `auth-session`。**

## Accomplishments

- 新增 `legacy-point-storage` 只读服务，把历史快照解析为可导入的 canonical `CreateTravelRecordRequest[]`，同时保留 `empty/corrupt/incompatible/ready` 状态。
- 在 `auth-session` 中新增 `pendingLocalImportDecision`、`localImportSummary`、`keepCloudRecordsAsSourceOfTruth()` 与 `importLocalRecordsIntoAccount()`。
- Web API 层新增 `importTravelRecords()`，前端从此通过单个 bulk import 请求对接后端，而不是逐条保存。

## Verification

- `pnpm --filter @trip-map/web test -- src/services/legacy-point-storage.spec.ts src/stores/auth-session.spec.ts` ✅
- `pnpm --filter @trip-map/web typecheck` ✅

## Task Commits

本计划在当前工作树内联完成，未生成独立 task commit。

## Files Created/Modified

- `apps/web/src/services/legacy-point-storage.ts` - 识别并规范化历史 `trip-map:point-state:v2`
- `apps/web/src/services/legacy-point-storage.spec.ts` - 覆盖 empty/corrupt/incompatible/ready/clear 行为
- `apps/web/src/services/api/records.ts` - 暴露 bulk import API client
- `apps/web/src/stores/auth-session.ts` - 增加一次性迁移 gate、import summary 与 cloud-wins 流程
- `apps/web/src/stores/auth-session.spec.ts` - 覆盖首次登录迁移决策、cloud-wins、import 替换 authoritative snapshot

## Decisions Made

- 对旧快照中的 `regionSystem/adminType` 采用“优先信任持久化字段，缺失时按 `placeKind/typeLabel` 推断”的最小恢复策略，避免引入额外服务端查询。
- 成功导入或用户明确选择 cloud-wins 后立即清理 legacy key，避免重复弹窗；失败时保留 key，便于重试。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 无额外阻塞；相关 store 与 service specs、`vue-tsc` 均通过。

## Next Phase Readiness

App 层已经有稳定的 store 合同，可以直接挂载显式导入选择对话框与导入结果摘要，不需要把迁移逻辑塞进地图组件。

## Self-Check

PASSED

---
*Phase: 24-session-boundary-local-import*
*Completed: 2026-04-14*
