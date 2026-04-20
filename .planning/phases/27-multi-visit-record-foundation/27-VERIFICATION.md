---
phase: 27-multi-visit-record-foundation
verified: 2026-04-20T10:41:57Z
status: passed
score: 11/11 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 10/11
  gaps_closed:
    - "已点亮地点的 popup 默认展示的“最近一次日期/范围”必须反映最近一次旅行，而不是最近一次录入"
    - "CreateTravelRecordRequest 的共享契约变更能直接约束到 CreateTravelRecordDto，避免日期字段在前后端间静默漂移"
  gaps_remaining: []
  regressions: []
---

# Phase 27: Multi-Visit Record Foundation 验证报告

**Phase Goal:** 用户可以为同一地点保存多次带旅行日期的记录，同时保持现有账号同步、bootstrap 恢复和地图点亮主链路稳定。  
**Verified:** 2026-04-20T10:41:57Z  
**Status:** passed  
**Re-verification:** 是，已覆盖 27-05 / 27-06 gap closure 后的最终状态

## 目标达成

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 共享 contracts 与构建产物都暴露 `startDate` / `endDate` nullable 日期字段 | ✓ VERIFIED | `packages/contracts/src/records.ts` 与 `packages/contracts/dist/records.d.ts` 都声明 `TravelRecord` / `CreateTravelRecordRequest` 的 `startDate: string \| null`、`endDate: string \| null`；`pnpm --filter @trip-map/contracts build` 退出码 0。 |
| 2 | Prisma 数据模型允许同一 `(userId, placeId)` 多条记录，并在生成后的 Prisma Client 中可见日期字段与四元组唯一键 | ✓ VERIFIED | `apps/server/prisma/schema.prisma` 为 `UserTravelRecord` 保留 `@@index([userId, placeId])`，并新增 `@@unique([userId, placeId, startDate, endDate])`；生成产物 `.prisma/client/index.d.ts` 暴露 `userId_placeId_startDate_endDate` compound unique input。 |
| 3 | `POST /records` 接受日期字段，并在 `endDate < startDate` 时拒绝请求 | ✓ VERIFIED | `CreateTravelRecordDto` 直接 `implements CreateTravelRecordRequest`，保留 `@Matches(/^\\d{4}-\\d{2}-\\d{2}$/)`；`RecordsService.createTravel()` 与 `importTravel()` 都调用 `assertValidDateRange()`；`records.service.spec.ts` 覆盖 create/import 两条拒绝路径。 |
| 4 | 同一地点可以保存多次旅行记录，后一次不会覆盖前一次 | ✓ VERIFIED | `RecordsRepository.createTravelRecord()` 使用 `prisma.userTravelRecord.create()` 而非 `upsert()`；`map-points.spec.ts` 验证同一地点两次 `illuminate()` 后保留两条真实记录。 |
| 5 | `/auth/bootstrap` 会返回日期字段，多次记录快照能被前端 restore/refresh 吃进去 | ✓ VERIFIED | `AuthService.bootstrap()` 返回 `records.map(toContractTravelRecord)` 并透传 `startDate/endDate`；`auth-session.ts` 在 restore/refresh 路径分别调用 `replaceTravelRecords()` / `applyAuthoritativeTravelRecords()`；`auth-bootstrap.e2e-spec.ts` 的真实 HTTP + Prisma 场景通过。 |
| 6 | 前端 store 以 trip-level 保存真实记录，同时保持地图 marker 按 place-level 去重 | ✓ VERIFIED | `map-points.ts` 通过 `tripsByPlaceId` 聚合同 place 全部记录，通过 `displayPoints` 仅保留每个 placeId 的最新一条 marker；相关 store spec 全绿。 |
| 7 | 旧本地记录迁移不会伪造旅行日期，而是显式落成未知日期 | ✓ VERIFIED | `legacy-point-storage.ts` 固定输出 `startDate: null`、`endDate: null`；`legacy-point-storage.spec.ts` 明确断言不会从 `createdAt` 推断日期。 |
| 8 | 未点亮地点必须先在 popup 内联表单中选择开始日期，日期 payload 会一路透传到 store/API | ✓ VERIFIED | `TripDateForm.vue` 要求开始日期、对反序区间禁用提交；`PointSummaryCard.vue` 点击“点亮”先展开表单；`MapContextPopup.vue` 与 `LeafletMapStage.vue` 透传 `{ startDate, endDate }` 到 `mapPointsStore.illuminate()`。 |
| 9 | 已点亮地点会显示次数摘要，并能在同一个 popup 内“再记一次去访” | ✓ VERIFIED | `PointSummaryCard.vue` 渲染 `已去过 N 次`、`最近一次` 和 `再记一次去访`；`LeafletMapStage.spec.ts` 验证从 `data-record-again` 展开表单后成功追加第二条记录。 |
| 10 | “最近一次日期/范围”摘要能正确反映最近一次旅行，而不是最近一次录入 | ✓ VERIFIED | `LeafletMapStage.vue` 的 `activePointLatestTripLabel` 只从 `startDate !== null` 的真实记录里按 `endDate ?? startDate` 降序选择；`LeafletMapStage.spec.ts` 回归用例证明较晚录入的 `2025-05-01 - 2025-05-05` 不会覆盖真正更晚旅行的 `2025-10-01`。 |
| 11 | 地图点亮主链路仍按“该地点至少存在一条记录”表达，地点级取消点亮语义保持当前 milestone 的已接受边界 | ✓ VERIFIED | `map-points.ts` 的 `isPlaceIlluminated()` 仍按 place-level 判断；`unilluminate()` 与后端 `DELETE /records/:placeId` 仍按 placeId 清空；`map-points.spec.ts` 覆盖“同地点多条记录时一次取消全部清除”，这与 ROADMAP 概述和 27-04 人工步骤 8 一致。 |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `packages/contracts/src/records.ts` | 共享 `TravelRecord` / `CreateTravelRecordRequest` 日期契约 | ✓ VERIFIED | source 中两类接口都显式包含 `startDate`、`endDate` |
| `packages/contracts/dist/records.d.ts` | contracts 构建产物已同步新字段 | ✓ VERIFIED | 本次复核重新执行 `pnpm --filter @trip-map/contracts build` 成功 |
| `apps/server/prisma/schema.prisma` | `UserTravelRecord` 日期字段、多次记录模型、四元组唯一约束 | ✓ VERIFIED | `startDate` / `endDate` 为 `String?`，并同时存在 `@@unique([userId, placeId, startDate, endDate])` 和 `@@index([userId, placeId])` |
| `node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/index.d.ts` | Prisma Client 已生成日期字段和 compound unique 类型 | ✓ VERIFIED | `startDate` / `endDate` 字段与 `userId_placeId_startDate_endDate` unique input 可见 |
| `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | DTO 直接绑定 shared contract | ✓ VERIFIED | `CreateTravelRecordDto implements CreateTravelRecordRequest`，日期字段为 required-nullable |
| `apps/server/src/modules/records/records.service.ts` | create/import 共用日期区间校验 helper | ✓ VERIFIED | `createTravel()` 与 `importTravel()` 都调用 `assertValidDateRange()` |
| `apps/server/src/modules/records/records.repository.ts` | trip-level create、三元组去重导入、DB 兜底配合 | ✓ VERIFIED | `create()`、`keyOf()`、`createMany({ skipDuplicates: true })` 与 place-level delete 均在位 |
| `apps/server/src/modules/auth/auth.service.ts` | bootstrap 返回 contract 记录含日期字段 | ✓ VERIFIED | `toContractTravelRecord()` 与 `bootstrap()` 都映射 `startDate/endDate` |
| `apps/web/src/stores/map-points.ts` | trip-level 真源、place-level marker 聚合、place-level unilluminate | ✓ VERIFIED | `tripsByPlaceId`、`displayPoints`、`applyAuthoritativeTravelRecords()`、`illuminate()`、`unilluminate()` 都与 Phase 27 设计一致 |
| `apps/web/src/services/legacy-point-storage.ts` | legacy 迁移输出未知日期 | ✓ VERIFIED | 规范化结果固定为 `null/null` |
| `apps/web/src/components/map-popup/TripDateForm.vue` | 内联日期表单与区间校验 | ✓ VERIFIED | 开始日期必填，结束日期可选，反序错误文案正确 |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | popup 摘要、再记一次 CTA、表单容器 | ✓ VERIFIED | 已点亮摘要与再记一次交互均存在 |
| `apps/web/src/components/map-popup/MapContextPopup.vue` | popup props/emits 透传 trip 数据 | ✓ VERIFIED | `tripCount`、`latestTripLabel`、`illuminate(payload)` 透传完整 |
| `apps/web/src/components/LeafletMapStage.vue` | 最新旅行摘要 selector 与 payload 透传 | ✓ VERIFIED | 27-05 的 selector 修复与 27-04 的 emit 链路都在位 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `packages/contracts/src/records.ts` | `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | `CreateTravelRecordDto implements CreateTravelRecordRequest` | ✓ WIRED | DTO 直接 implements shared contract，27-06 partial gap 已关闭 |
| `apps/server/prisma/schema.prisma` | generated Prisma Client | `prisma validate` + generated compound unique input | ✓ WIRED | Prisma schema 校验通过，生成 d.ts 暴露 `userId_placeId_startDate_endDate` |
| `apps/server/src/modules/records/records.controller.ts` | `apps/server/src/modules/records/records.service.ts` | `@Body(CreateTravelRecordDto)` -> `createTravel()` / `importTravel()` | ✓ WIRED | controller 明确把 DTO body 交给 service |
| `apps/server/src/modules/records/records.service.ts:createTravel` | `apps/server/src/modules/records/records.service.ts:importTravel` | 共享 `assertValidDateRange()` | ✓ WIRED | 两条路径复用同一 helper，27-06 warning 已关闭 |
| `apps/server/prisma/schema.prisma` | `apps/server/src/modules/records/records.repository.ts` | `@@unique(...)` 兜底 `createMany({ skipDuplicates: true })` | ✓ WIRED | repository 仍保留应用层 `keyOf()` 预查询，DB 层再以四元组唯一约束兜底 |
| `apps/server/src/modules/auth/auth.service.ts` | `apps/web/src/stores/auth-session.ts` | `/auth/bootstrap` -> `replaceTravelRecords()` / `applyAuthoritativeTravelRecords()` | ✓ WIRED | restore 与 same-user refresh 两条路径都消费 `bootstrap.records` |
| `apps/web/src/components/map-popup/TripDateForm.vue` | `apps/web/src/components/map-popup/PointSummaryCard.vue` | `emit('submit', { startDate, endDate })` | ✓ WIRED | 表单提交 payload 被 PointSummaryCard 接收并继续上抛 |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | `apps/web/src/components/map-popup/MapContextPopup.vue` | `illuminate(payload)` + `tripCount/latestTripLabel` props | ✓ WIRED | popup 层既透传 CTA 事件，也透传最新摘要展示所需 props |
| `apps/web/src/components/map-popup/MapContextPopup.vue` | `apps/web/src/components/LeafletMapStage.vue` | `@illuminate="handleIlluminate"` + `:latest-trip-label` binding | ✓ WIRED | `LeafletMapStage` 同时接住最新摘要与日期 payload |
| `apps/web/src/components/LeafletMapStage.vue` | `apps/web/src/stores/map-points.ts` | `mapPointsStore.illuminate({... startDate, endDate })` | ✓ WIRED | 27-04 的 UI payload 一直透传到 store / API |
| `apps/web/src/stores/map-points.ts:tripsByPlaceId` | `apps/web/src/components/LeafletMapStage.vue:activePointLatestTripLabel` | 按旅行日期选择最新 trip | ✓ WIRED | 27-05 的 selector 已从 `createdAt` 口径切换到 `endDate ?? startDate` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/auth/auth.service.ts` | `records` | `AuthRepository.findUserTravelRecordsByUserId()` -> Prisma `userTravelRecord` 查询 | Yes | ✓ FLOWING |
| `apps/web/src/stores/auth-session.ts` | `bootstrap.records` | `fetchAuthBootstrap()` 响应 | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `travelRecords` | `createTravelRecord()` 返回、`/auth/bootstrap` 快照、legacy import snapshot | Yes | ✓ FLOWING |
| `apps/web/src/components/LeafletMapStage.vue` | `activePointLatestTripLabel` | `mapPointsStore.tripsByPlaceId.get(placeId)` | Yes | ✓ FLOWING |
| `apps/web/src/services/legacy-point-storage.ts` | `records[*].startDate/endDate` | `loadLegacyPointStorageSnapshot()` 规范化 legacy localStorage 快照 | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| contracts 构建产物可重新生成 | `pnpm --filter @trip-map/contracts build` | 退出码 0 | ✓ PASS |
| server 类型检查 | `pnpm --filter @trip-map/server typecheck` | 退出码 0 | ✓ PASS |
| server 关键链路测试 | `pnpm --filter @trip-map/server test --run src/modules/records/records.service.spec.ts src/modules/records/records.repository.spec.ts src/modules/auth/auth.service.spec.ts test/auth-bootstrap.e2e-spec.ts` | 4 files / 22 tests passed | ✓ PASS |
| Prisma schema 自身有效 | `pnpm --filter @trip-map/server exec prisma validate --schema=prisma/schema.prisma` | `The schema at prisma/schema.prisma is valid` | ✓ PASS |
| web 类型检查 | `pnpm --filter @trip-map/web typecheck` | 退出码 0 | ✓ PASS |
| web 关键链路测试 | `pnpm --filter @trip-map/web test --run src/components/LeafletMapStage.spec.ts src/components/map-popup/TripDateForm.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/stores/map-points.spec.ts src/stores/auth-session.spec.ts src/services/legacy-point-storage.spec.ts` | 6 files / 110 tests passed | ✓ PASS |
| 本机 live app health / DB 观测 | `pnpm --filter @trip-map/server exec tsx -e "... app.inject('/health') ..."` | `{\"status\":\"ok\",\"service\":\"server\",\"contractsVersion\":\"phase11-v1\",\"database\":\"down\"}` | ? SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| TRIP-01 | 27-01, 27-02, 27-04 | 用户点亮地点时可以选择这次旅行发生的日期 | ✓ SATISFIED | `TripDateForm.vue` 强制开始日期并校验区间；`LeafletMapStage.vue` 将 `{startDate,endDate}` 透传到 store/API；server DTO/service 对日期格式和区间做守门。 |
| TRIP-02 | 27-01, 27-02, 27-03, 27-04, 27-06 | 用户可以为同一地点保存多次旅行记录，而不是被覆盖成单次去访 | ✓ SATISFIED | Prisma 从 place 级唯一约束转为 place 级索引 + 四元组唯一兜底；repository 用 `create()`；store 与 popup “再记一次去访”路径都保留同地点多条记录。 |
| TRIP-03 | 27-01, 27-02, 27-03, 27-05, 27-06 | 已保存的旅行日期与同地点多次去访记录在刷新、重开应用和跨设备后仍能稳定恢复 | ✓ SATISFIED | `AuthService.bootstrap()` 返回完整旅行记录数组；`auth-session.ts` 的 restore/refresh 均接入；`auth-bootstrap.e2e-spec.ts` 的真实 HTTP + Prisma 读写通过；本次未把 27-04 human checkpoint 重新打开为待办。 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/records/records.service.ts` | 47-50 | `toContractTravelRecord()` 仍把可空 metadata 强制 cast 成 contract 必填字段 | ⚠️ Warning | 如果数据库里已有历史坏数据或空 metadata 行，返回给前端的 contract 仍可能不完整；当前 Phase 27 的正常创建/导入路径未复现该问题。 |
| `apps/server/src/modules/auth/auth.service.ts` | 43-46 | bootstrap mapper 仍允许 `typeLabel` / `parentLabel` 兜底为空串，`regionSystem` / `adminType` 继续依赖 cast | ⚠️ Warning | 同样属于历史坏数据容错不足的风险，当前 e2e 与主链路测试未触发。 |
| `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | 63-70 | 日期只校验 `YYYY-MM-DD` 形状，没有校验“真实存在的日历日期” | ⚠️ Warning | UI 正常路径使用原生 `<input type=\"date\">` 不会产生伪日期，但 API/旧客户端仍可提交如 `2025-02-31` 的值。 |

### Accepted Product Boundary

`apps/web/src/stores/map-points.ts` 的 `unilluminate(placeId)` 与后端 `DELETE /records/:placeId` 仍按 placeId 清空该地点全部历史记录。这不是本次 verification 的 blocker：ROADMAP v6.0 概述已经明确“地图上的取消点亮仍维持地点级清理语义”，27-04 计划的人工步骤 8 也要求 unilluminate 后北京所有记录清除，因此本次按已接受产品边界处理。

### Gaps Summary

本次 re-verification 没有剩余 blocker 或 partial gap。27-05 已把 `latestTripLabel` 的选择口径从 `createdAt` 修正为按旅行日期排序，并由 `LeafletMapStage.spec.ts` 的补录回归用例锁住；27-06 已把 shared contract 到 DTO 的编译期绑定、`importTravel()` 共享日期区间校验、以及 `(userId, placeId, startDate, endDate)` 数据库唯一约束全部接回现有主链路。

本报告同时保留两类 residual risks。第一，当前本机 live health probe 仍返回 `database: "down"`，所以这次通过结论不声称“已在本机浏览器上重新完整回放一遍持久化链路”；通过证据主要来自代码检查、targeted unit/integration tests、以及通过的 `auth-bootstrap.e2e-spec.ts`。第二，仍有三个非阻塞 warning：历史空 metadata 容错不足、bootstrap mapper 同类风险，以及 API 边界上的“伪日期”校验缺口。这些都值得后续修补，但不会改变 Phase 27 goal achievement 已达成的结论。

---

_Verified: 2026-04-20T10:41:57Z_  
_Verifier: Claude (gsd-verifier)_
