# Phase 29: Timeline Page & Account Entry - Research

**Researched:** 2026-04-23
**Domain:** standalone timeline route / auth menu entry / timeline normalization
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### 用户名面板时间轴入口
- **D-01:** 用户名面板中增加「时间轴」入口按钮，带小图标。
- **D-02:** 入口按钮使用 pill 形状样式，与「退出登录」按钮视觉协调。

### 页面路由与框架
- **D-03:** 时间轴为独立页面，不是地图内嵌模块。
- **D-04:** 用户点击面板入口后跳转到独立时间轴页面（同一 tab 内路由切换）。

### 列表排序
- **D-05:** 时间轴列表按「最早优先」排序，最早旅行记录排在最前面。

### 记录卡片内容
- **D-06:** 每条旅行记录卡片包含：地点名称、旅行日期、国家/地区、去访次数标记。

### 同一地点多次去访展示
- **D-07:** 同一地点的多次去访在时间轴中拆分展示，每条旅行作为独立条目，日期不同。
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRIP-04 | 已登录用户可以从点击用户名后展开的面板进入独立的旅行时间轴页面。 | 入口应落在 `apps/web/src/components/auth/AuthTopbarControl.vue` 的已登录菜单内；当前这里只有用户名、邮箱和退出登录按钮，没有其他导航入口。 |
| TRIP-05 | 用户可以在时间轴页面按时间顺序查看自己的旅行记录。 | 时间轴必须基于 `useMapPointsStore().travelRecords` 逐条渲染，而不能使用 `displayPoints`，因为后者会按 `placeId` 去重，只保留某地点最近一条记录。 |
</phase_requirements>

## Summary

当前 web 端还是单视图应用。`apps/web/src/main.ts` 只挂载 `App.vue` + Pinia，`apps/web/package.json` 里也还没有 `vue-router`。`apps/web/src/App.vue` 直接把固定顶栏、notice 和 `LeafletMapStage` 组合在一个根壳里，这意味着 Phase 29 想做“独立页面”，不能只在地图舞台里再塞一个模块，而是必须先补一个明确的路由层。

用户名下拉菜单已经是现成的入口承载点。`apps/web/src/components/auth/AuthTopbarControl.vue` 已经负责已登录态菜单开关、点击外部关闭、`Escape` 关闭和退出登录按钮，因此“时间轴”按钮最小改动的方案就是插在同一菜单里，并复用它现有的 pill/button 视觉体系和关闭菜单行为。

时间轴数据不需要新后端接口。`packages/contracts/src/records.ts` 里的 `TravelRecord` 已经是一条旅行一条记录，带 `startDate`、`endDate`、`createdAt` 和完整 metadata；`apps/web/src/stores/map-points.ts` 里也已经把全部记录保存在 `travelRecords`，并用 `tripsByPlaceId` 做 place 级聚合。这意味着时间轴页面应该直接消费“逐条 travel record”，同时另外派生“同地点第几次 / 共几次”的展示信息。

排序规则有一个必须在规划时锁死的上下文漂移：`29-CONTEXT.md` 的 **D-05** 写的是“最早优先”，但 `<specifics>` 里写成了“最新旅行优先”。Phase 29 的计划必须以 locked decision 和 ROADMAP success criteria 为准，采用“最早优先”的升序时间轴。否则执行时很容易因为具体描述冲突而把顺序做反。

未知日期记录是另一个高风险点。Phase 27 已经明确“旧记录日期未知不能伪装成真实旅行日期”，`apps/web/src/components/LeafletMapStage.vue` 现有“最近一次旅行”逻辑也只让有日期的记录参与时间排序。因此时间轴不能把 `createdAt` 当成旅行日期去展示；更稳妥的做法是：有日期的记录按 `endDate ?? startDate` 升序排序，未知日期记录统一放到已知日期记录之后，再用 `createdAt` 和 `id` 仅做稳定性 tie-break。

路由方案上，建议使用 `vue-router`，但优先 `createWebHashHistory()`。仓库里目前只看到了 Vite dev server 配置，没有静态托管回退规则或服务端 rewrite 证据。如果直接用 `createWebHistory()`，独立页面很可能在硬刷新时撞到 404 风险；`hash` 路由则能在不改部署层的前提下满足“同一 tab 内独立页面切换”的产品目标。

Phase 30 还要交付统计与完成度页面，因此 Phase 29 如果已经要引入独立页面导航，继续手写一个 ad-hoc history store 反而会把后续页面扩展成本留到下一阶段。更标准、更可复用的路线是：Phase 29 正式引入 router，把根壳改成“固定顶栏 + `RouterView` + 两个 page view（地图页 / 时间轴页）”。

## Project Constraints

- 与用户沟通、文案和计划内容保持中文。
- 优先小改动，不推翻现有 `App.vue` 顶栏、notice、会话恢复与 Kawaii 视觉体系。
- Web 侧继续使用 Vue 3 `<script setup>` + Pinia + Vitest，不在本阶段顺带引入新的状态管理模式。
- 时间轴页只做“浏览历史”，不扩展编辑、单条删除或统计逻辑；这些仍留给后续 phase。

## Standard Stack

| Asset | Current State | Planning Guidance |
|-------|---------------|-------------------|
| Vue 3 | `apps/web/package.json` 里为 `vue@3.5.32` | 保持现状；时间轴页继续走 Composition API。 |
| Pinia | 已作为全局 store 层使用 | 不新增第二套 timeline store；优先在 `map-points` 暴露 selector。 |
| Vitest + happy-dom | `apps/web/vitest.config.ts` 已就绪 | 继续用组件测试 + store/service 测试锁定时间轴行为。 |
| Router | 当前缺失 | 新增 `vue-router@^4`，优先 `createWebHashHistory()`。 |

