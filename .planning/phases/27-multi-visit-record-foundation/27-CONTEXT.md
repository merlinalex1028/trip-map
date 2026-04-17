# Phase 27: Multi-Visit Record Foundation - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

把账号旅行记录从“每地点一条存在性记录”升级为“每次旅行一条历史记录”，为每条新记录引入按天填写的旅行起止日期，同时保持地图主舞台仍按“该地点至少存在一条旅行记录”来表达已去过状态，并继续兼容 bootstrap 恢复、跨设备同步和首次登录本地导入主链路。

</domain>

<decisions>
## Implementation Decisions

### 旅行日期模型
- **D-01:** 新增旅行记录时，用户必须先填写旅行日期后才能保存。
- **D-02:** 旅行日期精度固定到天，使用 `YYYY-MM-DD`。
- **D-03:** 每条旅行记录支持开始日期和可选结束日期；未填写结束日期时表示单日旅行；若填写结束日期，则必须满足 `结束日期 >= 开始日期`。

### 地图 Popup 多次记录入口
- **D-04:** 对于已点亮地点，“再记一次旅行”仍在当前地图 popup 内完成，不跳到其他页面，也不额外弹出独立对话框。
- **D-05:** 已点亮地点的 popup 默认展示轻量摘要：`已去过 N 次 + 最近一次日期/日期范围`。
- **D-06:** 地图上的“取消点亮”继续保持地点级清理语义，不细化到单条旅行记录删除；当一个地点的所有旅行记录都被清除后，该地点才变为未点亮。

### 历史旧记录迁移
- **D-07:** v6 之前的旧地点记录在迁移后，每个地点转换为 1 条历史旅行记录，而不是拆分或推测多次历史去访。
- **D-08:** 旧记录迁移后的旅行日期统一标记为“未知”，不能用旧 record 的 `createdAt` 近似伪装成真实旅行日期。
- **D-09:** 首次登录时导入的本地旧记录与账号里已有旧记录遵循同一迁移口径，保持数据语义一致。

### the agent's Discretion
- 具体的日期输入控件形态与表单展开动画，由规划和实现阶段结合现有 Kawaii popup 视觉系统决定。
- “日期未知”在数据层的具体表示方式由规划阶段决定，可为 nullable start/end date、显式状态字段或等价方案，但对产品语义必须统一为“未知而非推测”。
- 多次旅行记录落地后，前端是直接持有多条 trip 记录，还是在 store 内额外维护 place 级聚合视图，由规划阶段根据现有 `placeId` 主链路兼容成本决定。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope & Product Boundary
- `.planning/ROADMAP.md` — `Phase 27: Multi-Visit Record Foundation` 的目标、成功标准，以及 v6 默认边界中“取消点亮仍维持地点级清理语义”的约束。
- `.planning/PROJECT.md` — v6.0 milestone 定位、当前产品状态，以及 “多次去访 + 旅行日期” 作为本轮基础模型升级的关键决策。

### Requirements
- `.planning/REQUIREMENTS.md` — `TRIP-01`、`TRIP-02`、`TRIP-03` 的正式 requirement 定义与 v6 out-of-scope 约束。
- `.planning/STATE.md` — 当前项目处于 `ready_for_phase_planning`，Phase 27 尚未开始，实现时应承接 v5 已交付的账号/同步/overseas authoritative 基座。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — 现有地图 popup 主卡片与主 CTA，可承载“再记一次旅行”的 inline 表单与轻量摘要。
- `apps/web/src/components/map-popup/MapContextPopup.vue` — 已有 floating popup shell，可保持新增流程仍在地图主舞台内完成。
- `apps/web/src/stores/map-points.ts` — 当前 `travelRecords`、点亮状态推导、乐观写入与 authoritative snapshot 协调的前端真源。
- `apps/web/src/stores/auth-session.ts` — 负责 `/auth/bootstrap` 恢复、same-user refresh 与首次登录本地导入决策，Phase 27 需要保持这些入口的稳定性。
- `apps/web/src/services/legacy-point-storage.ts` — 本地旧记录归一化入口，后续需接入多次记录模型下的迁移逻辑。
- `apps/server/src/modules/records/records.repository.ts` — 当前 records create/import/delete 的持久化与去重逻辑集中点。
- `packages/contracts/src/records.ts` — web/server 共享的 `TravelRecord`、create/import request contract，Phase 27 的字段升级需要从这里统一扩散。

### Established Patterns
- `/auth/bootstrap` 返回当前账号 authoritative records snapshot，是前端恢复旅行记录的单一真源。
- 当前前端与后端都围绕 `placeId` 做存在性去重；多次去访升级后，仍必须保住 place-level illuminated UX，不允许因此破坏地图点亮表达。
- 前端对记录写入采用 optimistic update，再由服务端 authoritative 结果回填。
- 首次登录本地导入目前按“云端为准 / 导入本地”分流，Phase 27 需要保留这套边界，而不是引入第二套迁移路径。

### Integration Points
- `apps/server/prisma/schema.prisma` 中 `UserTravelRecord` 当前有 `@@unique([userId, placeId])`，这是多次去访模型的核心结构性约束。
- `apps/server/src/modules/records/dto/create-travel-record.dto.ts`、`apps/server/src/modules/records/records.service.ts` 与 `apps/server/src/modules/auth/auth.service.ts` 需要一起升级，让 create/import/bootstrap 全链路都携带新日期字段与未知日期旧记录。
- `apps/web/src/stores/map-points.ts` 当前对已点亮地点会直接复用单条记录，并在删除时按 `placeId` 全删；Phase 27 需要重构为“place 级 UI 表达 + trip 级数据底层”。
- `apps/web/src/components/LeafletMapStage.vue` 与 popup 交互流需要在不破坏 candidate-select / unsupported-overseas 流程的前提下加入 inline 日期录入。
- 代码库当前没有现成的日期输入组件或 date range 组件，Phase 27 需要在现有 Vue + Tailwind + popup 体系内补出一套轻量交互。

</code_context>

<specifics>
## Specific Ideas

- 一条旅行记录可以表示“单日旅行”或“带结束日期的日期范围”，而不是强制把一次旅行拆成多条记录。
- 已点亮地点的 popup 保持轻量，不直接展开历史列表；只展示次数与最近一次日期摘要，把详细浏览留给后续时间轴页面。
- 历史旧记录必须诚实标记为“日期未知”，让后续时间轴和统计在语义上区分“未知”与“真实日期”。
- “再记一次旅行”要延续当前地图主舞台的低跳转体验，优先在现有 popup 内闭环完成。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 27-multi-visit-record-foundation*
*Context gathered: 2026-04-17*
