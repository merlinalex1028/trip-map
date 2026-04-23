---
phase: 29-timeline-page-and-account-entry
verified: 2026-04-23T04:40:25Z
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "使用真实已登录账号，从用户名菜单点击“时间轴”进入 #/timeline"
    expected: "菜单先关闭，URL 切到 #/timeline，共享顶栏保留，地图舞台消失，并出现独立时间轴页面"
    why_human: "这属于真实浏览器用户流与视觉集成验证，组件测试无法完全替代"
  - test: "准备含已知日期、未知日期、同地点多次去访的真实账号数据后浏览时间轴列表"
    expected: "已知日期记录按最早优先显示，未知日期稳定排在最后，同地点多次去访拆成多张卡片并显示“第 N 次 / 共 N 次”"
    why_human: "需要在真实数据和真实浏览器里确认最终排序、文本可读性和滚动浏览体验"
  - test: "在手机宽度和桌面宽度下分别查看用户名菜单与时间轴页"
    expected: "时间轴入口、返回地图按钮、卡片层级和 pill 样式都可用且无遮挡"
    why_human: "响应式视觉表现和交互细节不能通过静态代码检查或 happy-dom 充分验证"
---

# Phase 29：时间轴页面与账号入口验证报告

**阶段目标：** 用户可以从用户名面板进入一个独立的旅行时间轴页面，按时间顺序浏览自己的旅行历史。  
**验证时间：** 2026-04-23T04:40:25Z  
**状态：** `human_needed`  
**复验：** 否，首次验证

## 目标达成情况

### 可观察真相

| # | 真相 | 状态 | 证据 |
| --- | --- | --- | --- |
| 1 | 已登录用户名面板中存在清晰的“时间轴”入口，并带独立图标与 pill 按钮样式 | ✓ 已验证 | `AuthTopbarControl.vue` 在第 132-150 行渲染 `data-auth-menu-item="timeline"` 按钮和图标容器；匿名态仅显示登录按钮（第 79-87 行）。 |
| 2 | 点击菜单入口会先关闭菜单，再在同一 tab 内导航到独立时间轴页面 | ✓ 已验证 | `handleNavigateToTimeline()` 在 `AuthTopbarControl.vue` 第 36-39 行先 `closeMenu()` 再 `router.push('/timeline')`；`AuthTopbarControl.spec.ts` 第 71-84 行断言导航发生且菜单关闭。 |
| 3 | App 主壳由 Router 驱动，时间轴页面是独立 route，而不是地图主舞台里的内联模块 | ✓ 已验证 | `main.ts` 第 9 行安装 router；`router/index.ts` 第 6-24 行定义 `#/` 与 `#/timeline`；`App.vue` 第 143 行改为 `<RouterView />`；`MapHomeView.vue` 单独承接 `LeafletMapStage`；`App.spec.ts` 第 306-359 行验证 timeline route 不渲染 map stage。 |
| 4 | 时间轴数据直接从原始 `travelRecords` 派生，而不是复用 `displayPoints` 的地点去重结果 | ✓ 已验证 | `map-points.ts` 第 102-118 行保留 `displayPoints` 去重语义，第 129 行单独暴露 `timelineEntries = computed(() => buildTimelineEntries(travelRecords.value))`。 |
| 5 | 排序遵循“有日期优先、最早优先、未知日期后置”，`createdAt` 只做稳定 tie-break，不当作旅行日期展示 | ✓ 已验证 | `timeline.ts` 第 41-62 行先比较 `hasKnownDate`、`sortDate`、`startDate`，最后才比较 `createdAt` 和 `recordId`；`TimelineVisitCard.vue` 第 12-21 行仅展示 `startDate/endDate`，未知日期显示固定文案 `日期未知`；`timeline.spec.ts` 第 57-149 行覆盖最早优先、未知日期后置和 tie-break。 |
| 6 | 同一地点多次去访在 selector 层就被拆成多条 entry，并带 `visitOrdinal` / `visitCount` | ✓ 已验证 | `timeline.ts` 第 65-84 行逐条 record 生成 entry 并回填 `visitOrdinal`、`visitCount`；`map-points.spec.ts` 第 946-985 行验证同地点两次去访不会被压成一条。 |
| 7 | Timeline 页面会根据登录态与数据态展示 restoring / anonymous / empty / populated 四种状态，并在 populated 态逐条渲染旅行卡片 | ✓ 已验证 | `TimelinePageView.vue` 第 16-25 行定义四态判断，第 69-169 行分别渲染 restoring、anonymous、empty、populated；第 163-167 行对 `timelineEntries` 做一条 entry 一张卡片的 `v-for`。 |
| 8 | 回归测试已覆盖菜单入口、route 切换、排序、多次去访拆分和匿名 CTA | ✓ 已验证 | `AuthTopbarControl.spec.ts` 第 55-99 行覆盖入口显隐和导航；`TimelinePageView.spec.ts` 第 94-167 行覆盖匿名 CTA、空状态、多次去访与未知日期；`App.spec.ts` 第 306-359 行覆盖 map/timeline route 切换；`timeline.spec.ts` 第 33-190 行覆盖排序与 visit metadata。另运行 `pnpm --filter @trip-map/web test`，结果为 32 个测试文件 / 286 个测试全部通过。 |

