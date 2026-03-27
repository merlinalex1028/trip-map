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

### Active

- [ ] 为城市地点添加图片、标签、游记或时间线内容
- [ ] 支持导入导出、分享或多设备同步
- [ ] 增加更精细的地图交互、路线规划和统计视图

## Current State

- `v2.0` 已归档，milestone audit 为 `passed`，Phase 7-10 与 16 个 v2 requirements 全部完成。
- 当前代码库已具备城市优先选择、真实边界点亮、desktop anchored popup + deep drawer 主链路，以及统一视觉系统。
- 当前源码规模约为 `8855` 行 `ts/vue`，自动化回归为 `14` 个 test files / `115` 个 tests 通过。

## Next Milestone Goals

- 在不破坏当前城市主链路的前提下，为城市地点引入图片、标签、游记或时间线等富内容表达。
- 评估导入导出、分享与多设备同步，明确哪些能力仍可保持本地优先，哪些需要后端支撑。
- 继续扩展地图使用深度，例如缩放/拖拽、想去清单、路线规划和旅行统计视图。

### Out of Scope

- 在线逆地理编码、在线搜索或第三方地点 API — 与本项目离线识别方向冲突，也会把核心识别质量交给外部服务
- 地图引擎整体替换为 `MapLibre`、`Leaflet` 或其他 slippy map 方案 — 这是架构级重做，不是下个 milestone 的默认增量目标
- popup 承担完整编辑表单 — 会与现有 deep drawer 职责重叠，增加两套详情入口长期分裂风险
- 账号系统、后端服务、多端同步 — 除非下一 milestone 显式重开，否则仍不默认纳入
- 社交、排行榜、社区内容流 — 偏离个人旅行地图主线

## Context

- 当前项目已经完成两个 milestone：`v1.0` 建立真实点位识别与点位 CRUD 基线，`v2.0` 完成城市主视角、边界高亮、popup 主舞台交互与视觉重构
- 前端技术栈继续保持为 `Vue 3 + Vite + TypeScript`
- 数据层继续采用本地静态地理数据、预置 seed 点位与 `localStorage` overlay，不依赖在线服务
- 当前主要产品风险已从“能否识别真实地点”转为“如何在不引入复杂后端的前提下扩展内容深度、数据流和地图探索能力”

## Constraints

- **Tech stack**: `Vue 3 + Vite + TypeScript` — 继续保持，不切换框架
- **Architecture**: 前端本地静态识别优先 — 不默认引入在线逆地理编码或后端依赖
- **Data model**: 必须保存真实地理语义（如 `lat/lng`、`cityId`、`boundaryId`）并兼容固定底图渲染语义
- **Map rendering**: 城市记录继续以真实城市边界为主表达，而不是退回单点 marker 作为默认语义
- **UX**: summary surface 继续保持 anchored popup，deep detail/edit 继续由 drawer 承接
- **Visual design**: 延续原创二次元美少女可爱风格，但始终优先保证可读性、状态辨识和命中安全
- **Scope**: 单用户本地体验优先，除非下一 milestone 明确重开同步或分享

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
*Last updated: 2026-03-27 after v2.0 milestone archive*
