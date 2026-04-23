# Phase 30: Travel Statistics & Completion Overview - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

用户可以基于自己的旅行历史看到基础旅行统计与国家/地区完成度，并正确区分总旅行次数与唯一地点完成度。

</domain>

<decisions>
## Implementation Decisions

### Statistics Display Location
- **D-01:** 统计展示在独立的 `/statistics` 页面，不集成到时间轴。
- **D-02:** 页面独立于 timeline，用户需要单独导航到达。

### Statistics Computation
- **D-03:** 统计数据由后端 `/stats` API 端点计算返回，不在前端 travelRecords 上直接计算。

### Visual Style
- **D-04:** 统计页面使用 Kawaii 风格卡片，与 timeline 页面视觉一致（cream/white gradient, rounded corners, pill badges）。

### Completion Rate (DEPRECATED)
- **D-05:** 国家/地区完成度百分比功能已取消。不再需要考虑 denominator 口径。

### Metrics Scope
- **D-06:** 基础统计指标包括：总旅行次数、已去过地点数。
- **D-07:** 同一地点多次去访：正确累加旅行次数，但不重复计算唯一地点数。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope & Product Boundary
- `.planning/ROADMAP.md` — `Phase 30: Travel Statistics & Completion Overview` 的目标、成功标准和 STAT-01、STAT-02、STAT-03 requirements
- `.planning/PROJECT.md` — v6.0 milestone 定位，「什么时候去过、去过几次、整体完成度如何」
- `.planning/STATE.md` — 当前处于 Phase 30 ready_for_planning

### Requirements
- `.planning/REQUIREMENTS.md` — `STAT-01`、`STAT-02`、`STAT-03` 的正式定义

### Prior Phase Context
- `.planning/phases/27-multi-visit-record-foundation/27-CONTEXT.md` — 多次旅行记录模型，日期字段格式（YYYY-MM-DD），开始/结束日期规范
- `.planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md` — overseas metadata 规范，displayName/typeLabel/parentLabel/subtitle
- `.planning/phases/29-timeline-page-and-account-entry/29-CONTEXT.md` — 时间轴页面结构、Kawaii 卡片样式参考

### Design System
- `apps/web/src/views/TimelinePageView.vue` — Kawaii 页面布局参考，cream/white gradient, rounded corners
- `apps/web/src/components/timeline/TimelineVisitCard.vue` — timeline 卡片组件样式参考

### Backend
- `apps/server/prisma/schema.prisma` — `UserTravelRecord` 模型结构，包含 startDate/endDate、displayName、parentLabel
- `packages/contracts/src/records.ts` — TravelRecord 接口定义

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/views/TimelinePageView.vue` — 完整 Kawaii 页面结构，包含 header、状态处理（restoring/anonymous/empty/populated）、grid 卡片布局
- `apps/web/src/stores/map-points.ts` — `travelRecords`、`tripsByPlaceId` 等 computed，Phase 30 统计可复用的数据结构
- `TimelineVisitCard` component — Kawaii 卡片的实际实现，包含 pill badges、floating shadow

### Established Patterns
- Kawaii pill-shaped badges：rounded-full、border-white/85、shadow-[var(--shadow-button)]
- Timeline card grid：`grid gap-4 md:gap-5`
- 状态分流：isRestoring / shouldShowAnonymousState / shouldShowEmptyState / shouldShowTimeline
- Phase 29 的「时间轴」入口按钮使用 pill 形状，与「退出登录」按钮视觉协调

### Integration Points
- 新页面路由需要接入 `apps/web/src/router/` 体系
- 后端需要新增 `/stats` 端点，可能需要新增 module
- 统计数据来自 `travelRecords` 集合，按 placeId 去重计算唯一地点

</codebase_context>

<specifics>
## Specific Ideas

- 独立 `/statistics` 页面，保持与 `/timeline` 页面不同的导航入口
- 统计页面风格与 timeline 一致，Kawaii cards
- 后端 `/stats` API 计算并返回统计数据
- 取消完成度百分比功能，简化统计范围

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 30-travel-statistics-and-completion-overview*
*Context gathered: 2026-04-23*
