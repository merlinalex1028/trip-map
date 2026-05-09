# Project Research Summary — v8.0

**Project:** 旅行世界地图  
**Milestone:** v8.0 Yume Kawaii 视觉重构与登录地图体验  
**Researched:** 2026-05-09  
**Confidence:** MEDIUM-HIGH

## Executive Summary

v8.0 不是单纯换皮，而是一次“入口、导航、地图记录主链路、时间线表达、统计表达”的整体产品化升级。新增 `8.0/落地页.png` 明确了未登录首屏应先用沉浸式旅行插画和 CTA 建立价值，再引导登录进入地图；登录后应用应切换为左侧导航的 Yume Kawaii 旅行日记壳。

用户明确要求不要自己造轮子，因此研究结论调整为：**当前项目没有通用 UI 组件库，v8.0 应引入成熟第三方依赖承接基础控件、日期选择、图表和图标**。推荐首选 `Naive UI + echarts + vue-echarts + @iconify/vue`，以现有 Tailwind token 做 Yume Kawaii 皮肤；Element Plus 作为备选，优势是 DatePicker 能力稳、中文生态成熟，但默认视觉更偏后台系统。

最大风险有三类：第一，路由从 `/` 地图改为落地页会影响现有测试和用户路径；第二，地图“识别即可用”不能只靠 UI 放开，必须和 authoritative catalog / geometry / 后端 guard 对齐；第三，旅途回忆图表不能用静态假数据，必须从当前账号真实记录或扩展后的 stats contract 派生。

## Recommended Stack

首选：

```bash
pnpm --filter @trip-map/web add naive-ui echarts vue-echarts @iconify/vue
```

为什么：
- `naive-ui`：Vue 3 + TypeScript，组件完整，主题 overrides 易于和现有 token 对接，无需全局 CSS。
- `echarts + vue-echarts`：覆盖折线、环图、柱状、雷达等旅途回忆图表，支持主题化和按需注册。
- `@iconify/vue`：统一地图、日历、手账、图鉴、奖章等图标来源；建议固定图标本地注册，避免运行时公网依赖。

备选：

```bash
pnpm --filter @trip-map/web add element-plus @element-plus/icons-vue echarts vue-echarts @iconify/vue
pnpm --filter @trip-map/web add -D unplugin-vue-components unplugin-auto-import
```

如果 UI 库 DatePicker 无法满足高保日期弹窗，再补：

```bash
pnpm --filter @trip-map/web add @vuepic/vue-datepicker
```

## Key Feature Findings

### Landing

未登录 `/` 应显示落地页，而不是地图。CTA：
- “开始记录旅途”打开注册优先的 auth dialog。
- “立即登录”打开登录。
- “探索世界地图”在未登录状态也不直接进入地图，应引导登录。
- authenticated 用户访问 `/` 自动进入 `/map`。

### Authenticated App Shell

登录后主应用应使用侧边导航：
- 世界足迹
- 旅途手账
- 旅途回忆
- 设置可保留为静态/未来入口

不显示：
- 我的收藏
- 收藏相关按钮或状态

### Map

地图核心 Leaflet 链路保留。popup 改为：
- 地点真实信息
- 类型标签和地区信息
- “留下足迹” CTA
- 已保存地点展示历史记录和“再留一次足迹”
- 日期选择迁移到独立 modal

### Footprint Date Dialog

独立弹窗需要 snapshot 当前地点 payload，提交时不再依赖实时 active point，避免地图点击切换导致错存。输出仍是 `{ startDate, endDate }`。

### Timeline

“旅途手账”使用现有 `timelineEntries`，视觉升级为发光竖线、节点、卡片和缩略图。不提供“添加新旅行”入口，不做收藏。

### Statistics

“旅途回忆”应从三张 stat card 升级为 dashboard。可派生：
- 月度/年度趋势：从 `travelRecords.startDate/endDate/createdAt`
- 国家分布：从 `parentLabel`
- 热门地点排行：按 `placeId` 聚合
- 累计天数：只对有日期记录计算

如要求 server-authoritative，需要扩展 `TravelStatsResponse` 和 `RecordsRepository.getTravelStats`。

## Architecture Implications

建议 phase 顺序：

1. **Dependency + UI Provider**：安装并接入 UI/图表/图标库，建立 Kawaii theme overrides。
2. **Landing + AuthenticatedShell**：新增 landing，迁移地图到 `/map`，统一登录门禁。
3. **Map Popup + Date Dialog**：把内联 TripDateForm 抽成独立日期弹窗，完成“留下足迹”主链路。
4. **Coverage Extension**：分析并扩展当前可识别但不可用地点，优先补 authoritative catalog/geometry。
5. **Timeline Redesign**：旅途手账视觉升级，排除新增入口和收藏。
6. **Statistics Dashboard**：旅途回忆图表化，必要时扩展 stats contract。
7. **Visual QA**：桌面/移动截图、地图/图表非空、弹窗层级、动效降级。

## Critical Decisions for Requirements

- UI 库推荐 Naive UI；如果你更偏向成熟中文生态，可换 Element Plus。
- 图表不要手写，使用 ECharts。
- 日期选择优先用所选 UI 库内置 DatePicker；复杂度不够再引入 `@vuepic/vue-datepicker`。
- 旅途回忆图表不能展示假数据。
- 不实现收藏和手账新增入口。
- 不通过前端绕过后端 authoritative guard 来“强行可用”。

## Confidence

| Area | Confidence | Notes |
|---|---|---|
| Dependency recommendation | MEDIUM-HIGH | 已基于当前 package 与官方资料判断；执行前仍需安装验证 |
| Landing/Auth architecture | HIGH | 与现有 auth store/router 模式一致 |
| Map popup/date dialog | HIGH | 现有 `TripDateForm` 和 `illuminate` 可复用 |
| Coverage extension | MEDIUM | 需要具体统计 unsupported/canonical gaps 后才能细化 |
| Statistics dashboard | MEDIUM-HIGH | 前端派生可落地；server-authoritative 需新增 contract |

## Sources

- `8.0/落地页.png`、`8.0/世界足迹.png`、`8.0/旅途回忆.png`、`8.0/旅途手帐.png`、`8.0/留下足迹.png`
- `apps/web/package.json`
- `apps/web/src/router/index.ts`
- `apps/web/src/App.vue`
- `apps/web/src/components/LeafletMapStage.vue`
- `apps/web/src/components/map-popup/PointSummaryCard.vue`
- `apps/web/src/components/map-popup/TripDateForm.vue`
- `apps/web/src/views/TimelinePageView.vue`
- `apps/web/src/views/StatisticsPageView.vue`
- `packages/contracts/src/stats.ts`
- `apps/server/src/modules/records/records.repository.ts`
- Naive UI npm / README
- Element Plus DatePicker and Quick Start official docs
- Apache ECharts official handbook and features docs
- vue-echarts npm / README
- Vue Datepicker official docs
- Iconify Vue official docs
