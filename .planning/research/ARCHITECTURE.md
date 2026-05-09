# Architecture Research — v8.0 Yume Kawaii 视觉重构与登录地图体验

**研究日期:** 2026-05-09  
**目标:** 在不破坏现有旅行记录/地图/账号基座的前提下，引入成熟 UI/图表/图标依赖，完成高保设计图落地。

## 当前架构基线

现有前端入口：

```text
App.vue
  ├─ fixed topbar + AuthTopbarControl
  ├─ RouterView
  ├─ AuthDialog
  └─ LocalImportDecisionDialog

routes:
  /           -> MapHomeView
  /timeline   -> TimelinePageView (requiresAuth)
  /statistics -> StatisticsPageView (requiresAuth)
```

现有地图主链路：

```text
Leaflet click
  -> resolveCanonicalPlace
  -> summarySurfaceState
  -> MapContextPopup
  -> PointSummaryCard
  -> TripDateForm (inline)
  -> mapPointsStore.illuminate
  -> POST /records
```

v8.0 要改为：

```text
Leaflet click
  -> resolveCanonicalPlace
  -> summarySurfaceState
  -> MapContextPopup
  -> PointSummaryCard (地点信息 + 留下足迹 CTA)
  -> FootprintDateDialog (modal)
  -> mapPointsStore.illuminate
  -> POST /records
```

## 推荐组件边界

### 应用壳

```text
App.vue
  ├─ AuthDialog
  ├─ LocalImportDecisionDialog
  └─ RouterView

LandingPageView.vue
  ├─ LandingHero.vue
  ├─ LandingFeatureCards.vue
  ├─ LandingMemoryStrip.vue
  └─ LandingAuthCta.vue

AuthenticatedShell.vue
  ├─ KawaiiSidebar.vue
  ├─ ShellNotice.vue
  └─ RouterView
```

职责：
- `App.vue` 只负责 session restore、全局 auth dialog、notice timer、focus refresh。
- `LandingPageView` 只给 anonymous/restoring 用户看，不挂载 Leaflet。
- `AuthenticatedShell` 只包裹需要登录的 app routes。
- `KawaiiSidebar` 承接地图、旅途手账、旅途回忆导航，不包含业务数据 mutation。

### 地图和日期弹窗

```text
MapHomeView.vue
  ├─ LeafletMapStage.vue
  ├─ MapTravelOverview.vue
  └─ AuthRestoreOverlay.vue

LeafletMapStage.vue
  ├─ MapContextPopup.vue
  └─ emits open-footprint-date-dialog(payload)

FootprintDateDialog.vue
  ├─ UI library Modal/Dialog
  ├─ UI library DatePicker
  └─ quick date buttons
```

关键改动：
- `PointSummaryCard` 不再持有 `isFormExpanded`，不再直接渲染 `TripDateForm`。
- `LeafletMapStage` 或上层 `MapHomeView` 持有 `pendingFootprintPlace`，打开独立日期弹窗。
- 日期弹窗提交后仍调用 `mapPointsStore.illuminate`，保持数据层不分叉。

### 旅途手账

```text
TimelinePageView.vue
  ├─ TimelineHero.vue
  ├─ TimelineYearFilter.vue
  └─ KawaiiTimelineList.vue
       └─ TimelineVisitCard.vue
```

约束：
- 不提供“添加新旅行”按钮。
- 右侧收藏按钮不实现，可从设计中移除或替换为纯装饰/空白区域。
- 图片缩略图由 deterministic placeholder service 生成，不暗示上传。

### 旅途回忆

```text
StatisticsPageView.vue
  ├─ MemoryDashboardHeader.vue
  ├─ MemoryMetricGrid.vue
  ├─ TripTrendChart.vue
  ├─ CountryDistributionChart.vue
  ├─ AnnualTrendChart.vue
  ├─ TravelStyleRadarChart.vue
  ├─ PopularPlacesRanking.vue
  └─ MemoryImageStrip.vue
```

数据来源：
- 后端 stats：基础总数真源。
- 前端 `travelRecords`：可派生月度趋势、年度趋势、国家分布、热门地点排行、缩略图 seeds。
- 如果要避免前端/后端口径分叉，应扩展 `TravelStatsResponse`。

## 路由方案

建议路线：

```text
/              -> LandingPageView (anonymous) 或 redirect /map (authenticated)
/map           -> AuthenticatedShell + MapHomeView
/timeline      -> AuthenticatedShell + TimelinePageView
/statistics    -> AuthenticatedShell + StatisticsPageView
```

守卫规则：
- `requiresAuth` route：restoring 时等待 `restoreSession()`；anonymous 时跳 `/` 并打开/提示登录。
- `/`：authenticated 时跳 `/map`；anonymous 时显示落地页。
- 未知 route：根据 auth 状态跳 `/map` 或 `/`。

