---
phase: 43-landing
plan: 01
subsystem: ui
tags: [vue, landing, auth, vitest, assets]
requires: []
provides:
  - public landing route view backed by semantic v8 assets
  - hero CTA wiring into the existing auth session modal
  - focused landing hero CTA component test coverage
affects: [phase-43-routing, phase-43-shell, landing-page]
tech-stack:
  added: []
  patterns: [thin route view, props-down-events-up landing sections, semantic v8 asset imports]
key-files:
  created:
    - apps/web/src/views/LandingPageView.vue
    - apps/web/src/views/LandingPageView.spec.ts
    - apps/web/src/components/landing/LandingPage.vue
    - apps/web/src/components/landing/LandingHero.vue
    - apps/web/src/components/landing/LandingTreasurePanel.vue
  modified:
    - apps/web/src/assets/v8/landing/landing-upper-bg.png
    - apps/web/src/assets/v8/landing/landing-lower-bg.png
    - apps/web/src/assets/v8/landing/travel-postcards.png
    - apps/web/src/assets/v8/landing/cta-mascot.png
    - apps/web/src/assets/v8/mascots/logo-cat-outline.png
    - apps/web/src/assets/v8/shell/default-avatar.png
    - apps/web/src/assets/v8/shell/sidebar-illustration.png
key-decisions:
  - "LandingPageView 保持为薄路由视图，只组合 LandingPage。"
  - "LandingHero 负责顶部品牌、标题和唯一保留的登录/注册 CTA；LandingTreasurePanel 只负责下半区标题、统计和拍立得展示。"
  - "按后续高保反馈改用完整 landing 背景图，并移除底部 CTA 条，避免与高保最终方向冲突。"
  - "Hero CTA 统一复用 useAuthSessionStore().openAuthModal('register' | 'login')，不引入第二套认证状态。"
patterns-established:
  - "Pattern 1: 高保真场景背景使用语义化 v8 资源导入，交互与文案保持真实 DOM。"
  - "Pattern 2: Landing 功能用父组件做 store orchestration，子组件只做展示和事件分发。"
requirements-completed: [AUTH-01, AUTH-04]
duration: 31min
completed: 2026-05-12
---

# Phase 43 Plan 01: Landing Summary

**公共落地页现在通过语义化 v8 背景资源和真实 DOM hero CTA 呈现，并直接接入现有登录/注册弹层；底部 CTA 条已按高保反馈移除。**

## Performance

- **Duration:** 31 min
- **Started:** 2026-05-12T02:11:00Z
- **Completed:** 2026-05-12T02:42:11Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- 将计划指定的 7 个 `prd/v8.0/切图` 资源复制到 `apps/web/src/assets/v8/...` 语义化英文路径。
- 新建 `LandingPageView`、`LandingPage`、`LandingHero`、`LandingTreasurePanel`，按 UI-SPEC 落地桌面端 landing 骨架与 CTA 布局。
- 追加完整落地页背景 `landing-full-bg.png` 与真实“旅记”字标切图，并将最终页面改为完整背景承载，不再拆上下半背景。
- 按用户最终反馈移除底部 CTA 条；下半区仅保留“你的旅行，值得被珍藏 ✨”、统计组和拍立得，并整体下移协调。
- 为匿名 landing hero CTA 补齐聚焦测试，覆盖注册与登录两种模式的 auth modal 触发。

## Task Commits

本次未执行任务级 git 提交。

原因：当前工作树位于 `main`，且本次用户授权的写入范围只覆盖计划文件与业务文件，不包含 GSD 状态/元数据流转文件；因此保留为未提交工作区变更，避免在受保护分支上直接落提交。

## Files Created/Modified

