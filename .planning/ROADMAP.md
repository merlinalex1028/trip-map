# Roadmap: 旅行世界地图

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6，已于 2026-03-24 归档
- ✅ **v2.0 城市主视角与可爱风格重构** — Phases 7-10，已于 2026-03-27 归档
- ✅ **v3.0 全栈化与行政区地图重构** — Phases 11-18，已于 2026-04-03 归档（[详情](milestones/v3.0-ROADMAP.md)）
- ✅ **v4.0 Kawaii UI 重构 & Tailwind 集成** — Phases 19-22，已于 2026-04-10 归档（[详情](milestones/v4.0-ROADMAP.md)）
- ✅ **v5.0 账号体系与云同步基础版** — Phases 23-26，已于 2026-04-17 归档（[详情](milestones/v5.0-ROADMAP.md)）
- ◆ **v6.0 旅行统计、时间轴与海外覆盖增强版** — Phases 27-35，收口中（2026-04-28 审计后新增 Phase 33-35 关闭文档同步、Nyquist 验证与测试固件 debt）

## Current Milestone: v6.0 旅行统计、时间轴与海外覆盖增强版

**Milestone:** v6.0  
**Phases:** 27-35  
**Requirements:** 10

## Overview

v6.0 让产品从"一个地点是否去过"的单次点亮模型，升级为"同一地点去过几次、分别什么时候去过、整体旅行完成度如何"的旅行历史模型。本 milestone 会先完成多次旅行记录的数据基座，再扩展海外覆盖、补上从用户名面板进入的独立时间轴页面，并在此基础上提供国家/地区完成度与基础旅行统计。

默认产品边界是：本轮先闭环"新增旅行记录、按时间展示、按记录统计"，不把单条旅行记录的编辑 / 局部删除工作流一起做完；地图上的取消点亮仍维持地点级清理语义。

## Phases

- [x] **Phase 27: Multi-Visit Record Foundation** - 把账号旅行记录从"每地点一条"升级为"每次旅行一条"，引入旅行日期并保住现有地图点亮主链路 (completed 2026-04-20)
- [x] **Phase 28: Overseas Coverage Expansion** - 把 authoritative overseas support catalog 扩展到更广的优先国家/地区，并让扩展后的记录在历史与统计视图中保持一致 (completed 2026-04-22)
- [x] **Phase 29: Timeline Page & Account Entry** - 在用户名面板增加时间轴入口，并交付独立的个人旅行时间轴页面（已由 Phase 32 收口完成）
- [x] **Phase 30: Travel Statistics & Completion Overview** - 基于多次旅行记录与扩展后的覆盖范围，交付基础旅行统计与国家/地区完成度（已由 Phase 32 收口完成）
- [x] **Phase 31: Statistics Sync Refresh Hardening** - 修复 authoritative metadata 刷新后 statistics 可能滞后的问题，确保统计与时间轴保持一致 (completed 2026-04-27)
- [x] **Phase 32: Route Deep-Link & Acceptance Closure** - 收口 `/timeline` 与 `/statistics` 的 deep-link / refresh 闭环，并完成 Timeline / Statistics 的人工验收与文档对齐 (completed 2026-04-28)
- [x] **Phase 33: Documentation Cleanup** - 补全 Phase 32 VERIFICATION.md、同步 REQUIREMENTS.md 追踪表、更新 Phase 29/30 VERIFICATION status (completed 2026-04-28)
- [ ] **Phase 34: Nyquist Validation Coverage** - 补全 Phase 27/29/30/32 Nyquist 验证策略
- [ ] **Phase 35: Test Fixture Alignment** - Server mock 引用权威 TOTAL_SUPPORTED_TRAVEL_COUNTRIES 常量

## Phase Overview

