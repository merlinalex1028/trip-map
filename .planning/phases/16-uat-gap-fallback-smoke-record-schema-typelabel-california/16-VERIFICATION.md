---
phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california
verified: 2026-04-02T09:39:07Z
status: human_needed
score: 14/14 must-haves verified
human_verification:
  - test: "fallback 点位的点亮入口反馈"
    expected: "fallback 点位的“点亮”按钮为禁用态，或在尝试触发时明确提示“该地点暂不支持点亮”，不再表现为假可点击。"
    why_human: "自动化已验证 disabled/notice wiring，但无法替代真实地图上的交互观感确认。"
  - test: "点亮后 saved overlay 的真实可见性"
    expected: "点亮成功后，同一 session 内出现对应 saved boundary overlay；reopen 或 refresh 后无残留、无缺失。"
    why_human: "自动化只能确认 shard load 与 addFeatures 调用，不能直接确认真实地图渲染效果。"
  - test: "California 真实区域点击体验"
    expected: "California 区域内多个真实点击都走 resolved branch，并显示一致的 `一级行政区` 与 `United States · 一级行政区`。"
    why_human: "server e2e 已锁定 bbox 与 authoritative 输出，但真实地图点击体验仍需人工抽样。"
---

# Phase 16: UAT gap fallback smoke record schema typelabel california Verification Report