- `apps/web/src/assets/v8/landing/landing-upper-bg.png` - 上半段落地页场景背景
- `apps/web/src/assets/v8/landing/landing-lower-bg.png` - 下半段落地页场景背景
- `apps/web/src/assets/v8/landing/landing-full-bg.png` - 用户后续提供的完整落地页背景
- `apps/web/src/assets/v8/landing/brand-wordmark.png` - “旅记”真实字标切图
- `apps/web/src/assets/v8/landing/travel-postcards.png` - 底部明信片装饰图
- `apps/web/src/assets/v8/landing/cta-mascot.png` - 已复制的 CTA 吉祥物支持素材；最终页面不再引用
- `apps/web/src/assets/v8/mascots/logo-cat-outline.png` - 顶部品牌猫猫图标
- `apps/web/src/assets/v8/shell/default-avatar.png` - 后续 shell 默认头像素材
- `apps/web/src/assets/v8/shell/sidebar-illustration.png` - 后续 shell 侧栏插画素材
- `apps/web/src/views/LandingPageView.vue` - `data-route-view="landing"` 的薄路由视图
- `apps/web/src/views/LandingPageView.spec.ts` - 落地页 CTA 触发 register/login 的聚焦测试
- `apps/web/src/components/landing/LandingPage.vue` - 资源导入、布局锚点和 auth modal orchestration
- `apps/web/src/components/landing/LandingHero.vue` - 顶部品牌区、标题和 hero CTA
- `apps/web/src/components/landing/LandingTreasurePanel.vue` - 下半区标题、装饰图和 stats DOM

## Decisions Made

- 保持 `LandingPageView.vue` 为纯组合视图，避免把 landing 实现堆进 route view。
- 让 `LandingPage.vue` 统一持有 `useAuthSessionStore()`，只由 `LandingHero` 通过 emits 触发登录/注册；下半区组件保持纯展示。
- 背景场景使用 `background-image`，标题、按钮、说明和 stats 保持真实 DOM，满足可访问性和 Phase 43 的切图规则。
- 后续高保反馈优先级高于最初底部 CTA 设定，因此删除底部 CTA 条与其按钮入口。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 改用项目内 vitest 二进制执行聚焦测试**
- **Found during:** Task 2
- **Issue:** 计划中的 `pnpm --filter @trip-map/web exec vitest run src/views/LandingPageView.spec.ts` 在当前环境里连 `pnpm --version` 都会挂起，无法返回结果。
- **Fix:** 使用等价的 `apps/web/node_modules/.bin/vitest run src/views/LandingPageView.spec.ts` 完成同一聚焦测试验证。
- **Files modified:** 无
- **Verification:** `./node_modules/.bin/vitest run src/views/LandingPageView.spec.ts` 通过

---

**Total deviations:** 1 auto-fixed (Rule 3: 1)
**Impact on plan:** 不影响交付内容，只替换了验证入口命令。

## Issues Encountered

- `pnpm` CLI 在当前环境中无输出且不退出，因此没有使用计划中的包管理器入口执行测试。

## User Setup Required

None - no external service configuration required.

## Known Stubs

None.

## Next Phase Readiness

- Landing route 需要的高保真资源路径和 hero CTA 交互契约已经就位，可供后续路由与应用壳计划接入 `/`、`/map` 等真实路由分支。
- `default-avatar.png` 与 `sidebar-illustration.png` 已复制到语义化路径，供后续 shell 计划直接引用。
- 未完成项仅剩后续计划负责的路由守卫、登录后跳转和 authenticated shell 接入。

## Self-Check: PASSED

- `apps/web/src/views/LandingPageView.vue`、`apps/web/src/components/landing/LandingPage.vue`、`apps/web/src/views/LandingPageView.spec.ts` 均已存在。
- 聚焦测试 `./node_modules/.bin/vitest run src/views/LandingPageView.spec.ts` 已通过。
- 最新验证补跑 `./node_modules/.bin/vue-tsc --noEmit` 与 `./node_modules/.bin/vite build` 均通过。

---
*Phase: 43-landing*
*Completed: 2026-05-12*
