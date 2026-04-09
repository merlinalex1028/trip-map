---
phase: 19-tailwind-token
plan: 01
subsystem: infra
tags: [tailwindcss, vite, vitest, pnpm, vue]
requires:
  - phase: 18
    provides: v3.0 web package baseline and existing Vite alias/proxy wiring
provides:
  - apps/web package-scoped Tailwind v4 and @tailwindcss/vite dependency entry
  - Vite plugin chain locked to tailwindcss() before vue()
  - static Vitest contract coverage for Tailwind dependency scope and plugin wiring
affects: [phase-19-plan-02, phase-19-plan-03, apps/web]
tech-stack:
  added: [tailwindcss@^4.2.2, @tailwindcss/vite@^4.2.2]
  patterns: [package-scoped frontend tooling dependencies, static source-contract tests for build entrypoints]
key-files:
  created: [apps/web/src/tailwind-token.spec.ts]
  modified: [apps/web/package.json, apps/web/vite.config.ts, pnpm-lock.yaml]
key-decisions:
  - "Tailwind v4 与 @tailwindcss/vite 仅安装在 @trip-map/web 的 devDependencies，避免污染 workspace 其他包。"
  - "用静态 Vitest 合同直接断言 package.json 与 vite.config.ts 源码字符串，锁定依赖范围和插件顺序。"
patterns-established:
  - "Pattern 1: 构建工具入口先用源文件契约测试锁定，再做依赖接入。"
  - "Pattern 2: web 包新增前端工具链依赖时保持 package-local scope，并由 pnpm-lock.yaml 作为联动证据。"
requirements-completed: [INFRA-01]
duration: 10 min
completed: 2026-04-09
---

# Phase 19 Plan 01: Tailwind Toolchain Entry Summary

**为 `apps/web` 锁定 Tailwind v4 包级依赖、Vite 插件顺序与静态契约测试，建立后续 token 与样式入口迁移的可验证前提**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-09T02:08:37Z
- **Completed:** 2026-04-09T02:18:24Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- 在 `@trip-map/web` 的 `devDependencies` 中新增 `tailwindcss@^4.2.2` 与 `@tailwindcss/vite@^4.2.2`
- 将 `apps/web/vite.config.ts` 的插件链固定为 `plugins: [tailwindcss(), vue()]`，保持现有 alias/proxy/fs 配置不变
- 新增 `apps/web/src/tailwind-token.spec.ts`，用静态源码契约覆盖依赖范围与 Vite 插件接入

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: 锁定 Tailwind 工具链静态契约测试** - `33e027e` (test)
2. **Task 1 GREEN: 接入 Tailwind v4 依赖与 Vite 插件** - `2ada49e` (feat)

## Files Created/Modified
- `apps/web/src/tailwind-token.spec.ts` - 读取 `package.json` 与 `vite.config.ts` 源码并断言精确字符串合同
- `apps/web/package.json` - 为 `@trip-map/web` 增加 Tailwind v4 与 Vite 插件依赖
- `apps/web/vite.config.ts` - 引入 `@tailwindcss/vite` 并把插件顺序固定为 Tailwind 在前、Vue 在后
- `pnpm-lock.yaml` - 记录 Tailwind v4 相关解析结果，作为 workspace 锁文件证据

## Decisions Made
- Tailwind 依赖保持 package-local，仅落在 `apps/web` 的 `devDependencies`，符合 INFRA-01 的作用域要求。
- 契约测试直接断言源码字符串而不是执行构建流程，保证基础设施入口变更可以快速、低噪声回归。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 复用现有 pnpm store 完成依赖安装**
- **Found during:** Task 1 (锁定 Tailwind v4 依赖范围与 Vite 插件接入)
- **Issue:** 默认安装命令命中 `ERR_PNPM_UNEXPECTED_STORE`，随后因沙箱限制无法在全局 pnpm store 下创建项目软链接。
- **Fix:** 改为显式使用现有 store 路径 `/Users/huangjingping/Library/pnpm/store/v10`，并申请一次提权完成 `pnpm add`。
- **Files modified:** None
- **Verification:** `pnpm --filter @trip-map/web exec vitest run src/tailwind-token.spec.ts`
- **Committed in:** `2ada49e`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 仅解决依赖安装环境阻塞，没有扩大实现范围，计划目标保持不变。

## Issues Encountered
- `pnpm add` 首次执行因 store 位置不一致失败；切换到当前仓库已使用的 store 后安装成功。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `apps/web` 已具备 Tailwind v4 与 `@tailwindcss/vite` 的可验证入口，19-02 可以继续建立 `src/style.css`、Nunito 字体基线和最小 Tailwind App shell。
- `tailwind-token.spec.ts` 已为后续继续追加 `main.ts` / `style.css` 合同断言提供落点。

## Self-Check: PASSED
- Verified summary file exists at `.planning/phases/19-tailwind-token/19-01-SUMMARY.md`
- Verified task commits `33e027e` and `2ada49e` exist in git history