**Phase Goal:** 用户在真实地图点击与保存链路中，能稳定看到正确的 canonical 行政区标签、点亮反馈与边界高亮；服务端记录 schema 与 shared contracts 保持一致，且 California 等已承诺支持的海外 admin1 能被 server-authoritative 地识别。
**Verified:** 2026-04-02T09:39:07Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Phase 16 的 server migration / e2e 在已知 PostgreSQL 状态下启动，而不是在未知连通性下直接运行 | ✓ VERIFIED | `16-00-DB-PREFLIGHT.md` 头部为 `status: ready`，且记录了 `prisma validate`、`prisma migrate status`、`records-contract.e2e-spec.ts` 成功结果 |
| 2 | schema 修改前已经确认 `prisma migrate status` 可连接配置中的 PostgreSQL | ✓ VERIFIED | preflight 记录成功；本次验证再次复核 `prisma migrate status`，sandbox 失败但非 sandbox 只读复核显示 `3 migrations found` 且 `Database schema is up to date!` |
| 3 | 如果数据库不可达，Phase 16 会在 Wave 0 阻塞，而不是等到 16-01/16-03 中途失败 | ✓ VERIFIED | `16-01-PLAN.md` 与 `16-03-PLAN.md` 都依赖 `16-00`；preflight artifact 明确建模了 blocker gate |
| 4 | `POST /records/smoke` 返回的 canonical 字段与数据库行一致，不再只在 HTTP response 里临时补字段 | ✓ VERIFIED | repository 直接写入 metadata；service 从 DB 行映射 response；`records-smoke.e2e-spec.ts` 断言 response 与 DB row 都匹配 smoke request |
| 5 | `POST /records` 与 `GET /records` 返回的 TravelRecord 携带 reopen/view 所需 canonical 展示元数据 | ✓ VERIFIED | shared contract、DTO、repository、service 和 `records-travel.e2e-spec.ts` 一致覆盖 `regionSystem/adminType/typeLabel/parentLabel/subtitle` |
| 6 | 旧 TravelRecord 可按 `placeId` 从 authoritative canonical catalog 回填 metadata，重新打开时恢复 canonical 标签 | ✓ VERIFIED | `backfill-record-metadata.ts` 基于 `canonicalPlaceCatalogBase` 回填；`records-travel.e2e-spec.ts` 插入 legacy row 后验证 backfill + `GET /records` |
| 7 | Phase 16 migration 不会因新增 metadata 列在已有数据上直接失败 | ✓ VERIFIED | migration SQL 仅 `ADD COLUMN`，新增列均为 nullable；非 sandbox `prisma migrate status` 显示 DB schema 已与仓库 migration 对齐 |
| 8 | 服务端不再依赖前端从 subtitle/displayName 反推 typeLabel 或 parentLabel | ✓ VERIFIED | `records.service.ts` 直接从 Prisma 行映射 `typeLabel/parentLabel/regionSystem/adminType/subtitle`；backfill 只按 `placeId` authoritative lookup，不按文案推断 |
| 9 | 保存后的 canonical 点位重新打开时，popup 仍显示正确的 typeLabel、parentLabel、subtitle | ✓ VERIFIED | `recordToDisplayPoint()` 直接读取 `TravelRecord` metadata；`map-points.spec.ts` 覆盖 Beijing/Hong Kong reopen |
| 10 | fallback 点位不再呈现一个可点击但无效果的点亮按钮 | ✓ VERIFIED | `PointSummaryCard.vue` 基于 `isIlluminatable` 禁用按钮并附带提示；`LeafletMapStage.vue` 在不可点亮时设置 `该地点暂不支持点亮` notice；web specs 通过 |
| 11 | 点亮成功后，同一 session 内会加载对应 shard 并出现 saved overlay 的前置渲染条件 | ✓ VERIFIED | `handleIlluminate()` 成功后调用 `getGeometryManifestEntry()` + `loadShardIfNeeded()`；`LeafletMapStage.spec.ts` 断言 `loadGeometryShard` 与 `addFeatures` |
| 12 | California 区域内真实点击会得到 server-authoritative canonical resolved 结果，而不是退回 fallback | ✓ VERIFIED | `findFixture()` 先匹配 California bbox；server e2e 覆盖 Los Angeles 与 San Francisco 都解析为 `us-california` |
| 13 | shared fixtures、server fixtures 与 Phase 12 UAT 文案对 California 使用同一组 placeId / datasetVersion / typeLabel | ✓ VERIFIED | `packages/contracts/src/fixtures.ts`、server fixture 和 `12-UAT.md` 统一为 `us-california / phase12-canonical-fixture-v1 / 一级行政区` |
| 14 | California resolve 不再依赖 ±0.0001° 的单点命中 | ✓ VERIFIED | `canonical-places.service.ts` 先走 bbox，再回退 legacy representative click；server e2e 明确覆盖 bbox 外点不误命中 California |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `.planning/phases/16-uat-gap-fallback-smoke-record-schema-typelabel-california/16-00-DB-PREFLIGHT.md` | DB preflight gate | ✓ VERIFIED | 存在，含 `status: ready` 与 env gate / e2e 结果 |
| `packages/contracts/src/records.ts` | Smoke/Travel canonical metadata 合同 | ✓ VERIFIED | `TravelRecord` 与 `CreateTravelRecordRequest` 都包含 `regionSystem/adminType/typeLabel/parentLabel/subtitle` |
| `apps/server/prisma/schema.prisma` | Smoke/Travel metadata 列 | ✓ VERIFIED | `SmokeRecord` 与 `TravelRecord` 具备 Phase 16 所需 metadata 列，新增列为 nullable |
| `apps/server/prisma/migrations/20260402082712_phase16_record_metadata_contracts/migration.sql` | additive migration | ✓ VERIFIED | 仅 `ADD COLUMN`；未引入 `SET NOT NULL` |
| `apps/server/scripts/backfill-record-metadata.ts` | authoritative `placeId` backfill | ✓ VERIFIED | 从 `canonicalPlaceCatalogBase` 构建 lookup，回填 smoke/travel rows，并保留 unmatched 列表 |
| `apps/server/src/modules/records/records.repository.ts` | DB 写入完整 canonical metadata | ✓ VERIFIED | smoke/travel `prisma.create` data 块均写入完整 metadata |
| `apps/server/src/modules/records/records.service.ts` | DB-first response mapping | ✓ VERIFIED | smoke/travel response 都从 Prisma row 映射，不回显临时输入对象 |
| `apps/web/src/stores/map-points.ts` | TravelRecord -> popup canonical metadata rehydrate | ✓ VERIFIED | `recordToDisplayPoint()`、optimistic record 与 API payload 全量透传 metadata |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | fallback illuminate 禁用态 | ✓ VERIFIED | 引入 `isIlluminatable`、disabled、`data-illuminatable` 与 hint |
| `apps/web/src/components/map-popup/MapContextPopup.vue` | popup 透传 illuminatable 状态 | ✓ VERIFIED | `is-illuminatable` 明确透传到 `PointSummaryCard` |
| `apps/web/src/components/LeafletMapStage.vue` | illuminate 成功后 shard load 与 notice | ✓ VERIFIED | 不可点亮时发 info notice；成功点亮后加载对应 shard |
| `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` | authoritative California fixture + bbox | ✓ VERIFIED | `us-california` fixture 与 `bounds` 定义齐全 |
| `apps/server/src/modules/canonical-places/canonical-places.service.ts` | bbox-first authoritative resolve | ✓ VERIFIED | `findFixture()` 先查 `bounds` 再回退 legacy click |
| `packages/contracts/src/fixtures.ts` | shared fixture 与 server fixture 对齐 | ✓ VERIFIED | Beijing/Hong Kong/Aba/California 及 ambiguous candidates 均对齐 authoritative IDs 与 labels |
| `.planning/phases/12-canonical/12-UAT.md` | California 历史 UAT 文案对齐 | ✓ VERIFIED | California 期望文案已改为 `一级行政区`，不再使用 `State` 口径 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `16-00-DB-PREFLIGHT.md` | `apps/server/prisma.config.ts` | `DATABASE_URL / DIRECT_URL / SHADOW_DATABASE_URL` gate | ✓ WIRED | preflight 正文显式记录 Prisma env gate |
| `16-00-DB-PREFLIGHT.md` | `apps/server/test/records-contract.e2e-spec.ts` | DB-backed server preflight | ✓ WIRED | preflight 记录了该 e2e 的成功输出 |
| `packages/contracts/src/records.ts` | `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | 同名字段对齐 | ✓ WIRED | DTO 实现了 contracts 中新增的五个 canonical metadata 字段 |
| `apps/server/src/modules/records/records.repository.ts` | `apps/server/prisma/schema.prisma` | Prisma create data | ✓ WIRED | smoke/travel `create` data 与 schema metadata 列逐项对齐 |
| `apps/server/src/modules/records/records.service.ts` | `apps/server/test/records-travel.e2e-spec.ts` | HTTP contract response shape | ✓ WIRED | e2e 明确断言 `GET /records` 与 DB row 的 metadata 一致 |
| `apps/web/src/stores/map-points.ts` | `packages/contracts/src/records.ts` | TravelRecord canonical metadata fields | ✓ WIRED | `recordToDisplayPoint()` 与 `illuminate()` 直接消费/发送 contracts 字段 |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | `apps/web/src/components/map-popup/MapContextPopup.vue` | `is-illuminatable` prop 透传 | ✓ WIRED | popup 把 `isIlluminatable` 传到 summary card |
| `apps/web/src/components/LeafletMapStage.vue` | `apps/web/src/services/geometry-loader.ts` | illuminate success -> `loadShardIfNeeded()` | ✓ WIRED | 成功点亮后通过 manifest 查 shard，再调用 `loadGeometryShard()`/`addFeatures()` |
| `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` | `packages/contracts/src/fixtures.ts` | `placeId / datasetVersion / typeLabel` mirrored constants | ✓ WIRED | California 与其他 authoritative fixtures 在 shared fixtures 中保持一致 |
| `apps/server/src/modules/canonical-places/canonical-places.service.ts` | `apps/server/test/canonical-resolve.e2e-spec.ts` | bbox-based California resolve assertions | ✓ WIRED | e2e 明确覆盖 LA / SF / bbox 外点 |
| `.planning/phases/12-canonical/12-UAT.md` | `packages/contracts/src/fixtures.ts` | expected California label/ID wording | ✓ WIRED | UAT 文案与 shared fixture 同步为 `一级行政区` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/records/records.repository.ts` | smoke/travel Prisma `data` | HTTP DTO / shared contracts | Yes | ✓ FLOWING |
| `apps/server/src/modules/records/records.service.ts` | `record.regionSystem/adminType/typeLabel/parentLabel/subtitle` | `prisma.smokeRecord.create` / `prisma.travelRecord.findMany/create` 返回行 | Yes | ✓ FLOWING |
| `apps/server/scripts/backfill-record-metadata.ts` | `metadata` | `canonicalPlaceCatalogBase[placeId]` authoritative lookup | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `travelRecords` / `recordToDisplayPoint()` | `/records` API 与 `createTravelRecord()` 返回值 | Yes | ✓ FLOWING |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | `summaryTypeLabel` / `summarySubtitle` / `isIlluminatable` | `surface.point` 与 popup props | Yes | ✓ FLOWING |
| `apps/web/src/components/LeafletMapStage.vue` | `summarySurfaceState` / geometry shard load | store state + manifest lookup + geometry loader | Yes | ✓ FLOWING |
| `apps/server/src/modules/canonical-places/canonical-places.service.ts` | resolved `place` | bbox/click fixture + `GEOMETRY_MANIFEST` lookup | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| shared fixtures 与 contracts 断言保持一致 | `pnpm --filter @trip-map/contracts test` | `src/contracts.spec.ts` 14 tests passed | ✓ PASS |
| web reopen label / fallback affordance / shard load 回归 | `pnpm --filter @trip-map/web exec vitest run src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts` | 3 files, 47 tests passed | ✓ PASS |
| California bbox authoritative resolve | `pnpm --filter @trip-map/server exec vitest run test/canonical-resolve.e2e-spec.ts` | 1 file, 14 tests passed | ✓ PASS |
| Prisma migration 状态与 DB gate | `pnpm --filter @trip-map/server exec prisma migrate status --schema prisma/schema.prisma` | sandbox 返回 `P1001`；非 sandbox 只读复核显示 `3 migrations found` 且 `Database schema is up to date!` | ✓ PASS |
| DB-backed smoke/travel round-trip 全链路 | 未在本步骤重跑 | 跳过：spot-check 约束要求不对共享 DB 执行写入；证据来自代码检查、`16-00-DB-PREFLIGHT.md`，以及用户提供的“escalated `pnpm test` 已通过”上下文 | ? SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| REQ-16-01 | `16-02-PLAN.md` | fallback 点位必须呈现禁用态或明确提示，不再是假可点击 | ? NEEDS HUMAN | `PointSummaryCard.vue` / `MapContextPopup.vue` / `LeafletMapStage.vue` 已接线，相关 web specs 全绿；仍需人工确认真实地图交互观感 |
| REQ-16-02 | `16-02-PLAN.md` | 点亮成功后必须加载 GeoJSON shard 并显示 saved overlay | ? NEEDS HUMAN | `handleIlluminate()` 成功后加载 shard，`LeafletMapStage.spec.ts` 断言 `loadGeometryShard` + `addFeatures`；仍需人工确认真实 overlay 可见性 |
| REQ-16-03 | `16-00-PLAN.md`, `16-01-PLAN.md` | `SmokeRecord` 完整落库 canonical summary 并从 DB 行 round-trip | ✓ SATISFIED | contracts/schema/repository/service/e2e 已闭合；preflight 和 migration status 均显示 DB gate 正常 |
| REQ-16-04 | `16-00-PLAN.md`, `16-01-PLAN.md`, `16-02-PLAN.md` | `TravelRecord` 保留 reopen/view 所需 canonical 展示元数据 | ✓ SATISFIED | `TravelRecord` 合同、schema、DTO、repository、service、backfill、store rehydrate 与 web/server tests 全部对齐 |
| REQ-16-05 | `16-03-PLAN.md` | California 必须遵循 server-authoritative 识别，fixtures/UAT/server 口径一致 | ? NEEDS HUMAN | bbox-first resolve、shared/server/UAT 对齐、server e2e 全绿；仍需人工抽样真实地图点击体验 |