**评分：** 8/8 个真相已验证

### 必需工件

| 工件 | 预期 | 状态 | 说明 |
| --- | --- | --- | --- |
| `apps/web/src/router/index.ts` | Hash router 与 map/timeline route 定义 | ✓ 已验证 | 存在、内容实质完整，并由 `main.ts` 安装。 |
| `apps/web/src/App.vue` | 持久化 app shell + `RouterView` | ✓ 已验证 | 共享顶栏、notice、auth dialog 仍在，主内容切换改由路由驱动。 |
| `apps/web/src/views/MapHomeView.vue` | 地图 route view，仅在 map route 渲染地图舞台 | ✓ 已验证 | 保留 `LeafletMapStage` 和 `AuthRestoreOverlay`。 |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | 已登录菜单内时间轴入口 | ✓ 已验证 | 入口、导航 handler、关闭菜单逻辑均存在。 |
| `apps/web/src/services/timeline.ts` | 时间轴归一化与排序 helper | ✓ 已验证 | 无占位实现，排序与 visit metadata 完整。 |
| `apps/web/src/stores/map-points.ts` | `timelineEntries` selector | ✓ 已验证 | 与 `displayPoints` 语义分离，导出可供页面消费。 |
| `apps/web/src/services/timeline.spec.ts` | 排序与 visit metadata 回归测试 | ✓ 已验证 | 覆盖 earliest-first、unknown-last、tie-break、visit 计数。 |
| `apps/web/src/views/TimelinePageView.vue` | 独立时间轴 route view | ✓ 已验证 | 直接消费 auth/map stores，不渲染 `LeafletMapStage`。 |
| `apps/web/src/components/timeline/TimelineVisitCard.vue` | 单条旅行卡片 UI | ✓ 已验证 | 渲染地点、日期、国家/地区与 visit 徽标。 |
| `apps/web/src/components/auth/AuthTopbarControl.spec.ts` | 菜单入口行为回归 | ✓ 已验证 | 在定向测试与全量测试中均执行通过。 |
| `apps/web/src/views/TimelinePageView.spec.ts` | 页面状态与逐条卡片回归 | ✓ 已验证 | 在定向测试与全量测试中均执行通过。 |
| `apps/web/src/App.spec.ts` | App 根壳 route 切换回归 | ✓ 已验证 | 验证 map/timeline 主内容切换与 topbar 保留。 |

### 关键连线验证

