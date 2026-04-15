---
phase: 24-session-boundary-local-import
plan: 03
subsystem: web-ui
tags: [vue3, app-shell, dialog, leaflet, auth, vitest]
requires:
  - phase: 24-02
    provides: pending local import decision and summary state from auth-session
provides:
  - app-level local import decision dialog
  - authoritative import summary surface
  - anonymous illuminate interception that preserves map context
affects: [AUTH-04, MIGR-01, MIGR-02, import UX]
tech-stack:
  added: []
  patterns:
    - app-level migration decision surface
    - anonymous save upgraded into login modal instead of hard redirect
key-files:
  created:
    - apps/web/src/components/auth/LocalImportDecisionDialog.vue
    - apps/web/src/components/auth/LocalImportDecisionDialog.spec.ts
  modified:
    - apps/web/src/App.vue
    - apps/web/src/App.spec.ts
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
key-decisions:
  - "导入选择和导入结果摘要都挂在 App-level surface，不内嵌到 AuthDialog 或 LeafletMapStage。"
  - "匿名点亮只打开登录弹层，当前 summary popup 与地图上下文不做清空。"
requirements-completed: [AUTH-04, MIGR-01, MIGR-02]
completed: 2026-04-14
---

# Phase 24 Plan 03: Import Decision UI Summary

**应用现在会在首次登录检测到本地旧记录时弹出明确的二选一导入对话框，同时匿名用户点击“点亮”只会被升级到登录弹层，不会丢失当前地图上下文。**

## Accomplishments

- 新增 `LocalImportDecisionDialog`，明确收口两个主 CTA：`导入本地记录到当前账号` 与 `以当前账号云端记录为准`。
- `App.vue` 接入 pending decision 与 import summary，并把导入成功后的 authoritative counts 作为结果摘要直接展示。
- `LeafletMapStage` 的 illuminate 入口新增匿名拦截：未登录时只调用 `openAuthModal('login')`，不再直接写 records。

## Verification

- `pnpm --filter @trip-map/web test -- src/components/auth/LocalImportDecisionDialog.spec.ts src/App.spec.ts src/components/LeafletMapStage.spec.ts` ✅
- `pnpm --filter @trip-map/web typecheck` ✅

## Task Commits

本计划在当前工作树内联完成，未生成独立 task commit。

## Files Created/Modified

- `apps/web/src/components/auth/LocalImportDecisionDialog.vue` - 一次性导入选择与结果摘要 UI
- `apps/web/src/components/auth/LocalImportDecisionDialog.spec.ts` - 锁定 CTA、禁用态与 summary 展示
- `apps/web/src/App.vue` - 在 app shell 挂载导入决策与 summary dialog
- `apps/web/src/App.spec.ts` - 覆盖 dialog 挂载、cloud-wins 关闭与 summary copy
- `apps/web/src/components/LeafletMapStage.vue` - 匿名点亮升级为 `openAuthModal('login')`
- `apps/web/src/components/LeafletMapStage.spec.ts` - 覆盖匿名拦截且不清空 summary surface

## Decisions Made

- 导入结果摘要复用同一个 dialog surface 展示，避免新增第三种 toast/drawer 形态稀释“用户刚做出的迁移决策”语义。
- 匿名拦截保留了 fallback point / detected preview 的现有 popup 状态，保证登录动作是“升级当前操作”，而不是“清空后重新来”。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 新增匿名会话判断后，`LeafletMapStage` 测试里一度把 `currentUser` 从错误 store 解构，已在同轮修正并通过全部相关组件测试。

## Next Phase Readiness

用户可见的迁移和匿名拦截交互已经稳定，后续只需继续强化 logout / switch-account / unauthorized 的边界收场与提示语义。

## Self-Check

PASSED

---
*Phase: 24-session-boundary-local-import*
*Completed: 2026-04-14*
