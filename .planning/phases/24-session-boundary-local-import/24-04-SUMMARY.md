---
phase: 24-session-boundary-local-import
plan: 04
subsystem: web-session-boundary
tags: [pinia, auth-session, map-points, app-shell, notices, vitest]
requires:
  - phase: 24-02
    provides: auth-session migration gate and import summary state
  - phase: 24-03
    provides: app-level import dialog and anonymous illuminate upgrade
provides:
  - logout clears session-boundary UI state and records
  - switch-account notice and reset-before-hydrate sequencing
  - regression coverage for unauthorized and restore-failure cleanup
affects: [AUTH-04, MIGR-04, session boundary UX]
tech-stack:
  added: []
  patterns:
    - reset-before-replace session boundary transition
    - reason-aware account switch notice
key-files:
  created: []
  modified:
    - apps/web/src/stores/auth-session.ts
    - apps/web/src/stores/auth-session.spec.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/App.spec.ts
key-decisions:
  - "账号切换时明确落 `已切换到 ...` notice，而不是静默替换 records。"
  - "logout / unauthorized / restore failure 都同步清空 Phase 24 新增的 pending import 与 import summary 状态。"
requirements-completed: [AUTH-04, MIGR-04]
completed: 2026-04-14
---

# Phase 24 Plan 04: Session Boundary Hardening Summary

**会话边界现在会在 logout、switch-account、unauthorized 和 restore failure 时统一先清场再切换 snapshot，并给出明确的边界提示。**

## Accomplishments

- `auth-session` 在 hydrate 新账号 snapshot 前显式执行 reset-before-replace，并在真正切换账号时展示 `已切换到 ...` notice。
- logout / unauthorized / restore failure 会同步清空 `pendingLocalImportDecision`、`localImportSummary` 与 map-points 里的 draft / pending / selected / summary 状态。
- 扩展 `auth-session.spec.ts`、`map-points.spec.ts`、`App.spec.ts`，锁住切账号、退出登录、边界清场与 notice 联动。

## Verification

- `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` ✅
- `pnpm --filter @trip-map/web typecheck` ✅

## Task Commits

本计划在当前工作树内联完成，未生成独立 task commit。

## Files Created/Modified

- `apps/web/src/stores/auth-session.ts` - 增加切账号 notice 与 Phase 24 新状态清理
- `apps/web/src/stores/auth-session.spec.ts` - 覆盖 switch-account reset 顺序、logout 清理 import 状态、unauthorized 不留旧边界
- `apps/web/src/stores/map-points.spec.ts` - 覆盖 `resetTravelRecordsForSessionBoundary()` 同时清理 draft / pending / selected / summary
- `apps/web/src/App.spec.ts` - 覆盖 `已退出当前账号` / `已切换到 ...` 与 app shell 同步渲染

## Decisions Made

- 继续沿用 Phase 23 建立的 `auth-session -> map-points` 单向边界切换模型，不在 Topbar 或 App 里重复写 reset 逻辑。
- notice 保持轻量信息提示，不额外引入 loading page 或 blocking interstitial，避免把边界切换体验做得过重。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 回归测试中有一个 `.at()` 与局部变量遗漏的小问题，已在同轮修正；不影响最终行为与类型合同。

## Next Phase Readiness

Phase 24 的会话边界语义已经闭合，Phase 25 可以直接在这个基础上继续做多设备同步、取消点亮和同步反馈语义。

## Self-Check

PASSED

---
*Phase: 24-session-boundary-local-import*
*Completed: 2026-04-14*
