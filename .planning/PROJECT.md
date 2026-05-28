# 旅行世界地图

## What This Is

一个面向个人使用的旅行世界地图应用，用户可以在世界地图上点击真实地理位置，由系统判断对应的真实地点，并创建、保存、编辑、删除和留下自己的旅行足迹。应用已经从单页地图演进为登录后使用的完整旅行记录体验：世界足迹地图、旅途手账、旅途回忆 dashboard，以及 Yume Kawaii / Soft Pastel Glassmorphism 视觉系统。

## Core Value

用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## Current State

- **v8.0 已于 2026-05-28 归档**：7 phases（42-48），32 plans，64 tasks；落地页、登录门禁、左侧应用壳、世界足迹地图、留下足迹日期弹窗、可用地点覆盖扩展、旅途手账、旅途回忆 dashboard、桌面视觉 QA 与无障碍回归证据均已完成计划闭环。
- **v8.0 close 接受的后续债务**：未运行独立 `v8.0-MILESTONE-AUDIT.md`；28 个 open artifacts 记录到 `STATE.md` Deferred Items；23 个 unchecked 或 non-Complete requirement rows 保留在 requirements archive 作为 known gaps。
- **v7.0 已于 2026-04-29 归档**：旅行记录日期、备注、标签编辑，单条记录删除，地图 popup 与旅途手账入口编辑/删除闭环。
- **v6.0 已于 2026-04-28 归档**：多次旅行记录数据基座、海外覆盖扩展、独立时间轴、基础统计与 authoritative metadata 刷新一致性、deep-link/refresh、文档同步、Nyquist 验证覆盖与测试固件对齐均已落地。
- **v5.0 已于 2026-04-17 归档**：邮箱密码账号、`sid` 会话恢复、账号记录绑定、首次登录本地导入、cloud-wins 与 same-user 多设备同步闭环。
- 代码库：`pnpm workspace + turbo` monorepo（`apps/web`、`apps/server`、`packages/contracts`）。
- 后端：NestJS + Fastify + Prisma + PostgreSQL，canonical resolve / travel records CRUD / stats 全链路。
- 前端：Vue 3 + Leaflet + Tailwind v4 + shadcn-vue primitives + ECharts + Nunito，双图层 GeoJSON（CN + OVERSEAS），server-driven 点亮与账号态页面。
- 几何交付：版本化静态 GeoJSON sharding（23MB -> 1.75MB，92% 减少）。

## Current Focus

等待下一个 milestone 定义。

**Next:** `$gsd-new-milestone`

## Requirements

### Active

- 下一轮 requirements 尚未定义。通过 `$gsd-new-milestone` 重新进入 questioning -> research -> requirements -> roadmap。
- v8.0 accepted gaps 保留为后续候选输入：`DS-*`、`AUTH-*`、`SHELL-*` 的 checklist 未同步勾选，部分 `MAP/DATE` requirement 仍未勾选，`QA-01/QA-03/QA-05` traceability 仍为 Partial/Gaps Found。

### Validated

