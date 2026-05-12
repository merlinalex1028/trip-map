---
phase: 43-landing
plan: 02
subsystem: routing-auth
tags: [vue-router, auth, landing, vitest]
requires: [43-01]
provides:
  - public landing root plus protected /map, /journal, /memories route semantics
  - fixed post-auth navigation to /map for login and registration
  - focused router and auth dialog regression coverage
affects: [landing-route, auth-dialog, route-guard]
tech-stack:
  added: []
  patterns: [async session-restore guard, fixed post-auth router replace]
key-files:
  created: []
  modified:
    - apps/web/src/router/index.ts
    - apps/web/src/router/index.spec.ts
    - apps/web/src/components/auth/AuthDialog.vue
    - apps/web/src/components/auth/AuthDialog.spec.ts
key-decisions:
  - "根路由 `/` 保持 public landing，鉴权后统一转入 `/map`。"
  - "旧 `/timeline` 与 `/statistics` 不保留兼容路由，统一走 catch-all 到 `/`。"
  - "登录和注册成功后都固定执行 `router.replace('/map')`，不保留 redirect intent。"
requirements-completed: [AUTH-02, AUTH-03, AUTH-05]
completed: 2026-05-12
---

# Phase 43 Plan 02: Landing Routing/Auth Summary

**Phase 43 的根路由、受保护应用路由和认证弹层跳转语义已切到 landing + `/map` 契约，并与 43-01 的 public landing 视图兼容。**

## Accomplishments

- 将 `apps/web/src/router/index.ts` 调整为 `landing`、`world-footprints`、`travel-journal`、`travel-memories` 四个核心路由语义，保留 `/__ui` 与 catch-all。
- 更新全局路由守卫：先等待 `restoreSession()`，已登录访问 `/` 时改为 `replace('/map')`，匿名访问 `/map`、`/journal`、`/memories` 时回到 `/`。
- 在 `AuthDialog.vue` 中接入 `useRouter()`，登录/注册成功后关闭弹层并固定跳转 `/map`。
- 为路由和认证弹层补齐聚焦测试，覆盖新路径、旧路径 fallthrough、成功导航和失败不导航。

## Verification

- 通过：`./node_modules/.bin/vitest run src/router/index.spec.ts`
- 通过：`./node_modules/.bin/vitest run src/components/auth/AuthDialog.spec.ts src/router/index.spec.ts`
- 通过：`rg -n "path: '/timeline'|path: '/statistics'|name: 'timeline'|name: 'statistics'" apps/web/src/router/index.ts` 无匹配
- 通过：`rg -n "redirect|returnTo|nextUrl|from.fullPath" apps/web/src/components/auth/AuthDialog.vue apps/web/src/components/auth/AuthDialog.spec.ts` 无匹配

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 使用项目内 Vitest 二进制作为等价测试入口**
- **Found during:** Task 1 / Task 2 verification
- **Issue:** 本次按用户要求避免 `pnpm --filter ...` 挂起风险，未使用计划里的 `pnpm --filter @trip-map/web exec vitest ...`。
- **Fix:** 改用等价的 `apps/web/node_modules/.bin/vitest run ...` 执行同一组聚焦测试。
- **Files modified:** 无
- **Impact:** 仅替换验证入口，不影响交付行为和覆盖范围。

## Compatibility Notes

- 与 43-01 一致，匿名用户访问 `/` 会落在 `LandingPageView`，不会进入 authenticated shell。
- `AuthDialog` 仍复用既有 auth store 的登录、注册和快照水合流程；本次只固定成功后的前端路由目的地。

## Known Stubs

None.

## Self-Check: PASSED

- 目标文件 `apps/web/src/router/index.ts`、`apps/web/src/router/index.spec.ts`、`apps/web/src/components/auth/AuthDialog.vue`、`apps/web/src/components/auth/AuthDialog.spec.ts` 已更新。
- `43-02-SUMMARY.md` 已创建。
- 聚焦测试与 `rg` 验收项均通过。
