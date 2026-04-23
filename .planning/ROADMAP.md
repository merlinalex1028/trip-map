# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档
- ✅ **v2.0 城市主视角与可爱风格重构** — Phases 7-10，已于 2026-03-27 归档
- ✅ **v3.0 全栈化与行政区地图重构** — Phases 11-18，已于 2026-04-03 归档（[详情](milestones/v3.0-ROADMAP.md)）
- ✅ **v4.0 Kawaii UI 重构 & Tailwind 集成** — Phases 19-22，已于 2026-04-10 归档（[详情](milestones/v4.0-ROADMAP.md)）
- ✅ **v5.0 账号体系与云同步基础版** — Phases 23-26，已于 2026-04-17 归档（[详情](milestones/v5.0-ROADMAP.md)）
- ◆ **v6.0 旅行统计、时间轴与海外覆盖增强版** — Phases 27-30，执行中（Phase 27-29 已完成，Phase 30 待人工验收）

## Current Milestone: v6.0 旅行统计、时间轴与海外覆盖增强版

**Milestone:** v6.0  
**Phases:** 27-30  
**Requirements:** 10

## Overview

v6.0 让产品从"一个地点是否去过"的单次点亮模型，升级为"同一地点去过几次、分别什么时候去过、整体旅行完成度如何"的旅行历史模型。本 milestone 会先完成多次旅行记录的数据基座，再扩展海外覆盖、补上从用户名面板进入的独立时间轴页面，并在此基础上提供国家/地区完成度与基础旅行统计。

默认产品边界是：本轮先闭环"新增旅行记录、按时间展示、按记录统计"，不把单条旅行记录的编辑 / 局部删除工作流一起做完；地图上的取消点亮仍维持地点级清理语义。

## Phases

- [x] **Phase 27: Multi-Visit Record Foundation** - 把账号旅行记录从"每地点一条"升级为"每次旅行一条"，引入旅行日期并保住现有地图点亮主链路 (completed 2026-04-20)
- [x] **Phase 28: Overseas Coverage Expansion** - 把 authoritative overseas support catalog 扩展到更广的优先国家/地区，并让扩展后的记录在历史与统计视图中保持一致 (completed 2026-04-22)
- [x] **Phase 29: Timeline Page & Account Entry** - 在用户名面板增加时间轴入口，并交付独立的个人旅行时间轴页面 (completed 2026-04-23)
- [ ] **Phase 30: Travel Statistics & Completion Overview** - 基于多次旅行记录与扩展后的覆盖范围，交付基础旅行统计与国家/地区完成度 (human-needed, awaiting UAT)

## Phase Overview

| # | Phase | Status | Requirements | Depends on |
|---|-------|--------|--------------|------------|
| 27 | Multi-Visit Record Foundation | Complete | TRIP-01, TRIP-02, TRIP-03 | Phase 26 |
| 28 | Overseas Coverage Expansion | Complete | GEOX-01, GEOX-02 | Phase 27 |
| 29 | Timeline Page & Account Entry | Complete | TRIP-04, TRIP-05 | Phase 27, Phase 28 |
| 30 | Travel Statistics & Completion Overview | Human Needed | STAT-01, STAT-02, STAT-03 | Phase 27, Phase 28, Phase 29 |

## Phase Details

### Phase 27: Multi-Visit Record Foundation
**Goal:** 用户可以为同一地点保存多次带旅行日期的记录，同时保持现有账号同步、bootstrap 恢复和地图点亮主链路稳定。
**Depends on:** Phase 26
**Requirements:** TRIP-01, TRIP-02, TRIP-03
**Plans:** 6/6 plans complete
**Success Criteria** (what must be TRUE):
1. 用户在点亮地点时可以输入或选择旅行日期，并成功保存到当前账号。
2. 同一地点可以保存多次旅行记录，后一次保存不会覆盖前一次旅行历史。
3. 刷新页面、重开应用和跨设备恢复后，旅行日期与同地点多次记录都会稳定恢复。
4. 地图仍能基于"该地点至少存在一条旅行记录"保持已去过状态，不会因多次记录模型而失去点亮表达。
**UI hint:** yes

Plans:
- [x] 27-01-PLAN.md — Contracts + Prisma schema 多次记录模型 + 日期字段（Wave 0，含 [BLOCKING] db push）
- [x] 27-02-PLAN.md — 后端 RecordsRepository/Service + DTO 日期校验 + AuthService.bootstrap 同步（Wave 1）
- [x] 27-03-PLAN.md — map-points store 多条记录重构 + legacy-point-storage 迁移输出日期未知（Wave 2）
- [x] 27-04-PLAN.md — TripDateForm + PointSummaryCard 摘要 + LeafletMapStage 贯通 + 人工验证（Wave 3，含 checkpoint）
- [x] 27-05-PLAN.md — [gap-closure] LeafletMapStage latestTripLabel 改按旅行日期排序 + 回归测试（Wave 4，关闭 VERIFICATION blocker）
- [x] 27-06-PLAN.md — [gap-closure] DTO implements 共享契约 + importTravel 日期校验共享 + UserTravelRecord 四元组 @@unique（Wave 4，关闭 PARTIAL + warnings）

