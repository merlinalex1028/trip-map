---
phase: 44-world-footprints-map-footprint-date-dialog
plan: 02
subsystem: ui
tags: [vue, leaflet, vitest, assets, sidebar]
requires:
  - phase: 44-01
    provides: popup/date dialog contract baseline and focused test guardrails
provides:
  - semantic v8 world-footprints character and pin assets
  - Leaflet world-footprints map stage treatment with star-footprint markers
  - map-route-only sidebar visual mode without changing shell navigation
affects: [map-stage, marker-layer, authenticated-shell, phase-44-followups]
tech-stack:
  added: []
  patterns:
    - route-scoped shell visual mode without nav expansion
    - semantic asset imports from apps/web/src/assets/v8 only
    - Leaflet container styling layered around existing recognition flow
key-files:
  created:
    - .planning/phases/44-world-footprints-map-footprint-date-dialog/44-02-SUMMARY.md
  modified:
    - apps/web/src/assets/v8/characters/map-popup-girl.webp
    - apps/web/src/assets/v8/characters/footprint-dialog-girl.webp
    - apps/web/src/assets/v8/characters/sidebar-camera-girl.webp
    - apps/web/src/assets/v8/pins/pin-star-orange.png
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/SeedMarkerLayer.vue
    - apps/web/src/components/shell/ShellSidebar.vue
    - apps/web/src/components/shell/AuthenticatedAppShell.spec.ts
key-decisions:
  - "地图舞台只叠加 world-footprints 视觉壳，保留 useLeafletMap / resolveCanonicalPlace / confirmCanonicalPlace 识别链路不变。"
  - "sidebar 仅在 /map 切换到 world-footprints 视觉模式，导航依然严格锁定 map/journal/memories 三项。"
  - "角色资产转 WebP 时改用本地 cwebp，避免 sips 无法写入 WebP 导致任务阻塞。"
patterns-established:
  - "Map Route Visual Override: 通过 route computed + data-shell-visual-mode 做单路由高保视觉恢复。"
  - "Marker Visual Contract: 44px button + aria-label + data-marker-visual=\"star-footprint\" 作为 marker 稳定契约。"
requirements-completed: [MAP-01, MAP-02]
duration: 13 min
completed: 2026-05-13
---

# Phase 44 Plan 02: 世界足迹地图视觉恢复 Summary

**语义化 v8 角色资产、Leaflet 世界足迹舞台和 `/map` 专属 sidebar 视觉模式已经对齐到同一套高保视觉语言。**

## Performance

- **Duration:** 13 min
- **Started:** 2026-05-13T08:31:00Z
- **Completed:** 2026-05-13T08:43:54Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- 按计划源文件把 Phase 44 P0 角色图与 pin 资源同步到 `apps/web/src/assets/v8/...` 语义路径，产品代码继续避免直接引用中文切图目录。
- 维持现有 Leaflet 识别链路前提下，为 `LeafletMapStage.vue` 增加 `world-footprints-stage` 视觉容器，并让 `SeedMarkerLayer.vue` 使用星形足迹 marker 视觉与 44px 可访问点击目标。
- 为 `ShellSidebar.vue` 增加 `/map` route 专属 `world-footprints` 视觉模式与底部插画切换，同时用 focused spec 锁住三项导航 contract。

## Task Commits

1. **Task 1: 复制并命名 Phase 44 P0 资产** - `69faa3f` (`chore`)
2. **Task 2: 升级地图舞台和星形足迹 marker** - `783f242` (`feat`)
3. **Task 3: 仅在地图 route 恢复高保 sidebar 视觉** - `387b0a4` (`feat`)

## Files Created/Modified

- `apps/web/src/assets/v8/characters/map-popup-girl.webp` - 用 `切图 16@2x.png` 生成 popup 角色透明资产。
- `apps/web/src/assets/v8/characters/footprint-dialog-girl.webp` - 用 `切图 14@2x.png` 生成日期弹窗角色资产。
- `apps/web/src/assets/v8/characters/sidebar-camera-girl.webp` - 用 `切图 17@2x.png` 生成地图 sidebar 插画资产。
- `apps/web/src/assets/v8/pins/pin-star-orange.png` - 与设计切图重新同步橙色星形 pin。
- `apps/web/src/components/LeafletMapStage.vue` - 增加 `world-footprints-stage` hook 与粉紫/浅蓝世界足迹舞台视觉。
- `apps/web/src/components/SeedMarkerLayer.vue` - 用星形 pin 资产替换点状 marker，同时保留可访问 button contract。
- `apps/web/src/components/shell/ShellSidebar.vue` - 只在 `/map` 启用 world-footprints 视觉模式与地图专属底部插画。
- `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` - 断言 map route/非 map route 的 visual mode 与插画切换行为。

## Decisions Made

- `LeafletMapStage.vue` 只做容器和地图框体视觉增强，不碰 `MapContextPopup`、`resolveCanonicalPlace`、`confirmCanonicalPlace`、`useLeafletMap` 调用链。
- marker 视觉优先复用真实 pin 资产，保留 `data-marker-state`、`aria-label` 和 reduced-motion guard，避免把视觉恢复变成交互回归。
- sidebar 视觉恢复只作用于 `/map`，避免把 Phase 44 扩大成全局 shell 重设计。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `sips` 无法输出 WebP，改用本地 `cwebp` 转换角色资产**
- **Found during:** Task 1 (复制并命名 Phase 44 P0 资产)
- **Issue:** `sips -s format webp` 在当前环境返回 `Can't write format: org.webmproject.webp`，导致角色资产无法生成到目标路径。
- **Fix:** 改用已安装的 `cwebp` 将三张角色 PNG 转为目标 WebP 文件。
- **Files modified:** `apps/web/src/assets/v8/characters/map-popup-girl.webp`, `apps/web/src/assets/v8/characters/footprint-dialog-girl.webp`, `apps/web/src/assets/v8/characters/sidebar-camera-girl.webp`
- **Verification:** 资产存在检查通过，focused grep 验证产品代码无 `prd/v8.0/切图|raw-crops` 引用。
- **Committed in:** `69faa3f`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 仅替换本地图像转换工具，交付范围和产物契约保持不变。

## Issues Encountered

- `git commit` 初次执行受沙箱 `index.lock` 权限限制阻塞，改为按流程申请提交通行权限后继续完成原子提交。

## User Setup Required

None - no external service configuration required.

## Known Stubs

None.

## Threat Flags

None.

## Next Phase Readiness

- Phase 44 后续 popup/date dialog 计划可以直接复用本次落地的 `apps/web/src/assets/v8/characters/*` 与 map/sidebar 视觉 hook。
- 当前 focused coverage已锁住 map route sidebar 视觉模式和 marker contract，没有新增收藏、badge、progress 或 shell 信息架构变更。

## Self-Check: PASSED

- `44-02-SUMMARY.md` 已创建并存在于 Phase 44 目录。
- Task commits `69faa3f`、`783f242`、`387b0a4` 均可在 git 历史中找到。

---
*Phase: 44-world-footprints-map-footprint-date-dialog*
*Completed: 2026-05-13*