| # | Phase | Status | Requirements | Depends on |
|---|-------|--------|--------------|------------|
| 27 | Multi-Visit Record Foundation | Complete | TRIP-01, TRIP-02, TRIP-03 | Phase 26 |
| 28 | Overseas Coverage Expansion | Complete | GEOX-01, GEOX-02 | Phase 27 |
| 29 | Timeline Page & Account Entry | Gap Closure Pending | TRIP-04, TRIP-05 | Phase 27, Phase 28 |
| 30 | Travel Statistics & Completion Overview | Gap Closure Pending | STAT-01, STAT-02, STAT-03 | Phase 27, Phase 28, Phase 29 |
| 31 | Statistics Sync Refresh Hardening | Complete | STAT-03 | Phase 28, Phase 30 |
| 32 | Route Deep-Link & Acceptance Closure | Executing | TRIP-04, TRIP-05, STAT-01, STAT-02 | Phase 29, Phase 30, Phase 31 |
| 33 | Documentation Cleanup | 1/1 | Complete   | 2026-04-28 |
| 34 | Nyquist Validation Coverage | Planned | — (tech debt) | Phase 27, Phase 29, Phase 30, Phase 32 |
| 35 | Test Fixture Alignment | Planned | — (tech debt) | Phase 30 |

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
**Verification:** milestone audit reopened (`.planning/milestones/v6.0-MILESTONE-AUDIT.md`)；剩余 human UAT / route-doc drift 在 Phase 32 收口
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
**Verification:** automated verification passed, but milestone audit found follow-up gaps; Phase 31 关闭 statistics refresh gap，Phase 32 收口 deploy deep-link / human UAT (`.planning/phases/30-travel-statistics-and-completion-overview/30-VERIFICATION.md`, `.planning/phases/30-travel-statistics-and-completion-overview/30-HUMAN-UAT.md`, `.planning/milestones/v6.0-MILESTONE-AUDIT.md`)
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

### Phase 31: Statistics Sync Refresh Hardening
**Goal:** authoritative metadata 经 bootstrap / same-user sync 刷新后，统计页会稳定重拉并与时间轴保持一致，不再出现国家数 / 完成度滞后。
**Depends on:** Phase 28, Phase 30
**Requirements:** STAT-03
**Gap Closure:** closes audit integration gap `Phase 28 metadata backfill / same-user sync -> Phase 30 statistics refresh`，并补上 `Overseas metadata -> bootstrap/sync -> statistics completion` flow gap；同时支撑 `STAT-01` / `STAT-02` 的一致性收口。
**Plans:** 1/1 plans complete
**Success Criteria** (what must be TRUE):
1. metadata-only authoritative refresh 也会触发 statistics 重新获取或重新计算，不需要整页刷新。
2. timeline 与 statistics 对同一份 overseas metadata / country completion 始终一致。
3. 回归测试覆盖 bootstrap、same-user sync 和 completion 指标不滞后的场景。
**UI hint:** yes

Plans:
- [x] 31-01-PLAN.md — Statistics page metadata-aware refresh trigger + route/auth regressions

### Phase 32: Route Deep-Link & Acceptance Closure
**Goal:** `/timeline` 与 `/statistics` 的路由在目标部署环境可直达 / 刷新，同时 Timeline / Statistics 的人工验收与规划文档状态完成闭环。
**Depends on:** Phase 29, Phase 30, Phase 31
**Requirements:** TRIP-04, TRIP-05, STAT-01, STAT-02
**Gap Closure:** closes audit integration gap `Vue Router createWebHistory -> production hosting deep-link / refresh`，并收口 Phase 29 / Phase 30 的 human-needed 验收、`#/timeline` 文档漂移与 roadmap 状态不一致问题。
**Plans:** 3/3 plans complete
**Success Criteria** (what must be TRUE):
1. `/timeline` 与 `/statistics` 在目标部署方式下 direct-open / refresh 不返回 404。（✅ Plan 32-02 SPA fallback 配置完成）
2. Timeline / Statistics 的真实浏览器与移动/桌面验收完成，并写回对应 HUMAN-UAT / VERIFICATION / ROADMAP。（✅ Plan 32-03 文档对齐 + 人工 UAT 完成）
3. `ROADMAP.md`、HUMAN-UAT 与运行时路由写法一致，不再出现 `#/timeline` 这类漂移。（✅ 5 个文档已清理）
**UI hint:** yes

Plans:
- [x] 32-01-PLAN.md — Router auth guard + test coverage (Wave 1)
- [x] 32-02-PLAN.md — Deploy fallback configuration (Wave 1, checkpoint: deploy verify)
- [x] 32-03-PLAN.md — Documentation alignment & human UAT (Wave 2, depends on 32-01, checkpoint: human UAT)

