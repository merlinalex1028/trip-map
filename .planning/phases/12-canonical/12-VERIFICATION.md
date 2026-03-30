---
phase: 12-canonical
verified: 2026-03-30T11:23:30Z
status: passed
score: 4/4 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 2/4
  gaps_closed:
    - "同一地点在 popup、drawer、已保存记录和地图高亮中保持同一个 canonical 身份，不会出现名称、边界和保存结果对不上的情况。"
    - "用户关闭再重开同一记录后，系统仍能还原同一地点与边界，不会因为展示名或数据版本变化被识别成另一条地点。"
  gaps_remaining: []
  regressions: []
---

# Phase 12: Canonical 地点语义 Verification Report

**Phase Goal:** 用户点击地图后，`server` 会返回稳定的 canonical 地点结果，并明确区分中国市级与海外一级行政区语义。  
**Verified:** 2026-03-30T11:23:30Z  
**Status:** passed  
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 用户点击中国地点时得到市级结果，点击海外地点时得到一级行政区结果，界面会明确显示对应层级，而不是继续统一伪装成“城市”。 | ✓ VERIFIED | `packages/contracts/src/place.ts` 与 `packages/contracts/src/resolve.ts` 固定 canonical taxonomy 和三分支 resolve union；`apps/server/test/canonical-resolve.e2e-spec.ts` 覆盖 Beijing / Hong Kong / California；popup/drawer 直接渲染 `typeLabel` 与 `subtitle`。 |
| 2 | 同一地点在 popup、drawer、已保存记录和地图高亮中保持同一个 canonical 身份，不会出现名称、边界和保存结果对不上的情况。 | ✓ VERIFIED | `apps/web/src/services/city-boundaries.ts` 增加 canonical boundary 映射与 boundary-level coverage helper；`apps/web/src/stores/map-points.ts` 用真实几何命中派生 `activeBoundaryCoverageState`；`apps/web/src/components/WorldMapStage.spec.ts` 锁定 canonical Beijing 高亮与 California missing。 |
| 3 | 用户关闭再重开同一记录后，系统仍能还原同一地点与边界，不会因为展示名或数据版本变化被识别成另一条地点。 | ✓ VERIFIED | `apps/web/src/services/point-storage.ts` 持久化 `placeId` / `boundaryId` / `placeKind` / `datasetVersion` / `clickLat` / `clickLng`；`apps/web/src/stores/map-points.ts` 继续按 `placeId` 复用 saved point；`apps/web/src/components/WorldMapStage.spec.ts` 与 `apps/web/src/components/PointPreviewDrawer.spec.ts` 分别锁定 reopened Beijing highlight 与 reopened California unsupported notice。 |
| 4 | 当点击结果无法可靠命中到中国市级或海外一级行政区时，界面会给出明确 fallback 或失败反馈，而不是静默创建错误地点。 | ✓ VERIFIED | `apps/server/src/modules/canonical-places/canonical-places.service.ts` 对 no-match / mismatch 返回 `failed`；`apps/server/test/canonical-resolve.e2e-spec.ts` 覆盖 `NO_CANONICAL_MATCH` 与 `CANDIDATE_MISMATCH`；`apps/web/src/components/WorldMapStage.vue` failed 分支只提示、不建 draft。 |

**Score:** 4/4 roadmap truths verified

### Plan Must-Haves Cross-Check

| Plan | Must-haves | Status | Evidence |
| --- | --- | --- | --- |
| `12-01` | 3 truths | ✓ VERIFIED | contracts 中 `PlaceKind`、`ChinaAdminType`、`CanonicalResolveResponse`、fixtures 与 contract spec 全部存在并通过。 |
| `12-02` | 3 truths | ✓ VERIFIED | `CanonicalPlacesModule`、`/places/resolve`、`/places/confirm`、fixture-backed authoritative resolver 与 e2e 全部成立。 |
| `12-03` | 3 truths | ✓ VERIFIED | `WorldMapStage` 点击链路走 server API；store 与 snapshot 共享 canonical 字段；旧 `version: 1` 快照保持 incompatible。 |
| `12-04` | 3 truths | ✓ VERIFIED | popup/drawer 都显示 canonical `displayName` / `typeLabel` / `subtitle`；候选表面不再提供 fallback CTA；UI spec 覆盖北京/香港/加州。 |
| `12-05` | 3 truths | ✓ VERIFIED | canonical boundary 映射、真实 `activeBoundaryCoverageState`、Beijing reopen highlight 与 California unsupported notice 全部有实现和回归。 |

