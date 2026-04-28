# Project Research Summary

**Project:** 旅行世界地图
**Domain:** 旅行记录编辑、元数据扩展与单条删除
**Milestone:** v7.0
**Researched:** 2026-04-28
**Confidence:** HIGH

## Executive Summary

v7.0 的本质是在已有的多次旅行记录基座（v6.0）之上，补齐"记录可编辑、可附加元数据、可单条删除"的闭环。经过代码库分析，**现有技术栈已完全覆盖所需能力，无需引入新依赖**。核心工作在于 Prisma schema 扩展（2 个字段）、2 个新 API 端点（PATCH + DELETE）、3 个新前端组件（表单 + 弹窗 + 标签输入），以及现有组件适配。

最大风险不在功能实现本身，而在三个结构性断层：删除语义从 placeId 级到 recordId 级的降级、日期编辑触发唯一约束冲突、以及编辑/删除后统计缓存未刷新导致的数据不一致。路线图应先锁定数据层（contracts + prisma + backend），再处理前端 store 乐观更新，最后接 UI 组件。

## Key Findings

### Recommended Stack

**无需新增任何依赖**。v7.0 所有功能均可通过现有技术栈实现。

**Core technologies (unchanged):**
- `Vue 3 + Pinia + Tailwind v4`：前端与 UI 基线，已有 TripDateForm 表单模式可复用。
- `NestJS 11 + Fastify 5`：后端框架，新增 PATCH/DELETE 端点。
- `Prisma 6 + PostgreSQL`：Schema 扩展 `notes`（String?）和 `tags`（String[]），PostgreSQL 原生数组支持。
- `class-validator + class-transformer`：DTO 验证，扩展到新字段。

**Critical stack decisions:**
- 使用 PostgreSQL 数组存储标签，不引入独立 Tag 模型/表——场景简单，无需多表关联。
- PATCH 语义而非 PUT——部分更新场景更灵活，place 字段不可编辑。
- 确认弹窗自行实现，不引入 Headless UI 等外部库——保持项目轻量。
- 备注只支持纯文本，不引入 TipTap/Quill 等富文本编辑器。

### Expected Features

v7.0 的 table stakes 是"编辑日期 + 备注标签 + 单条删除 + 确认机制"闭环。

**Must have (table stakes):**
- 编辑旅行日期（修改已有记录的开始/结束日期）。
- 添加备注（纯文本，最大 1000 字符）。
- 添加标签（字符串数组，最多 10 个，每个最长 20 字符）。
- 单条记录删除（通过 recordId，非 placeId 级清除）。
- 删除前确认弹窗（无撤销历史）。
- 编辑/删除后时间轴自动重排序。
- 编辑/删除后统计自动刷新。

**Should have (competitive):**
- 删除时检查：如果该地点只剩最后一条记录，提示将取消点亮。
- 编辑表单本地去重检查：对比同 placeId 其他记录，避免日期冲突。

**Defer (v2+):**
- 编辑历史/撤销栈（PROJECT.md 已决策不做）。
- 地点修改（placeId/boundaryId 不可变更）。
- 富文本备注、Markdown 渲染。
- 独立 Tag 模型（标签云、标签管理页）。

### Architecture Approach

架构上应保持现有数据流不变，只在各层增量扩展：Prisma schema 添加字段 → contracts 更新接口 → 后端新增端点 → 前端 API 函数 → store 新增方法 → UI 组件。

**Major components:**
1. **Data layer**: Prisma schema 扩展 `notes` + `tags`，contracts 更新 `TravelRecord` 接口并新增 `UpdateTravelRecordRequest`。
2. **Backend API**: `PATCH /records/:id`（更新单条）、`DELETE /records/record/:id`（删除单条），保留现有 `DELETE /records/:placeId`（地点级清除）。
3. **Frontend store**: `updateRecord` 和 `deleteSingleRecord` 方法，遵循现有乐观更新模式（snapshot → optimistic → rollback on failure）。
4. **Frontend UI**: `ConfirmDialog`（通用确认弹窗）、`TimelineEditForm`（时间轴编辑表单）、`TagInput`（标签输入组件）。

**Key design decisions:**
- PATCH 响应返回完整 TravelRecord（含 updatedAt），支持乐观更新冲突检测。
- 删除端点使用 `/records/record/:id` 路径，避免与现有 `/records/:placeId` 冲突。
- 编辑/删除后显式调用 `statsStore.fetchStatsData()` 刷新统计。
- `travelRecords` 更新必须用 immutable 模式（`.map()` 替换），触发 shallowRef computed 重算。

### Critical Pitfalls

1. **删除语义断裂**: 现有 `deleteTravelRecordByPlaceId` 删除该地点所有记录，v7.0 需要单条删除。必须新增独立端点和前端方法，保留旧端点兼容。
2. **日期编辑触发唯一约束冲突**: `@@unique([userId, placeId, startDate, endDate])` 在日期编辑时可能冲突。后端需 catch Prisma P2002 转为 409，前端需本地去重检查。
3. **编辑后时间轴不重排序**: Vue `shallowRef` 对数组内部元素修改不敏感。编辑成功后必须用 `.map()` 替换触发 computed 重算。
4. **编辑/删除后统计缓存未刷新**: 现有流程中 mutation 完成后不会自动触发统计刷新。需在 edit/delete 成功回调中显式调用 `fetchStatsData()`。
5. **乐观更新回滚不一致**: 编辑操作的回滚需恢复原记录所有字段，使用 `previousRecords` 快照，与现有 `unilluminate` 模式一致。