- ✓ 用户可以注册、登录、退出，并拥有独立账号身份 — v5.0
- ✓ 旅行记录与账号绑定，刷新或更换设备后仍能恢复到同一份账号记录 — v5.0
- ✓ 首次登录本地导入、本地/云端二选一与切账号边界清理已经闭环 — v5.0
- ✓ 优先海外国家/地区的 admin1 可识别/可点亮覆盖、持久化文本稳定回放与未支持地区可解释反馈已闭环 — v5.0 / v6.0
- ✓ 用户点亮地点时可以选择旅行日期，并能为同一地点保存多次旅行记录 — v6.0
- ✓ 已保存的旅行日期与同地点多次去访记录在刷新、重开应用和跨设备后仍能稳定恢复 — v6.0
- ✓ 扩展后的海外记录在地图、时间轴和统计视图中保持一致的标题与归类 — v6.0
- ✓ 已登录用户可以从独立页面查看时间序列旅行记录，并区分同一地点的多次去访 — v6.0
- ✓ 统计会正确区分总旅行次数、唯一地点和国家/地区覆盖 — v6.0
- ✓ 用户可以修改已有旅行记录的日期、备注和标签 — v7.0
- ✓ 用户可以删除单条旅行记录，删除最后一条记录时获得明确 destructive 提示 — v7.0
- ✓ 编辑/删除后时间轴自动重排序、统计自动刷新，网络失败时乐观更新正确回滚 — v7.0
- ✓ Yume Kawaii theme bridge、shadcn-vue primitive set、统一图标方案和 ECharts chart theme 已接入 `apps/web` — v8.0 / Phase 42
- ✓ 未登录用户访问 `/` 看到落地页，登录/注册成功后进入 `/map`，受保护页面回到登录入口 — v8.0 / Phase 43
- ✓ 已登录应用使用左侧 Yume Kawaii shell，导航收敛为世界足迹、旅途手账、旅途回忆，不显示收藏入口 — v8.0 / Phase 43
- ✓ 地图弹窗统一为地点信息 + “留下足迹”入口，日期选择进入独立弹窗，并使用冻结地点快照保存 — v8.0 / Phase 44
- ✓ 可保存地点与不可保存地点的 frontend availability 分类、解释文案、date dialog guard 与 canonical chain 已闭环 — v8.0 / Phase 45
- ✓ `/journal` 已升级为旅途手账，包含发光竖线、星形节点、旅行卡片和无添加/收藏入口约束 — v8.0 / Phase 46
- ✓ `/memories` 已升级为真实账号数据驱动的 dashboard，包含概览卡、图表、Top 5 足迹和 browse-only postcard strip — v8.0 / Phase 47
- ✓ Phase 48 已完成桌面截图矩阵、auth/sidebar/日期弹窗/chart accessibility 修复、long-text containment、reduced-motion guard 和 release gate evidence — v8.0 / Phase 48

### Out of Scope

- 收藏功能，包括“我的收藏”、爱心/星标收藏按钮和收藏状态管理。
- 用户上传旅行照片或富文本游记；当前只承载旅行时间、备注、标签、统计和视觉缩略图/插画位。
- 第三方 OAuth 登录与账号接入增强。
- 同步历史、最近同步时间与更完整的同步状态可见性。
- 分享、公开主页与协作能力。
- 自动轨迹、GPS 采集或外部行程导入。
- Dark mode。
- JS 动画库（framer-motion 等）；当前 CSS transition 和 reduced-motion guard 已满足主路径需要。
- 全球城市级统一覆盖。

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v6.0 先把旅行记录升级为“多次去访 + 旅行日期”模型 | 时间轴和统计都依赖记录从 place-level presence 升级为 trip-level history | ✓ Good — Validated in Phase 27 |
| 时间轴作为独立页面而不是地图内联模块 | 更适合承载时间序列浏览 | ✓ Good — Validated in Phase 29 |
| 统计页保持 server-authoritative，并用 metadata-aware revision 触发重拉 | 避免前端本地重算统计口径和统计滞后 | ✓ Good — Validated in Phase 31 |
| v7.0 编辑不含地点修改 | 关联地点不可变更，避免 placeId / boundaryId 级联更新复杂度 | ✓ Good — Validated in v7.0 |
| v7.0 无编辑历史/撤销 | 仅确认弹窗，不做 undo 栈，控制实现复杂度 | ✓ Good — Validated in v7.0 |
| 使用 PostgreSQL 数组存储标签 | 场景简单，无需独立 Tag 模型/表 | ✓ Good — Implemented in Phase 36 |
| v8.0 不做收藏功能 | 用户确认除收藏外纳入设计图功能，收藏状态会引入新数据模型与页面分支 | ✓ Good — Preserved across Phase 43/46/47 |
| 旅途手账不提供“添加新旅行”入口 | 旅行创建仍从地图真实地点进入，避免绕过地图识别主线 | ✓ Good — Validated in Phase 46 |
| 地图弹窗始终使用统一地点信息 UI 与“留下足迹”入口 | 已保存地点 popup 不显示过往记录，不使用“再留一次足迹”分支 | ✓ Good — Implemented in Phase 44 |
| 旅途回忆 dashboard 保持 server-authoritative | 图表、排行、画像和缩略图都从当前账号 `/records/stats` 派生 | ✓ Good — Validated in Phase 47 |
| Phase 48 证据矩阵采用 fixed QA account | 通过正常认证弹层采集截图，避免绕过登录守卫 | ✓ Good — Validated in Phase 48 |

