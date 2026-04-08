---
phase: 260408-nw1-kawaii
plan: 01
subsystem: web-shell
tags: [vue, css, layout, topbar, quick-fix]
provides:
  - compacts the kawaii topbar so the map regains first-screen visibility
  - realigns shell top padding, notice anchor, and decorative spark offset with the new topbar height
  - preserves existing map behavior and the kawaii visual language
affects: [app-shell, homepage-layout, topbar, map-shell]
tech-stack:
  added: []
  patterns: [thin-app-shell, fixed-topbar-offset-sync]
key-files:
  created: []
  modified: [apps/web/src/App.vue]
key-decisions:
  - "Keep the fix inside App.vue and avoid touching map logic or global theme tokens."
  - "Preserve the kawaii brand voice, but reduce the topbar back to lightweight navigation density."
duration: 14min
completed: 2026-04-08
---

# Quick Task 260408-nw1 Summary

**kawaii 顶部栏已压缩回轻量导航高度，首页首屏地图可视区域恢复。**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-04-08T09:12:02Z
- **Completed:** 2026-04-08T09:26:29Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- 在 [App.vue](/Users/huangjingping/i/trip-map/apps/web/src/App.vue) 收紧了顶部栏目标高度、垂直 padding 和品牌区间距，避免 fixed header 视觉上变成海报头图。
- 同步回收了 `poster-shell` 顶部留白、`interactionNotice` 顶部锚点和左侧装饰 spark 偏移，让回收的空间直接返还给地图首屏。
- 在窄屏下隐藏副标题，只保留“旅记”主标题，确保小视口里也不会再次把地图压缩得过浅。

## Verification

- `pnpm --filter @trip-map/web exec vue-tsc --noEmit`
  - 结果：通过。
- 人工验收
  - 结果：用户已确认 `approved`，顶部栏高度恢复正常，地图不再被明显遮挡。

## Task Commits

1. **Task 1: 在 App.vue 内压缩顶部栏占位并回收地图首屏高度** - `e2675e4`

## Files Modified

- `apps/web/src/App.vue` - 压缩顶部栏高度并同步调整壳层、提示浮层和装饰偏移。

## Next Phase Readiness

- 当前 kawaii 风格已保留，但顶部栏密度恢复到更适合作为地图主舞台入口的层级。
- 如果后续还要在顶部栏加入按钮或筛选器，建议继续沿用当前紧凑高度约束，避免再次侵占首屏地图面积。
