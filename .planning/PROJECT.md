# 旅行世界地图

## What This Is

一个面向个人使用的旅行世界地图应用，用户可以在世界地图上点击真实地理位置，由系统离线判断对应的真实地点，并创建、保存、重开和点亮自己的旅行记录。

`v4.0` 已交付：前端现在采用 Tailwind v4 + Nunito Variable + Kawaii 视觉主路径，App shell、popup 与 summary card 已统一到可审计的 pastel / pill / floating-cloud 风格，同时保留既有 Leaflet 地图主舞台与真实地点记录链路。

## Core Value

用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## Current Milestone: v5.0 账号体系与云同步基础版

**Goal:** 让用户从本地单机旅行地图升级到可登录、可跨设备同步旅行记录的旅行地图。

**Target features:**
- 用户可以注册、登录、退出，并拥有独立账号身份
- 旅行记录与账号绑定，刷新或更换设备后仍能看到同一份点亮记录
- 在现有中国 + 海外行政区链路上继续扩展海外可识别/可点亮覆盖
- 清理会直接阻塞账号化、同步和覆盖扩展落地的技术债

## Current State

- **v4.0 已于 2026-04-10 归档**：4 phases（19-22），11 plans，12/12 requirements satisfied，canonical milestone audit passed
- **v3.0 已于 2026-04-03 交付**：8 phases（11-18），39 plans，29/29 requirements satisfied
- 代码库：`pnpm workspace + turbo` monorepo（`apps/web`、`apps/server`、`packages/contracts`）
- 后端：NestJS + Fastify + Prisma + PostgreSQL，canonical resolve / travel records CRUD 全链路
- 前端：Vue 3 + Leaflet + Tailwind v4 + Nunito，双图层 GeoJSON（CN + OVERSEAS），server-driven 点亮
- 几何交付：版本化静态 GeoJSON sharding（23MB → 1.75MB，92% 减少）

## Next Milestone Goals

- 完成账号体系与跨设备同步闭环，把“本地单机”升级为“账号化记录”
- 扩展海外行政区覆盖，让同步后的旅行记录在更多海外地点可识别、可点亮
- 只清理会直接阻塞账号化、同步和覆盖扩展的技术债

## Requirements

### Active

- [ ] 用户可以注册、登录、退出，并拥有独立账号身份
- [ ] 旅行记录与账号绑定，刷新或更换设备后仍能看到同一份点亮记录
- [ ] 海外地点识别与点亮覆盖继续扩展到更实用的可用范围
- [ ] 清理直接阻塞账号化 / 同步 / 覆盖扩展的技术债

### Validated

- ✓ Tailwind CSS 已集成到 `apps/web`，可在 Vue SFC 中使用工具类 — v4.0
- ✓ 页面使用奶油白背景（#FAFAFA / #FFF5F5），并提供 `sakura` / `mint` / `lavender` / `cream` 主题 token — v4.0
- ✓ Nunito Variable 已作为全局字体基线生效 — v4.0
- ✓ App shell、popup、PointSummaryCard 已完成 Kawaii/Tailwind 主路径迁移 — v4.0
- ✓ pill-shaped 按钮/徽章、floating-cloud 卡片、宽松 spacing、hover / active motion 合同均已通过 formal verification 与 milestone audit — v4.0

### Out of Scope

- 后端逻辑大改 — 下一 milestone 再评估
- Dark mode — 目前仍非优先项
- JS 动画库（framer-motion 等） — 当前 CSS transition 已满足主路径需要
- 用户账号体系、多设备同步、更多海外国家支持 — 留待下一 milestone 明确定义范围

## Archived Milestone Snapshots

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
*Last updated: 2026-04-10 — after v5.0 milestone start*
