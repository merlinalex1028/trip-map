---
phase: 28-overseas-coverage-expansion
verified: 2026-04-21T08:01:29Z
status: gaps_found
score: 7/10 must-haves verified
overrides_applied: 0
gaps:
  - truth: "canonical datasetVersion 在 build、server 与 contracts 之间保持一致，并与 geometry dataset version 明确分离"
    status: failed
    reason: "build script 先生成 `canonical-authoritative-2026-04-21`，随后又在 shard feature 上覆盖为 `2026-04-21-geo-v3`；server canonical lookup 与多条回归测试都把 geometry version 当成 authoritative datasetVersion，而 contracts Phase 28 fixtures 仍断言 canonical 版本。"
    artifacts:
      - path: "apps/web/scripts/geo/build-geometry-manifest.mjs"
        issue: "`createOverseasFeatureMetadata()` 生成 canonical datasetVersion，但 `enrichFeature()` 又覆盖成 geometry version。"
      - path: "apps/server/src/modules/canonical-places/place-metadata-catalog.ts"
        issue: "canonical summary 直接读取 geometry shard 的 `feature.properties.datasetVersion`，把错误版本继续传播到 resolve/save/backfill。"
      - path: "apps/server/test/phase28-overseas-cases.ts"
        issue: "共享 13 国矩阵把 `2026-04-21-geo-v3` 当成 authoritative datasetVersion。"
      - path: "packages/contracts/src/fixtures.ts"
        issue: "Phase 28 fixtures 仍使用 `canonical-authoritative-2026-04-21`，与 server 当前行为不一致。"
    missing:
      - "停止在 geometry shard feature 上覆盖 canonical `datasetVersion`。"
      - "重新生成 geo shards 与 generated contracts。"
      - "把 server resolve/backfill 回归统一改为断言 `canonical-authoritative-2026-04-21`，geometry 版本仅通过 `geometryRef.geometryDatasetVersion` 暴露。"
  - truth: "既有 overseas 记录会被回填到 Phase 28 metadata，并在 bootstrap / same-user sync / 后续 timeline 和统计消费者中一致复用"
    status: failed
    reason: "backfill 脚本只更新 `travelRecord` 与 `smokeRecord`，没有更新登录态主链路实际读取的 `userTravelRecord`；现有 bootstrap/sync 测试也只种入已经正确的记录，没有验证旧 metadata 升级路径。"
    artifacts:
      - path: "apps/server/scripts/backfill-record-metadata.ts"
        issue: "未扫描或更新 `userTravelRecord`。"
      - path: "apps/server/src/modules/auth/auth.service.ts"
        issue: "`/auth/bootstrap` 直接返回 `userTravelRecord`，因此老用户记录不会被当前 backfill 修正。"
      - path: "apps/server/src/modules/records/records.repository.ts"
        issue: "`/records` create/import 全部写入 `userTravelRecord`，与 backfill 目标表不一致。"
      - path: "apps/server/test/auth-bootstrap.e2e-spec.ts"
        issue: "测试直接插入已正确的 `userTravelRecord`，没有覆盖旧标签升级后再 bootstrap 的真实迁移场景。"
    missing:
      - "为 `userTravelRecord` 增加与 `travelRecord`/`smokeRecord` 同步的 metadata backfill。"
      - "补一条 e2e：先写入带旧 overseas metadata 的 `userTravelRecord`，执行 backfill，再验证 `/auth/bootstrap` 和 same-user sync 返回升级后的 Phase 28 metadata。"
---

# Phase 28: Overseas Coverage Expansion Verification Report