兼容策略：
- 旧 `/` 地图入口迁移到 `/map`，避免“落地页和地图都在 `/`”冲突。
- 登录成功后，如果用户是从 landing CTA 触发，跳转 `/map`。

## UI 依赖接入点

如果选 Naive UI：

```text
main.ts
  app.use(createPinia())
  app.use(router)
  // 可局部导入，也可在 AuthenticatedShell 内用 NConfigProvider 包裹

components/ui/
  KawaiiUiProvider.vue   // NConfigProvider + themeOverrides
```

使用原则：
- 基础控件使用 UI 库：Modal、DatePicker、Menu、Button、Skeleton、Empty、Tabs。
- 页面结构、卡片视觉、插画背景、地图 popup 仍由本项目组件和 Tailwind/CSS 控制。
- UI 库 theme overrides 映射现有 `--color-accent`、`--radius-bubble`、`--shadow-float` 等 token。

## 统计数据契约扩展选项

### 选项 A：前端派生图表数据

优点：
- 不改后端 contract，最快落地。
- 现有 `travelRecords` 已包含地点、国家、日期、tags、notes。

缺点：
- 统计页有一部分 server-authoritative（总数），一部分 client-derived（趋势/排行），需要测试保证口径一致。

适合 v8.0 MVP。

### 选项 B：扩展 `/records/stats`

新增：

```ts
interface TravelStatsResponse {
  totalTrips: number
  uniquePlaces: number
  uniqueCities: number
  visitedCountries: number
  totalSupportedCountries: number
  knownTripDays: number
  monthlyTrend: Array<{ month: string; trips: number }>
  yearlyTrend: Array<{ year: string; trips: number }>
  countryDistribution: Array<{ country: string; trips: number; percentage: number }>
  popularPlaces: Array<{ placeId: string; displayName: string; parentLabel: string; trips: number }>
}
```

优点：
- 统计口径稳定，页面更轻。

缺点：
- 需要 contracts/server/web 全链路改造和更多测试。

推荐：
- v8.0 如果 roadmap 容量允许，采用选项 B；否则先 A，但在 requirements 中明确“图表从当前账号记录派生，保持与基础 stats 一致”。

## 地图覆盖扩展架构

当前不可用原因主要来自：
- `isActivePointIlluminatable` 要求 `placeId/placeKind/datasetVersion/boundaryId` 全部存在。
- `RecordsService.assertAuthoritativeOverseasRecord` 对 overseas payload 要求 metadata 完全匹配 authoritative catalog。
- `OUTSIDE_SUPPORTED_DATA` fallback 只有文本身份，没有 canonical placeId/boundaryId，无法保存。

可落地方案：

1. **优先扩展 authoritative catalog 和 geometry manifest**：让更多已识别 canonical 地点拥有 boundaryId。
2. **对“识别但边界缺失”的地点设计 text-only travel record？** 不建议本轮直接做，因为会破坏地图高亮和现有数据契约，需要新 `boundarySupportState`/record semantics。
3. **将“可识别位置全部可用”定义为当前 authoritative resolve 能返回 canonical identity 的位置均可留下足迹**，并通过扩展 manifest/catalog 缩小 unsupported 面。

推荐路线：
- Phase 中单独处理 coverage：先统计当前 canonical resolve 能识别但 `boundaryId` 不可渲染/不可保存的类型，再决定是否补 geometry 或调整 create guard。
- 不在 UI 层绕过后端 authoritative guard。

## 测试与验证策略

必须覆盖：
- router：anonymous `/` 显示 landing；authenticated `/` 跳 `/map`；anonymous `/map` 跳 `/`。
- auth：landing CTA 打开 login/register，登录成功进入 `/map`。
- map popup：点击地点只显示地点信息和“留下足迹”；日期表单不再内嵌。
- date dialog：快捷日期、范围校验、提交、取消、关闭、pending 状态。
- statistics：图表容器存在且有稳定尺寸；数据由 stats/travelRecords 正确派生。
- visual：Playwright 桌面/移动截图检查不重叠、Leaflet canvas/tiles 非空、图表非空。

## Recommended Phase Order

1. 依赖和 UI Provider：安装并接入 UI/图表/图标库，建立主题桥。
2. Landing + AuthenticatedShell：先切路由和登录门禁。
3. Map popup + FootprintDateDialog：恢复核心记录创建主链路。
4. Coverage extension：让可识别地点尽量可留下足迹。
5. Timeline redesign：旅途手账视觉升级。
6. Statistics dashboard：旅途回忆图表化和数据派生/contract 扩展。
7. Visual QA：截图、响应式、动效降级、图表/地图非空验证。
