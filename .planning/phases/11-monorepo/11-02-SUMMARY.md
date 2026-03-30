---
phase: 11-monorepo
plan: 02
subsystem: infra
tags: [pnpm, turborepo, vite, vitest, vue, web, bridge]
requires:
  - phase: 11-monorepo
    plan: 01
    provides: pnpm workspace + turbo 根编排层与 @trip-map/contracts 薄契约包
provides:
  - apps/web 独立 workspace package 壳层
  - web-local Vite/Vitest/TypeScript 配置入口
  - 显式 temporary legacy bootstrap bridge
affects: [Phase 11, apps/web, legacy-bridge, source-migration]
tech-stack:
  added: []
  patterns: [package-local web shell, explicit legacy bootstrap bridge, package-scoped dependency resolution]
key-files:
  created:
    - apps/web/package.json
    - apps/web/tsconfig.json
    - apps/web/index.html
    - apps/web/vite.config.ts
    - apps/web/vitest.config.ts
    - apps/web/src/main.ts
    - apps/web/src/legacy-entry.ts
  modified:
    - pnpm-lock.yaml
    - .planning/phases/11-monorepo/11-02-SUMMARY.md
key-decisions:
  - "apps/web/main.ts 只委托给 package-local legacy-entry，不把完整 runtime/source/spec 迁移塞进 11-02。"
  - "legacy root src 的依赖解析通过 apps/web 的 tsconfig/vite 显式映射到 package 自身依赖，保持根包继续是 orchestrator-only。"
patterns-established:
  - "Temporary bridge pattern: apps/web 持有 index/vite/vitest/bootstrap，legacy root src 只作为过渡运行源被 legacy-entry 引入。"
  - "Workspace ownership pattern: web 运行时依赖和脚本收口到 @trip-map/web，根 package 只保留 turbo 代理脚本。"
requirements-completed: [ARC-01]
duration: 12min
completed: 2026-03-30
---

# Phase 11 Plan 02: Web Package Shell Summary

**独立的 `@trip-map/web` workspace 壳层配合显式 `legacy-entry` 过渡桥，让 web 启动、构建和类型检查入口正式收口到 `apps/web`。**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-30T03:27:00Z
- **Completed:** 2026-03-30T03:39:02Z
- **Tasks:** 1
- **Files modified:** 8

## Accomplishments

- 创建 `apps/web` package，并把 `dev/build/test/typecheck`、依赖声明和 `@trip-map/contracts` workspace 依赖收口到 `@trip-map/web`。
- 把 `index.html`、`vite.config.ts`、`vitest.config.ts` 和 `src/main.ts` 建在 `apps/web`，使 `pnpm -C apps/web build/typecheck` 可以独立运行。
- 新增显式 `apps/web/src/legacy-entry.ts`，只负责桥接当前 root `src/App.vue` 与样式，不提前迁移完整 runtime、spec 或 assets。

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold `apps/web` as a standalone package and add a temporary bridge to the legacy root app** - `3d86f5f` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `apps/web/package.json` - 定义 `@trip-map/web`、package-local 脚本与前端依赖，并声明 `@trip-map/contracts` workspace 依赖。
- `apps/web/tsconfig.json` - 继承根 `tsconfig.base.json`，为 legacy root runtime 建立 package-scoped 类型解析映射并排除未迁移 spec。
- `apps/web/index.html` - 把浏览器入口页面迁到 `apps/web`，由 package-local `src/main.ts` 启动。
- `apps/web/vite.config.ts` - 提供 package-local Vue/Vite 配置，并允许 temporary bridge 读取 repo root legacy source。
- `apps/web/vitest.config.ts` - 提供 `happy-dom` 测试入口，兼容 package-local 与 legacy root spec 路径。
- `apps/web/src/main.ts` - 作为新的 web bootstrap 入口，只显式委托给 `legacy-entry`。
- `apps/web/src/legacy-entry.ts` - temporary bridge，负责挂载 root `src/App.vue` 与 legacy 样式。
- `pnpm-lock.yaml` - 新增 `apps/web` importer 与依赖解析结果，保证 workspace 安装和验证可复现。

## Decisions Made

- 保持 11-02 只做 web package 壳层、配置和 bridge，不提前迁移 `src/` 运行时代码、spec 或 assets。
- 允许 temporary bridge 继续引用 root `src/`，但把 bootstrap ownership 放回 `apps/web`，让后续计划可以明确移除桥接层。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 补齐新 workspace 的依赖安装与 lockfile importer**
- **Found during:** Task 1 (Scaffold `apps/web` as a standalone package and add a temporary bridge to the legacy root app)
- **Issue:** 新建 `apps/web/package.json` 后，`pnpm -C apps/web build/typecheck` 因缺少本地 `node_modules` 与 `vue-tsc` 二进制无法启动。
- **Fix:** 运行 `pnpm install --no-frozen-lockfile` 更新 workspace 安装与 `pnpm-lock.yaml`，为 `apps/web` 建立 package-local 依赖链接。
- **Files modified:** `pnpm-lock.yaml`
- **Verification:** `pnpm -C apps/web build`、`pnpm -C apps/web typecheck`
- **Committed in:** `3d86f5f` (part of task commit)

**2. [Rule 3 - Blocking] 修正 legacy root source 对 package-local 依赖与类型的解析**
- **Found during:** Task 1 (Scaffold `apps/web` as a standalone package and add a temporary bridge to the legacy root app)
- **Issue:** 过渡期 bridge 会把 root `src/` 纳入 `apps/web` 的 typecheck/build 图，但这些文件默认向上只会解析到仓库根，拿不到 `apps/web/node_modules` 中的运行时依赖和类型。
- **Fix:** 在 `apps/web/tsconfig.json` 添加 bare module `paths` 映射并排除未迁移 root specs，在 `apps/web/vite.config.ts` 添加对应 alias 与 repo root 访问允许，另外单独把 `d3-geo` 类型映射到 `@types/d3-geo`。
- **Files modified:** `apps/web/tsconfig.json`, `apps/web/vite.config.ts`
- **Verification:** `pnpm -C apps/web build`、`pnpm -C apps/web typecheck`
- **Committed in:** `3d86f5f` (part of task commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** 两项修正都直接服务于 package shell 的可构建性和可类型检查性，没有扩大到 runtime/spec/assets 迁移。

## Issues Encountered

- 沙箱内首次执行 `pnpm install --no-frozen-lockfile` 因 `registry.npmjs.org` DNS 解析失败而中断；改为提权后重跑即恢复。
- `vite build` 仍提示 bundle 体积超过 `500 kB`，这是当前 legacy 应用体量带来的既有告警，本计划未处理拆包。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/web` 已经是可独立执行的 workspace package，后续计划可以专注迁移 app shell、runtime supporting modules 和 specs，而不必再重复搭脚手架。
- `legacy-entry.ts` 已把过渡边界显式化，后续只需在源码完全迁入 `apps/web` 后删除 bridge 并把 `main.ts` 直连 package-local runtime。

## Self-Check: PASSED

- Verified summary file exists: `.planning/phases/11-monorepo/11-02-SUMMARY.md`
- Verified task commit exists: `3d86f5f`

---
*Phase: 11-monorepo*
*Completed: 2026-03-30*
