# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档
- ✅ **v2.0 城市主视角与可爱风格重构** — Phases 7-10，已于 2026-03-27 归档
- ✅ **v3.0 全栈化与行政区地图重构** — Phases 11-18，已于 2026-04-03 归档（[详情](milestones/v3.0-ROADMAP.md)）
- ✅ **v4.0 Kawaii UI 重构 & Tailwind 集成** — Phases 19-22，已于 2026-04-10 归档（[详情](milestones/v4.0-ROADMAP.md)）
- ✅ **v5.0 账号体系与云同步基础版** — Phases 23-26，已于 2026-04-17 归档（[详情](milestones/v5.0-ROADMAP.md)）
- ✅ **v6.0 旅行统计、时间轴与海外覆盖增强版** — Phases 27-35，已于 2026-04-28 归档（[详情](milestones/v6.0-ROADMAP.md)）
- ✅ **v7.0 旅行记录编辑与删除** — Phases 36-41，已于 2026-04-29 归档（[详情](milestones/v7.0-ROADMAP.md)）
- 🚧 **v8.0 Yume Kawaii 视觉重构与登录地图体验** — Phases 42-48，规划中

---

## Current Milestone: v8.0 Yume Kawaii 视觉重构与登录地图体验

**Goal:** 将现有旅行地图升级为登录后使用的梦かわいい风格完整应用，并补齐设计图中除收藏外的页面与交互能力。  
**Granularity:** coarse  
**Phase range:** 42-48  
**Requirements:** 48/48 mapped

## Phases

- [x] **Phase 42: UI Primitives 与 Yume Kawaii Theme Bridge** — 引入 shadcn-vue、ECharts/Iconify 等依赖，并建立可复用的 Soft Pastel Glassmorphism 组件与 token 基线 (completed 2026-05-11)
- [x] **Phase 43: Landing、登录门禁与应用壳** — 新增未登录落地页、全应用登录守卫、登录后左侧导航壳和全局文案替换 (completed 2026-05-12)
- [x] **Phase 44: 世界足迹地图与留下足迹日期弹窗** — 改造地图视觉、统一地点弹窗、独立日期选择弹窗和保存状态反馈 (completed 2026-05-13)
- [x] **Phase 45: 可用地点覆盖扩展** — 识别“可识别但不可留下足迹”的断点，并尽量补齐 authoritative 保存所需 metadata / geometry (completed 2026-05-18, UAT passed)
- [x] **Phase 46: 旅途手账重构** — 将时间轴升级为发光手账流，移除新增旅行入口和收藏相关入口 (completed 2026-05-20)
- [x] **Phase 47: 旅途回忆 Dashboard** — 将统计页升级为真实数据驱动的图表、排行、概览和视觉缩略图区 (completed 2026-05-26)
- [ ] **Phase 48: Visual QA、Accessibility 与回归验证** — 对桌面/移动、地图、图表、弹窗、动效和现有回归测试做收口验证

## Phase Details

### Phase 42: UI Primitives 与 Yume Kawaii Theme Bridge

**Goal:** `apps/web` 具备可复用的第三方 UI primitives、图表和图标基座，并把默认视觉统一成 v8 高保图需要的柔粉玻璃风格。  
**Depends on:** Nothing（v8.0 首个 phase）  
**Requirements:** DS-01, DS-02, DS-03, DS-04, DS-05

**Success Criteria**（用户可观察行为）:
1. 开发者可以在 `apps/web` 中稳定导入 shadcn-vue 本地组件，构建 Button、Card、Dialog、Popover、Calendar、Tabs、Sidebar、Dropdown Menu、Skeleton、Scroll Area 等控件。
2. 基础控件默认呈现 Yume Kawaii / Soft Pastel Glassmorphism 主题，而不是 shadcn 默认中性黑白灰。
3. 旅途回忆后续可使用 ECharts/vue-echarts 渲染折线、环图、柱状和雷达图。
4. 页面图标由统一方案提供，实际使用图标不依赖运行时公网拉取。

**Plans:** 5/5 plans complete