## Archived Milestone Snapshots

<details>
<summary>v8.0 Yume Kawaii 视觉重构与登录地图体验 (Phases 42-48)</summary>

- shadcn-vue primitives、ECharts/vue-echarts、Iconify 图标和 Soft Pastel Glassmorphism token 基线已接入。
- 落地页、登录门禁、登录后左侧导航壳和全局文案替换已完成。
- 世界足迹地图、统一地点弹窗、独立留下足迹日期弹窗和保存状态反馈已完成。
- 可用地点覆盖扩展、canonical availability 分类、不可用地点解释文案与保存 guard 已完成。
- 旅途手账和旅途回忆 dashboard 已使用真实账号记录驱动。
- Phase 48 完成桌面视觉 QA、无障碍、动效降级和回归验证证据。
- Known gaps accepted at close: 28 deferred open artifacts, 23 unchecked/non-Complete requirement rows.

</details>

<details>
<summary>v7.0 旅行记录编辑与删除 (Phases 36-41)</summary>

- 用户可以编辑已有旅行记录的日期、备注和标签。
- 用户可以删除单条记录，删除最后一条记录时获得明确 destructive 提示。
- 编辑/删除后地图、旅途手账和统计可自动同步。

</details>

<details>
<summary>v6.0 旅行统计、时间轴与海外覆盖增强版 (Phases 27-35)</summary>

- 多次旅行记录、日期模型、独立时间轴、基础统计和 overseas admin1 覆盖增强已落地。
- 统计和 metadata refresh 保持 server-authoritative。
- Nyquist 验证覆盖与测试固件对齐完成。

</details>

<details>
<summary>v5.0 账号体系与云同步基础版 (Phases 23-26)</summary>

- 邮箱密码账号、`sid` 会话恢复与 current-user records ownership 已正式交付。
- 首登本地导入、cloud-wins 与 logout / switch-account / unauthorized 边界清理已闭环。
- same-user 多设备同步、foreground refresh 与 overlap 竞态已收口。

</details>

<details>
<summary>v4.0 Kawaii UI 重构 & Tailwind 集成 (Phases 19-22)</summary>

- Tailwind v4、Vite 插件顺序、单一 CSS 入口与 Nunito Variable 已在 `apps/web` 稳定落地。
- App shell、MapContextPopup、PointSummaryCard 完成 Kawaii/Tailwind 主路径迁移。

</details>

<details>
<summary>v3.0 全栈化与行政区地图重构 (Phases 11-18)</summary>

- Monorepo: `apps/web` + `apps/server` + `packages/contracts`。
- Backend: NestJS + Fastify + Prisma + PostgreSQL。
- Canonical resolve: server authoritative，中国市级 / 海外一级行政区。
- Map engine: Leaflet，双图层 GeoJSON（CN + OVERSEAS）。

</details>

<details>
<summary>v2.0 城市主视角与可爱风格重构 (Phases 7-10)</summary>

- 城市成为主要选择结果，国家/地区只作为兜底信息。
- 地图中的已点亮地点以真实城市边界范围整体高亮。
- 桌面 anchored popup 成为地图主舞台中的 summary 主入口。

</details>

<details>
<summary>v1.0 MVP (Phases 1-6)</summary>

- 可交互世界地图 + 真实点位识别。
- 点位 CRUD + localStorage 持久化。
- 城市/国家级地理识别。

</details>

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-28 after v8.0 milestone*
