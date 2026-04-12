---
phase: 23-auth-ownership-foundation
plan: 05
subsystem: ui
tags: [vue3, pinia, auth-session, tailwind, vitest]
requires:
  - phase: 23-04
    provides: auth-session store bootstrap, modal state, and records lifecycle reset
provides:
  - topbar auth identity chip for anonymous and authenticated states
  - unified login/register dialog wired to auth-session actions
  - restoring overlay scoped to the map shell during session bootstrap
  - App first-mount restoreSession bootstrap on the real shell path
affects: [phase-24-session-boundary, auth-ui, app-shell]
tech-stack:
  added: []
  patterns:
    - store-backed auth shell components in Vue 3 Composition API
    - restoring overlay rendered inside data-region="map-shell" without unmounting LeafletMapStage
key-files:
  created:
    - apps/web/src/components/auth/AuthTopbarControl.vue
    - apps/web/src/components/auth/AuthDialog.vue
    - apps/web/src/components/auth/AuthRestoreOverlay.vue
  modified:
    - apps/web/src/App.vue
    - apps/web/src/App.spec.ts
    - apps/web/src/components/auth/AuthDialog.spec.ts
key-decisions:
  - "Auth shell 继续复用 auth-session store 作为唯一真源，App 只负责首次 restore bootstrap 与组合挂载。"
  - "restoring 态只覆盖 data-region=\"map-shell\"，保留顶栏与 LeafletMapStage 在 DOM 中持续存在。"
  - "顶栏 authenticated menu 严格收口为用户名、邮箱、退出登录，不引入设置页或设备管理占位。"
patterns-established:
  - "App shell composition: App.vue 维持 shell/notice 布局，新 auth 交互拆到 feature 组件中。"
  - "Dialog/tab contract: 登录与注册共用一个 dialog，通过 authMode 切换而不做页面导航。"
requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-05]
duration: 21min
completed: 2026-04-12
---

# Phase 23 Plan 05: Auth Shell Summary

**Vue App shell 现已接入顶栏身份 chip、统一登录/注册 dialog，以及仅覆盖地图舞台的 restoring overlay**

## Performance

- **Duration:** 21 min
- **Started:** 2026-04-12T12:17:00Z
- **Completed:** 2026-04-12T12:38:12Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- App 首次挂载会显式触发一次 `restoreSession()`，把真实 session bootstrap 放回壳层启动路径。
- 顶栏右侧已按合同接入匿名 `登录 / 注册` chip、已登录用户名 chip 与最小 dropdown。
- 登录/注册共用一个认证 dialog，成功后关闭弹层并回到触发入口；restoring 蒙层只覆盖地图主舞台。

## Task Commits

1. **Task 1: 建立 auth shell UI 的组件与 App 规格** - `ae2e17d` (test)
2. **Task 2: 实现顶栏账号入口、认证弹层与地图舞台 restoring 蒙层** - `0818d9d` (feat)

## Files Created/Modified
- `apps/web/src/components/auth/AuthTopbarControl.vue` - 顶栏匿名/已登录身份入口与最小 dropdown。
- `apps/web/src/components/auth/AuthDialog.vue` - 单个 dialog 内的登录/注册 tab 与表单提交流程。
- `apps/web/src/components/auth/AuthRestoreOverlay.vue` - 仅作用于地图舞台的 restoring 蒙层。
- `apps/web/src/App.vue` - 在壳层首次挂载触发 `restoreSession()` 并组合新 auth 组件。
- `apps/web/src/App.spec.ts` - App shell 的 auth restore、入口状态与 overlay 合同测试。
- `apps/web/src/components/auth/AuthDialog.spec.ts` - 认证 dialog 的 tab、字段集与成功关闭测试。

## Decisions Made
- 保持 `App.vue` 为薄组合面，只挂载 auth 组件并在 `onMounted()` 上触发 restore，不把交互细节塞回 root。
- authenticated dropdown 继续使用轻量文本菜单，身份信息只展示服务端 session 恢复得到的 `currentUser`。
- dialog 成功提交后显式调用 `closeAuthModal()` 并恢复焦点，和 store 里的 close 行为保持幂等。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 修正 TDD 规格的 store spy 时机**
- **Found during:** Task 2 (实现顶栏账号入口、认证弹层与地图舞台 restoring 蒙层)
- **Issue:** `App.spec.ts` 与 `AuthDialog.spec.ts` 最初在 mount 之后才 spy store action，导致组件持有原始 action，引发 restore/login/register 真实请求和假失败。
- **Fix:** 把两个 spec 的 helper 改为“先配置 store，再 mount 组件”，确保 restore/login/register/closeAuthModal 都被稳定拦截。
- **Files modified:** apps/web/src/App.spec.ts, apps/web/src/components/auth/AuthDialog.spec.ts
- **Verification:** `pnpm --filter @trip-map/web test -- src/App.spec.ts src/components/auth/AuthDialog.spec.ts`、`pnpm --filter @trip-map/web typecheck`
- **Committed in:** `0818d9d`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 仅修正测试基座，属于完成本计划所必需的阻塞清理；无额外产品范围扩张。

## Issues Encountered
- 并发 `git add` 两次触发了临时 `.git/index.lock` 冲突；改为串行暂存后即恢复，未影响代码结果。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- AUTH-05 的壳层入口和 restoring UX 已就位，Phase 24 可以直接围绕匿名浏览边界与首次本地导入展开。
- 顶栏与弹层已经锁住最小 auth UI 面，后续 phase 若扩展文案或导入流程，应避免把 deferred 能力塞回当前 dropdown/dialog。

## Self-Check: PASSED

- FOUND: `.planning/phases/23-auth-ownership-foundation/23-05-SUMMARY.md`
- FOUND: `ae2e17d`
- FOUND: `0818d9d`

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