| From | To | Via | 状态 | 说明 |
| --- | --- | --- | --- | --- |
| `apps/web/src/main.ts` | `apps/web/src/router/index.ts` | bootstrap 安装 router | ✓ 已验证 | `main.ts` 第 9 行执行 `.use(router)`。 |
| `apps/web/src/router/index.ts` | `apps/web/src/views/TimelinePageView.vue` | `/timeline` route component | ✓ 已验证 | `router/index.ts` 第 14-18 行把 `/timeline` 指向 `TimelinePageView`。 |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | `apps/web/src/router/index.ts` | 菜单 CTA 导航 | ✓ 已验证 | `AuthTopbarControl.vue` 第 36-39 行调用 `router.push('/timeline')`。 |
| `apps/web/src/stores/map-points.ts` | `apps/web/src/services/timeline.ts` | store selector 委托 helper | ✓ 已验证 | `map-points.ts` 第 129 行调用 `buildTimelineEntries(travelRecords.value)`。 |
| `apps/web/src/services/timeline.ts` | `apps/web/src/services/timeline.spec.ts` | 排序回归测试 | ✓ 已验证 | `timeline.spec.ts` 第 57-149 行覆盖关键排序与 tie-break。 |
| `apps/web/src/views/TimelinePageView.vue` | `apps/web/src/stores/map-points.ts` | 页面消费 `timelineEntries` | ✓ 已验证 | `TimelinePageView.vue` 第 13-25、145-167 行直接读取并渲染 `timelineEntries`。 |
| `apps/web/src/views/TimelinePageView.vue` | `apps/web/src/components/timeline/TimelineVisitCard.vue` | 一条 entry 一张卡 | ✓ 已验证 | `TimelinePageView.vue` 第 163-167 行逐条传入 `entry`。 |
| `apps/web/src/components/auth/AuthTopbarControl.spec.ts` | `apps/web/src/components/auth/AuthTopbarControl.vue` | 菜单行为回归 | ✓ 已验证 | spec 第 5 行直接导入组件，第 71-84 行断言时间轴导航。 |
| `apps/web/src/views/TimelinePageView.spec.ts` | `apps/web/src/views/TimelinePageView.vue` | 页面状态回归 | ✓ 已验证 | spec 第 10 行直接导入页面，第 94-167 行断言状态分支与卡片内容。 |
| `apps/web/src/App.spec.ts` | `apps/web/src/router/index.ts` | route shell 回归 | ⚠️ 部分 | `App.spec.ts` 第 63-81 行在测试里复制了一份 memory router 路由表，而不是直接复用 `src/router/index.ts`；当前能证明壳层切换行为，但对运行时路由配置漂移的约束较弱。 |

### Level 4 数据流追踪

| 工件 | 数据变量 | 来源 | 是否产生真实数据 | 状态 |
| --- | --- | --- | --- | --- |
| `apps/web/src/views/TimelinePageView.vue` | `timelineEntries` | `useMapPointsStore().timelineEntries` → `buildTimelineEntries(travelRecords)` | 是 | ✓ 流动 |
| `apps/web/src/stores/map-points.ts` | `travelRecords` | `auth-session.ts` 在 `applyAuthenticatedSnapshot()` 第 114-137 行与 `refreshAuthenticatedSnapshot()` 第 210-237 行写入 bootstrap.records | 是 | ✓ 流动 |
| `apps/web/src/components/timeline/TimelineVisitCard.vue` | `entry` prop | `TimelinePageView.vue` 第 163-167 行 `v-for` 逐条传入 | 是 | ✓ 流动 |

### 行为抽检

| 行为 | 命令 | 结果 | 状态 |
| --- | --- | --- | --- |
| Phase 29 关键回归测试可执行 | `pnpm --filter @trip-map/web test -- src/App.spec.ts src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/services/timeline.spec.ts src/stores/map-points.spec.ts` | 5 个测试文件 / 80 个测试全部通过 | ✓ 通过 |
| web 包整体验证无联动回归 | `pnpm --filter @trip-map/web test` | 32 个测试文件 / 286 个测试全部通过 | ✓ 通过 |
| web 包类型检查通过 | `pnpm --filter @trip-map/web typecheck` | 退出码 0 | ✓ 通过 |

### 需求覆盖

