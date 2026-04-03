# 旅行世界地图

## What This Is

一个面向个人使用的旅行世界地图应用，用户可以在世界地图上点击真实地理位置，由系统离线判断对应的真实地点，并创建、保存、重开和点亮自己的旅行记录。

`v3.0` 已交付：产品现在是 `web + server + contracts` 全栈 monorepo，支持 server authoritative canonical resolve（中国市级 / 海外一级行政区）、Leaflet 地图引擎、PostgreSQL 持久化旅行记录与 GeoJSON 边界点亮。

## Core Value

用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## Current State

- **v3.0 已于 2026-04-03 交付**：8 phases (11-18)，39 plans，29/29 requirements satisfied
- 代码库：`pnpm workspace + turbo` monorepo（`apps/web`、`apps/server`、`packages/contracts`）
- 后端：NestJS + Fastify + Prisma + PostgreSQL，canonical resolve / travel records CRUD 全链路
- 前端：Vue 3 + Leaflet，双图层 GeoJSON（CN + OVERSEAS），server-driven 点亮
- 几何交付：版本化静态 GeoJSON sharding（23MB → 1.75MB，92% 减少）
- Milestone audit: `passed`（29/29 requirements，18/18 phases verified）

## Next Milestone Goals

待通过 `/gsd:new-milestone` 定义 v4.0 范围。候选方向：

- 用户账号体系（AUTH-01）
- 多设备数据同步（SYNC-01/02）
- 更多海外国家支持（GEOX-08）
- 部署与运维自动化（OPS-01）

## Archived Milestone Snapshots

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

This document evolves at milestone boundaries.

**After each milestone**:
1. Archive previous state in `<details>` above
2. Update Current State with shipped version
3. Define Next Milestone Goals
4. Core Value check — still the right priority?

---
*Last updated: 2026-04-03 — v3.0 milestone shipped*