### Phase 28: Overseas Coverage Expansion
**Goal:** 用户可以在更广的优先海外国家/地区上稳定识别并保存旅行记录，且扩展后的 metadata 能被时间轴和统计视图复用。
**Depends on:** Phase 27
**Requirements:** GEOX-01, GEOX-02
**Plans:** 7/7 plans complete
**Verification:** passed (`.planning/phases/28-overseas-coverage-expansion/28-VERIFICATION.md`)
**Success Criteria** (what must be TRUE):
1. 一组新增的优先海外国家/地区可以稳定 resolve 到可保存的 authoritative admin1 记录。
2. 扩展后的海外记录在地图、bootstrap 恢复和跨设备读取时都保持一致的标题、类型标签和归类信息。
3. 时间轴与统计消费这些海外记录时，不需要临时兜底推导文案或归类。
**UI hint:** yes

Plans:
- [x] 28-01-PLAN.md — 拆分 overseas build-time authoring、锁定 21 国支持矩阵并生成 v3 geometry manifest / supported-country summary
- [x] 28-02-PLAN.md — server authoritative guard、metadata backfill 与新增国家/旧标签拒绝回归
- [x] 28-03-PLAN.md — unsupported-country copy 切到 generated summary，并更新 contracts/web consumer compatibility tests
- [x] 28-04-PLAN.md — [gap-closure] 修复 canonical `datasetVersion` / geometry version split-brain，并恢复历史 fixtures baseline
- [x] 28-05-PLAN.md — [gap-closure] 扩展 `userTravelRecord` backfill，并补旧记录经 bootstrap / sync 回放的迁移 e2e
- [x] 28-06-PLAN.md — [gap-closure] 修复 overseas identity collision，给 build 产物与 canonical lookup 增加 fail-fast 唯一性守卫，并补 Washington/DC 与 Buenos Aires resolve/save regression
- [x] 28-07-PLAN.md — [gap-closure] 将 metadata backfill 改为 `updateMany()` + skipped summary，并锁定 backfill/bootstrap/sync 组合回归

### Phase 29: Timeline Page & Account Entry
**Goal:** 用户可以从用户名面板进入一个独立的旅行时间轴页面，按时间顺序浏览自己的旅行历史。
**Depends on:** Phase 27, Phase 28
**Requirements:** TRIP-04, TRIP-05
**Plans:** 4/4 plans complete
**Verification:** 自动化验证通过，人工验收于 2026-04-23 批准
**Success Criteria** (what must be TRUE):
1. 点击用户名后展开的面板中存在清晰的"时间轴"入口按钮。
2. 用户可以从该入口进入独立页面，而不是在地图主舞台中以内联模块打开时间轴。
3. 时间轴页面按旅行时间稳定展示个人旅行记录，并能区分同一地点的多次去访。
**UI hint:** yes

### Phase 30: Travel Statistics & Completion Overview
**Goal:** 用户可以基于自己的旅行历史看到基础旅行统计与国家/地区完成度，并正确区分总旅行次数与唯一地点完成度。
**Depends on:** Phase 27, Phase 28, Phase 29
**Requirements:** STAT-01, STAT-02, STAT-03
**Plans:** 5/5 plans complete
**Verification:** automated verification passed; waiting for human UAT (`.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md`, `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md`)
**Success Criteria** (what must be TRUE):
1. 用户可以看到总旅行次数、已去过地点数和已去过国家/地区数等基础统计。
2. 用户可以看到国家/地区完成度，且完成度口径与当前支持覆盖范围保持一致。
3. 当同一地点存在多次旅行记录时，统计会正确累加旅行次数，但不会错误放大唯一地点数或完成度。
**UI hint:** yes

Plans:
- [x] 30-01-PLAN.md — 合约 + 后端 GET /records/stats 端点 + service 测试
- [x] 30-02-PLAN.md — 前端 API/store/StatCard/StatisticsPageView
- [x] 30-03-PLAN.md — 路由注册 + 账号面板导航按钮
- [x] 30-04-PLAN.md — [gap-closure] 扩展 TravelStatsResponse 含 visitedCountries + totalSupportedCountries，后端国家聚合 + 去重测试
- [x] 30-05-PLAN.md — [gap-closure] 前端三指标 StatCard 布局 + mock 数据更新 + 去重验证测试

## Progress Table

| Phase | Status | Requirements | Next Step |
|-------|--------|--------------|-----------|
| 27. Multi-Visit Record Foundation | Complete | TRIP-01, TRIP-02, TRIP-03 | Phase 28 |
| 28. Overseas Coverage Expansion | Complete | GEOX-01, GEOX-02 | Phase 29 |
| 29. Timeline Page & Account Entry | Complete | TRIP-04, TRIP-05 | Phase 30 |
| 30. Travel Statistics & Completion Overview | Human Needed | STAT-01, STAT-02, STAT-03 | Complete 30-HUMAN-UAT and approve Phase 30 |

## Current Status

Phase 30 的 5 个计划都已执行完成，基础统计链路现已扩展为 `totalTrips + uniquePlaces + visitedCountries + totalSupportedCountries`，自动化验证得分 `15/15`，当前状态为 `human_needed`。剩余动作是完成 `30-HUMAN-UAT.md` 中两项人工验收：真实浏览器中的统计页可读性，以及部署环境下 `/statistics`、`/timeline` 的 deep-link / refresh 验收。

---
*Last updated: 2026-04-23 — Phase 30 awaiting human UAT*