| Requirement | 来源 Plan | 描述 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| `TRIP-04` | `29-01`、`29-03`、`29-04` | 已登录用户可以从点击用户名后展开的面板进入独立的旅行时间轴页面 | ✓ 满足 | 菜单入口与导航在 `AuthTopbarControl.vue` 第 36-39、132-150 行；独立 route 在 `router/index.ts` 第 14-18 行；`App.spec.ts` 第 306-359 行与 `AuthTopbarControl.spec.ts` 第 55-99 行提供回归覆盖。 |
| `TRIP-05` | `29-02`、`29-03`、`29-04` | 用户可以在时间轴页面按时间顺序查看自己的旅行记录 | ✓ 满足 | `timeline.ts` 第 37-85 行实现 earliest-first + unknown-last；`map-points.ts` 第 129 行暴露 `timelineEntries`；`TimelinePageView.vue` 第 145-167 行渲染逐条卡片；`TimelineVisitCard.vue` 第 12-22、47-71 行渲染日期与 visit 标记。 |

**Requirement ID 交叉检查：**  
计划 frontmatter 中声明的 requirement ID 为 `TRIP-04`、`TRIP-05`，二者都能在 `REQUIREMENTS.md` 中找到正式定义，且都被本阶段的实现与测试证据覆盖。`REQUIREMENTS.md` 未为 Phase 29 列出额外但未被任何 plan 认领的 orphaned requirement。

### 反模式扫描

| 文件 | 行 | 模式 | 严重级别 | 影响 |
| --- | --- | --- | --- | --- |
| `apps/web/src/App.spec.ts` | 63 | 测试内重复定义 memory router 路由表，而不是直接复用 `src/router/index.ts` | ⚠️ Warning | 如果运行时路由路径或命名未来发生漂移，而测试夹具未同步更新，route-shell 回归可能出现假阳性。 |

补充说明：对 phase 29 相关实现文件执行了 TODO/FIXME/placeholder/空实现扫描，未发现阻断目标达成的占位实现。扫描命中的 `null` 初始值均属于 Pinia/Vue 的正常状态初始化，不属于 stub。

### 需要人工验证

### 1. 已登录菜单跳转链路

**Test:** 使用真实已登录账号，点击顶栏用户名展开菜单，再点击“时间轴”。  
**Expected:** 菜单关闭，地址切到 `#/timeline`，共享顶栏保留，地图舞台消失，出现独立时间轴页面。  
**Why human:** 这是完整用户流和真实浏览器渲染验证，happy-dom 与 mock router 不能完全替代。

### 2. 真实旅行历史排序与多次去访呈现

**Test:** 用至少一条已知日期记录、一条未知日期记录、以及同地点两次去访的数据账号打开时间轴页面。  
**Expected:** 已知日期记录按最早优先排列；未知日期记录排在后面；同地点显示为多张卡片，并带“第 N 次 / 共 N 次”标记。  
**Why human:** 需要在真实数据与真实 UI 中确认顺序、文案可读性和滚动浏览体验。

### 3. 响应式与视觉一致性

**Test:** 分别在手机宽度和桌面宽度下检查用户名菜单、时间轴页头部、返回地图按钮和卡片列表。  
**Expected:** 入口、按钮、卡片与 pill 徽标都保持可点击、无遮挡、无布局挤压。  
**Why human:** 视觉表现与响应式细节无法通过源码扫描或组件单测充分验证。

### 结论

代码层面未发现阻断 Phase 29 目标达成的缺口：独立 `#/timeline` 路由、用户名菜单入口、基于 `travelRecords` 的时间轴数据派生、最早优先排序、未知日期后置、多次去访拆分，以及对应回归测试都已落地并通过自动验证。

当前状态之所以不是 `passed`，仅因为本阶段仍包含必须由真人完成的浏览器验收项：真实登录链路、真实历史数据排序可读性，以及移动端/桌面端视觉表现。除此之外，唯一需要关注的非阻断性风险是 `App.spec.ts` 复制了测试用路由表，后续若调整运行时路由，建议改为复用 `src/router/index.ts` 或抽出共享 route factory，以避免测试夹具与运行时配置漂移。

---

_Verified: 2026-04-23T04:40:25Z_  
_Verifier: Claude (gsd-verifier)_
