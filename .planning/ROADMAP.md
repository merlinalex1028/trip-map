# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档
- ✅ **v2.0 城市主视角与可爱风格重构** — Phases 7-10，已于 2026-03-27 归档
- 🚧 **v3.0 全栈化与行政区地图重构** — Phases 11-15，当前规划中

## Overview

`v3.0` 只围绕这次 milestone 的 requirement 做增量重构，不把项目扩成 GIS 平台或大规模基础设施改造。路线图按“先定 monorepo 与契约边界，再定 canonical 地点语义，再固化几何交付，之后切 Leaflet 主链路，最后切旅行记录与点亮写链路”的顺序推进，并明确遵守这些约束：`server` 从 `v3.0` 起拥有 canonical area resolve，几何先用版本化静态资产交付，中国与海外 GeoJSON 不在数据层合并，`Leaflet` 直接加载海外 admin1 与中国市级两层，且不迁移旧 `localStorage` 数据或历史 seed 点位。

## Phases

- [ ] **Phase 11: Monorepo 与契约基线** - 拆出 `web + server + contracts`，把 PostgreSQL 与共享契约定为 v3.0 基线
- [ ] **Phase 12: Canonical 地点语义** - 让 `server` 成为中国市级 / 海外一级行政区解析的唯一真源
- [ ] **Phase 13: 行政区数据与几何交付** - 固定中国与海外独立数据集、版本清单与静态几何交付策略
- [ ] **Phase 14: Leaflet 地图主链路迁移** - 在 `Leaflet` 中恢复双图层地图、popup 与 drawer 的连续主链路
- [ ] **Phase 15: 服务端记录与点亮闭环** - 把旅行记录与点亮动作切到 `server` API，并收口旧本地数据路径

## Phase Details

### Phase 11: Monorepo 与契约基线
**Goal**: 用户可以通过拆分后的 `web` 与 `server` 应用访问同一套 v3.0 基线，且核心数据契约与持久化底座已经稳定  
**Depends on**: Phase 10  
**Requirements**: ARC-01, ARC-03, ARC-04, API-04  
**Success Criteria** (what must be TRUE):
  1. 用户访问 v3.0 应用时，`apps/web` 可以通过独立运行的 `apps/server` 正常完成主链路访问，前后端不再耦合在单体前端里。
  2. 用户触发的同一条请求链路中，前端与服务端一致使用 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 等关键字段，不会因为契约漂移看到错名或错边界。
  3. 验收者把环境切换到任意 PostgreSQL 兼容实例时，核心读写链路仍可运行，不要求依赖 Supabase 私有能力。
  4. 首发环境在不启用 `PostGIS`、`Redis`、`BullMQ` 或对象存储的前提下，仍能支撑 v3.0 主链路。
**Plans**: 10 plans

Plans:
- [ ] `11-01-PLAN.md` — 建立 `pnpm workspace + turbo` 根编排层，并创建薄 `packages/contracts` 契约包
- [ ] `11-02-PLAN.md` — 搭建 `apps/web` package/config/bootstrap 壳层，并显式桥接 legacy root app
- [ ] `11-03-PLAN.md` — 搭建 `apps/server` 的 NestJS bootstrap、health 与 contract-backed route 边界
- [ ] `11-04-PLAN.md` — 打通最小 `web -> server -> DB/contracts` smoke path 与联合验证
- [ ] `11-05-PLAN.md` — 迁移 web app shell 与顶层交互组件到 `apps/web`
- [ ] `11-06-PLAN.md` — 为 `apps/server` 接入 Prisma/PostgreSQL 持久化、DI wiring 与 DB-backed smoke 验证
- [ ] `11-07-PLAN.md` — 迁移 web services、geo data 与 web-local types 到 `apps/web`
- [ ] `11-08-PLAN.md` — 迁移 web 的 non-UI specs/test-helper 到 `apps/web`
- [ ] `11-09-PLAN.md` — 迁移 Pinia/composable runtime glue，并把 app shell rewiring 到 package-local supporting modules
- [ ] `11-10-PLAN.md` — 迁移剩余 UI regression、styles/assets，并移除 `legacy-entry` 过渡桥