**Plan Truth Coverage:** 15/15 verified

### Previous Gap Closure

| Previous Gap | Current Status | Evidence |
| --- | --- | --- |
| canonical boundaryId mapping broken between server fixtures and web geometry dataset | ✓ CLOSED | `apps/web/src/services/city-boundaries.ts` 中 `CANONICAL_BOUNDARY_ID_TO_RENDERABLE_ID` 显式映射 `datav-cn-beijing -> cn-beijing-municipality`、`datav-cn-hong-kong -> hk-hong-kong-island-cluster`，并把 Aba / Tianjin / Langfang / California 显式判定为 `null`。 |
| `activeBoundaryCoverageState` only checked `boundaryId` non-empty | ✓ CLOSED | `apps/web/src/stores/map-points.ts` 改为调用 `hasBoundaryCoverageForBoundaryId(activePoint.value.boundaryId)`；canonical point 无几何命中时返回 `missing`，legacy city 仍保留 `cityId` 兜底。 |
| reopened canonical boundary highlight had no automated regression | ✓ CLOSED | `apps/web/src/components/WorldMapStage.spec.ts` 明确断言 save/close/reopen Beijing 后仍渲染 `data-boundary-id="cn-beijing-municipality"`；`apps/web/src/components/PointPreviewDrawer.spec.ts` 明确断言 reopened California 显示 unsupported notice。 |

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `packages/contracts/src/place.ts` | canonical taxonomy 与 summary 字段 | ✓ VERIFIED | `PlaceKind = 'CN_ADMIN' | 'OVERSEAS_ADMIN1'`，并包含 `typeLabel` / `parentLabel` / `subtitle`。 |
| `packages/contracts/src/resolve.ts` | resolved / ambiguous / failed 合同 | ✓ VERIFIED | request / confirm DTO shape、failed reason、discriminated union 全部存在。 |
| `packages/contracts/src/fixtures.ts` | Phase 12 resolved / ambiguous / failed fixtures | ✓ VERIFIED | Beijing / Hong Kong / California / ambiguous / failed fixtures 与 admin semantics 完整。 |
| `apps/server/src/modules/canonical-places/*` | `/places/resolve` 与 `/places/confirm` authoritative 入口 | ✓ VERIFIED | module / controller / service / fixtures / DTO / e2e 全部 wired。 |
| `apps/web/src/services/api/canonical-places.ts` | web resolve/confirm API client | ✓ VERIFIED | 使用 `createApiUrl('/places/resolve')` 与 `createApiUrl('/places/confirm')`。 |
| `apps/web/src/services/point-storage.ts` | canonical v2 snapshot 持久化 | ✓ VERIFIED | `trip-map:point-state:v2`、`version: 2`、canonical identity 与原始点击坐标都被保存。 |
| `apps/web/src/services/city-boundaries.ts` | canonical boundaryId -> renderable boundaryId mapping | ✓ VERIFIED | 提供 `resolveRenderableBoundaryId()`、`hasBoundaryCoverageForBoundaryId()`、`getBoundaryById()` 显式映射入口。 |
| `apps/web/src/stores/map-points.ts` | canonical identity、reopen reuse、真实 boundary support state | ✓ VERIFIED | `activeBoundaryCoverageState` 走真实几何命中，`summarySurfaceState` 传播同一支持态，`openSavedPointForPlaceOrStartDraft()` 继续按 `placeId` 复用。 |
| `apps/web/src/components/WorldMapStage.vue` | server-authoritative click flow 与 canonical highlight | ✓ VERIFIED | 点击与候选确认走 canonical API；边界层通过 `getBoundaryById()` 读取 renderable boundary。 |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | popup canonical title/type/subtitle/candidates | ✓ VERIFIED | 直接渲染 `typeLabel` / `subtitle` / candidate canonical fields，并在 missing 时显示 boundary unsupported notice。 |
| `apps/web/src/components/PointPreviewDrawer.vue` | drawer canonical title/type/subtitle/unsupported notice | ✓ VERIFIED | 直接渲染 `typeLabel` / `subtitle`，并根据 store 的 `activeBoundaryCoverageState` 显示 unsupported notice。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `packages/contracts/src/index.ts` | `place.ts` / `resolve.ts` | single-entry re-export | ✓ WIRED | `export * from './place'` 与 `export * from './resolve'` 都存在。 |
| `apps/server/src/app.module.ts` | `CanonicalPlacesModule` | Nest imports | ✓ WIRED | server 已导入 `CanonicalPlacesModule`。 |
| `apps/server/src/modules/canonical-places/canonical-places.controller.ts` | `CanonicalPlacesService` | `resolve()` / `confirm()` | ✓ WIRED | controller 经 DTO 校验后直接调用 service。 |
| `apps/web/src/components/WorldMapStage.vue` | `apps/web/src/services/api/canonical-places.ts` | `resolveCanonicalPlace()` / `confirmCanonicalPlace()` | ✓ WIRED | 地图点击与候选确认都通过 server authoritative API。 |
| `apps/web/src/services/point-storage.ts` | `apps/web/src/stores/map-points.ts` | canonical persistence fields | ✓ WIRED | `placeId` / `boundaryId` / `placeKind` / `datasetVersion` / `clickLat` / `clickLng` 在 store 与 snapshot 间保持同构。 |
| `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` | `apps/web/src/services/city-boundaries.ts` | canonical `boundaryId` mapping | ✓ WIRED | server fixture 输出的 Beijing / Hong Kong / Aba / Tianjin / Langfang / California ids 在 web 端都被映射或显式判定 unsupported。 |
| `apps/web/src/stores/map-points.ts` | `apps/web/src/components/map-popup/PointSummaryCard.vue` / `apps/web/src/components/PointPreviewDrawer.vue` | `boundarySupportState` / `typeLabel` / `subtitle` | ✓ WIRED | popup 与 drawer 都消费 store 派生状态，不再依赖 spec 手工注入运行时路径。 |
| `apps/web/src/stores/map-points.ts` | `apps/web/src/components/WorldMapStage.vue` | `selectedBoundaryId` / `savedBoundaryIds` | ✓ WIRED | Stage 通过 `getBoundaryById()` 把 persisted canonical `boundaryId` 映射为当前可绘制边界。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/canonical-places/canonical-places.service.ts` | `place` / `candidates` | `canonicalPlaceCatalog` + `CANONICAL_RESOLVE_FIXTURES` | Yes | ✓ FLOWING |
| `apps/web/src/services/point-storage.ts` | `userPoints[*].placeId` 等 canonical 字段 | `saveDraftAsPoint()` -> localStorage v2 snapshot | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `activeBoundaryCoverageState` | `hasBoundaryCoverageForBoundaryId()` + `hasBoundaryCoverageForCityId()` | Yes | ✓ FLOWING |
| `apps/web/src/components/WorldMapStage.vue` | `selectedBoundaryGroup` / `savedBoundaryGroups` | `getBoundaryById(boundaryId)` -> `resolveRenderableBoundaryId()` -> current geo dataset | Yes | ✓ FLOWING |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | `summaryTypeLabel` / `summarySubtitle` / `boundarySupportNotice` | `summarySurfaceState` | Yes | ✓ FLOWING |
| `apps/web/src/components/PointPreviewDrawer.vue` | `drawerTypeLabel` / `drawerSubtitle` / `drawerBoundarySupportNotice` | `activePoint` + `activeBoundaryCoverageState` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| contracts 输出 canonical taxonomy 与三分支 resolve union | `pnpm --dir packages/contracts exec vitest run src/contracts.spec.ts` | `5 tests passed` | ✓ PASS |
| server authoritative resolve/confirm 行为 | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts` | `7 tests passed` | ✓ PASS |
| web canonical mapping/store/highlight/drawer 行为 | `pnpm --dir apps/web exec vitest run src/services/city-boundaries.spec.ts src/stores/map-points.spec.ts src/components/WorldMapStage.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts` | `32 tests passed` | ✓ PASS |
| phase-local typecheck | `pnpm --dir packages/contracts exec tsc --noEmit` / `pnpm --dir apps/server exec tsc --noEmit` / `pnpm --dir apps/web exec tsc --noEmit` | all exited `0` | ✓ PASS |
| 当前 web 边界数据文件是否真的只包含 renderable ids，而非 canonical ids | `node -e "const fs=require('fs'); const geo=JSON.parse(fs.readFileSync('apps/web/src/data/geo/city-boundaries.geo.json','utf8')); const ids=new Set(geo.features.map(f=>f.properties.boundaryId)); const check=['cn-beijing-municipality','hk-hong-kong-island-cluster','datav-cn-beijing','datav-cn-hong-kong','datav-cn-aba','ne-admin1-us-california']; for (const id of check) console.log(id+':'+ids.has(id));"` | `cn-beijing-municipality:true`, `hk-hong-kong-island-cluster:true`, `datav-cn-beijing:false`, `datav-cn-hong-kong:false`, `datav-cn-aba:false`, `ne-admin1-us-california:false` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `ARC-02` | `12-02`, `12-03`, `12-05` | `server` 成为 canonical area resolve 权威来源 | ✓ SATISFIED | `CanonicalPlacesModule` 提供 `/places/resolve` 与 `/places/confirm`；`WorldMapStage` 点击与确认链路直接调用 API。 |
| `PLC-01` | `12-01`, `12-02`, `12-05` | 中国市级 / 海外一级行政区语义明确 | ✓ SATISFIED | contracts taxonomy、server fixtures/e2e、popup/drawer 文案与 highlight support-state 一致。 |
| `PLC-02` | `12-01`, `12-02`, `12-05` | 稳定 canonical `placeId` 与 boundary identity | ✓ SATISFIED | contracts 固定 `placeId`/`boundaryId`；reopen reuse 继续按 `placeId`；boundary mapping 不改写持久化字段合同。 |
| `PLC-03` | `12-03`, `12-05` | 持久化 `placeKind`、`boundaryId`、`datasetVersion`、原始点击坐标 | ✓ SATISFIED | point-storage v2 snapshot 显式保存并加载这些字段。 |
| `PLC-04` | `12-01`, `12-02`, `12-05` | 无法可靠命中时给出明确 fallback/failed | ✓ SATISFIED | server `failed` union 与 WorldMapStage failed/unsupported notice 都存在，且不创建错误 draft。 |
| `PLC-05` | `12-03`, `12-04`, `12-05` | popup、drawer、已保存记录、地图高亮保持同一 canonical 身份 | ✓ SATISFIED | popup/drawer/store/highlight/reopen 现在围绕同一 canonical identity；Beijing highlight 与 California missing 都有回归。 |
| `UIX-04` | `12-01`, `12-04`, `12-05` | 用户清楚区分中国市级与海外一级行政区语义 | ✓ SATISFIED | `PointSummaryCard` / `PointPreviewDrawer` 直接渲染 `typeLabel` 与 `subtitle`，并覆盖 Beijing / Hong Kong / California。 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| - | - | No blocker anti-patterns found in phase-critical runtime files. | - | 旧 blocker 对应的 hollow wiring 已被实质修复。 |

