---
phase: 28-overseas-coverage-expansion
verified: 2026-04-22T03:30:59Z
status: passed
score: 10/10 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 7/10
  gaps_closed:
    - "扩容后的 overseas admin1 identity 在 generated artifacts 与 canonical lookup 中保持全局唯一，新增国家可以稳定 resolve 并保存旅行记录"
    - "既有 overseas 记录会被稳定回填，并在 bootstrap / same-user sync / 后续时间轴统计消费者中一致复用升级后的 metadata"
  gaps_remaining: []
  regressions: []
---

# Phase 28: Overseas Coverage Expansion Verification Report

**Phase Goal:** 用户可以在更广的优先海外国家/地区上稳定识别并保存旅行记录，且扩展后的 metadata 能被时间轴和统计视图复用。  
**Verified:** 2026-04-22T03:30:59Z  
**Status:** passed  
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Phase 28 的 authoritative overseas support matrix 已锁定为 21 国，并通过区域化 build-time authoring 暴露稳定入口。 | ✓ VERIFIED | `apps/web/scripts/geo/overseas-admin1-support.mjs:1` 仍是 thin re-export；`apps/web/scripts/geo/overseas-support/index.mjs:8-45` 聚合六个区域模块并导出 `priorityCountries` / `supportedCountrySummaries`；spot-check `node --input-type=module` 返回 21 个 ISO2，顺序为 `JP, KR, TH, SG, MY, IN, ID, AE, SA, AU, PG, US, CA, BR, AR, DE, PL, CZ, EG, MA, ZA`。 |
| 2 | 新增国家全部按 admin1-only 落地，且 SG / AE / AU 的特殊 allow/deny guard 仍保留。 | ✓ VERIFIED | `apps/web/scripts/geo/overseas-support/asia.mjs:7-13`、`apps/web/scripts/geo/overseas-support/middle-east.mjs:7-25`、`apps/web/scripts/geo/overseas-support/oceania.mjs:7-24` 继续以 `Number(featureProperties.gadm_level) === 1` 约束 admin1；`asia.mjs:47-56` 保留 SG allow-list，`middle-east.mjs:18-24` 保留 AE allow/deny，`oceania.mjs:18-24` 保留 AU 8 州/领地 allow-list。 |
| 3 | build-time overseas metadata 继续直接生成标准英文 `typeLabel` 与 `${parentLabel} · ${typeLabel}` subtitle，不再回退到统一 `一级行政区`。 | ✓ VERIFIED | `apps/web/scripts/geo/build-geometry-manifest.mjs:281-304` 从 country definition 写入 `defaultTypeLabel` 与标准 subtitle；`rg -n "一级行政区" apps/web/scripts/geo/build-geometry-manifest.mjs` 无命中；server/web/contract 回归分别通过 `59 passed`、`91 passed`、`17 passed`，未再出现旧标签混入 authoritative payload。 |
| 4 | geometry dataset 与 canonical dataset 版本已经明确分离，并以 `2026-04-21-geo-v3` / `canonical-authoritative-2026-04-21` 落盘。 | ✓ VERIFIED | `apps/web/scripts/geo/build-geometry-manifest.mjs:56` 定义 canonical dataset version，`build-geometry-manifest.mjs:296` 把它写入 overseas feature metadata；`packages/contracts/src/generated/geometry-manifest.generated.ts:1-10` 同时记录 `canonicalDatasetVersion` 和 `geometryDatasetVersion`；`pnpm --filter @trip-map/web geo:build:check` 通过并输出 `856 entries`、`487 overseas entries`。 |
| 5 | generated contracts 已同时产出 manifest 与 supported-country summary，且 web unsupported copy 直接复用这一真源。 | ✓ VERIFIED | `packages/contracts/src/generated/geometry-manifest.generated.ts:8579-8729` 导出 `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES` 与 `SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH`；`apps/web/src/constants/overseas-support.ts:1-10` 直接 re-export 并构建 unsupported notice；spot-check 校验 generated summary 的 ISO2 顺序与 `priorityCountries` 完全一致。 |
| 6 | 一组新增优先海外国家/地区可以稳定 resolve 并保存 authoritative admin1 记录，且 Washington/DC、Buenos Aires Province/City 不再冲突。 | ✓ VERIFIED | `apps/web/scripts/geo/build-geometry-manifest.mjs:74-81` 为 `US-WA`、`US-DC`、`AR-B`、`AR-C` 定义 special identities，`build-geometry-manifest.mjs:235-254` 与 `build-geometry-manifest.mjs:405-421` 增加 fail-fast 唯一性校验；`apps/server/test/phase28-overseas-cases.ts:305-307` 导出 `PHASE28_IDENTITY_COLLISION_CASES`；`apps/server/test/canonical-resolve.e2e-spec.ts:324-326` 与 `apps/server/test/records-travel.e2e-spec.ts:408-448` 锁定 collision probes；duplicate scan 对 `manifest.json` / `overseas/layer.json` 返回 `duplicate* = []`。 |
| 7 | canonical metadata lookup 已从“静默覆盖”改为 duplicate fail-fast，resolve/create/import exact-match 防线仍然存在。 | ✓ VERIFIED | `apps/server/src/modules/canonical-places/place-metadata-catalog.ts:67-86` 在 shard lookupId 冲突时报错，`place-metadata-catalog.ts:105-123` 对重复 `placeId` / `boundaryId` 直接抛错；`apps/server/src/modules/records/records.service.ts:122-146` 继续要求 `datasetVersion/displayName/typeLabel/subtitle` 等字段 exact-match authoritative catalog；server 六个测试文件共 `59 passed`。 |
| 8 | 既有 overseas 记录会被稳定回填到新 metadata，且 `travelRecord` / `smokeRecord` / `userTravelRecord` 全部采用不会抛 `P2025` 的更新策略。 | ✓ VERIFIED | `apps/server/scripts/backfill-record-metadata.ts:154-177` 用 `updateMany()` 替代逐条 `update()`；`backfill-record-metadata.ts:208-265` 为三张表分别统计 `matched/unmatched/skipped`；`apps/server/test/record-metadata-backfill.e2e-spec.ts:116-144` 锁定 zero-count skipped 行为；组合执行 `record-metadata-backfill + auth-bootstrap + records-sync` 已包含在本次 server `59 passed` 中，旧 `P2025` 未复发。 |
| 9 | bootstrap / same-user sync / map consumer 继续直接复用持久化 metadata，而不是客户端重新推导 labels。 | ✓ VERIFIED | `apps/server/src/modules/auth/auth.service.ts:189-198` 直接返回 `records.map(toContractTravelRecord)`；`apps/web/src/stores/map-points.ts:50-69` 将 `TravelRecord.displayName/typeLabel/parentLabel/subtitle` 直接投影到 UI；`apps/server/test/auth-bootstrap.e2e-spec.ts:428-472` 与 `apps/server/test/records-sync.e2e-spec.ts:407-451` 明确断言旧 `一级行政区` 不再回放；web 三个 consumer 测试文件共 `91 passed`。 |
| 10 | 扩展后的 metadata 已具备供时间轴和统计视图复用的共享契约，不需要再额外创建 fallback 文案真源。 | ✓ VERIFIED | `packages/contracts/src/generated/geometry-manifest.generated.ts:8579-8729` 提供 authoritative summary 常量，`apps/web/src/constants/overseas-support.ts:1-10` 已不再维护静态国家名单，`rg -n "overseas-catalog|modules/overseas|PHASE26_SUPPORTED_OVERSEAS_COUNTRIES" apps/web/src apps/server/src apps/web/scripts/geo packages/contracts/src` 无命中。推断：后续时间轴/统计可直接消费与 map/bootstrap 相同的 persisted metadata 与 generated summary，而无需再派生新的标签策略。 |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/web/scripts/geo/overseas-admin1-support.mjs` | 保持旧 import path 稳定可用的 thin wrapper | ✓ VERIFIED | 第 1 行仅做 `export *`，未分叉出新的真源。 |
| `apps/web/scripts/geo/overseas-support/index.mjs` | 21 国聚合入口与 summary 导出 | ✓ VERIFIED | 导出 `priorityCountries`、`priorityCountryByIso3`、`supportedCountrySummaries`、`getOverseasAdmin1CountryDefinition`。 |
| `apps/web/scripts/geo/overseas-support/*.mjs` | 分区域 admin1-only 国家定义与特殊 guard | ✓ VERIFIED | 六个区域文件都存在，国家集合与 Phase 28 plan 一致。 |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | v3 build、canonical label policy、identity guard | ✓ VERIFIED | 已包含 special identity overrides、`assertUniqueOverseasIdentity()`、canonical dataset metadata 生成与 generated summary 导出。 |
| `apps/web/public/geo/2026-04-21-geo-v3/manifest.json` | authoritative geometry manifest | ✓ VERIFIED | duplicate scan 显示 856 个 manifest entries、487 个 overseas entries，`placeId` / `boundaryId` 无重复。 |
| `apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json` | overseas canonical feature metadata | ✓ VERIFIED | `us-washington-state`、`us-district-of-columbia`、`ar-buenos-aires-province`、`ar-buenos-aires-city` 已分别落盘，且 duplicate scan 为 0。 |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | generated manifest + summary constants | ✓ VERIFIED | 既暴露 `GEOMETRY_MANIFEST`，也暴露 `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES` / `SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH`。 |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | fail-fast canonical lookup | ✓ VERIFIED | duplicate `lookupId`、`placeId`、`boundaryId` 都会直接抛错，不再静默覆盖。 |
| `apps/server/scripts/backfill-record-metadata.ts` | race-safe metadata backfill | ✓ VERIFIED | 三张表统一走 `updateMany()`，并把 zero-count 行记录到 per-table skipped summary。 |
| `apps/server/test/phase28-overseas-cases.ts` | shared 13-country + collision regression matrix | ✓ VERIFIED | 同时导出 `PHASE28_NEW_COUNTRY_CASES`、`PHASE28_IDENTITY_COLLISION_CASES`、`PHASE28_LEGACY_OVERSEAS_USER_TRAVEL_ROWS`。 |
| `apps/web/src/constants/overseas-support.ts` | generated-summary-backed unsupported notice | ✓ VERIFIED | 直接依赖 contracts summary，而非 web 侧静态名单。 |
| `apps/web/src/stores/map-points.ts` | persisted-metadata consumer | ✓ VERIFIED | `recordToDisplayPoint()` 直接读取 `TravelRecord` 的 authoritative metadata 字段。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `apps/web/scripts/geo/overseas-support/*.mjs` | `apps/web/scripts/geo/build-geometry-manifest.mjs` | country definitions + label policy imports | ✓ WIRED | build script 导入 `getOverseasAdmin1CountryDefinition`、`getOverseasAdmin1SourceFeatureId`、`isSupportedOverseasAdmin1Feature`、`supportedCountrySummaries`。 |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | `apps/web/public/geo/2026-04-21-geo-v3/manifest.json` / `overseas/layer.json` | `geo:build` generated output | ✓ WIRED | `pnpm --filter @trip-map/web geo:build:check` 通过，dry-run 实际产出 856 条 manifest / 487 条 overseas features。 |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | `packages/contracts/src/generated/geometry-manifest.generated.ts` | generated summary constants | ✓ WIRED | `build-geometry-manifest.mjs:443-467` 序列化 `supportedCountrySummaries` 并写入 generated TS。 |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | `apps/web/src/constants/overseas-support.ts` | supported-country summary reuse | ✓ WIRED | `overseas-support.ts:1-10` 直接从 `@trip-map/contracts` 引入 `SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH`。 |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | manifest-backed canonical summary lookup | ✓ WIRED | `place-metadata-catalog.ts:167-194` 遍历 `GEOMETRY_MANIFEST` 并按 shard feature 生成 canonical summary 索引。 |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | `apps/server/src/modules/records/records.service.ts` | authoritative exact-match validation | ✓ WIRED | `records.service.ts:122-146` 同时对 `placeId` 与 `boundaryId` 解析后的 canonical summary 做一致性校验。 |
| `apps/server/scripts/backfill-record-metadata.ts` | `apps/server/src/modules/auth/auth.service.ts` | backfilled `userTravelRecord` -> bootstrap replay | ✓ WIRED | `backfill-record-metadata.ts` 更新 `userTravelRecord` 后，`auth.service.ts:189-198` 直接回放同一份 persisted records。 |
| `apps/server/scripts/backfill-record-metadata.ts` | `apps/server/test/auth-bootstrap.e2e-spec.ts` / `apps/server/test/records-sync.e2e-spec.ts` | combo migration regressions | ✓ WIRED | 两个测试文件都调用 `backfillRecordMetadata(prisma)` 并断言升级后的 `datasetVersion/typeLabel/subtitle`。 |
| `apps/server/src/modules/auth/auth.service.ts` | `apps/web/src/stores/map-points.ts` | persisted metadata replay | ✓ WIRED | bootstrap 返回的 `TravelRecord` 直接进入 `recordToDisplayPoint()`，未经过客户端 label 重推导。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/web/scripts/geo/overseas-support/index.mjs` | `supportedCountrySummaries` | 六个区域模块的 country definitions | Yes | ✓ FLOWING |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | overseas `placeId` / `boundaryId` / `renderableId` | `OVERSEAS_SPECIAL_IDENTITIES` + `slugify(admin1Name)` + uniqueness guard | Yes | ✓ FLOWING |
| `apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json` | canonical feature metadata | `createOverseasFeatureMetadata()` build-time 生成 | Yes | ✓ FLOWING |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES` / `SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH` | `supportedCountrySummaries` 的序列化输出 | Yes | ✓ FLOWING |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | `byPlaceId` / `byBoundaryId` | `GEOMETRY_MANIFEST` + shard feature lookup | Yes | ✓ FLOWING |
| `apps/server/scripts/backfill-record-metadata.ts` | matched / skipped / unmatched backfill summary | `findMany()` + `updateMany()` + canonical lookup | Yes | ✓ FLOWING |
| `apps/server/src/modules/auth/auth.service.ts` | bootstrap `records` | persisted `userTravelRecord` rows | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `displayName` / `typeLabel` / `subtitle` | persisted `TravelRecord` fields | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| 21 国 build-time support matrix 存在且顺序稳定 | `node --input-type=module` 导入 `priorityCountries` / `supportedCountrySummaries` | 返回 21 个 ISO2，`count = 21`，`summaryCount = 21` | ✓ PASS |
| generated summary 顺序与 authoring matrix 一致 | `node --input-type=module` 对比 `priorityCountries` 与 `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES.map(iso2)` | `sameOrder: true` | ✓ PASS |
| `geo:build` 仍可在当前数据源下完整通过 | `pnpm --filter @trip-map/web geo:build:check` | dry-run 成功，输出 `856 entries` / `487 overseas entries` | ✓ PASS |
| 当前 manifest / overseas layer 不存在 duplicate identities | Node 脚本扫描 `manifest.json` 与 `overseas/layer.json` | `duplicateManifestBoundaryIds = []`、`duplicateManifestPlaceIds = []`、`duplicateLayerBoundaryIds = []`、`duplicateLayerPlaceIds = []` | ✓ PASS |
| server authoritative resolve/save/import/backfill/bootstrap/sync 全链路稳定 | `pnpm --filter @trip-map/server test --run test/canonical-resolve.e2e-spec.ts test/records-travel.e2e-spec.ts test/records-import.e2e-spec.ts test/record-metadata-backfill.e2e-spec.ts test/auth-bootstrap.e2e-spec.ts test/records-sync.e2e-spec.ts` | `6 passed`, `59 passed (59)` | ✓ PASS |
| web consumer 继续直吃 persisted metadata | `pnpm --filter @trip-map/web test --run src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` | `3 passed`, `91 passed (91)` | ✓ PASS |
| contracts 层继续导出 Phase 28 authoritative fixtures / contract | `pnpm --filter @trip-map/contracts test --run src/contracts.spec.ts` | `1 passed`, `17 passed (17)` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `GEOX-01` | `28-01`, `28-02`, `28-04`, `28-06` | 用户可以在更广的优先海外国家/地区上稳定识别并记录旅行 | ✓ SATISFIED | 21 国 matrix、admin1-only policy、collision-specific identities、duplicate fail-fast、resolve/save/import 测试已同时成立；server 全链路 spot-check `59 passed`。 |
| `GEOX-02` | `28-01`, `28-02`, `28-03`, `28-05`, `28-07` | 扩展后的海外记录在地图、时间轴和统计视图中保持一致的标题、类型与归类 | ✓ SATISFIED | canonical metadata 由 persisted `TravelRecord` 与 generated summary 统一供给；backfill/bootstrap/sync/map consumer 测试均通过，且未发现新的 runtime fallback truth source。 |

Orphaned requirements: none. 所有 PLAN frontmatter 中声明的 requirement IDs 都能在 `.planning/REQUIREMENTS.md` 中找到，且仅 `GEOX-01`、`GEOX-02` 映射到 Phase 28。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/server/test/auth-bootstrap.e2e-spec.ts` | 376 | 慢迁移回归本身没有显式超时，`30000` 只出现在文件更后面的另一条测试 | ⚠️ Warning | 当前组合 server 回归已通过，但在更慢 CI 机器上仍可能存在超时抖动风险。 |
| `apps/server/test/record-metadata-backfill.e2e-spec.ts` | 116 | zero-count skipped 只直接断言了 `userTravelRecord`，未参数化覆盖 `travelRecord` / `smokeRecord` | ℹ️ Info | 当前实现三张表共用同一 helper，功能未受阻，但 skipped summary 的对称性保护还不完整。 |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` / `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | 235 / 79 | duplicate fail-fast 分支通过 clean-data build 和运行时装载间接验证，但没有专门的负向测试故意注入冲突 | ℹ️ Info | 当前 guard 真正存在且当前数据集通过，但失败路径未来若被改坏，回归面仍偏薄。 |

### Gaps Summary

没有发现新的 blocking gap。上一次 verification 的两个核心 blocker 已被真实关闭：

1. overseas identity collision 已消失。Washington/DC 与 Buenos Aires Province/City 现在拥有不同的 `placeId` / `boundaryId`，build 产物与 generated contracts 中无重复 identity，canonical lookup 也改为 duplicate fail-fast。
2. backfill race 已消失。三张记录表统一切到 `updateMany()` + per-table skipped summary，组合执行 backfill/bootstrap/sync 回归通过，旧 `P2025` 不再出现。

当前剩余的只是测试可靠性与覆盖完整度层面的 warning/info，不再阻断 Phase 28 目标达成。

---

_Verified: 2026-04-22T03:30:59Z_  
_Verifier: Codex (gsd-verifier)_
