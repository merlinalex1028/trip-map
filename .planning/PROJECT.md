# 旅行世界地图

## What This Is

一个面向个人使用的旅行世界地图应用，用户可以在世界地图上点击真实地理位置，由系统判断对应的真实地点，并创建、保存、编辑、删除和留下自己的旅行足迹。

`v7.0` 已完成：用户现在可以编辑已有旅行记录的日期、添加备注和标签，删除单条记录，并在旅途手账和地图入口均可操作。`v8.0` 已完成需求和路线图规划，准备进入 Yume Kawaii 视觉重构、登录落地页、全应用登录门禁、地图覆盖扩展和独立日期弹窗实现阶段。

## Core Value

用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## Current State

- **v7.0 已于 2026-04-29 归档**：6 phases（36-41），8 plans，23 tasks，13/13 requirements satisfied，milestone audit passed，396 测试通过
- **v6.0 已完成（Phase 27-35 全部交付）**：多次旅行记录数据基座、海外覆盖扩展、独立时间轴、基础统计与 authoritative metadata 刷新一致性、deep-link/refresh、文档同步、Nyquist 验证覆盖与测试固件对齐均已落地
- **v5.0 已于 2026-04-17 归档**：4 phases（23-26），22 plans，26 tasks，17/17 requirements satisfied，milestone audit passed
- **v4.0 已于 2026-04-10 归档**：4 phases（19-22），11 plans，12/12 requirements satisfied，canonical milestone audit passed
- **v3.0 已于 2026-04-03 交付**：8 phases（11-18），39 plans，29/29 requirements satisfied
- 用户现在可注册、登录、退出，并通过 `sid` cookie 会话恢复到同一账号
- 旅行记录已经绑定到账号，支持首次登录本地记录导入、cloud-wins 与切账号边界清理
- same-user 多设备点亮/取消点亮、foreground refresh 与 notice 分流已经闭环
- 8 国 overseas admin1 authoritative support catalog、persisted metadata replay 与 unsupported popup feedback 已经落地
- 代码库：`pnpm workspace + turbo` monorepo（`apps/web`、`apps/server`、`packages/contracts`）
- 后端：NestJS + Fastify + Prisma + PostgreSQL，canonical resolve / travel records CRUD 全链路
- 前端：Vue 3 + Leaflet + Tailwind v4 + Nunito，双图层 GeoJSON（CN + OVERSEAS），server-driven 点亮
- 几何交付：版本化静态 GeoJSON sharding（23MB → 1.75MB，92% 减少）

## Current Milestone: v8.0 Yume Kawaii 视觉重构与登录地图体验

**Goal:** 将现有旅行地图升级为登录后使用的梦かわいい风格完整应用，并补齐设计图中除收藏外的页面与交互能力。

**Target features:**
- 新增未登录落地页，用户点击登录后才进入地图；地图、旅途手账、旅途回忆等应用页面都需要登录
- 按 `8.0/` 设计图实现 Yume Kawaii / Soft Pastel Glassmorphism / Anime Travel Diary 风格，包括左侧导航、用户卡片、插画位与轻量漂浮动效
- 地图首页保留核心地图体验，升级为“世界足迹”视觉，弹窗始终展示真实地点信息和“留下足迹”
- 点击“留下足迹”后打开独立日期选择弹窗，支持日历与快捷日期选择
- 当前系统可识别的地图位置尽量全部扩展为可保存/可用，降低“识别但不可留下足迹”的断裂感
- `点亮` 文案替换为 `留下足迹`，`旅行统计` 替换为 `旅途回忆`，`时间轴` 替换为 `旅途手账`
- 旅途手账升级为发光竖线、节点、旅行卡片和视觉缩略图，不提供“添加新旅行”入口
- 旅途回忆升级为 dashboard，包含概览卡、趋势图、分布图、年度趋势、风格分析、热门足迹排行和回忆图片横滑

**Out of scope for v8.0:**
- 收藏功能，包括“我的收藏”、爱心/星标收藏按钮、收藏状态管理
- 用户上传旅行照片或富文本游记；本轮只实现设计图所需的视觉缩略图/插画位

## Requirements

### Active

- `DS-01`-`DS-05`: 引入 shadcn-vue / ECharts / 统一图标方案，并建立 Yume Kawaii theme bridge
- `AUTH-01`-`AUTH-05`: 新增落地页、登录/注册入口、全应用登录门禁和登录后 `/map` 入口
- `SHELL-01`-`SHELL-04`: 建立登录后应用壳、左侧导航、移动端导航适配和全局文案替换
- `MAP-01`-`MAP-06` + `DATE-01`-`DATE-06`: 升级世界足迹地图、统一地点弹窗和独立“留下足迹”日期弹窗
- `COV-01`-`COV-04`: 扩展当前可识别地点的可保存能力，并解释仍不可用的 authoritative 限制
- `JOURNAL-01`-`JOURNAL-06`: 将时间轴升级为旅途手账，不提供添加新旅行入口和收藏入口
- `MEM-01`-`MEM-07` + `QA-01`-`QA-05`: 将统计升级为旅途回忆 dashboard，并完成视觉、可访问性和回归验证