**Phase Goal:** 用户可以在更广的优先海外国家/地区上稳定识别并保存旅行记录，且扩展后的 metadata 能被时间轴和统计视图复用。
**Verified:** 2026-04-21T08:01:29Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Phase 28 的海外支持真源已经锁定为 21 国，并以区域化 build-time authoring 暴露稳定入口。 | ✓ VERIFIED | `apps/web/scripts/geo/overseas-support/index.mjs` 聚合 6 个区域模块并导出 `priorityCountries` / `supportedCountrySummaries`；实际执行导入检查得到 21 个 ISO2。 |
| 2 | 新增国家全部按 admin1-only 落地，且 SG / AE / AU 特殊 allow/deny guard 仍保留。 | ✓ VERIFIED | 六个区域文件都以 `Number(featureProperties.gadm_level) === 1` 为 guard；`SG`、`AE`、`AU` 的 allow-list / deny-list 仍在。 |
| 3 | overseas metadata 不再使用统一 `一级行政区`，而是生成英文 `typeLabel` 与 `${parentLabel} · ${typeLabel}` subtitle。 | ✓ VERIFIED | `apps/web/scripts/geo/build-geometry-manifest.mjs` 中 `createOverseasFeatureMetadata()` 直接使用 country definition 的 `defaultTypeLabel`；`geo:build:check` 通过并生成 487 条 overseas entries。 |
| 4 | 一组新增优先海外国家/地区可以稳定 resolve 并保存为 authoritative admin1 记录。 | ✓ VERIFIED | `apps/server/test/canonical-resolve.e2e-spec.ts` 通过 24 条回归，其中包含 13 国共享矩阵；`apps/server/test/records-travel.e2e-spec.ts` 通过 12 条回归，证明 `/records` 写入路径可用。 |
| 5 | canonical datasetVersion 与 geometry dataset version 在 build、server、contracts 间保持一致且职责分离。 | ✗ FAILED | build script 把 canonical `datasetVersion` 覆盖成 geometry version，server catalog 和 Phase 28 server 测试随之固化为 `2026-04-21-geo-v3`，而 contracts Phase 28 fixtures 仍断言 `canonical-authoritative-2026-04-21`。 |
| 6 | generated supported-country summary 已成为 web unsupported-country copy 的唯一真源。 | ✓ VERIFIED | `packages/contracts/src/generated/geometry-manifest.generated.ts` 导出 `SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH`；`apps/web/src/constants/overseas-support.ts` 直接 re-export 并生成提示文案。 |
| 7 | server create/import 仍会拒绝 forged 或 stale overseas metadata。 | ✓ VERIFIED | `apps/server/src/modules/records/records.service.ts` 对 `datasetVersion` / `displayName` / `typeLabel` / `subtitle` 等字段做 exact-match；`records-travel.e2e-spec.ts` 实际通过。 |
| 8 | 既有 overseas 记录会被回填到新的 datasetVersion / title / type / subtitle，并在 bootstrap/sync 中回放升级后的值。 | ✗ FAILED | `backfill-record-metadata.ts` 只更新 `travelRecord` 和 `smokeRecord`；`/auth/bootstrap` 与 `/records` 主链路读写的是 `userTravelRecord`，当前迁移不会触达它。 |
| 9 | 新增 13 国的 bootstrap / same-user sync / map consumer 继续复用持久化 metadata，而不是客户端重新推导。 | ✓ VERIFIED | `auth-bootstrap.e2e-spec.ts`、`records-sync.e2e-spec.ts` 都基于共享 13 国矩阵回放 canonical fields；`apps/web/src/stores/map-points.ts` 直接读取 `record.displayName` / `typeLabel` / `subtitle`。 |
| 10 | 扩展后的 metadata 已经能被时间轴和统计视图稳定复用，而不需要临时兜底推导。 | ✗ FAILED | 复用路径本身已准备好，但由于 `datasetVersion` split-brain 和 `userTravelRecord` 未回填，现有老 overseas 记录仍可能携带旧 metadata，无法作为 Phase 29/30 的稳定输入。 |

