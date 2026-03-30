# 旅行世界地图

## What This Is

一个面向个人使用的旅行世界地图应用，用户可以在世界地图上点击真实地理位置，由系统离线判断对应的真实地点，并创建、保存、重开和点亮自己的旅行记录。产品重点不是做复杂 GIS 平台，而是把“旅行足迹记录”做得直观、可信、可持续迭代。

当前已完成 `v2.0` 交付：产品具备城市优先识别、真实城市边界高亮、桌面 anchored popup 摘要交互、deep drawer 详情编辑，以及统一的原创可爱风视觉主链路。

## Core Value

用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## Requirements

### Validated

- [x] 用户点击已有点位时可以重新选中该点位并打开对应详情面板 — v1.0
- [x] 用户取消新建点位时，地图上不会残留未保存的空点位 — v1.0
- [x] 用户可以看到一张可交互的世界地图，并在首个里程碑内完成基础桌面/移动抽屉体验 — v1.0
- [x] 用户点击地图后，系统可以离线识别真实地点，至少达到国家/地区级准确性 — v1.0
- [x] 用户可以创建、查看、编辑、删除自己的旅行点位，并看到高亮状态 — v1.0
- [x] 用户数据可通过本地种子数据和 `localStorage` 合并加载，并在刷新后保留 — v1.0
- [x] 用户可以以城市为主要选择结果，通过候选或搜索完成确认，并在失败时回退到国家/地区级结果 — v2.0
- [x] 已保存城市与当前选中城市会以真实城市边界整体高亮，并在 reopen / switch / close / fallback 时保持身份一致 — v2.0
- [x] 用户可以在地图内 anchored popup 完成高频摘要操作，再按需进入 deep drawer 查看和编辑完整详情 — v2.0
- [x] 当前桌面主链路已统一为原创可爱风视觉，并保持未记录 / 已记录 / 当前选中 / 低置信回退四态可辨识 — v2.0
- [x] 当前单体前端应用已演进为 `web + server + contracts` 的 monorepo 结构，并明确了前后端边界 — Phase 11
- [x] TypeScript 后端服务已落地为 `NestJS + Prisma + PostgreSQL` 基线，并验证了可移植的持久化链路 — Phase 11
- [x] 用户点击地图后，系统会通过 `server` authoritative canonical resolve 区分中国市级 / 海外一级行政区，并为地点生成稳定的 canonical identity — Phase 12
- [x] popup、drawer、已保存记录与地图高亮在当前支持的 canonical 点位上保持同一地点身份；无几何支持时会明确提示 unsupported — Phase 12

### Active

- [ ] 将已完成的 canonical 地点语义迁移到 `Leaflet` 主链路
- [ ] 中国境内边界数据使用阿里云 `DataV.GeoAtlas` 合规市级 GeoJSON，境外使用 `Natural Earth` 一级行政区数据
- [ ] 选中地点后在面板中提供名称右侧的点亮/取消点亮动作，并通过 GeoJSON 整个行政区边界呈现点亮状态

## Current State

- `v2.0` 已归档，milestone audit 为 `passed`，Phase 7-10 与 16 个 v2 requirements 全部完成。
- Phase 11 已完成：代码库现在是 `pnpm workspace + turbo` 驱动的 `apps/web + apps/server + packages/contracts` monorepo，并通过 `BackendBaselinePanel` 验证了 `web -> server -> PostgreSQL` 的真实 smoke path。
- Phase 12 已完成：canonical 地点语义、server authoritative resolve、web canonical persistence、popup/drawer 真实行政称谓，以及 canonical boundary highlight/reopen gap closure 全部验证通过。
- 当前代码库已具备城市优先选择、真实边界点亮、desktop anchored popup + deep drawer 主链路，以及可移植的 TypeScript 服务端持久化基线。
- 当前自动化回归已扩展到 monorepo 级 `pnpm build`、`pnpm test`、`pnpm typecheck` 全通过。

## Current Milestone: v3.0 全栈化与行政区地图重构

**Goal:** 把当前纯前端旅行地图升级为 monorepo 的全栈应用，引入 TypeScript 后端服务，重新划分前后端职责，并将地图交互改造为“中国市级 / 海外一级行政区”的新语义。

**Target features:**
- 使用 monorepo 管理现有 `web` 应用与新增 `server` 服务
- 评估哪些现有前端数据、存储和识别流程应迁移到后端 API 重构
- 后端优先调研 `NestJS`，并梳理数据库、对象存储等候选依赖方案供选择
- 地图渲染切换到 `Leaflet`
- 中国境内采用阿里云 `DataV.GeoAtlas` 市级边界数据，境外采用 `Natural Earth` 一级行政区数据
- 中国境内选中到市级，境外选中到一级行政区
- 面板内提供名称右侧的点亮 / 取消点亮按钮，已点亮区域以 GeoJSON 全边界高亮呈现

### Out of Scope