## Implications for Roadmap

基于研究，建议把 v7.0 切成 4 个 phase，按数据流自底向上构建。

### Phase 1: Data Layer (contracts + prisma + backend)
**Rationale:** 没有 schema 和 API，前端无法开发。
**Delivers:** Prisma migration（notes + tags）、contracts 更新、DTO、repository、service、controller（PATCH + DELETE）。
**Addresses:** 编辑旅行日期、添加备注/标签、单条删除的后端能力。
**Avoids:** 前端先行导致类型不匹配、接口设计返工。

### Phase 2: Frontend API + Store
**Rationale:** 数据层就绪后，前端需要 API 函数和 store 方法才能接 UI。
**Delivers:** `updateTravelRecord`、`deleteTravelRecordById` API 函数、store 的 `updateRecord`、`deleteSingleRecord` 方法、乐观更新逻辑。
**Addresses:** 前端数据流闭环，为 UI 组件提供稳定接口。
**Avoids:** UI 组件直接调用原始 fetch、乐观更新逻辑散落在组件中。

### Phase 3: Timeline Edit/Delete UI
**Rationale:** 时间轴是编辑/删除的主入口，先闭环核心交互。
**Delivers:** `ConfirmDialog` 组件、`TimelineEditForm` 组件、`TimelineVisitCard` 适配（添加编辑/删除按钮）。
**Addresses:** 用户可在时间轴页面编辑日期/备注/标签、删除单条记录。
**Avoids:** 地图 popup 复杂度干扰核心编辑体验。

### Phase 4: Map Popup Edit & Integration
**Rationale:** 地图 popup 编辑是增量能力，时间轴闭环后再做。
**Delivers:** `PointSummaryCard` 添加"编辑记录"按钮、`MapContextPopup` 透传、`travelRecordRevision` 更新、E2E 验证。
**Addresses:** 地图 popup 内可编辑日期、编辑/删除后统计自动刷新。
**Avoids:** popup 编辑与时间轴编辑同时开发导致交互冲突。

### Phase Ordering Rationale

- Phase 1 必须先于所有 phase，因为 schema 和 API 是前端的前提。
- Phase 2 紧接 Phase 1，store 是 UI 和 API 的桥梁。
- Phase 3 先于 Phase 4，时间轴是编辑/删除的主场景，popup 是增量。
- Phase 4 最后做，确保核心闭环稳定后再扩展入口。

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** 需要细化 TimelineEditForm 的交互设计——是内联展开还是模态弹窗？标签输入是逗号分隔还是 pill-chip？
- **Phase 4:** 需要确认 popup 编辑的范围——只编辑日期还是也包含备注/标签？

Phases with standard patterns (skip research-phase):
- **Phase 1:** Prisma migration + NestJS controller/service/repository 模式成熟。
- **Phase 2:** 前端 API 函数 + Pinia store 乐观更新模式已在 v5.0/v6.0 验证。

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | 无需新依赖，现有栈完全覆盖，技术路径清晰。 |
| Features | HIGH | 需求明确，v6.0 已验证多次旅行记录模型，v7.0 是增量扩展。 |
| Architecture | HIGH | 与当前代码结构高度一致，组件边界和构建顺序清楚。 |
| Pitfalls | HIGH | 风险点已被当前代码状态与 Prisma/Vue 机制交叉验证。 |

**Overall confidence:** HIGH

### Gaps to Address

- **编辑表单交互细节**: TimelineEditForm 是内联展开还是模态弹窗？需要产品决策。
- **标签输入组件设计**: TagInput 是逗号分隔文本输入还是 pill-chip 输入？需要 UI 决策。
- **日期冲突的用户提示文案**: 409 Conflict 返回后前端如何展示？需要文案设计。
- **删除最后一条记录的提示逻辑**: 如果地点只剩最后一条记录，提示"将取消点亮"还是"将删除该地点所有记录"？

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — v7.0 技术栈分析
- `.planning/research/ARCHITECTURE.md` — v7.0 架构设计
- `.planning/research/PITFALLS.md` — v7.0 领域陷阱
- `apps/server/prisma/schema.prisma` — UserTravelRecord 模型与唯一约束
- `apps/server/src/modules/records/records.controller.ts` — 现有端点
- `apps/server/src/modules/records/records.service.ts` — 数据映射与业务逻辑
- `apps/server/src/modules/records/records.repository.ts` — 数据访问层
- `packages/contracts/src/records.ts` — TravelRecord 接口
- `apps/web/src/services/api/records.ts` — 前端 API 函数
- `apps/web/src/stores/map-points.ts` — 前端 store 与乐观更新模式
- `apps/web/src/stores/stats.ts` — 统计刷新机制
- `apps/web/src/components/timeline/TimelineVisitCard.vue` — 时间轴卡片
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — 地图弹窗
- `apps/web/src/components/map-popup/TripDateForm.vue` — 日期表单模式
- `apps/web/src/services/timeline.ts` — 时间轴排序逻辑

### Secondary (MEDIUM confidence)
- Prisma composite unique constraints documentation
- Vue 3 shallowRef reactivity documentation

---
*Research completed: 2026-04-28*
*Ready for roadmap: yes*
