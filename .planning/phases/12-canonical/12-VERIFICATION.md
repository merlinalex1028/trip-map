---
phase: 12-canonical
verified: 2026-03-30T10:50:58Z
status: gaps_found
score: 2/4 must-haves verified
gaps:
  - truth: "同一地点在 popup、drawer、已保存记录和地图高亮中保持同一个 canonical 身份，不会出现名称、边界和保存结果对不上的情况。"
    status: failed
    reason: "server 返回的 canonical boundaryId 与 web 侧当前边界数据集的 boundaryId 不对齐，WorldMapStage 只按 boundaryId 命中几何，导致 canonical 地点不会真正高亮；同时 store 把任何非空 boundaryId 都当作 supported，UI 也不会提示边界缺失。"
    artifacts:
      - path: "apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts"
        issue: "canonical fixtures 使用 datav-cn-beijing / datav-cn-hong-kong / datav-cn-aba / ne-admin1-us-california 等 boundaryId。"
      - path: "apps/web/src/services/city-boundaries.ts"
        issue: "getBoundaryById 只能命中 web 当前 city-boundaries.geo.json 内已有 boundaryId；spot-check 显示上述 canonical boundaryId 全部不存在。"
      - path: "apps/web/src/stores/map-points.ts"
        issue: "activeBoundaryCoverageState 只要 boundaryId 非空就返回 supported，掩盖了实际几何缺失。"
      - path: "apps/web/src/components/WorldMapStage.vue"
        issue: "边界图层与 anchor 都依赖 getBoundaryById(boundaryId)，命不中时直接不渲染。"
    missing:
      - "把 server canonical boundaryId 与 web 当前可渲染边界数据集对齐，或在 web 增加 canonical boundaryId -> 当前 boundary dataset id 的明确映射。"
      - "把 boundary support 判定改为基于实际几何命中结果，而不是 boundaryId 非空。"
      - "补一条使用 Phase 12 canonical fixtures 的地图高亮回归测试，而不是只测 legacy city drafts。"
  - truth: "用户关闭再重开同一记录后，系统仍能还原同一地点与边界，不会因为展示名或数据版本变化被识别成另一条地点。"
    status: partial
    reason: "placeId 与 datasetVersion 的持久化和重开复用是成立的，但重开后的 canonical boundaryId 仍然无法命中当前地图边界数据，用户看不到被还原的边界，高亮链路不完整。"
    artifacts:
      - path: "apps/web/src/services/point-storage.ts"
        issue: "已持久化 placeId / boundaryId / placeKind / datasetVersion / clickLat / clickLng。"
      - path: "apps/web/src/stores/map-points.ts"
        issue: "openSavedPointForPlaceOrStartDraft 按 placeId 复用已保存点，但 selectedBoundaryId 只是返回持久化字符串，不验证几何是否存在。"
      - path: "apps/web/src/components/PointPreviewDrawer.spec.ts"
        issue: "回归只验证标题/类型/副标题一致，没有验证重开后的 canonical 边界仍能真正高亮。"
    missing:
      - "为 reopened canonical point 补边界可视恢复校验。"
      - "在重开链路中把 boundary 可用性纳入状态判断和用户反馈。"
---

# Phase 12: Canonical 地点语义 Verification Report

**Phase Goal:** 用户点击地图后，`server` 会返回稳定的 canonical 地点结果，并明确区分中国市级与海外一级行政区语义。
**Verified:** 2026-03-30T10:50:58Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 用户点击中国地点时得到市级结果，点击海外地点时得到一级行政区结果，界面会明确显示对应层级，而不是继续统一伪装成“城市”。 | ✓ VERIFIED | contracts 把 `PlaceKind`/`ChinaAdminType`/`typeLabel`/`subtitle` 固定下来；server e2e 覆盖 Beijing/Hong Kong/California；popup/drawer 渲染 `typeLabel` 与 `subtitle`。 |
| 2 | 同一地点在 popup、drawer、已保存记录和地图高亮中保持同一个 canonical 身份，不会出现名称、边界和保存结果对不上的情况。 | ✗ FAILED | 名称与 identity 在 popup/drawer/store 中一致，但 canonical `boundaryId` 无法命中 web 当前边界数据，地图高亮链路断开。 |
| 3 | 用户关闭再重开同一记录后，系统仍能还原同一地点与边界，不会因为展示名或数据版本变化被识别成另一条地点。 | ✗ FAILED | `placeId` 复用和 v2 snapshot 持久化成立，但重开后 `boundaryId` 仍无法解析到几何，边界无法被恢复。 |
| 4 | 当点击结果无法可靠命中到中国市级或海外一级行政区时，界面会给出明确 fallback 或失败反馈，而不是静默创建错误地点。 | ✓ VERIFIED | `CanonicalResolveResponse` 有 `failed` 分支；server e2e 覆盖 `NO_CANONICAL_MATCH`/`CANDIDATE_MISMATCH`；`WorldMapStage` failed 分支只提示、不建 draft。 |

