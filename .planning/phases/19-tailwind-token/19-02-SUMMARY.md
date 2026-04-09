---
phase: 19-tailwind-token
plan: 02
subsystem: ui
tags: [tailwindcss, vue, vitest, typography, leaflet]
requires:
  - phase: 19-01
    provides: package-scoped Tailwind v4 dependencies, Vite plugin wiring, and static contract test baseline
provides:
  - single CSS entrypoint that orders Tailwind, Leaflet, legacy tokens, and global compatibility styles
  - Nunito Variable baseline shared by global body text and Tailwind `font-sans`
  - minimal Tailwind app shell scaffold that preserves Leaflet map stage boundaries
affects: [phase-19-plan-03, apps/web, tailwind-shell]
tech-stack:
  added: [@fontsource-variable/nunito@^5.2.7]
  patterns: [single-css-entry, foundation-only-tailwind-theme, thin-tailwind-app-shell]
key-files:
  created: [apps/web/src/style.css]
  modified:
    - apps/web/package.json
    - pnpm-lock.yaml
    - apps/web/src/main.ts
    - apps/web/src/styles/tokens.css
    - apps/web/src/App.vue
    - apps/web/src/App.spec.ts
    - apps/web/src/tailwind-token.spec.ts
key-decisions:
  - "用 `src/style.css` 统一承接 Tailwind、Leaflet 与 legacy CSS imports，让 `main.ts` 只保留字体与单一入口。"
  - "全局默认字体与 `font-sans` 一起切到 Nunito Variable，同步保留现有中文 fallback 链。"
  - "App.vue 只迁移 topbar、notice 和 map shell 这些壳层布局；装饰性 grain/spark 继续留在少量 scoped CSS。"
patterns-established:
  - "Pattern 1: Tailwind foundation token 只暴露基础色族，语义状态变量继续停留在 legacy CSS variable 层。"
  - "Pattern 2: Leaflet 主舞台只接收 `min-h-0 flex-1` 这类安全布局类，不在壳层向地图容器注入 transform/filter utility。"
requirements-completed: [INFRA-02, INFRA-03, STYLE-01, STYLE-02]
duration: 10 min
completed: 2026-04-09
---

# Phase 19 Plan 02: Tailwind Token Shell Summary

**`apps/web` 已切到单一 CSS 入口、Nunito Variable 字体基线与 foundation-only Tailwind token，并用最小 Tailwind 壳层保留 Leaflet 地图舞台边界**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-09T10:26:04+08:00
- **Completed:** 2026-04-09T10:36:11+08:00
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- 新增 `apps/web/src/style.css`，把 Tailwind、Leaflet、legacy token 和 global compatibility 层串成唯一 CSS 入口。
- 在 `@trip-map/web` 中安装 `@fontsource-variable/nunito`，并把 `main.ts`、`tokens.css`、Tailwind `--font-sans` 一起收敛到同一套 Nunito fallback 链。
- 把 `App.vue` 收口为最小 Tailwind 壳层样板，仅迁移页面背景、topbar、notice 和 map shell，不触碰 popup/card/button/drawer 范围。
- 扩展 `tailwind-token.spec.ts` 与 `App.spec.ts`，用静态合同和 shell smoke 锁住 import 顺序、token 值、字体入口与地图舞台连续性。

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: 建立单一 CSS 入口、foundation token 与 Nunito 基线的失败合同** - `b35695f` (test)
2. **Task 1 GREEN: 落地单一 CSS 入口、Nunito 依赖与 foundation token** - `485d3e4` (feat)
3. **Task 2 RED: 收紧 App shell 的最小 Tailwind smoke test** - `5048825` (test)
4. **Task 2 GREEN: 把 App.vue 收口为最小 Tailwind 壳层样板** - `25e028d` (feat)

## Files Created/Modified
- `apps/web/package.json` - 为 `@trip-map/web` 增加 `@fontsource-variable/nunito`
- `pnpm-lock.yaml` - 记录 Nunito 字体包锁定结果
- `apps/web/src/style.css` - 提供单一 CSS 入口、精确 import 顺序和 12 个 foundation token
- `apps/web/src/main.ts` - 收敛为字体导入加 `style.css` 主入口
- `apps/web/src/styles/tokens.css` - 对齐 Nunito fallback 链与 cream 页面底色
- `apps/web/src/App.vue` - 用 Tailwind utility 实现最小壳层布局，保留现有 store/watch 逻辑
- `apps/web/src/App.spec.ts` - 新增 Tailwind 壳层与 map-stage 连续性断言
- `apps/web/src/tailwind-token.spec.ts` - 新增 Nunito、单一入口、foundation token 与 legacy 兼容层静态断言

## Decisions Made
- `style.css` 成为 Tailwind v4 的唯一入口，`main.ts` 不再分散导入 `tokens.css`、`global.css` 与 Leaflet CSS。
- Nunito Variable 先统一作为标题和正文的默认字体，保证本阶段“字体明显切换”目标可验证。
- App 壳层布局使用 Tailwind utility，装饰性 grain/spark 和 warning notice 背景仍保留在小范围 scoped CSS，避免把 Phase 20 组件迁移提前带入。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `style.css`、Nunito 字体基线和最小 Tailwind shell 已就位，19-03 可以直接做最终验证与浏览器冒烟。
- Leaflet 地图舞台继续由 `LeafletMapStage` 直接承接，后续若扩展 Tailwind 迁移，应继续沿用当前“壳层先行、深层组件后置”的边界。

## Self-Check: PASSED
- Verified summary file exists at `.planning/phases/19-tailwind-token/19-02-SUMMARY.md`
- Verified task commits `b35695f`, `485d3e4`, `5048825`, and `25e028d` exist in git history
