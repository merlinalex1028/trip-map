---
phase: 43-landing
plan: 03
subsystem: shell
tags: [vue, shell, auth, vitest]
requires: [43-01]
provides:
  - authenticated desktop shell for /map, /journal, /memories
  - App root branching between public routes and requiresAuth shell routes
  - old authenticated topbar navigation cleanup
affects: [app-root, authenticated-shell, auth-topbar]
tech-stack:
  added: []
  patterns:
    - thin App root orchestration with RouterView slot branching
    - authenticated sidebar shell built on shadcn-vue Sidebar primitives
    - anonymous-only topbar auth trigger
key-files:
  created:
    - apps/web/src/components/shell/AuthenticatedAppShell.vue
    - apps/web/src/components/shell/ShellSidebar.vue
    - apps/web/src/components/shell/AuthenticatedAppShell.spec.ts
  modified:
    - apps/web/src/App.vue
    - apps/web/src/App.spec.ts
    - apps/web/src/App.kawaii.spec.ts
    - apps/web/src/components/auth/AuthTopbarControl.vue
    - apps/web/src/components/auth/AuthTopbarControl.spec.ts
decisions:
  - App.vue uses RouterView slot branching and wraps only route.meta.requiresAuth === true in AuthenticatedAppShell.
  - ShellSidebar locks navigation to exactly 世界足迹, 旅途手账, 旅途回忆 and routes logout back to /.
  - AuthTopbarControl no longer exposes authenticated navigation and only keeps the anonymous login/register trigger.
duration: unknown
completed: 2026-05-12
---

# Phase 43 Plan 03: Authenticated Shell Summary

**已登录桌面应用现在使用左侧 Yume Kawaii shell，公共落地页不再被旧 topbar 包裹，authenticated 导航收敛到固定三项侧栏入口。**

## Accomplishments

- 新建 `AuthenticatedAppShell.vue`，使用 `SidebarProvider`、`Sidebar`、`SidebarInset` 落地 `data-app-shell` 容器，并锁定 `--sidebar-width: 280px`。
- 新建 `ShellSidebar.vue`，接入默认头像、固定插画、当前用户名、三项固定导航和 logout 流程，满足 D-11 到 D-17 的 sidebar contract。
- 更新 `App.vue`，移除旧 topbar 主导航，改为 `RouterView` slot 分支：`status === 'restoring'` 显示 `正在恢复你的旅途...`，`route.meta.requiresAuth === true` 时进入 authenticated shell，其余公共路由直接渲染。
- 收敛 `AuthTopbarControl.vue` 为匿名登录触发器，移除旧 `/timeline`、`/statistics` 路由导航面。
- 更新 `App.spec.ts`、`App.kawaii.spec.ts`、`AuthenticatedAppShell.spec.ts`、`AuthTopbarControl.spec.ts`，把测试契约迁移到新的 authenticated shell 与 public/app route 分支模型。

## Verification

- `./node_modules/.bin/vitest run src/components/shell/AuthenticatedAppShell.spec.ts`
- `./node_modules/.bin/vitest run src/App.spec.ts src/App.kawaii.spec.ts src/components/auth/AuthTopbarControl.spec.ts src/components/shell/AuthenticatedAppShell.spec.ts`
- `rg -n "我的收藏|收藏|badge|progress|summary|统计摘要|旅行记录摘要|bottom-nav|drawer|Sheet" apps/web/src/components/shell`
- `rg -n "AuthTopbarControl|data-region=\"topbar\"|data-kawaii-shell=\"thin\"" apps/web/src/App.vue`
- `rg -n "/timeline|/statistics|data-auth-menu-item=\"timeline\"|data-auth-menu-item=\"statistics\"" apps/web/src/components/auth/AuthTopbarControl.vue apps/web/src/components/auth/AuthTopbarControl.spec.ts`

结果：
- 4 个聚焦 spec 文件共 21 个测试全部通过。
- shell 组件目录未引入收藏、badge、progress、drawer 等禁用表面。
- `App.vue` 已无 `AuthTopbarControl`、`data-region="topbar"`、`data-kawaii-shell="thin"`。
- `AuthTopbarControl` 源码与 spec 已无旧 `/timeline`、`/statistics` 路由契约。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 改用项目内 vitest 二进制执行验证**
- **Found during:** Verification
- **Issue:** 用户提示 `pnpm --filter ...` 可能挂起；本次执行直接采用项目内等价入口，避免卡在包管理器层。
- **Fix:** 使用 `apps/web/node_modules/.bin/vitest` 执行计划要求的同一组聚焦测试。
- **Files modified:** 无
- **Impact:** 仅替换测试入口，不影响实现与覆盖范围。

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- 目标 shell 文件 `[apps/web/src/components/shell/AuthenticatedAppShell.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/shell/AuthenticatedAppShell.vue)`、`[ShellSidebar.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/shell/ShellSidebar.vue)`、`[AuthenticatedAppShell.spec.ts](/Users/huangjingping/i/trip-map/apps/web/src/components/shell/AuthenticatedAppShell.spec.ts)` 已创建。
- 允许改写的 `App.vue`、`App.spec.ts`、`App.kawaii.spec.ts`、`AuthTopbarControl.vue`、`AuthTopbarControl.spec.ts` 已更新。
- 聚焦验证命令已通过。