### Validated

- ✓ 用户可以注册、登录、退出，并拥有独立账号身份 — v5.0 / Phase 23
- ✓ 旅行记录与账号绑定，刷新或更换设备后仍能恢复到同一份账号记录 — v5.0 / Phase 23-25
- ✓ 首次登录本地导入、本地/云端二选一与切账号边界清理已经闭环 — v5.0 / Phase 24
- ✓ 优先海外国家/地区的 admin1 可识别/可点亮覆盖、持久化文本稳定回放与未支持地区可解释反馈已闭环 — v5.0 / Phase 26
- ✓ 用户点亮地点时可以选择旅行日期 — v6.0 / Phase 27
- ✓ 用户可以为同一地点保存多次旅行记录 — v6.0 / Phase 27
- ✓ 已保存的旅行日期与同地点多次去访记录在刷新、重开应用和跨设备后仍能稳定恢复 — v6.0 / Phase 27
- ✓ 用户可以在更广的优先海外国家/地区上稳定识别并记录旅行 — v6.0 / Phase 28
- ✓ 扩展后的海外记录在地图、时间轴和统计视图中保持一致的标题与归类 — v6.0 / Phase 28
- ✓ 已登录用户可以从点击用户名后展开的面板进入独立的旅行时间轴页面 — v6.0 / Phase 29
- ✓ 用户可以在时间轴页面按时间顺序查看自己的旅行记录，并区分同一地点的多次去访 — v6.0 / Phase 29
- ✓ 当同一地点存在多次旅行记录时，统计会正确区分"总旅行次数"和"唯一地点 / 完成度" — v6.0 / Phase 30-31
- ✓ `STAT-01`: 用户可以查看基础旅行统计 — v6.0 / Phase 30
- ✓ `STAT-02`: 用户可以查看国家/地区完成度 — v6.0 / Phase 30
- ✓ Tailwind CSS 已集成到 `apps/web` — v4.0
- ✓ 页面使用奶油白背景及主题 token — v4.0
- ✓ Nunito Variable 全局字体基线 — v4.0
- ✓ Kawaii/Tailwind 主路径迁移完成 — v4.0
- ✓ pill-shaped 按钮、floating-cloud 卡片、设计语言 formal verification — v4.0
- ✓ `EDIT-01`: 用户可以修改已有旅行记录的开始日期和结束日期 — v7.0
- ✓ `EDIT-02`: 用户可以为旅行记录添加或修改纯文本备注（最长 1000 字符）— v7.0
- ✓ `EDIT-03`: 用户可以为旅行记录添加或修改标签（最多 10 个，每个最长 20 字符）— v7.0
- ✓ `EDIT-04`: 编辑日期时自动检查同地点其他记录日期冲突并提示 — v7.0
- ✓ `DEL-01`: 用户可以删除单条旅行记录 — v7.0
- ✓ `DEL-02`: 删除前展示确认弹窗 — v7.0
- ✓ `DEL-03`: 删除最后一条记录时提示将取消点亮 — v7.0
- ✓ `SYNC-01`: 编辑后时间轴自动重排序 — v7.0
- ✓ `SYNC-02`: 删除后时间轴自动移除 — v7.0
- ✓ `SYNC-03`: 编辑/删除后统计自动刷新 — v7.0
- ✓ `SYNC-04`: 网络失败时乐观更新正确回滚 — v7.0

### Out of Scope

