---
phase: 11-monorepo
plan: 01
subsystem: infra
tags: [pnpm, turborepo, contracts, typescript, vitest]
requires: []
provides:
  - pnpm workspace + turbo 根编排层
  - 可独立 build/test/typecheck 的 @trip-map/contracts 薄契约包
  - place/records/health smoke 契约与稳定 fixture
affects: [Phase 11, apps/web, apps/server, packages/contracts]
tech-stack:
  added: [turbo]
  patterns: [root-turbo-delegation, thin-contracts-package, workspace-task-graph]
key-files:
  created:
    - turbo.json
    - tsconfig.base.json
    - packages/contracts/package.json
    - packages/contracts/vitest.config.ts
    - packages/contracts/src/place.ts
    - packages/contracts/src/records.ts
    - packages/contracts/src/health.ts
    - packages/contracts/src/fixtures.ts
    - packages/contracts/src/index.ts
  modified:
    - package.json
    - pnpm-workspace.yaml
    - pnpm-lock.yaml
    - packages/contracts/tsconfig.json
    - packages/contracts/src/contracts.spec.ts
key-decisions:
  - "根 package.json 只保留 turbo 代理脚本，不再承载 Vite/Vue 单应用运行入口。"
  - "@trip-map/contracts 只暴露类型、常量与 fixture；不引入 Pinia、Vue、Nest 或 Prisma 运行时依赖。"
patterns-established:
  - "Workspace orchestration: root scripts -> turbo tasks -> package-local scripts."
  - "Contracts package: canonical 字段与 smoke DTO 从单一 index 出口 re-export。"
requirements-completed: [ARC-01, ARC-04]
duration: 13min
completed: 2026-03-30
---

# Phase 11 Plan 01: Monorepo Root 与 Contracts Summary

**pnpm workspace + turbo 根编排层配合 @trip-map/contracts 薄契约包，锁定了 Phase 11 后续共享的 canonical place 与 smoke record 字段真源。**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-30T03:12:10Z
- **Completed:** 2026-03-30T03:25:07Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- 把仓库根目录收口成纯 `pnpm workspace + turbo` 编排层，补齐 `turbo.json`、workspace globs 和共享 `tsconfig.base.json`。
- 通过 TDD 建立 `@trip-map/contracts`，统一导出 `PlaceKind`、canonical place fields、smoke records DTO、health 响应与稳定 fixture。
- 验证 `contracts` 包不含 `boundaryDatasetVersion`、`pinia`、`vue`、`@nestjs`、`prisma` 等泄漏字段或框架依赖。

## Task Commits

Each task was committed atomically:

1. **Task 1: Reframe the repo root as a pnpm workspace + turbo orchestrator** - `867c8ab` (chore)
2. **Task 2: Create the thin contracts package for canonical place and smoke record fields** - `bbd1995` (test)
3. **Task 2: Create the thin contracts package for canonical place and smoke record fields** - `43d4f60` (feat)

## Files Created/Modified

- `package.json` - 根脚本改为 `turbo run` 代理，并声明 `packageManager` 与 root `turbo` 依赖。
- `pnpm-workspace.yaml` - 收口 `apps/*` 与 `packages/*` workspace globs，并保留 `allowBuilds.esbuild`。
- `turbo.json` - 定义 `build/test/typecheck/dev` 任务图和缓存策略。
- `tsconfig.base.json` - 提取共享 TypeScript 严格配置，供后续 app/package 继承。
- `pnpm-lock.yaml` - 更新 root `turbo` 与 `packages/contracts` workspace importer。
- `packages/contracts/package.json` - 声明 `@trip-map/contracts` 以及 `build/test/typecheck` 脚本。
- `packages/contracts/tsconfig.json` - 让 contracts 包独立编译到 `dist/`。
- `packages/contracts/vitest.config.ts` - 定义 node 环境下的 contracts 测试入口。
- `packages/contracts/src/place.ts` - 定义 `PlaceKind`、`CanonicalPlaceRef`、`CanonicalPlaceSummary`。
- `packages/contracts/src/records.ts` - 定义 smoke record create/response DTO。
- `packages/contracts/src/health.ts` - 定义 `PHASE11_CONTRACTS_VERSION` 与 `HealthStatusResponse`。
- `packages/contracts/src/fixtures.ts` - 提供稳定的 smoke request fixture。
- `packages/contracts/src/index.ts` - 从单一入口 re-export 所有公开契约。
- `packages/contracts/src/contracts.spec.ts` - 以 runtime 常量与类型级断言守护导出面与字段名。

## Decisions Made

- 根目录立即切换为 orchestrator-only，哪怕当前 dry-run 只命中 `@trip-map/contracts`，也不保留旧单体运行脚本作为过渡。
- `contracts` 的导出验证采用 “运行时常量 + `expectTypeOf` 类型断言” 组合，而不是把 TypeScript 接口误当成运行时值。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Task 1 首次执行 `pnpm exec turbo run build typecheck --dry=json` 时因为本地还没有 `turbo` 二进制失败；通过 `pnpm install --no-frozen-lockfile` 更新 root 依赖与 lockfile 后恢复验证。
- 并行 `git add` 两次遇到瞬时 `index.lock` 竞争；未产生仓库损坏，顺序重试后即恢复。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/web` 与 `apps/server` 现在可以在后续计划中直接接入同一套 workspace 任务图和共享 `tsconfig.base.json`。
- `@trip-map/contracts` 已经提供 Phase 11 后续 smoke path 所需的最小 place / records / health 契约真源。

## Self-Check: PASSED

- Verified `.planning/phases/11-monorepo/11-01-SUMMARY.md` exists on disk.
- Verified task commits `867c8ab`, `bbd1995`, and `43d4f60` exist in git history.
