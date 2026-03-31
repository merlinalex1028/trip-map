---
phase: 260331-pj4-title
plan: "01"
subsystem: web-ui
tags: [css, layout, leaflet, poster-title]
dependency_graph:
  requires: []
  provides: [shrunk-title-block, full-coverage-map]
  affects: [PosterTitleBlock.vue, App.vue, LeafletMapStage.vue]
tech_stack:
  added: []
  patterns: [flex layout for fill-height containers]
key_files:
  created: []
  modified:
    - apps/web/src/components/PosterTitleBlock.vue
    - apps/web/src/App.vue
    - apps/web/src/components/LeafletMapStage.vue
decisions:
  - "poster-shell__experience 改为 flex column + height 100%，让 stage 区域通过 flex: 1 1 0 撑满剩余高度，而非继续使用 grid + 68vh 固定高度"
  - "LeafletMapStage 地图容器从 height: 68vh 改为 flex: 1 1 0，保证 Leaflet 初始化时容器像素尺寸由布局决定，invalidateSize() 可正确修复偏移"
metrics:
  duration: "~5min"
  completed: "2026-03-31T10:26:00Z"
  tasks: 2
  files: 3
---

# Quick Task 260331-pj4: 缩小标题块高度并修复地图偏移 Summary

**One-liner:** 将 PosterTitleBlock padding/gap/字号缩小约 40%，并将地图容器布局从固定 68vh 改为 flex fill，消除地图右半偏移和顶部间隙。

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | 缩小 PosterTitleBlock 高度 | 365d54f | apps/web/src/components/PosterTitleBlock.vue |
| 2 | 修复地图偏移与顶部间隙——布局层调整 | 4b5222e | apps/web/src/App.vue, apps/web/src/components/LeafletMapStage.vue |

## Changes Summary

### Task 1 — PosterTitleBlock.vue

- `padding`: `var(--space-lg)` -> `var(--space-sm) var(--space-md)`
- `gap`: `var(--space-sm)` -> `0.25rem`
- `.poster-title-block__ribbon` `min-height`: `2.25rem` -> `1.6rem`
- `.poster-title-block__ribbon` `padding-inline`: `var(--space-md)` -> `var(--space-sm)`
- `.poster-title-block__ribbon` `letter-spacing`: `0.18em` -> `0.1em`
- `.poster-title-block__title` 新增 `font-size: 1.4rem`、`line-height: 1.2`（覆盖 `var(--font-display-size)`）
- `.poster-title-block__underline` `height`: `0.6rem` -> `0.3rem`，`width`: `7rem` -> `4rem`
- `.poster-title-block__guiding-line` 新增 `font-size: 0.8rem`

### Task 2 — App.vue + LeafletMapStage.vue

**App.vue：**
- `.poster-shell__experience`: `display: grid` -> `flex column`；`padding/gap` 清零；新增 `height: 100%`
- `.poster-shell__stage`: 去掉 `grid-area` / `min-height: 68vh`；改为 `flex: 1 1 0; min-height: 0`

**LeafletMapStage.vue：**
- `.leaflet-map-stage`: `min-height: 68vh` -> `height: 100%; display: flex; flex-direction: column`
- `.leaflet-map-stage__map`: `height: 68vh; min-height: 400px` -> `flex: 1 1 0; min-height: 0`（保留 `width: 100%`、`border-radius`、`overflow: hidden`、`border`、`background`）

## Verification

- `pnpm --filter @trip-map/web test`: 141/141 tests passed
- 代码修改仅涉及 CSS，无逻辑变更，无新依赖

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Awaiting Human Verification

**checkpoint:human-verify** — 视觉验证待用户确认：

1. 打开 http://localhost:5173
2. 检查标题区域高度是否明显减小，整体一屏可见标题 + 地图
3. 检查地图瓷砖是否完整显示（不再只有右半），无顶部白边
4. 在地图上点击任意位置，确认识别流程正常
5. 尝试缩放地图，确认控件正常

## Self-Check: PASSED

- `apps/web/src/components/PosterTitleBlock.vue` — FOUND
- `apps/web/src/App.vue` — FOUND
- `apps/web/src/components/LeafletMapStage.vue` — FOUND
- Commit `365d54f` — FOUND
- Commit `4b5222e` — FOUND
