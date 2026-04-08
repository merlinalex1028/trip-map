---
phase: 260408-mom-topbar-title
plan: 01
subsystem: web-shell
tags: [vue, layout, topbar, leaflet]
provides:
  - removes the old poster-style title block from the app shell
  - adds a compact top bar with the site title "旅记" on the left
  - redistributes shell height so the map continues filling the remaining viewport
affects: [app-shell, homepage-layout, map-shell]
tech-stack:
  added: []
  patterns: [thin-app-shell, viewport-grid-layout]
key-files:
  created: []
  modified: [apps/web/src/App.vue, apps/web/src/App.spec.ts]
key-decisions:
  - "Keep the change inside App.vue instead of touching LeafletMapStage internals."
  - "Leave the top bar right side empty as a reserved extension slot."
duration: 9min
completed: 2026-04-08
---

# Quick Task 260408-mom Summary

**首页壳层已从“左上角海报标题块 + 地图”调整为“顶部栏 + 占满剩余高度的地图”。**

## Performance

- **Duration:** ~9 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- 从 [App.vue](/Users/huangjingping/i/trip-map/apps/web/src/App.vue) 移除了旧的 `PosterTitleBlock` 渲染和导入。
- 新增一个轻量顶部栏，左侧显示“旅记”，右侧保留空白占位区域，方便后续扩展。
- 调整 app shell 的视口高度与网格分配，让地图卡片继续吃满顶部栏下方的剩余空间。
- 更新 [App.spec.ts](/Users/huangjingping/i/trip-map/apps/web/src/App.spec.ts)，不再依赖旧标题组件和“旅行世界地图”文案。

## Verification

- `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts`
  - 结果：通过。
- `pnpm --filter @trip-map/web exec vue-tsc --noEmit`
  - 结果：通过。

## Task Commits

1. **Task 1-2: 调整 App 顶部栏与页面壳层布局** - `25f4042`

## Files Modified

- `apps/web/src/App.vue` - 用顶部栏替换旧标题块，并重新分配顶部栏与地图区的高度。
- `apps/web/src/App.spec.ts` - 改为断言新顶部栏“旅记”和旧标题文案移除。

## Next Phase Readiness

- 页面右上角已有空白占位，可继续接入后续按钮、筛选器或用户入口。
