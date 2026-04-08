---
phase: 260408-lu0-taze
plan: 01
subsystem: tooling
tags: [taze, pnpm, dependencies]
provides:
  - workspace dependencies refreshed via taze with latest-compatible set captured in manifests and lockfile
  - TypeScript 6 and Prisma 7 were identified as incompatible with current repo constraints and rolled back minimally
  - root build and typecheck pass after dependency refresh
affects: [developer-experience, monorepo, dependency-maintenance]
tech-stack:
  added: []
  patterns: [taze-latest-upgrade, minimal-manifest-rollback]
key-files:
  created: []
  modified: [package.json, apps/web/package.json, apps/server/package.json, apps/server/tsconfig.build.json, pnpm-lock.yaml]
key-decisions:
  - "Use taze as the sole source of truth for initial latest discovery and write-back."
  - "Rollback TypeScript from 6.0.2 to 5.9.3 because the current server build config is not TypeScript 6 compatible."
  - "Rollback Prisma from 7.x to 6.x because Prisma 7 requires config/schema migration beyond this quick task's scope."
duration: 30min
completed: 2026-04-08
---

# Quick Task 260408-lu0 Summary

**本次通过 `taze` 完成了 workspace 依赖升级，并把结果收敛到一个可安装、可构建、可类型检查的组合。**

## Performance

- **Duration:** ~30 min
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- 使用 `pnpm dlx taze latest -r --include-locked` 盘点 root、web、server 三个 manifest 的升级候选，并用 `-w` 直接写回版本。
- 完成 `pnpm-lock.yaml` 同步，保留了 `turbo`、`vitest`、`vite`、`vue`、`pinia`、`happy-dom`、NestJS 小版本等升级。
- 识别并最小回退 `typescript` 与 `prisma` 两组依赖，避免把这次 quick 任务扩大成配置迁移或业务代码改造。
- 修复了服务端构建态 tsconfig 继承问题，使当前依赖组合下的 `pnpm build` 可恢复通过。

## Final Dependency Outcome

- 保留升级：
  - root: `turbo ^2.9.5`, `vitest ^4.1.3`
  - web: `vue ^3.5.32`, `pinia ^3.0.4`, `nanoid ^5.1.7`, `@vitejs/plugin-vue ^6.0.5`, `vite ^8.0.7`, `vitest ^4.1.3`, `vue-tsc ^3.2.6`, `happy-dom ^20.8.9`
  - server: `@fastify/static ^9.1.0`, `@nestjs/common/core/platform-fastify/testing 11.1.18`, `@types/node ^25.5.2`, `@types/supertest ^7.2.0`, `vitest ^4.1.3`
- 最小回退：
  - `typescript`: `^6.0.2` 回退到 `^5.9.3`
  - `prisma` / `@prisma/client`: `^7.7.0` 回退到 `^6.19.2`

## Verification

- `pnpm dlx taze latest -r --include-locked`
  - 结果：成功列出 root/web/server 的最新版本候选。
- `pnpm install`
  - 结果：成功同步 manifests 与 `pnpm-lock.yaml`。
- `CI=1 pnpm install --frozen-lockfile`
  - 结果：通过，确认 lockfile 与 manifests 一致。
- `CI=1 pnpm build`
  - 结果：通过。
- `CI=1 pnpm typecheck`
  - 结果：通过。
- `CI=1 pnpm test`
  - 结果：web 与 contracts 通过；server 中 3 个依赖真实 PostgreSQL 的 e2e suite 因无法连接 `aws-1-ap-southeast-1.pooler.supabase.com:5432` 失败。

## Issues Encountered

- `typescript 6.0.2` 触发服务端 `tsconfig.build.json` 的构建错误；回退到 `5.9.3` 后恢复。
- `prisma 7.7.0` 要求迁移 `schema.prisma` 与 `prisma.config.ts` 的 datasource 配置，超出本 quick task 范围；回退到 `6.19.x` 后恢复。
- `pnpm` 在当前环境会忽略 Prisma build scripts，因此额外执行了一次 `pnpm --filter @trip-map/server exec prisma generate --schema prisma/schema.prisma` 生成 client。
- 服务端 e2e 测试依赖外部数据库，当前环境无法连库，因此 `pnpm test` 未做到全绿；这更像环境阻塞，而不是本次依赖升级引入的 API 断裂。

## Task Commits

1. **Task 1-3: 用 taze 升级依赖并完成最小回退与验证** - `a08b4b0`

## Files Modified

- `package.json` - 根工具链依赖升级到当前可用组合。
- `apps/web/package.json` - 前端运行时与测试/构建工具链升级。
- `apps/server/package.json` - 服务端 NestJS 周边依赖升级，并对 Prisma/TypeScript 保持兼容版本。
- `apps/server/tsconfig.build.json` - 仅在构建态禁用 `allowImportingTsExtensions` 继承，以恢复 emit 构建。
- `pnpm-lock.yaml` - 锁定最终升级后的解析结果。

## Next Phase Readiness

- 仓库已经处于可安装、可构建、可类型检查状态。
- 若要继续推进到“测试全绿”，下一步需要在可访问 PostgreSQL 的环境下复跑 server e2e，或单独处理其数据库依赖策略。