### Phase 12: Canonical 地点语义
**Goal**: 用户点击地图后，`server` 会返回稳定的 canonical 地点结果，并明确区分中国市级与海外一级行政区语义  
**Depends on**: Phase 11  
**Requirements**: ARC-02, PLC-01, PLC-02, PLC-03, PLC-04, PLC-05, UIX-04  
**Success Criteria** (what must be TRUE):
  1. 用户点击中国地点时得到市级结果，点击海外地点时得到一级行政区结果，界面会明确显示对应层级，而不是继续统一伪装成“城市”。
  2. 同一地点在 popup、drawer、已保存记录和地图高亮中保持同一个 canonical 身份，不会出现名称、边界和保存结果对不上的情况。
  3. 用户关闭再重开同一记录后，系统仍能还原同一地点与边界，不会因为展示名或数据版本变化被识别成另一条地点。
  4. 当点击结果无法可靠命中到中国市级或海外一级行政区时，界面会给出明确 fallback 或失败反馈，而不是静默创建错误地点。
**Plans**: TBD

### Phase 13: 行政区数据与几何交付
**Goal**: 用户使用的中国与海外行政区边界都来自可追踪的数据清单，并以版本化静态几何资产稳定交付  
**Depends on**: Phase 12  
**Requirements**: GEOX-03, GEOX-04, GEOX-05, GEOX-06, GEOX-07, API-03  
**Success Criteria** (what must be TRUE):
  1. 用户在地图中看到的中国边界来自阿里云 `DataV.GeoAtlas` 市级数据，海外边界来自去除中国后的 `Natural Earth admin-1` 数据，且两套来源与版本可独立追踪。
  2. 前端可以按需获取地点摘要、边界引用或几何资源入口，并命中对应版本的静态几何资产完成缓存，不需要把整套 GeoJSON 预先塞进数据库。
  3. 中国图层与海外图层在 `Leaflet` 中保持分离加载，不会在数据层被预合并，也不会让中国区域在海外图层中重复出现。
  4. 用户点击、popup 锚点与边界渲染在中国和海外场景下都不出现明显坐标错位。
**Plans**: TBD

### Phase 14: Leaflet 地图主链路迁移
**Goal**: 用户可以在 `Leaflet` 地图里继续完成选中、摘要查看、深度查看和边界高亮，不丢失现有主链路体验  
**Depends on**: Phase 13  
**Requirements**: MAP-04, MAP-05, MAP-06, MAP-08, UIX-01  
**Success Criteria** (what must be TRUE):
  1. 用户在 `Leaflet` 地图上仍可完成点击、选中、查看 popup 摘要和进入 drawer 深度查看，不因换图引擎而退化主链路。
  2. 地图会同时渲染海外一级行政区图层与中国市级图层，并在视觉和交互上表现为同一套产品体验。
  3. 当前选中地点始终以完整行政区 GeoJSON 边界高亮呈现，而不是退回单点 marker 作为主表达。
  4. 用户切换选中对象、关闭 popup 或重开已有记录时，地图不会残留旧高亮，也不会出现双重选中状态。
**Plans**: TBD
**UI hint**: yes

### Phase 15: 服务端记录与点亮闭环
**Goal**: 用户的旅行记录与点亮动作都通过 `server` API 持久化，并在界面上即时同步状态变化  
**Depends on**: Phase 14  
**Requirements**: API-01, API-02, API-05, MAP-07, UIX-02, UIX-03, UIX-05  
**Success Criteria** (what must be TRUE):
  1. 用户的旅行记录读取、创建、更新、删除，以及点亮 / 取消点亮动作都通过 `server` API 持久化，并以 canonical `placeId` 作为目标身份。
  2. 地点标题右侧提供明确的“点亮 / 取消点亮”按钮，用户点击后能立即看到按钮文案、状态色和地图边界高亮同步变化。
  3. 当请求处于加载中、成功或失败时，popup、drawer、地图高亮与 API 返回状态保持一致，不会出现表面不同步。
  4. `v3.0` 新链路启动后，应用不再读取、迁移或保留旧 `localStorage` 旅行数据，也不再使用历史 seed 点位作为记录来源。
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:** 11 → 12 → 13 → 14 → 15

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 11. Monorepo 与契约基线 | 3/10 | In Progress|  |
| 12. Canonical 地点语义 | 0/TBD | Not started | - |
| 13. 行政区数据与几何交付 | 0/TBD | Not started | - |
| 14. Leaflet 地图主链路迁移 | 0/TBD | Not started | - |
| 15. 服务端记录与点亮闭环 | 0/TBD | Not started | - |