- 第三方 OAuth 登录与账号接入增强 — 本轮重点转向旅行记录表达与统计，不扩展登录体系
- 同步历史、最近同步时间与更完整的同步状态可见性 — 本轮不处理同步可观察性增强
- 分享、公开主页与协作能力 — 会引入权限与隐私模型，超出本轮单用户旅行表达范围
- 旅行照片上传、游记正文与富文本内容 — 当前只承载旅行时间、备注、标签、统计和视觉缩略图/插画位，不做内容社区化
- 单条旅行记录编辑与删除 — 已在 v7.0 实现，不再属于 Out of Scope
- 自动轨迹、GPS 采集或外部行程导入 — 偏离当前“手动点亮 + 主动记录”的产品主线
- Dark mode — 目前仍非优先项
- JS 动画库（framer-motion 等） — 当前 CSS transition 已满足主路径需要
- 全球城市级统一覆盖 — 范围过大，v6.0 先扩展优先海外国家/地区的 admin1 能力
- 收藏功能 — v8.0 明确不纳入，包括我的收藏、爱心/星标收藏按钮与收藏状态管理

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v6.0 先把旅行记录升级为"多次去访 + 旅行日期"模型 | 时间轴和统计都依赖记录从 place-level presence 升级为 trip-level history | ✓ Good — Validated in Phase 27 |
| 时间轴作为独立页面而不是地图内联模块 | 这是用户明确指定的交互路径，且更适合承载时间序列浏览 | ✓ Good — Validated in Phase 29 |
| 时间轴入口放在点击用户名后展开的面板内 | 复用现有账号入口心智，避免在地图主舞台额外引入高噪声导航 | ✓ Good — Validated in Phase 29 |
| 统计页保持 server-authoritative，并用 metadata-aware revision 触发重拉 | 避免在前端本地重算统计口径，同时保证 bootstrap / same-user sync 后不会出现统计滞后 | ✓ Good — Validated in Phase 31 |
| 单条旅行记录编辑 / 局部删除延后 | 本轮先闭环新增、展示和统计，控制模型迁移复杂度 | ✓ Resolved — 纳入 v7.0 |
| v7.0 编辑不含地点修改 | 关联地点不可变更，避免 placeId / boundaryId 级联更新复杂度 | ✓ Good — Validated in v7.0 |
| v7.0 无编辑历史/撤销 | 仅确认弹窗，不做 undo 栈，控制实现复杂度 | ✓ Good — Validated in v7.0 |
| PATCH 语义而非 PUT | 部分更新场景更灵活，place 字段不可编辑 | ✓ Good — Implemented in Phase 36 |
| 删除端点使用 /records/record/:id | 避免与现有 /records/:placeId 冲突 | ✓ Good — Implemented in Phase 36 |
| store 方法名 deleteSingleRecord 与 API 同名 | import 时重命名 API 为 deleteSingleRecordApi | ✓ Good — Implemented in Phase 37 |
| 使用 PostgreSQL 数组存储标签 | 场景简单，无需独立 Tag 模型/表 | ✓ Good — Implemented in Phase 36 |
| v8.0 不做收藏功能 | 用户确认除收藏外纳入设计图功能，收藏状态会引入新数据模型与页面分支 | — Pending |
| 旅途手账不提供“添加新旅行”入口 | 用户确认旅行创建仍从地图真实地点进入，避免绕过地图识别主线 | — Pending |
| 地图弹窗始终使用统一地点信息 UI 与“留下足迹”入口 | 用户确认已保存地点 popup 不显示过往记录，不使用“再留一次足迹”分支 | — Pending |

## Archived Milestone Snapshots

<details>
<summary>v5.0 账号体系与云同步基础版 (Phases 23-26)</summary>

- 邮箱密码账号、`sid` 会话恢复与 current-user records ownership 已正式交付
- 首登本地导入、cloud-wins 与 logout / switch-account / unauthorized 边界清理已闭环
- same-user 多设备同步、foreground refresh 与 overlap 竞态已收口
- 8 国 overseas admin1 authoritative support catalog、persisted metadata replay 与 unsupported popup feedback 已落地
- 17/17 requirements satisfied，v5.0 milestone audit `passed`

</details>

<details>
<summary>v4.0 Kawaii UI 重构 & Tailwind 集成 (Phases 19-22)</summary>

- Tailwind v4、Vite 插件顺序、单一 CSS 入口与 Nunito Variable 已在 `apps/web` 稳定落地
- App shell、MapContextPopup、PointSummaryCard 完成 Kawaii/Tailwind 主路径迁移
- Phase 19 与 Phase 20 formal verification 已补齐
- canonical v4.0 milestone audit 已 re-audit 为 `passed`

</details>

<details>
<summary>v3.0 全栈化与行政区地图重构 (Phases 11-18)</summary>

- Monorepo: `apps/web` + `apps/server` + `packages/contracts`
- Backend: NestJS + Fastify + Prisma + PostgreSQL
- Canonical resolve: server authoritative，中国市级 / 海外一级行政区
- Map engine: Leaflet，双图层 GeoJSON（CN + OVERSEAS）
- Geometry: 版本化静态 sharding，92% bundle 减少
- 29/29 requirements satisfied，18/18 phases verified

</details>

<details>
<summary>v2.0 城市主视角与可爱风格重构 (Phases 7-10)</summary>

- 城市成为主要选择结果，国家/地区只作为兜底信息
- 地图中的已点亮地点以真实城市边界范围整体高亮
- 桌面 anchored popup 成为地图主舞台中的 summary 主入口
- 整体视觉升级为原创可爱风格

</details>

<details>
<summary>v1.0 MVP (Phases 1-6)</summary>

- 可交互世界地图 + 真实点位识别
- 点位 CRUD + localStorage 持久化
- 城市/国家级地理识别

</details>

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-09 — v8.0 roadmap ready*