Plans:
- [x] 42-01-PLAN.md — Pin dependencies, configure `@` aliases, and generate the locked shadcn-vue primitive set.
- [x] 42-02-PLAN.md — Recalibrate v8 theme tokens and theme generated primitives with a primitive state matrix.
- [x] 42-03-PLAN.md — Add local semantic `KawaiiIcon` registry and wrapper.
- [x] 42-04-PLAN.md — Add ECharts module registration, Yume Kawaii chart theme, and `BaseChart`.
- [x] 42-05-PLAN.md — Wire the dev-only `/__ui` showcase route and full phase gate.

---

### Phase 43: Landing、登录门禁与应用壳

**Goal:** 未登录用户先看到落地页；登录或注册后进入 `/map`；地图、旅途手账、旅途回忆都通过统一应用壳访问并受登录保护。  
**Depends on:** Phase 42  
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, SHELL-01, SHELL-02, SHELL-03, SHELL-04

**Success Criteria**（用户可观察行为）:
1. 未登录用户访问 `/` 时看到 `8.0/落地页.png` 所表达的沉浸式落地页，已登录用户访问 `/` 时自动进入 `/map`。
2. 落地页的注册/登录入口复用现有账号体系，成功后进入地图并恢复同一账号云端记录。
3. 已登录应用显示左侧 Yume Kawaii 导航壳，提供世界足迹、旅途手账、旅途回忆入口，不显示收藏入口。
4. 移动端导航不会挤压地图主区域，匿名访问受保护页面会回到落地页。
5. 全局文案完成替换：`点亮` -> `留下足迹`，`旅行统计` -> `旅途回忆`，`时间轴` -> `旅途手账`。

**Plans:** 4/4 plans complete

Plans:
**Wave 1**
- [x] 43-01-PLAN.md — Copy semantic v8 assets and build the public landing view with real auth CTAs.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 43-02-PLAN.md — Replace route/auth semantics for `/`, `/map`, `/journal`, `/memories`, and post-auth `/map` navigation.
- [x] 43-03-PLAN.md — Add the authenticated left sidebar shell and remove old topbar route navigation.

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 43-04-PLAN.md — Migrate route-facing copy/hooks and run the Phase 43 focused/full verification gate.

---

### Phase 44: 世界足迹地图与留下足迹日期弹窗

**Goal:** 地图保持 Leaflet 核心识别链路，同时升级为世界足迹视觉；地点弹窗始终展示真实地点信息和“留下足迹”，日期选择进入独立弹窗。  
**Depends on:** Phase 43  
**Requirements:** MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, MAP-06, DATE-01, DATE-02, DATE-03, DATE-04, DATE-05, DATE-06

**Success Criteria**（用户可观察行为）:
1. 用户点击地图后，弹窗始终展示真实地点名称、类型标签、地区信息和固定“留下足迹”入口。
2. 已保存地点弹窗不展开过往旅行记录，也不使用“再留一次足迹”文案；新增记录仍从“留下足迹”进入。
3. 点击“留下足迹”后打开独立日期选择弹窗，支持快捷日期和其他日期选择。
4. 日期提交符合后端 `YYYY-MM-DD` 契约，并在打开弹窗时锁定当前地点 payload，避免切换地图地点后保存错位。
5. 未登录、不可用地点、保存中、保存失败和保存成功状态都有清晰反馈与可访问焦点管理。

**Plans:** 5/5 plans complete

Plans:
**Wave 0**
- [x] 44-01-PLAN.md — Lock Phase 44 popup, dialog, marker, sidebar, and snapshot regression contracts.

**Wave 1** *(blocked on Wave 0 completion)*
- [x] 44-02-PLAN.md — Prepare P0 assets and restore world-footprints map stage, marker, and map-route sidebar visuals.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 44-03-PLAN.md — Refactor the map popup into a unified factual place card with one `留下足迹` entry.
- [x] 44-04-PLAN.md — Build the standalone shadcn-vue footprint date Dialog and date payload contract.

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 44-05-PLAN.md — Wire snapshot-safe Dialog submission, store feedback, and the full Phase 44 verification gate.

---

### Phase 45: 可用地点覆盖扩展

**Goal:** 梳理并尽量补齐当前 server 能识别但前端不可保存的地点，让可识别地点更稳定地成为可留下足迹的地点。  
**Depends on:** Phase 44  
**Requirements:** COV-01, COV-02, COV-03, COV-04

