---
phase: 260408-lc0-turbo-parallel-turbo-v2-dev
plan: 01
subsystem: tooling
tags: [turbo, turborepo, dev-workflow]
provides:
  - root dev script no longer depends on deprecated `--parallel`
  - web package now declares `with` linkage to `@trip-map/server#dev`
  - standalone `dev:web` and `dev:server` entries keep single-package semantics
affects: [developer-experience, monorepo]
tech-stack:
  added: []
  patterns: [package-level-turbo-with]
key-files:
  created: [apps/web/turbo.json]
  modified: [package.json]
key-decisions:
  - "Keep root turbo.json unchanged because it already declares the shared persistent/cache=false defaults for dev tasks."
  - "Model the web->server companion process in apps/web/turbo.json instead of keeping CLI-level `--parallel`."
duration: 11min
completed: 2026-04-08
---

# Quick Task 260408-lc0 Summary

**根 `pnpm dev` 已迁移到 Turbo v2 推荐的配置驱动方式，`--parallel` 弃用告警消失，同时保留 web 拉起 server 的联动入口。**

## Performance

- **Duration:** ~11 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- 把根 `dev` 脚本从 `turbo run dev --parallel` 改为 `turbo run dev --filter=@trip-map/web`。
- 新增 `apps/web/turbo.json`，通过 `tasks.dev.with = ["@trip-map/server#dev"]` 显式声明开发期伴随服务关系。
- 将 `dev:web` / `dev:server` 收口为直接调用各自 package 脚本，避免 `dev:web` 因 `with` 关系意外连带拉起 server。

## Task Commits

1. **Task 1: 用 package-level Turbo 配置替代根脚本里的 `--parallel`** - `3901f4a`

## Verification

- `pnpm exec turbo run dev --filter=@trip-map/web --dry=json`
  - 结果：dry-run 中同时出现 `@trip-map/web#dev` 与 `@trip-map/server#dev`，且 web 任务带有 `with: ["@trip-map/server#dev"]`。
- 短时启动 `CI=1 pnpm dev`
  - 结果：日志里不再出现 `--parallel is deprecated`，并可见 `@trip-map/web:dev:` 与 `@trip-map/server:dev:` 两个任务前缀。
  - 备注：`@trip-map/server:dev` 在当前沙箱环境下因 `tsx watch` 监听 `/tmp/tsx-501/*.pipe` 报 `EPERM` 退出；这是环境限制，不是 Turbo 编排回归。

## Files Created/Modified

- `apps/web/turbo.json` - 为 web 包声明 Turbo v2 `with` 伴随任务关系。
- `package.json` - 更新根开发入口并保留清晰的单包 dev 命令。

## Deviations from Plan

- 没有引入对根 `turbo.json` 的额外改动，因为现有 `tasks.dev` 已满足 `persistent: true` 与 `cache: false` 的目标。

## Next Phase Readiness

- 仓库可以继续沿用 `pnpm dev` 作为前后端联动入口。
- 后续升级 Turbo major 时，不再受 `--parallel` 移除影响。