## Architecture Patterns

### Pattern 1: Persistent App Shell + Routed Main Content

建议保留 `App.vue` 作为根壳，只把现有地图主舞台抽到 `MapHomeView.vue`，然后在 `App.vue` 中把主内容位替换成 `RouterView`。这样会话恢复、顶栏 control、notice、dialog 都还能停留在同一个根组件，不会因为切到 timeline route 就重复初始化。

### Pattern 2: Timeline Entries Must Derive from Raw Travel Records

`displayPoints` 会按 `placeId` 去重并只留一个地点摘要，这非常适合地图点亮态，但会丢失同地点多次旅行。时间轴应该新增一个纯函数或 selector，例如 `buildTimelineEntries(travelRecords)` / `timelineEntries`，要求：

- 每条 `TravelRecord` 都生成一条 timeline entry。
- 同一 `placeId` 的记录按时间顺序编号，派生 `visitOrdinal` 与 `visitCount`。
- 保留原始 `displayName`、`typeLabel`、`parentLabel`、`subtitle`，不要重新猜 metadata。

### Pattern 3: Unknown-Date Records Are Stable, Not Fake-Dated

推荐排序键：

1. `hasKnownDate = Boolean(startDate)`
2. 已知日期记录：`sortDate = endDate ?? startDate`
3. 未知日期记录：不生成展示日期，只在内部使用 `createdAt`、`id` 做稳定性 tie-break

这样既满足“按时间顺序浏览”，又不违反 Phase 27 的“未知不是推测”约束。

### Pattern 4: Auth Menu Action Should Navigate, Not Mutate Global UI State

“时间轴”入口更适合做真正路由跳转，而不是在全局 store 里再塞一个 `activeView = 'timeline'`。原因有三点：

- 产品明确要求独立页面。
- 路由天然支持返回地图、刷新保留位置和后续统计页扩展。
- `AuthTopbarControl.vue` 已经是菜单动作组件，加一个 `router.push('/timeline')` 的复杂度很低。

## Alternatives Considered

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| 手写 history / pathname store | 依赖最少 | 需要自己处理 `popstate`、404 风险、未来页面扩展和测试桩；会形成 repo 内自定义路由层 | 不推荐 |
| `vue-router` + `createWebHistory()` | URL 更干净 | 当前仓库没有部署回退配置证据，硬刷新风险不明 | 暂不选 |
| `vue-router` + `createWebHashHistory()` | 标准方案、改动集中、无需服务端 rewrite、可直接支持 Phase 30 | URL 带 `#`，不如 clean path 漂亮 | 推荐 |

## Likely Files to Touch

- `apps/web/package.json` — 新增 router 依赖
- `apps/web/src/main.ts` — 注册 router
- `apps/web/src/router/index.ts` — 新建路由定义
- `apps/web/src/App.vue` — 根壳改为 `RouterView`
- `apps/web/src/views/MapHomeView.vue` — 抽出现有地图页
- `apps/web/src/views/TimelinePageView.vue` — 新建独立时间轴页
- `apps/web/src/components/auth/AuthTopbarControl.vue` — 新增时间轴入口
- `apps/web/src/components/timeline/TimelineVisitCard.vue` — 新建时间轴卡片组件
- `apps/web/src/services/timeline.ts` 或 `apps/web/src/stores/map-points.ts` — 时间轴数据派生与排序
- `apps/web/src/App.spec.ts` / `apps/web/src/stores/map-points.spec.ts` / timeline 相关新 spec — 回归测试

## Common Pitfalls

### Pitfall 1: 用 `displayPoints` 做时间轴数据源

这会把同一地点多次去访压成一条，直接违背 D-07 和 TRIP-05。

### Pitfall 2: 把 `createdAt` 当成未知旅行日期展示

`createdAt` 只能用来稳定排序，不能拿去显示成旅行日期，否则会违背 Phase 27 的历史数据语义。

### Pitfall 3: 依据 `<specifics>` 把顺序做成“最新优先”

当前 phase context 自己就有冲突，执行 plan 时必须明确以 locked decision `D-05` 为真源。

### Pitfall 4: timeline route 仍然渲染地图舞台

如果时间轴页只是把 `LeafletMapStage` 上方/下方再插一段列表，它仍然不是“独立页面”，会让 success criteria 2 失败。

### Pitfall 5: 直接上 `createWebHistory()` 却不补部署回退

本仓库暂时没有看到相应配置，计划里不应把隐含部署改造偷偷塞进 Phase 29。

## Validation Architecture

**Test framework:** Vitest + happy-dom（沿用 `apps/web/vitest.config.ts`）

**Recommended quick run:**

```bash
pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts src/components/auth/AuthTopbarControl.spec.ts
```

**Recommended full run:**

```bash
pnpm --filter @trip-map/web test
pnpm --filter @trip-map/web typecheck
```

**Manual checks required:**

1. 已登录用户打开用户名菜单后能看到「时间轴」入口。
2. 点击入口后地址切到 `#/timeline`，且主内容区不再显示地图舞台。
3. 时间轴列表按最早优先展示，有日期记录在前，未知日期记录在后。
4. 同一地点多次去访被拆成多条卡片，而不是合并成一条。