**Score:** 7/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/web/scripts/geo/overseas-support/index.mjs` | 21 国区域化 support matrix 聚合入口 | ✓ VERIFIED | 导出 `priorityCountries`、`supportedCountrySummaries`、`getOverseasAdmin1CountryDefinition` 等 build-time 真源接口。 |
| `apps/web/scripts/geo/overseas-support/*.mjs` | admin1-only 国家定义与特殊 guard | ✓ VERIFIED | 六个区域文件均存在，且包含计划要求的新增国家与 SG/AE/AU 规则。 |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | 生成 v3 geometry manifest 与 canonical overseas labels | ✗ HOLLOW | 逻辑存在且 `geo:build:check` 可跑，但 `datasetVersion` 被错误覆盖成 geometry version。 |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | generated manifest + supported-country summaries | ⚠️ DRIFTED | 覆盖摘要常量正确，但和 server 当前读取到的 `datasetVersion` 语义分裂。 |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | manifest-backed canonical summary lookup | ⚠️ HOLLOW | wiring 完整，但直接把 shard 里的错误 `datasetVersion` 继续当作 canonical metadata。 |
| `apps/server/scripts/backfill-record-metadata.ts` | authoritative metadata backfill | ✗ NOT COMPLETE | 只回填 `travelRecord` / `smokeRecord`，未覆盖真实登录态消费的 `userTravelRecord`。 |
| `apps/server/src/modules/records/records.service.ts` | create/import exact-match authoritative guard | ✓ VERIFIED | 对 overseas payload 做完整字段比对，并给出稳定错误文案。 |
| `apps/web/src/constants/overseas-support.ts` | generated-summary-backed unsupported helper | ✓ VERIFIED | 已移除静态名单，直接使用 generated summary 常量。 |
| `apps/web/src/stores/map-points.ts` | persisted metadata consumer compatibility | ✓ VERIFIED | `recordToDisplayPoint()` 直接映射持久化 metadata，无 `placeId` 级 fallback derivation。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `apps/web/scripts/geo/overseas-support/*.mjs` | `apps/web/scripts/geo/build-geometry-manifest.mjs` | aggregated support matrix + label policy imports | ✓ WIRED | build script 从 `overseas-admin1-support.mjs` 导入 `getOverseasAdmin1CountryDefinition` / `supportedCountrySummaries`。 |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | `packages/contracts/src/generated/geometry-manifest.generated.ts` | `geo:build` generated output | ✓ WIRED | `geo:build:check` 成功生成 generated manifest 和 supported-country summaries。 |
| geometry shards (`apps/web/public/geo/2026-04-21-geo-v3/*`) | `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | feature metadata lookup | ⚠️ WIRED WITH DRIFT | wiring 完整，但 server 读取到的是被覆盖后的 geometry version，而非 canonical version。 |
| `apps/server/scripts/backfill-record-metadata.ts` | `apps/server/src/modules/auth/auth.service.ts` | bootstrap replay consumes backfilled persisted metadata | ✗ NOT_WIRED | backfill 不更新 `userTravelRecord`，而 `/auth/bootstrap` 只返回 `userTravelRecord`。 |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | `apps/web/src/constants/overseas-support.ts` | supported-country summary import | ✓ WIRED | web helper 直接 re-export/import generated summary constants。 |
| `apps/web/src/stores/map-points.ts` | map / popup consumers | persisted metadata replay | ✓ WIRED | `displayPoints`、`openSavedPointForPlaceOrStartDraft()` 均通过 `recordToDisplayPoint()` 复用持久化 metadata。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | `metadata.datasetVersion` | `CANONICAL_DATASET_VERSION` -> `enrichFeature()` | No — line 289 又覆盖为 `GEOMETRY_DATASET_VERSION` | ⚠️ STATIC / DRIFT |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | `summary.datasetVersion` | `feature.properties.datasetVersion` | No — 直接继承了 shard 中被覆盖后的 geometry version | ⚠️ HOLLOW |
| `apps/server/scripts/backfill-record-metadata.ts` | backfill update payload | `buildCanonicalMetadataLookup()` | Partial — 仅写 `travelRecord` / `smokeRecord` | ✗ DISCONNECTED |
| `apps/web/src/constants/overseas-support.ts` | `SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH` | generated contracts constant | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `displayName` / `typeLabel` / `subtitle` | persisted `TravelRecord` fields | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Build pipeline can regenerate Phase 28 geometry outputs | `pnpm --filter @trip-map/web geo:build:check` | 成功生成 856 entries，其中 overseas 487 条 | ✓ PASS |
| Contracts package remains buildable | `pnpm --filter @trip-map/contracts build` | `tsc -p tsconfig.json` 退出码 0 | ✓ PASS |
| Backfill helper regression still runs | `pnpm --filter @trip-map/server test test/record-metadata-backfill.e2e-spec.ts` | 2 tests passed | ✓ PASS |
| New-country resolve matrix still runs | `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` | 24 tests passed | ✓ PASS |
| Web consumer compatibility on persisted metadata still runs | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | 48 tests passed | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `GEOX-01` | `28-01`, `28-02` | 用户可以在更广的优先海外国家/地区上稳定识别并记录旅行 | ✓ SATISFIED | 21 国 authoring matrix 已落地；`canonical-resolve.e2e-spec.ts` 与 `records-travel.e2e-spec.ts` 实际通过。 |
| `GEOX-02` | `28-01`, `28-02`, `28-03` | 扩展后的海外记录在地图、时间轴和统计视图中保持一致的标题、类型与归类 | ✗ BLOCKED | `datasetVersion` split-brain 与 `userTravelRecord` 未回填会让旧 overseas 记录在 bootstrap/sync/未来 timeline/statistics 中继续带旧 metadata。 |

Orphaned requirements: none found. `.planning/REQUIREMENTS.md` 仅将 `GEOX-01` 和 `GEOX-02` 映射到 Phase 28。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | 289 | canonical datasetVersion 被 geometry version 覆盖 | 🛑 Blocker | 造成 server 与 contracts 对 authoritative `datasetVersion` 的语义分裂。 |
| `apps/server/scripts/backfill-record-metadata.ts` | 99 | backfill 只覆盖 `travelRecord` / `smokeRecord` | 🛑 Blocker | 已登录用户真实读写的 `userTravelRecord` 不会升级到 Phase 28 metadata。 |
| `apps/server/test/phase28-overseas-cases.ts` | 175 | regression 将 geometry version 当作 authoritative datasetVersion | ⚠️ Warning | 测试会固化错误语义，掩盖 `datasetVersion` split-brain。 |

### Gaps Summary

Phase 28 已经完成了覆盖范围扩展本身：21 国 build-time support matrix、13 国 resolve/save 回归、generated supported-country summaries、以及 map consumer 直吃持久化 metadata 这几部分都真实存在且能跑通。

但 phase goal 仍未达成，原因是两条根因级 blocker 仍在代码里：

1. `datasetVersion` 语义已经 split-brain。build script 明明创建了 `canonical-authoritative-2026-04-21`，却在写入 shard 时覆盖成 `2026-04-21-geo-v3`；server lookup 和回归测试继续把这个 geometry version 当 authoritative metadata，而 contracts Phase 28 fixtures 又坚持 canonical version。这会让 exact-match、防伪、回填和未来 consumer 的“同一字段”不再指向同一语义。

2. backfill 没有覆盖真正被 bootstrap/sync/time-based consumers 读取的 `userTravelRecord`。当前测试只是验证“新写入的正确记录可以被正确回放”，没有验证“老记录会被升级后再回放”。因此既有 overseas 用户数据仍可能保留旧 `typeLabel` / `subtitle` / `datasetVersion`，直接破坏 GEOX-02 和 Phase 29/30 的复用前提。

建议后续动作：

1. 修正 `build-geometry-manifest.mjs`，让 canonical `datasetVersion` 保留在 canonical metadata 中，仅把 geometry 版本保留在 `geometryRef.geometryDatasetVersion` / manifest entry。
2. 重新生成 `apps/web/public/geo/2026-04-21-geo-v3/*` 与 `packages/contracts/src/generated/geometry-manifest.generated.ts`，并统一 server/contracts/tests 的 authoritative datasetVersion 断言。
3. 扩展 `backfill-record-metadata.ts` 到 `userTravelRecord`，再补一条迁移 e2e：旧 overseas `userTravelRecord` -> 执行 backfill -> `/auth/bootstrap` / same-user sync 返回升级后的 Phase 28 metadata。

---

_Verified: 2026-04-21T08:01:29Z_  
_Verifier: Claude (gsd-verifier)_