**Success Criteria**（用户可观察行为）:
1. 开发者可以看到“已识别但不可留下足迹”的地点类别、数量和原因。
2. canonical resolve 能返回完整 canonical identity 的地点尽量具备保存所需的 boundaryId / geometry / metadata。
3. 仍不具备 authoritative 保存条件的地点不会出现可提交的假入口，界面会解释不可用原因。
4. 扩展后的地点在地图高亮、旅途手账、旅途回忆中的标题和归类一致。

**Plans:** 4/4 plans complete

Plans:
**Wave 0**
- [x] 45-01-PLAN.md — Build the server runtime breakpoint matrix and canonical resolve coverage assertions.
- [x] 45-02-PLAN.md — Add frontend footprint availability classification and popup friendly reason rendering.

**Wave 1** *(blocked on Wave 0 completion)*
- [x] 45-03-PLAN.md — Wire availability through the real map popup, date-dialog guard, and manifest highlight checks.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 45-04-PLAN.md — Close record API, bootstrap replay, journal, memories, and final Phase 45 verification gates.

---

### Phase 46: 旅途手账重构

**Goal:** `/timeline` 重命名并视觉升级为“旅途手账”，用发光竖线、星形节点和卡片流展示旅行记录。  
**Depends on:** Phase 45  
**Requirements:** JOURNAL-01, JOURNAL-02, JOURNAL-03, JOURNAL-04, JOURNAL-05, JOURNAL-06

**Success Criteria**（用户可观察行为）:
1. `/timeline` 以“旅途手账”形式展示用户真实旅行记录，卡片包含日期、地点、地区、备注/标签摘要和视觉缩略图/插画位。
2. 手账使用发光渐变竖线、星形节点和轻量动效，桌面与移动端均无文本截断或重叠。
3. 页面不提供“添加新旅行”入口，新增旅行仍必须从地图真实地点进入。
4. 页面不显示收藏按钮、收藏状态或“我的收藏”相关入口。
5. 空状态、登录恢复和错误状态符合 Yume Kawaii 视觉语言。

**Plans:** 4/4 plans complete

Plans:
**Wave 1**
- [x] 46-01-PLAN.md — Lock `/journal`, shell navigation, and forbidden add/favorite/collection absence contracts.
- [x] 46-02-PLAN.md — Add deterministic journal summary, location, tag, and decorative postcard helpers.

**Wave 2** *(blocked on Wave 1 helper completion)*
- [x] 46-03-PLAN.md — Refactor journal cards into reading-first postcard cards with quiet edit/delete management.

**Wave 3** *(blocked on Wave 1 contracts and Wave 2 cards)*
- [x] 46-04-PLAN.md — Build the glowing journal stream, Yume Kawaii states, and final Phase 46 verification gates.

---

### Phase 47: 旅途回忆 Dashboard

**Goal:** `/statistics` 重命名并视觉升级为“旅途回忆”，用真实账号旅行记录驱动概览、图表、排行和视觉缩略图区。  
**Depends on:** Phase 46  
**Requirements:** MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06, MEM-07

**Success Criteria**（用户可观察行为）:
1. 页面展示总旅行次数、去过地点、去过城市或行政区、去过国家/地区四个概览卡。
2. 页面展示月度趋势折线图、国家/地区分布环图、年度趋势柱状图和旅行风格雷达图。
3. 热门足迹排行采用视觉化排行布局，不回退为传统表格。
4. 回忆图片横滑/视觉缩略图区存在，但不提供用户上传照片能力。
5. 所有图表和排行由当前账号真实旅行记录或 server-authoritative stats 派生；无记录时展示空状态，不渲染静态假数据。

**Plans:** 4/4 plans complete

Plans:
**Wave 1**
- [x] 47-01-PLAN.md — Extend the account-scoped memories stats contract and aggregate semantics.

**Wave 2** *(blocked on Wave 1 contract completion)*
- [x] 47-02-PLAN.md — Build real aggregate chart option helpers and the four-panel memories chart grid.

**Wave 3** *(blocked on Wave 2 chart composition)*
- [x] 47-03-PLAN.md — Compose the four-card overview and chart grid into the protected `/memories` route states.

**Wave 4** *(blocked on populated route composition)*
- [x] 47-04-PLAN.md — Add visual Top 5 footprints, real-record postcards, and final memories web gates.

---

### Phase 48: Visual QA、Accessibility 与回归验证