Phase 16 在 `REQUIREMENTS.md` 中声明的 `REQ-16-01` 至 `REQ-16-05` 均已被计划 frontmatter 覆盖；未发现 orphaned requirements。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| — | — | 未发现 TODO/FIXME/placeholder、硬编码空数据流或未接线 stub；扫描命中的 `return null`/空值判断均为正常 guard | ℹ️ Info | 当前扫描范围内无阻断 Phase 16 目标的 stub/placeholder 反模式 |

### Human Verification Required

### 1. fallback 点位的点亮入口反馈

**Test:** 打开一个 `OUTSIDE_SUPPORTED_DATA` fallback 点位，查看 popup 中“点亮”入口的状态，并尝试点击。  
**Expected:** 按钮为禁用态，或明确出现 `该地点暂不支持点亮`，不再出现“看起来能点但没有效果”的体验。  
**Why human:** 自动化能验证 disabled/notice wiring，无法替代真实地图交互观感判断。

### 2. 点亮后 saved overlay 的真实可见性

**Test:** 在真实地图上选择一个可识别且有边界数据的地点，点击“点亮”，观察同一 session 内的边界高亮；随后 reopen/refresh 再确认一次。  
**Expected:** 点亮成功后立即看到 saved overlay；reopen 或 refresh 后没有缺失高亮或残留旧高亮。  
**Why human:** 自动化只能证明 `loadShardIfNeeded()` 和 `addFeatures()` 被调用，不能直接验证真实地图渲染效果。

### 3. California 真实区域点击体验

**Test:** 在 California 区域内多个位置点击，例如洛杉矶与旧金山附近，以及州内其它随机位置。  
**Expected:** 都进入 server-authoritative resolved branch，并稳定显示 `us-california`、`一级行政区` 与 `United States · 一级行政区`。  
**Why human:** server e2e 已验证 bbox 逻辑，但真实地图点击的体感与文案呈现仍需人工抽样。

### Gaps Summary

未发现自动化 blocker gap。Phase 16 的 must-haves、关键 artifacts、接线和数据流均已在实际代码中落地，并通过了 contracts/web/server 的只读 spot-check；DB gate 也通过了非 sandbox 的只读 migration 状态复核。剩余工作仅是 Phase 16 自身 validation contract 中已经声明的 3 项人工验收。

---

_Verified: 2026-04-02T09:39:07Z_  
_Verifier: Claude (gsd-verifier)_
