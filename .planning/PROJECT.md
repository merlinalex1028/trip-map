# 旅行世界地图

## What This Is

一个面向个人使用的旅行世界地图应用，用户可以在世界地图上点击真实地理位置，由系统判断对应的真实地点，并创建、保存、重开和点亮自己的旅行记录。

`v6.0` 收口中：产品已经把“去过哪里”升级为“什么时候去过、去过几次、整体完成度如何”，并完成旅行时间、独立时间轴、基础统计、海外覆盖扩展与统计刷新一致性主链路；当前剩余工作集中在 deep-link / refresh 部署验收与人工 UAT 闭环。

## Core Value

用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## Current State

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

## Current Milestone: v6.0 旅行统计、时间轴与海外覆盖增强版

**Goal:** 让用户能够记录每次旅行发生的时间、在同一地点保存多次去访记录，并通过独立时间轴页面与基础统计回看自己的旅行历史，同时把 overseas 覆盖扩展到更广的优先国家/地区。

**Target features:**
- 点亮地点时可选择旅行时间
- 同一地点支持多次点亮，代表多次去访
- 用户可从用户名面板进入独立时间轴页面
- 时间轴页面按时间顺序展示个人旅行记录
- 提供国家/地区完成度与基础旅行统计
- 把 overseas 覆盖扩展到更广的优先国家/地区

## Requirements

### Active

- `STAT-01`: 用户可以查看基础旅行统计，包括旅行次数、已去过地点数与国家/地区数
- `STAT-02`: 用户可以查看国家/地区完成度

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
- ✓ 已登录用户可以从点击用户名后展开的面板进入独立的旅行时间轴页面 — v6.0 / Phase 29（Validated in Phase 29: Timeline Page & Account Entry）
- ✓ 用户可以在时间轴页面按时间顺序查看自己的旅行记录，并区分同一地点的多次去访 — v6.0 / Phase 29（Validated in Phase 29: Timeline Page & Account Entry）
- ✓ 当同一地点存在多次旅行记录时，统计会正确区分“总旅行次数”和“唯一地点 / 完成度”，且 authoritative metadata 刷新后统计与时间轴保持一致 — v6.0 / Phase 30-31（Validated in Phase 31: Statistics Sync Refresh Hardening）
- ✓ Tailwind CSS 已集成到 `apps/web`，可在 Vue SFC 中使用工具类 — v4.0
- ✓ 页面使用奶油白背景（#FAFAFA / #FFF5F5），并提供 `sakura` / `mint` / `lavender` / `cream` 主题 token — v4.0
- ✓ Nunito Variable 已作为全局字体基线生效 — v4.0
- ✓ App shell、popup、PointSummaryCard 已完成 Kawaii/Tailwind 主路径迁移 — v4.0
- ✓ pill-shaped 按钮/徽章、floating-cloud 卡片、宽松 spacing、hover / active motion 合同均已通过 formal verification 与 milestone audit — v4.0

### Out of Scope

- 第三方 OAuth 登录与账号接入增强 — 本轮重点转向旅行记录表达与统计，不扩展登录体系
- 同步历史、最近同步时间与更完整的同步状态可见性 — 本轮不处理同步可观察性增强
- 分享、公开主页与协作能力 — 会引入权限与隐私模型，超出本轮单用户旅行表达范围
- 旅行照片、游记正文与富文本内容 — 当前只承载旅行时间和基础统计，不做内容社区化
- 单条旅行记录的编辑 / 局部删除工作流 — v6.0 先聚焦新增与展示，地图取消点亮仍保持地点级清理语义
- 自动轨迹、GPS 采集或外部行程导入 — 偏离当前“手动点亮 + 主动记录”的产品主线
- Dark mode — 目前仍非优先项
- JS 动画库（framer-motion 等） — 当前 CSS transition 已满足主路径需要
- 全球城市级统一覆盖 — 范围过大，v6.0 先扩展优先海外国家/地区的 admin1 能力

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v6.0 先把旅行记录升级为“多次去访 + 旅行日期”模型 | 时间轴和统计都依赖记录从 place-level presence 升级为 trip-level history | ✓ Good — Validated in Phase 27 |
| 时间轴作为独立页面而不是地图内联模块 | 这是用户明确指定的交互路径，且更适合承载时间序列浏览 | ✓ Good — Validated in Phase 29 |
| 时间轴入口放在点击用户名后展开的面板内 | 复用现有账号入口心智，避免在地图主舞台额外引入高噪声导航 | ✓ Good — Validated in Phase 29 |
| 统计页保持 server-authoritative，并用 metadata-aware revision 触发重拉 | 避免在前端本地重算统计口径，同时保证 bootstrap / same-user sync 后不会出现统计滞后 | ✓ Good — Validated in Phase 31 |
| 单条旅行记录编辑 / 局部删除延后 | 本轮先闭环新增、展示和统计，控制模型迁移复杂度 | — Pending |

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
*Last updated: 2026-04-28 — after Phase 35 completion (v6.0 shipped)*