**Score:** 2/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `packages/contracts/src/place.ts` | canonical taxonomy 与 summary 字段 | ✓ VERIFIED | `PlaceKind`、`ChinaAdminType`、`typeLabel`、`parentLabel`、`subtitle` 已固定。 |
| `packages/contracts/src/resolve.ts` | resolved / ambiguous / failed 合同 | ✓ VERIFIED | discriminated union 与失败 reason 完整存在。 |
| `packages/contracts/src/fixtures.ts` | Phase 12 fixtures | ✓ VERIFIED | Beijing/Hong Kong/California/ambiguous/failed fixtures 存在。 |
| `apps/server/src/modules/canonical-places/*` | `/places/resolve` 与 `/places/confirm` authoritative 入口 | ✓ VERIFIED | controller、service、fixtures、DTO 和 e2e 全部存在并通过。 |
| `apps/web/src/services/api/canonical-places.ts` | web resolve/confirm API client | ✓ VERIFIED | 正确调用 `/places/resolve` 与 `/places/confirm`。 |
| `apps/web/src/services/point-storage.ts` | canonical v2 snapshot 持久化 | ✓ VERIFIED | `trip-map:point-state:v2`、`version: 2`、canonical 字段与 click 坐标持久化存在。 |
| `apps/web/src/stores/map-points.ts` | canonical identity、重开复用、边界支持状态 | ⚠️ HOLLOW | `placeId` 复用成立，但 `activeBoundaryCoverageState` 误把任意非空 `boundaryId` 当成 supported。 |
| `apps/web/src/components/WorldMapStage.vue` | server-authoritative click flow 与 canonical highlight | ⚠️ HOLLOW | resolve/confirm 主链路已切换，但边界图层只按 `getBoundaryById(boundaryId)` 查找，canonical ids 当前命不中。 |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | popup canonical title/type/subtitle/candidates | ✓ VERIFIED | 直接渲染 `typeLabel`、`subtitle`、`candidateHint`、推荐候选。 |
| `apps/web/src/components/PointPreviewDrawer.vue` | drawer canonical title/type/subtitle | ✓ VERIFIED | 直接渲染 `typeLabel` 与 `subtitle`。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `packages/contracts/src/index.ts` | `place.ts` / `resolve.ts` | single-entry re-export | ✓ WIRED | `export * from './place'` 与 `export * from './resolve'` 均存在。 |
| `apps/server/src/app.module.ts` | `CanonicalPlacesModule` | Nest imports | ✓ WIRED | `AppModule` 已导入 `CanonicalPlacesModule`。 |
| `apps/server/src/modules/canonical-places/canonical-places.controller.ts` | `CanonicalPlacesService` | `resolve()` / `confirm()` | ✓ WIRED | DTO 校验后直接调用 service。 |
| `apps/web/src/components/WorldMapStage.vue` | `apps/web/src/services/api/canonical-places.ts` | `resolveCanonicalPlace()` / `confirmCanonicalPlace()` | ✓ WIRED | 点击与候选确认都走 server API。 |
| `apps/web/src/services/point-storage.ts` | `apps/web/src/stores/map-points.ts` | `placeId` / `boundaryId` / `placeKind` / `datasetVersion` / `clickLat` / `clickLng` | ✓ WIRED | store 持久化与加载使用同一组 canonical 字段。 |
| `apps/web/src/stores/map-points.ts` | `apps/web/src/components/map-popup/PointSummaryCard.vue` / `apps/web/src/components/PointPreviewDrawer.vue` | `typeLabel` / `subtitle` | ✓ WIRED | popup/drawer 都直接消费 canonical 展示字段。 |
| `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` | `apps/web/src/services/city-boundaries.ts` | `boundaryId` | ✗ NOT_WIRED | server 返回的 canonical `boundaryId` 当前无法命中 web 边界数据集。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/canonical-places/canonical-places.service.ts` | `place` / `candidates` | `canonicalPlaceCatalog` + `CANONICAL_RESOLVE_FIXTURES` | Yes | ✓ FLOWING |
| `apps/web/src/services/point-storage.ts` | `userPoints[*].placeId` 等 canonical 字段 | `saveDraftAsPoint()` -> localStorage v2 snapshot | Yes | ✓ FLOWING |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | `summaryTypeLabel` / `summarySubtitle` | `summarySurfaceState` | Yes | ✓ FLOWING |
| `apps/web/src/components/PointPreviewDrawer.vue` | `drawerTypeLabel` / `drawerSubtitle` | `activePoint` | Yes | ✓ FLOWING |
| `apps/web/src/components/WorldMapStage.vue` | `selectedBoundaryGroup` / `savedBoundaryGroups` | `getBoundaryById(boundaryId)` | No | ✗ DISCONNECTED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| contracts 输出 canonical taxonomy 与三分支 resolve union | `pnpm --dir packages/contracts exec vitest run src/contracts.spec.ts` | 5 tests passed | ✓ PASS |
| server authoritative resolve/confirm 行为 | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts` | 7 tests passed | ✓ PASS |
| web canonical store / click flow / popup / drawer 行为 | `pnpm --dir apps/web exec vitest run src/services/point-storage.spec.ts src/stores/map-points.spec.ts src/components/WorldMapStage.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts` | 25 tests passed | ✓ PASS |
| canonical `boundaryId` 能否命中当前 web 边界数据 | `node -e "const data=require('./apps/web/src/data/geo/city-boundaries.geo.json'); const ids=new Set(data.features.map(f=>f.properties.boundaryId)); const check=['datav-cn-beijing','datav-cn-hong-kong','datav-cn-aba','ne-admin1-us-california','cn-beijing-municipality']; for (const id of check) console.log(id, ids.has(id));"` | `datav-cn-beijing false`, `datav-cn-hong-kong false`, `datav-cn-aba false`, `ne-admin1-us-california false`, `cn-beijing-municipality true` | ✗ FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `ARC-02` | `12-02`, `12-03` | `server` 成为 canonical area resolve 权威来源 | ✓ SATISFIED | `CanonicalPlacesModule` 提供 `/places/resolve` 与 `/places/confirm`；`WorldMapStage` 点击链路直接调用 API。 |
| `PLC-01` | `12-01`, `12-02` | 中国市级 / 海外一级行政区语义明确 | ✓ SATISFIED | contracts taxonomy、server e2e 与 popup/drawer 文案都区分 `直辖市` / `特别行政区` / `一级行政区`。 |
| `PLC-02` | `12-01`, `12-02` | 稳定 canonical `placeId` | ✓ SATISFIED | contracts 固定 `placeId`；store 按 `placeId` 复用已保存点。 |
| `PLC-03` | `12-03` | 持久化 `placeKind`、`boundaryId`、`datasetVersion`、原始点击坐标 | ✓ SATISFIED | point-storage v2 snapshot 显式保存并加载这些字段。 |
| `PLC-04` | `12-01`, `12-02` | 无法可靠命中时给出明确 fallback/failed | ✓ SATISFIED | failed union、server e2e、`WorldMapStage` failed 分支不创建错误 draft。 |
| `PLC-05` | `12-03`, `12-04` | popup、drawer、已保存记录、地图高亮保持同一 canonical 身份 | ✗ BLOCKED | popup/drawer/已保存记录一致，但地图高亮使用的 canonical `boundaryId` 不能命中当前 web 边界数据。 |
| `UIX-04` | `12-01`, `12-04` | 用户清楚区分中国市级与海外一级行政区语义 | ✓ SATISFIED | `PointSummaryCard` / `PointPreviewDrawer` 直接渲染 `typeLabel` 与 `subtitle`，组件回归已覆盖 Beijing/Hong Kong/California。 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/web/src/stores/map-points.ts` | 109 | 以 `boundaryId` 非空代替“边界真实可用”判断 | 🛑 Blocker | canonical point 即使找不到对应几何也会被标成 `supported`，UI 不会显示缺失提示。 |
| `apps/web/src/components/WorldMapStage.spec.ts` | 252 | 边界高亮回归只覆盖 legacy city drafts | ⚠️ Warning | Phase 12 canonical `boundaryId` -> 高亮链路没有被测试锁住。 |
| `apps/web/src/components/PointPreviewDrawer.spec.ts` | 221 | 手工注入 `boundarySupportState: 'supported'` | ⚠️ Warning | 组件测试绕过了 store 对真实边界可用性的派生逻辑。 |

### Human Verification Required

无。自动化已发现阻塞 phase goal 的代码级 gap，当前不进入人工验收阶段。

### Gaps Summary

Phase 12 的 contracts、server authoritative resolve、web canonical store、popup/drawer 真实类型展示都已经落地，并且对应回归与 typecheck 全部通过。这证明“canonical 语义”和“server 真源”两件事基本成立。

但从 phase goal 倒推，`boundaryId` 不是只要被存起来就算完成。当前 server fixtures 输出的 canonical `boundaryId` 与 web 侧实际可渲染的边界数据集不一致，`WorldMapStage` 又只按 `boundaryId` 直接取几何，结果是 canonical 点位无法形成真实地图高亮。更严重的是，store 还把任何非空 `boundaryId` 误判为 `supported`，所以 UI 不会提示用户“当前地点暂不支持边界高亮”。这直接打断了 success criteria 2 和 3，也使 `PLC-05` 仍然未达成。

---

_Verified: 2026-03-30T10:50:58Z_
_Verifier: Claude (gsd-verifier)_
