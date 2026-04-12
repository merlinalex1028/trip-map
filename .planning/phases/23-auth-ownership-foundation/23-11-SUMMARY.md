---
phase: 23-auth-ownership-foundation
plan: 11
subsystem: ui
tags: [vue3, vitest, auth-dialog, tailwind, gap-closure]
requires:
  - phase: 23-05
    provides: auth dialog shell, modal open/close semantics, and focus restore flow
  - phase: 23-09
    provides: failed-login dialog stays open with form-level error alert
provides:
  - centered auth dialog surface contract that stays stable after failed login alerts render
  - regression spec asserting backdrop centering classes and explicit dialog semantics in error state
affects: [auth-ui, phase-23-gap-closures, AUTH-02, AUTH-05]
tech-stack:
  added: []
  patterns:
    - app-controlled dialog surface semantics instead of native dialog positioning
    - error-state component regression tests that assert layout contract, not only copy
key-files:
  created: []
  modified:
    - apps/web/src/components/auth/AuthDialog.vue
    - apps/web/src/components/auth/AuthDialog.spec.ts
key-decisions:
  - "错误态居中问题通过移除原生 <dialog> 定位语义并改用显式 role=\"dialog\" 面板来修复。"
  - "布局回归规格优先锁定 backdrop/panel 的居中合同，而不是只断言错误文案存在。"
patterns-established:
  - "弹层布局 contract: fixed backdrop + flex center + explicit dialog role + non-shrinking panel surface."
  - "认证失败回归测试同时检查 isAuthModalOpen、alert 与布局类名。"
requirements-completed: [AUTH-02, AUTH-05]
duration: 4min
completed: 2026-04-12
---

# Phase 23 Plan 11: Auth Dialog Centering Gap Closure Summary

**认证弹层在登录失败显示错误提示后仍由应用自控的居中面板承载，不再受原生 dialog 定位语义干扰。**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-12T15:44:04Z
- **Completed:** 2026-04-12T15:47:54Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- 为 `AuthDialog` 增加了错误态布局回归规格，锁定 backdrop 居中类名、显式 dialog 语义和非原生 `dialog` 容器合同。
- 将认证弹层表面语义收口到应用控制的 `role="dialog"` 面板，避免错误提示出现后与浏览器原生 `<dialog>` 定位发生竞争。
- 补强面板的 `shrink-0` 合同，确保错误 alert 插入后对话框仍稳定锚定在视口中央。

## Task Commits

Each task was committed atomically:

1. **Task 1: 用组件规格锁定错误态弹层布局** - `4a1c41f` (test)
2. **Task 2: 收紧 AuthDialog 的居中布局语义** - `6dc2afd` (fix)

## Files Created/Modified
- `apps/web/src/components/auth/AuthDialog.spec.ts` - 增加 failed login 错误态下的居中布局回归规格。
- `apps/web/src/components/auth/AuthDialog.vue` - 使用应用自控 dialog 面板语义并补强 non-shrinking 居中表面合同。

## Decisions Made
- 保持现有登录/注册交互、焦点恢复和错误文案不变，只修正弹层容器语义与布局合同。
- 让测试断言对准 `data-auth-dialog-backdrop` 与 `data-auth-dialog` 的公开 DOM 合同，以降低未来样式回归漏检概率。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- 并行执行中的 `23-10` 提交 `f3a9907` 在 Task 2 过程中也改动了 `apps/web/src/components/auth/AuthDialog.vue`，并提前带入了从原生 `<dialog>` 切到显式 dialog surface 的核心修复。为避免回退他人工作，本计划在该 `HEAD` 基础上继续完成验证，并以 `6dc2afd` 追加最小的 `shrink-0` 收紧，保持 `23-11` 仍有独立 task commit。
- 一次 `git add` 因仓库存在临时 `.git/index.lock` 失败；随后重试 `git commit` 成功，未影响最终结果。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- 认证弹层的失败态视觉回归已收口，后续 auth UI 调整可以直接复用这条组件规格防止居中布局再次漂移。
- 该 cosmetic gap 已闭环，不需要新增认证字段、流程分支或额外后端配套。

## Self-Check: PASSED

- FOUND: `.planning/phases/23-auth-ownership-foundation/23-11-SUMMARY.md`
- FOUND: `4a1c41f`
- FOUND: `6dc2afd`

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