### Phase 33: Documentation Cleanup
**Goal:** 补全 Phase 32 VERIFICATION.md，同步 REQUIREMENTS.md 追踪表（TRIP-04/05/STAT-01/02 → Complete），更新 Phase 29/30 VERIFICATION.md frontmatter status（human_needed → passed）。
**Depends on:** Phase 32
**Requirements:** — (tech debt closure)
**Gap Closure:** closes v6.0-MILESTONE-AUDIT.md documentation tech debt items
**Plans:** 1/1 plans complete
**Success Criteria** (what must be TRUE):
1. 32-VERIFICATION.md 存在，包含 router guard / SPA fallback / 文档对齐的验证证据。
2. REQUIREMENTS.md 追踪表所有 Phase 32 需求标记为 Complete。
3. Phase 29/30 VERIFICATION.md frontmatter status 同步为 passed。
**UI hint:** no

Plans:
- [x] 33-01-PLAN.md — 创建 32-VERIFICATION.md + 修复 29/30 VERIFICATION.md 正文状态

### Phase 34: Nyquist Validation Coverage
**Goal:** 补全 Phase 27/29/30/32 的 Nyquist 验证策略，使其 nyquist_compliant + wave_0_complete。
**Depends on:** Phase 27, Phase 29, Phase 30, Phase 32
**Requirements:** — (tech debt closure)
**Gap Closure:** closes v6.0-MILESTONE-AUDIT.md nyquist validation tech debt items
**Success Criteria** (what must be TRUE):
1. 27-VALIDATION.md: nyquist_compliant=true, wave_0_complete=true
2. 29-VALIDATION.md: nyquist_compliant=true, wave_0_complete=true
3. 30-VALIDATION.md: nyquist_compliant=true, wave_0_complete=true
4. 32-VALIDATION.md: nyquist_compliant=true, wave_0_complete=true
**UI hint:** no

### Phase 35: Test Fixture Alignment
**Goal:** Server test mock 使用权威常量而非硬编码 `21`，消除 fixture / production 口径不一致风险。
**Depends on:** Phase 30
**Requirements:** — (tech debt closure)
**Gap Closure:** closes v6.0-MILESTONE-AUDIT.md test fixture tech debt item
**Success Criteria** (what must be TRUE):
1. Server stats test mock 改为从 TOTAL_SUPPORTED_TRAVEL_COUNTRIES 导入或计算，不再硬编码数字。
**UI hint:** no

## Progress Table

| Phase | Status | Requirements | Next Step |
|-------|--------|--------------|-----------|
| 27. Multi-Visit Record Foundation | Complete | TRIP-01, TRIP-02, TRIP-03 | Phase 28 |
| 28. Overseas Coverage Expansion | Complete | GEOX-01, GEOX-02 | Phase 29 |
| 29. Timeline Page & Account Entry | Complete | TRIP-04, TRIP-05 | Closed by Phase 32 doc alignment |
| 30. Travel Statistics & Completion Overview | Complete | STAT-01, STAT-02, STAT-03 | Closed by Phase 32 deploy fallback + doc alignment |
| 31. Statistics Sync Refresh Hardening | Complete | STAT-03 | Phase 32 |
| 32. Route Deep-Link & Acceptance Closure | Complete | TRIP-04, TRIP-05, STAT-01, STAT-02 | Phase 33 (doc cleanup) |
| 33. Documentation Cleanup | Planned | — (tech debt) | Phase 34 |
| 34. Nyquist Validation Coverage | Planned | — (tech debt) | Phase 35 |
| 35. Test Fixture Alignment | Planned | — (tech debt) | Milestone complete |

## Current Status

2026-04-28 的 milestone audit 认定 v6.0 全部 9 项需求已交付，5/5 E2E 流程完成，无关键阻塞。剩余 8 项技术债务（3 文档同步 + 4 Nyquist 验证 + 1 测试固件），已规划 Phase 33-35 逐项关闭。

---
*Last updated: 2026-04-28 — gap closure phases 33-35 added after milestone re-audit*