- 在线逆地理编码、在线搜索或第三方地点 API — 与本项目离线识别方向冲突，也会把核心识别质量交给外部服务
- popup 承担完整编辑表单 — 会与现有 deep drawer 职责重叠，增加两套详情入口长期分裂风险
- 社交、排行榜、社区内容流 — 偏离个人旅行地图主线
- 在数据库、对象存储等候选方案完成评估前，直接锁定某一个后端基础设施组合 — 需要先做研究和权衡
- 在没有验证中国合规数据链路与境外行政区数据精度前，直接承诺所有国家都达到城市级识别 — 当前 milestone 明确以“中国市级 / 海外一级行政区”为边界

## Context

- 当前项目已经完成两个 milestone：`v1.0` 建立真实点位识别与点位 CRUD 基线，`v2.0` 完成城市主视角、边界高亮、popup 主舞台交互与视觉重构
- 当前前端技术栈为 `Vue 3 + Vite + TypeScript`，此次 milestone 会基于它扩展为包含 `web` 与 `server` 的 monorepo
- 现有数据层仍采用本地静态地理数据、预置 seed 点位与 `localStorage` overlay；本 milestone 需要重新评估其中哪些适合迁移到后端
- 当前主要产品风险已从“能否识别真实地点”转为“如何在引入后端后仍保持地理语义清晰、数据来源合规、架构边界稳定”

## Constraints

- **Tech stack**: 前端继续保持 `Vue 3 + Vite + TypeScript`，后端同样使用 TypeScript 生态 — 降低跨端心智切换与模型转换成本
- **Architecture**: 允许引入后端服务，但必须先明确哪些职责迁移、哪些仍保留在前端或静态数据层
- **Data model**: 必须保存真实地理语义（如 `lat/lng`、`cityId`、`boundaryId`）并兼容固定底图渲染语义
- **Map semantics**: 中国境内命中到市级，境外命中到一级行政区，不能混淆两套行政层级
- **Map rendering**: 已点亮地点继续以真实边界高亮为主表达，而不是退回单点 marker 作为默认语义
- **Map engine**: 地图交互将切换到 `Leaflet`，需要同时评估底图、投影、GeoJSON 性能与交互改造成本
- **UX**: summary surface 继续保持 anchored popup，deep detail/edit 继续由 drawer 承接
- **Visual design**: 延续原创二次元美少女可爱风格，但始终优先保证可读性、状态辨识和命中安全
- **Data compliance**: 中国境内行政区边界数据必须使用符合国家测绘规范的合规来源
- **Scope**: 当前 milestone 的重点是全栈化与行政区语义重构，不默认同时承诺完整账号体系或社交系统

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 使用 `Vue 3 + Vite + TypeScript` 启动项目 | 与 PRD 一致，适合快速构建高交互前端 | ✓ Shipped in v1.0 |
| 采用固定投影世界地图 + 静态地理数据识别 | 满足真实点位判断，同时避免过早引入在线地理服务 | ✓ Shipped in v1.0 |
| 数据层采用 `seed + localStorage overlay` | 满足首屏演示与本地持久化，不依赖后端 | ✓ Shipped in v1.0 |
| `v2.0` 以城市作为主要选择单位 | 用户明确要求旅行记录以城市为核心，而不是国家/地区级保守结果 | ✓ Shipped in v2.0 |
| `v2.0` 以真实城市边界整体点亮替代单点 marker 表达 | 需要让“去过这座城市”在地图上具备区域语义，而非仅是坐标点 | ✓ Shipped in v2.0 |
| summary 保持轻量 popup，deep detail/edit 继续由 drawer 承接 | 保持地图主舞台感，同时避免两套完整编辑入口长期分裂 | ✓ Shipped in v2.0 |
| `v2.0` 晚期正式收口为 desktop-only 主链路 | 让 Phase 09/10 文档、实现与验收范围重新一致，避免继续维护已移除的移动端壳层 | ✓ Shipped in v2.0 |
| 项目内用户可见表面优先使用圆角 | 更符合可爱风方向，也能统一卡片、弹窗、按钮与标签的亲和感 | ✓ Shipped in v2.0 |
| `v3.0` 将以 monorepo + TypeScript backend 作为研究起点 | 新 milestone 已明确包含服务端引入与前后端职责重划，需要先用同语言生态稳定建模 | — Pending |
| `v3.0` Phase 11 以 `pnpm workspace + turbo`、`@trip-map/contracts`、`NestJS + Prisma + PostgreSQL` 固定全栈基线 | 先稳定 monorepo、共享契约与最小真实写链路，后续 Phase 12-15 才能专注在 canonical 语义与 Leaflet 主链路 | ✓ Completed in Phase 11 |
| `v3.0` 地图语义切换为“中国市级 / 海外一级行政区” | 这是数据合规性、识别精度与实现复杂度之间的当前最优平衡点 | ✓ Completed in Phase 12 |

## Archived Milestone Snapshot

<details>
<summary>v2.0 shipped scope</summary>

- 城市成为主要选择结果，国家/地区只作为兜底信息
- 地图中的已点亮地点以真实城市边界范围整体高亮
- 桌面 anchored popup 成为地图主舞台中的 summary 主入口
- 整体视觉升级为原创可爱风格，但保留状态辨识和交互可靠性护栏

</details>

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with milestone reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current shipped state

---
*Last updated: 2026-03-30 after Phase 12 completion*