### Human Verification Required

None. 这次 re-verification 的旧 gap 都是代码级连线问题，当前已由实现、回归测试与 typecheck 共同关闭；不再需要先开新的 gap planning 才能继续。

### Gaps Summary

旧版 verification 的两个 blocker 已关闭。`apps/web/src/services/city-boundaries.ts` 现在明确区分“canonical boundaryId”和“当前 web 可渲染 boundaryId”，并把当前无几何支持的 canonical id 显式判定为 unsupported。`apps/web/src/stores/map-points.ts` 不再把非空 `boundaryId` 误判成 supported，而是把真实几何命中结果传播到 popup、drawer 与地图高亮链路。`apps/web/src/components/WorldMapStage.spec.ts` 和 `apps/web/src/components/PointPreviewDrawer.spec.ts` 又补上了 Beijing reopen highlight 与 California reopened unsupported 的自动化证据。

结论是：Phase 12 在 `12-05` 之后已经真正达成 phase goal，不需要继续为旧 verification 的 gap 再做 gap planning。后续 Phase 13/14 可以直接把这里的 canonical identity、boundary mapping 与 geometry-backed support-state 当成既定约束继续推进。

---

_Verified: 2026-03-30T11:23:30Z_  
_Verifier: Claude (gsd-verifier)_
