# 旅行世界地图

## What This Is

一个面向个人使用的旅行世界地图应用，用户可以在世界地图上点击真实地理位置，由系统离线判断该点击对应的真实地点后，创建并点亮自己的旅行点位。产品重点不是做复杂 GIS 平台，而是把“旅行足迹记录”做得直观、可信、可持续迭代。

`v1.0` 已以 `Vue 3 + Vite + TypeScript` 的单页应用形式完成交付，当前产品具备真实点位识别、点位点亮、详情面板编辑和本地持久化能力。

## Core Value

用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## Requirements

### Validated

- [x] 用户点击已有点位时可以重新选中该点位并打开对应详情面板 — v1.0
- [x] 用户取消新建点位时，地图上不会残留未保存的空点位 — v1.0
- [x] 用户可以看到一张可交互的世界地图，并在桌面端和移动端正常使用 — v1.0
- [x] 用户点击地图后，系统可以离线识别真实地点，至少达到国家/地区级准确性 — v1.0
- [x] 系统在无法可靠识别城市时，仍可以回退到国家或地区级结果继续创建点位 — v1.0
- [x] 用户可以创建、查看、编辑、删除自己的旅行点位，并看到高亮状态 — v1.0
- [x] 用户可以通过详情面板维护地点名称、简介、点亮状态等基础内容 — v1.0
- [x] 用户数据可通过本地种子数据和 `localStorage` 合并加载，并在刷新后保留 — v1.0

### Active

- [ ] 以城市为主要选择结果，国家/地区仅作为识别失败时的兜底信息
- [ ] 地图中的已点亮地点以真实城市边界范围整体高亮，而不是单点 marker
- [ ] 详情交互从抽屉重构为悬浮弹窗，并与地图主舞台形成一体化体验
- [ ] 整体视觉升级为原创二次元美少女可爱风格，不绑定具体 IP

## Current State

- `v1.0` 已归档，milestone audit 为 `passed`，Phase 1-6 与 23 个 v1 requirements 全部完成。
- 当前代码库已具备可运行的旅行地图 MVP，`v2.0` 将围绕“城市主视角 + 城市区域点亮 + 悬浮弹窗 + 风格重构”展开，而不是继续停留在国家级点位增强。

## Current Milestone: v2.0 城市主视角与可爱风格重构

**Goal:** 把旅行地图从“国家/地区级点位记录”升级为“以城市为主要选择单位、以真实城市区域点亮呈现、并完成整体可爱风格重构”的新版本。

**Target features:**
- 城市成为主要选择结果，国家/地区只作为兜底信息而不是主交互目标
- 以真实城市行政边界为目标，让点亮效果覆盖整个城市区域，而不是单个 marker 点
- 详情交互从抽屉改为悬浮弹窗，保持地图主舞台感
- 整体视觉升级为原创二次元美少女可爱风格，不绑定具体 IP 或角色

### Out of Scope

- 后端服务与账号体系 — 本 milestone 仍聚焦单用户本地体验，避免把核心复杂度转移到服务端
- 多端同步、分享、导入导出 — 先把城市识别与城市区域点亮体验做稳，再评估数据流扩展
- 图片、游记、标签、时间线等富内容 — 当前重点是城市主交互和视觉/详情形态重构
- 社交、排行榜、探索内容流 — 偏离个人旅行地图主线
- 在线逆地理编码 API — 与“本地离线识别”方向冲突

## Context

- 当前项目已完成 v1 milestone 的 6 个 phase，前端代码、测试与 planning 产物均已存在；[PRD.md](/Users/huangjingping/i/trip-map/PRD.md) 继续作为产品背景文档保留
- 产品已经明确要求“真实点位判断”，不能只保存屏幕坐标，必须保存 `lat/lng`、国家/地区信息，并支持后续增强到城市级
- 第一版默认采用固定投影世界地图，点击地图后先完成屏幕坐标到地理坐标的映射，再做国家边界命中与可选城市匹配
- 数据来源分为两层：项目内置的预置示例点位，以及用户通过界面创建和编辑后的本地点位
- `v2.0` 的主要新增风险集中在真实城市边界数据质量、城市命中判定稳定性、区域高亮渲染性能、弹窗定位策略，以及强风格 UI 重构对可用性的影响

## Constraints

- **Tech stack**: `Vue 3 + Vite + TypeScript` — 已在产品方案中确认，后续实现不切换框架
- **Architecture**: 前端本地静态识别 — v1 不依赖后端和在线逆地理编码接口
- **Accuracy**: 城市识别必须成为主路径，国家/地区级识别作为兜底而非默认结果
- **Data model**: 必须保存 `lat/lng` 与 `x/y` — 前者保证真实地点语义，后者保证固定底图渲染稳定
- **Map rendering**: 城市点亮应以真实城市边界为目标 — 不接受只把城市继续表现成单点 marker
- **UX**: 详情交互应改为悬浮弹窗 — 不再沿用桌面右侧抽屉 / 移动端底部抽屉作为主模式
- **Visual design**: 使用原创二次元美少女可爱风格 — 可借鉴风格语言，但不绑定任何具体 IP
- **Scope**: 单用户本地体验优先 — 不提前引入同步、账号、分享等扩展能力

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 使用 `Vue 3 + Vite + TypeScript` 启动项目 | 与 PRD 一致，适合快速构建高交互前端 | ✓ Shipped in v1.0 |
| 采用固定投影世界地图 + 静态地理数据识别 | 满足真实点位判断，同时避免 v1 引入复杂在线地理服务 | ✓ Shipped in v1.0 |
| v1 以国家/地区级识别为硬性能力 | 这是产品可信度底线，城市级作为增强能力递进 | ✓ Shipped in v1.0 |
| 用户点位保存 `lat/lng` 与 `x/y` 双坐标 | 兼顾真实地理语义与底图渲染稳定性 | ✓ Shipped in v1.0 |
| 数据层采用 `seed + localStorage overlay` | 满足首屏演示与本地持久化，不依赖后端 | ✓ Shipped in v1.0 |
| 详情交互采用响应式抽屉而非独立页面 | 保持地图为主视觉，同时减少跳转中断感 | ✓ Shipped in v1.0 |
| `v2.0` 以城市作为主要选择单位 | 用户明确要求旅行记录以城市为核心，而不是国家/地区级保守结果 | — Pending |
| `v2.0` 以真实城市边界整体点亮替代单点 marker 表达 | 需要让“去过这座城市”在地图上具备区域语义，而非仅是坐标点 | — Pending |
| `v2.0` 详情交互改为悬浮弹窗 | 让地图继续成为视觉主舞台，同时减少抽屉对整体风格的割裂感 | — Pending |
| `v2.0` 整体视觉升级为原创二次元美少女可爱风格 | 用户明确要求做统一视觉语言重构，且不绑定具体 IP | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-25 after v2.0 milestone initialization*