**Goal:** 对 v8.0 所有新页面和关键交互做桌面/移动截图、可访问性、动效降级和现有功能回归验证。  
**Depends on:** Phase 47  
**Requirements:** QA-01, QA-02, QA-03, QA-04, QA-05

**Success Criteria**（用户可观察行为）:
1. 落地页、地图、旅途手账、旅途回忆、留下足迹弹窗在桌面和移动端截图中无明显重叠、截断或不可读文本。
2. Leaflet 地图、星形标记和 ECharts 图表在本地运行时非空渲染。
3. Dialog、Calendar、导航和登录入口支持键盘操作、焦点管理和可读 aria 标签。
4. `prefers-reduced-motion` 下漂浮、呼吸和 hover 动效会降级，核心操作不受影响。
5. 新增依赖和页面改造不会破坏现有 auth、records、timeline、statistics 回归测试。

**Plans:** 0 plans yet

---

## Coverage Map

| Requirement | Phase | Status |
|-------------|-------|--------|
| DS-01 | Phase 42 | Pending |
| DS-02 | Phase 42 | Pending |
| DS-03 | Phase 42 | Pending |
| DS-04 | Phase 42 | Pending |
| DS-05 | Phase 42 | Pending |
| AUTH-01 | Phase 43 | Complete |
| AUTH-02 | Phase 43 | Complete |
| AUTH-03 | Phase 43 | Complete |
| AUTH-04 | Phase 43 | Complete |
| AUTH-05 | Phase 43 | Complete |
| SHELL-01 | Phase 43 | Complete |
| SHELL-02 | Phase 43 | Complete |
| SHELL-03 | Phase 43 | Complete |
| SHELL-04 | Phase 43 | Complete |
| MAP-01 | Phase 44 | Pending |
| MAP-02 | Phase 44 | Pending |
| MAP-03 | Phase 44 | Pending |
| MAP-04 | Phase 44 | Pending |
| MAP-05 | Phase 44 | Pending |
| MAP-06 | Phase 44 | Pending |
| DATE-01 | Phase 44 | Pending |
| DATE-02 | Phase 44 | Pending |
| DATE-03 | Phase 44 | Pending |
| DATE-04 | Phase 44 | Pending |
| DATE-05 | Phase 44 | Pending |
| DATE-06 | Phase 44 | Pending |
| COV-01 | Phase 45 | Pending |
| COV-02 | Phase 45 | Pending |
| COV-03 | Phase 45 | Pending |
| COV-04 | Phase 45 | Pending |
| JOURNAL-01 | Phase 46 | Complete |
| JOURNAL-02 | Phase 46 | Complete |
| JOURNAL-03 | Phase 46 | Complete |
| JOURNAL-04 | Phase 46 | Complete |
| JOURNAL-05 | Phase 46 | Complete |
| JOURNAL-06 | Phase 46 | Complete |
| MEM-01 | Phase 47 | Complete |
| MEM-02 | Phase 47 | Complete |
| MEM-03 | Phase 47 | Complete |
| MEM-04 | Phase 47 | Complete |
| MEM-05 | Phase 47 | Complete |
| MEM-06 | Phase 47 | Complete |
| MEM-07 | Phase 47 | Complete |
| QA-01 | Phase 48 | Pending |
| QA-02 | Phase 48 | Pending |
| QA-03 | Phase 48 | Pending |
| QA-04 | Phase 48 | Pending |
| QA-05 | Phase 48 | Pending |

> 48/48 requirements mapped — 100% coverage ✓

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 42. UI Primitives 与 Yume Kawaii Theme Bridge | 5/5 | Complete   | 2026-05-11 |
| 43. Landing、登录门禁与应用壳 | 4/4 | Complete | 2026-05-12 |
| 44. 世界足迹地图与留下足迹日期弹窗 | 5/5 | Complete   | 2026-05-13 |
| 45. 可用地点覆盖扩展 | 4/4 | Complete    | 2026-05-18 |
| 46. 旅途手账重构 | 4/4 | Complete    | 2026-05-20 |
| 47. 旅途回忆 Dashboard | 4/4 | Complete    | 2026-05-26 |
| 48. Visual QA、Accessibility 与回归验证 | 0/0 | Not Started | — |

---

*Created: 2026-05-09*
*Last updated: 2026-05-12 — Phase 43 completed*
