# Phase 29: Timeline Page & Account Entry - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

用户可以从点击用户名后展开的面板进入独立的旅行时间轴页面，并在该页面按时间顺序浏览自己的旅行历史记录。

</domain>

<decisions>
## Implementation Decisions

### 用户名面板时间轴入口
- **D-01:** 用户名面板中增加「时间轴」入口按钮，带小图标。
- **D-02:** 入口按钮使用 pill 形状样式，与「退出登录」按钮视觉协调。

### 页面路由与框架
- **D-03:** 时间轴为独立页面，不是地图内嵌模块。
- **D-04:** 用户点击面板入口后跳转到独立时间轴页面（同一tab内路由切换）。

### 列表排序
- **D-05:** 时间轴列表按「最早优先」排序，最早旅行记录排在最前面。

### 记录卡片内容
- **D-06:** 每条旅行记录卡片包含：地点名称、旅行日期、国家/地区、去访次数标记。

### 同一地点多次去访展示
- **D-07:** 同一地点的多次去访在时间轴中拆分展示，每条旅行作为独立条目，日期不同。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope & Product Boundary
- `.planning/ROADMAP.md` — `Phase 29: Timeline Page & Account Entry` 的目标、成功标准和 TRIP-04、TRIP-05 requirements
- `.planning/PROJECT.md` — v6.0 milestone 定位，「同一地点去过几次、分别什么时候去过」旅行历史模型
- `.planning/STATE.md` — 当前处于 Phase 29 ready_for_planning

### Requirements
- `.planning/REQUIREMENTS.md` — `TRIP-04`、`TRIP-05` 的正式定义

### Prior Phase Context
- `.planning/phases/27-multi-visit-record-foundation/27-CONTEXT.md` — 多次旅行记录模型，日期字段格式（YYYY-MM-DD），开始/结束日期规范
- `.planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md` — overseas metadata 规范，displayName/typeLabel/parentLabel/subtitle

### Design System
- `apps/web/src/components/auth/AuthTopbarControl.vue` — 现有用户名面板样式与结构
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — 已有记录卡片参考

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/auth/AuthTopbarControl.vue` — 现有用户名下拉面板，可在此基础上增加时间轴入口按钮
- `apps/web/src/stores/map-points.ts` — 旅行记录数据源，时间轴页面需要从此获取用户旅行记录
- `apps/web/src/stores/auth-session.ts` — 当前用户信息获取

### Established Patterns
- Kawaii pill-shaped 按钮：bg-white/86、rounded-full、shadow-[var(--shadow-button)]
- 多次旅行记录已支持：Phase 27 数据模型已建立多条记录结构
- overseas metadata 规范：Phase 28 的 displayName/typeLabel/parentLabel/subtitle

### Integration Points
- 时间轴入口需要在 `AuthTopbarControl.vue` 面板内增加按钮
- 页面路由需要接入现有前端路由体系
- 数据来自 `map-points.ts` 的 `travelRecords` 集合

</codebase_context>

<specifics>
## Specific Ideas

- 时间轴入口按钮带小图标，pill 形状，与「退出登录」按钮风格一致
- 独立页面，同 tab 内路由切换
- 列表按最新旅行优先排序
- 每条记录显示：地点名、日期、国家/地区、该地点去访次数
- 同一地点多次去访拆分为独立条目展示

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 29-timeline-page-and-account-entry*
*Context gathered: 2026-04-22*
