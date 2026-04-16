---
phase: 26-overseas-coverage-foundation
verified: 2026-04-16T09:13:55Z
status: human_needed
score: 11/11 must-haves verified
overrides_applied: 0
human_verification:
  - test: "点击支持国家的 admin1（如 Tokyo / Gangwon / Dubai）"
    expected: "popup 直接进入正常详情态，点亮按钮可用，点亮后刷新或重新 bootstrap 仍显示相同标题/类型/副标题"
    why_human: "需要真实浏览器中的地图点击、popup 呈现与交互节奏确认；自动化测试只覆盖了代码路径和接口语义"
  - test: "点击未支持的海外地区（如 British Columbia / Vancouver）"
    expected: "popup 内出现“暂不支持点亮”说明，按钮保留但禁用，页面不弹全局 interactionNotice"
    why_human: "是否‘清楚可解释’属于真实 UI/UX 体验判断，需人工确认文案位置、可见性和理解成本"
  - test: "检查 disabled CTA 的文案、顺序和无障碍表现"
    expected: "unsupported notice 位于 boundary-missing notice 之前，按钮 title/aria-label 均为“该地点暂不支持点亮”"
    why_human: "视觉顺序、屏幕阅读器体验和浏览器原生 tooltip 呈现无法仅靠当前自动化完全替代"
---

# Phase 26: Overseas Coverage Foundation Verification Report

**Phase Goal:** 用户可以在一组优先海外国家/地区获得更实用且可解释的 admin1 点亮体验
**Verified:** 2026-04-16T09:13:55Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Phase 26 的 authoritative 海外支持面只覆盖 `JP / KR / TH / SG / MY / AE / AU / US`，不是把 Natural Earth 的全球 admin1 直接暴露给产品 | ✓ VERIFIED | [apps/web/scripts/geo/overseas-admin1-support.mjs](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/overseas-admin1-support.mjs#L1) 明确声明 8 国 allowlist；[apps/web/scripts/geo/build-geometry-manifest.mjs](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/build-geometry-manifest.mjs#L369) 只写入 `isSupportedOverseasAdmin1Feature(props)` 通过的 feature；`geo:build:check` 实际产出 `overseas entries: 228`，并且 manifest 仅含 `AE/AU/JP/KR/MY/SG/TH/US` 8 国 |
| 2 | `AE-X..` / `AU-X..` 噪声条目不会进入 authoritative manifest，`SG-01~05` 被显式接受 | ✓ VERIFIED | [apps/web/scripts/geo/overseas-admin1-support.mjs](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/overseas-admin1-support.mjs#L27) 显式允许 `SG-01~05`；同文件 [#L34](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/overseas-admin1-support.mjs#L34) 与 [#L39](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/overseas-admin1-support.mjs#L39) 显式 deny `AE-X01~ / AE-X02~ / AU-X02~ / AU-X03~ / AU-X04~`；对 generated manifest 的脚本检查结果 `badCount: 0` |
| 3 | 服务端 `/places/resolve` 继续从过滤后的 manifest + 几何分片命中支持地区，并把支持面外点击落为 `OUTSIDE_SUPPORTED_DATA` | ✓ VERIFIED | [apps/server/src/modules/canonical-places/canonical-places.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/canonical-places/canonical-places.service.ts#L69) 启动时从 `GEOMETRY_MANIFEST` 加载真实几何与 metadata；[apps/server/test/canonical-resolve.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/canonical-resolve.e2e-spec.ts#L209) 验证 Tokyo，[apps/server/test/canonical-resolve.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/canonical-resolve.e2e-spec.ts#L231) 验证 Gangwon，[apps/server/test/canonical-resolve.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/canonical-resolve.e2e-spec.ts#L254) 验证 Dubai，[apps/server/test/canonical-resolve.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/canonical-resolve.e2e-spec.ts#L279) 与 [apps/server/test/canonical-resolve.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/canonical-resolve.e2e-spec.ts#L450) 验证 AU 噪声/Vancouver 返回 `OUTSIDE_SUPPORTED_DATA` |
| 4 | 单一明确的海外 canonical 命中会直接进入正常 popup/点亮链路，只有 `ambiguous` 才进入候选确认 | ✓ VERIFIED | [apps/web/src/components/LeafletMapStage.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue#L690) `resolved` 直接 `applyResolvedPlace()`；[apps/web/src/components/LeafletMapStage.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue#L707) 仅 `ambiguous` 进入 `startPendingCanonicalSelection()`；[apps/web/src/components/LeafletMapStage.spec.ts](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.spec.ts#L561) 与 [apps/web/src/components/LeafletMapStage.spec.ts](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.spec.ts#L572) 覆盖两条分支 |
| 5 | 已识别且受支持的海外地点可以走真实点亮保存链路，而不只是 resolve 成功 | ✓ VERIFIED | [apps/web/src/components/LeafletMapStage.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue#L484) 受支持点位会调用 `mapPointsStore.illuminate()`；[apps/web/src/stores/map-points.ts](/Users/huangjingping/i/trip-map/apps/web/src/stores/map-points.ts#L361) 到 [apps/web/src/stores/map-points.ts](/Users/huangjingping/i/trip-map/apps/web/src/stores/map-points.ts#L427) 会 POST `/records`；后端 [apps/server/src/modules/records/records.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts#L73) 接收并校验 authoritative overseas payload |
| 6 | 海外 `displayName / typeLabel / parentLabel / subtitle` 只在 authoritative catalog 中确定一次，并通过保存记录与 `/auth/bootstrap` 原样回放 | ✓ VERIFIED | [apps/server/src/modules/canonical-places/place-metadata-catalog.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/canonical-places/place-metadata-catalog.ts#L59) 强制 geometry shard 含完整 canonical metadata；[apps/server/src/modules/records/records.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts#L117) 校验持久化文本必须与 catalog 一致；[apps/server/src/modules/auth/auth.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/auth/auth.service.ts#L27) 与 [apps/server/src/modules/auth/auth.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/auth/auth.service.ts#L154) 直接回放记录字段；[apps/server/test/auth-bootstrap.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/auth-bootstrap.e2e-spec.ts#L235) 验证 Tokyo 回放 |
| 7 | 旧 metadata backfill 已从 4 个 fixture 切到当前 manifest-backed place catalog | ✓ VERIFIED | [apps/server/scripts/backfill-record-metadata.ts](/Users/huangjingping/i/trip-map/apps/server/scripts/backfill-record-metadata.ts#L55) 直接从 `buildManifestCanonicalMetadataLookup()` 构建 lookup；文件内不存在 `PHASE12_RESOLVED_*` 引用；[apps/server/test/records-travel.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/records-travel.e2e-spec.ts#L309) 之后同文件的 backfill 用例验证 Tokyo 旧记录可被 manifest-backed lookup 回填 |
| 8 | `/records` 对 `OVERSEAS_ADMIN1` 写入会复用 authoritative catalog 校验，拒绝 out-of-scope 或伪造 metadata payload | ✓ VERIFIED | [apps/server/src/modules/records/records.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts#L95) 到 [apps/server/src/modules/records/records.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts#L130) 通过 `placeId` + `boundaryId` + 文本字段逐项校验；[apps/server/test/records-travel.e2e-spec.ts](/Users/huangjingping/i/trip-map/apps/server/test/records-travel.e2e-spec.ts#L309) 验证 `ca-british-columbia` 被 400 拒绝 |
| 9 | 前端展示层继续消费持久化字段，不会在 bootstrap 或 popup 阶段按 `placeId` 重算海外标题、副标题或类型标签 | ✓ VERIFIED | [apps/web/src/stores/map-points.ts](/Users/huangjingping/i/trip-map/apps/web/src/stores/map-points.ts#L51) `recordToDisplayPoint()` 直接使用 record 的 `displayName / subtitle / typeLabel`；[apps/web/src/stores/map-points.spec.ts](/Users/huangjingping/i/trip-map/apps/web/src/stores/map-points.spec.ts#L270) 明确断言使用持久化的 `Tokyo (Persisted)` / `Persisted subtitle from record` |
| 10 | 已识别但暂未支持的海外区域会在当前 popup 内得到清楚解释，而不是再走全局 `interactionNotice` 主路径 | ✓ VERIFIED | [apps/web/src/constants/overseas-support.ts](/Users/huangjingping/i/trip-map/apps/web/src/constants/overseas-support.ts#L1) 固定支持国家文案与 unsupported notice builder；[apps/web/src/components/LeafletMapStage.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue#L725) 将 `OUTSIDE_SUPPORTED_DATA` 写入 `fallbackNotice` 并 `clearInteractionNotice()`；[apps/web/src/components/LeafletMapStage.spec.ts](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.spec.ts#L889) 验证 unsupported popup fallback |
| 11 | 未支持地区的点亮按钮保持原位但禁用，`title/aria-label` 与 notice 顺序都明确表达“该地点暂不支持点亮” | ✓ VERIFIED | [apps/web/src/components/map-popup/PointSummaryCard.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.vue#L127) 先渲染 `summaryFallbackNotice` 再渲染 `boundarySupportNotice`；同文件 [#L139](/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.vue#L139) 到 [#L143](/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.vue#L143) 生成 disabled 按钮提示；[apps/web/src/components/map-popup/PointSummaryCard.spec.ts](/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.spec.ts#L163) 验证 `title/aria-label`，并有 notice 顺序断言覆盖 |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/web/scripts/geo/overseas-admin1-support.mjs` | 8 国 priority-country support catalog 与国家级 allow/denylist | ✓ VERIFIED | 存在、内容实质性完整；含 8 国 allowlist、AE/AU denylist、SG-01~05 allowlist |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | 只为支持国家输出 overseas authoritative layer / manifest entry | ✓ VERIFIED | `buildOverseasLayer()` 在写 layer 前调用 `isSupportedOverseasAdmin1Feature()` |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | 过滤后的 authoritative overseas manifest | ✓ VERIFIED | contracts build 成功；脚本检查显示 overseas 仅 228 条且只含 8 国，无 `AE-X/AU-X` |
| `apps/server/test/canonical-resolve.e2e-spec.ts` | priority-country resolve / unsupported regression coverage | ✓ VERIFIED | 23 tests 通过，覆盖 Tokyo/Gangwon/Dubai/AU 噪声/Vancouver |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | manifest-backed overseas canonical metadata lookup | ✓ VERIFIED | 从 `GEOMETRY_MANIFEST + geometry shards` 构建 `byPlaceId / byBoundaryId` lookup |
| `apps/server/scripts/backfill-record-metadata.ts` | fixture-free metadata backfill | ✓ VERIFIED | 通过 shared metadata lookup 回填 legacy travel/smoke rows |
| `apps/server/src/modules/records/records.service.ts` | `/records` authoritative overseas validation | ✓ VERIFIED | create/import 两条写入链均执行 authoritative 校验 |
| `apps/server/test/auth-bootstrap.e2e-spec.ts` | bootstrap 文本回放验证 | ✓ VERIFIED | 提权后通过；显式断言 overseas record 字段原样返回 |
| `apps/server/test/records-travel.e2e-spec.ts` | out-of-scope payload rejection 与 backfill regression | ✓ VERIFIED | 提权后通过；断言 `ca-british-columbia` 被拒、Tokyo backfill 生效 |
| `apps/server/test/records-sync.e2e-spec.ts` | same-user multi-session replay consistency | ✓ VERIFIED | 提权后通过；断言 session B bootstrap 拿到相同 overseas 文本 |
| `apps/web/src/stores/map-points.spec.ts` | record-to-display replay regression | ✓ VERIFIED | 66 tests 所在批次通过；断言前端不按 `placeId` 重算海外文本 |
| `apps/web/src/constants/overseas-support.ts` | 支持国家名单与 unsupported 文案 builder | ✓ VERIFIED | 文案真源已抽离，LeafletMapStage 引用它构建 fallback notice |
| `apps/web/src/components/LeafletMapStage.vue` | popup-only unsupported feedback 与 illuminate gating | ✓ VERIFIED | `resolved/ambiguous/unsupported` 三条主路径都已接通 |
| `apps/web/src/components/LeafletMapStage.spec.ts` | unsupported popup-only feedback 与 ambiguous-only regression | ✓ VERIFIED | 组件集成测试通过，覆盖 unsupported popup、ambiguous-only、resolved direct detail |
| `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` | disabled unsupported CTA contract verification | ✓ VERIFIED | 组件测试通过，覆盖 disabled CTA 与可访问性提示 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `overseas-admin1-support.mjs` | `build-geometry-manifest.mjs` | priority-country filter and country-specific override application | ✓ WIRED | [build-geometry-manifest.mjs](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/build-geometry-manifest.mjs#L27) 导入 `getOverseasAdmin1SourceFeatureId` / `isSupportedOverseasAdmin1Feature`，并在 [#L377](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/build-geometry-manifest.mjs#L377) 实际过滤 |
| `build-geometry-manifest.mjs` | `geometry-manifest.generated.ts` | generated authoritative manifest | ✓ WIRED | [build-geometry-manifest.mjs](/Users/huangjingping/i/trip-map/apps/web/scripts/geo/build-geometry-manifest.mjs#L403) `generateTypescriptManifest()` 生成 `GEOMETRY_MANIFEST` |
| `geometry-manifest.generated.ts` | `canonical-places.service.ts` | manifest-backed overseas geometry lookup | ✓ WIRED | [canonical-places.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/canonical-places/canonical-places.service.ts#L77) 对 `GEOMETRY_MANIFEST` 逐项加载 shard + feature + metadata |
| `place-metadata-catalog.ts` | `records.service.ts` | authoritative support and metadata validation for POST /records and /records/import | ✓ WIRED | [records.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts#L108) 同时按 `placeId` 与 `boundaryId` 命中 shared catalog，再比对 `displayName/typeLabel/parentLabel/subtitle` |
| `place-metadata-catalog.ts` | `canonical-places.service.ts` | shared authoritative metadata lookup | ✓ WIRED | [canonical-places.service.ts](/Users/huangjingping/i/trip-map/apps/server/src/modules/canonical-places/canonical-places.service.ts#L17) 导入 `getCanonicalPlaceSummaryByBoundaryId()`，在 [#L99](/Users/huangjingping/i/trip-map/apps/server/src/modules/canonical-places/canonical-places.service.ts#L99) 复用 |
| `place-metadata-catalog.ts` | `backfill-record-metadata.ts` | manifest-backed backfill input | ✓ WIRED | [backfill-record-metadata.ts](/Users/huangjingping/i/trip-map/apps/server/scripts/backfill-record-metadata.ts#L5) 导入 shared builder，并在 [#L55](/Users/huangjingping/i/trip-map/apps/server/scripts/backfill-record-metadata.ts#L55) 组装 lookup |
| `overseas-support.ts` | `LeafletMapStage.vue` | unsupported notice copy and supported-country list | ✓ WIRED | [LeafletMapStage.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue#L11) 导入 builder，在 [#L728](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue#L728) 生成 unsupported notice |
| `LeafletMapStage.vue` | `PointSummaryCard.vue` | fallbackNotice + disabled illuminate button semantics | ✓ WIRED | [LeafletMapStage.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue#L807) 向 popup 传递 `surface` 与 `is-illuminatable`，由 [PointSummaryCard.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.vue#L127) 和 [PointSummaryCard.vue](/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.vue#L139) 渲染说明与 disabled CTA |
| `auth-bootstrap.e2e-spec.ts` | `map-points.spec.ts` | bootstrap replayed text is rendered without recomputation | ✓ WIRED | 两侧测试分别锁住服务端回放和前端消费持久化字段，组成 OVRS-02 的跨层契约 |
| `LeafletMapStage.spec.ts` | `PointSummaryCard.spec.ts` | popup-only unsupported explanation without global notice | ✓ WIRED | 集成测试验证 popup fallback 路径，组件测试验证 CTA/notice 细节，共同覆盖 OVRS-03 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | `manifestEntries` / `layerFeatures` | Natural Earth GeoJSON + `isSupportedOverseasAdmin1Feature()` | Yes | ✓ FLOWING |
| `apps/server/src/modules/canonical-places/canonical-places.service.ts` | `supportedResolvedGeometries` | `GEOMETRY_MANIFEST` + `apps/web/public/geo/*/layer.json` + metadata catalog | Yes | ✓ FLOWING |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | `byPlaceId` / `byBoundaryId` | geometry shards中嵌入的 canonical metadata | Yes | ✓ FLOWING |
| `apps/server/src/modules/records/records.service.ts` | `placeSummary` / `boundarySummary` | shared metadata lookup | Yes | ✓ FLOWING |
| `apps/web/src/components/LeafletMapStage.vue` | `summarySurfaceState` / fallback draft point | `/places/resolve` 响应与 `lookupCountryRegionByCoordinates()` 结果 | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `displayPoints` | `TravelRecord` 持久化字段与 `/records` API 返回 | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| geometry build 实际收口到 8 国 authoritative overseas manifest | `pnpm --filter @trip-map/web run geo:build:check` | exit 0；dry-run 产出 `overseas entries: 228`、`total entries: 597` | ✓ PASS |
| canonical resolve 支持/未支持海外点击语义 | `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts` | 23 tests passed | ✓ PASS |
| persisted overseas records 的写入、bootstrap 回放、多 session 一致性 | `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts test/auth-bootstrap.e2e-spec.ts test/records-sync.e2e-spec.ts` | 沙箱内因数据库网络限制失败；提权后 19 tests passed | ✓ PASS |
| web popup / disabled CTA / store replay 语义 | `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/stores/map-points.spec.ts` | 66 tests passed | ✓ PASS |
| 相关包静态检查与 contracts 编译 | `pnpm --filter @trip-map/web typecheck` / `pnpm --filter @trip-map/server typecheck` / `pnpm --filter @trip-map/contracts build` | exit 0 / exit 0 / exit 0 | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `OVRS-01` | `26-01-PLAN.md`, `26-03-PLAN.md` | 用户可以在优先海外国家/地区的一级行政区上稳定识别并点亮地点 | ✓ SATISFIED | 8 国 manifest 收口、Tokyo/Gangwon/Dubai resolve 回归、resolved direct-detail + illuminate 保存链路均已验证 |
| `OVRS-02` | `26-02-PLAN.md` | 已保存的海外旅行记录在刷新、重开和跨设备后仍稳定显示标题、类型标签和副标题 | ✓ SATISFIED | shared metadata catalog、/records authoritative 校验、`/auth/bootstrap` 回放与 map-points replay 测试均通过 |
| `OVRS-03` | `26-03-PLAN.md` | 点击暂未支持的海外区域时，用户会看到明确的“不支持点亮”说明 | ✓ SATISFIED | unsupported popup fallback、disabled CTA、无全局 notice 主路径的组件/集成测试通过 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| - | - | 未发现阻塞型或警告级 stub / placeholder / orphaned wiring | ℹ️ Info | 扫描到的 `null` / `[]` / `console.log` 均为初始状态或 CLI 输出，不构成空实现 |

### Human Verification Required

### 1. 支持国家真实点亮

**Test:** 登录后点击 `Tokyo`、`Gangwon` 或 `Dubai` 对应 admin1 区域，再点击 popup 中的“点亮”按钮。  
**Expected:** 直接进入普通详情态，不经过 candidate-select；点亮成功后刷新页面或重新打开应用仍看到相同标题/类型/副标题。  
**Why human:** 自动化已覆盖 resolve、保存和 bootstrap，但真实地图点选、Leaflet popup 位置与用户感知节奏仍需人工确认。

### 2. 未支持海外地区 popup-only 解释

**Test:** 点击 `British Columbia` / `Vancouver` 一类支持面外地区。  
**Expected:** popup 中出现“已识别到该地区 / 当前暂不支持点亮”的说明；按钮保留在原位但禁用；页面不出现全局 `interactionNotice`。  
**Why human:** “解释是否清楚”与“是否误解为点击失效”属于体验判断，需人眼确认。

### 3. 无障碍与说明顺序

**Test:** 用浏览器检查 disabled 按钮的 `title`/`aria-label`，并确认 unsupported notice 在 boundary-missing notice 之前。  
**Expected:** `title` 与 `aria-label` 都是“该地点暂不支持点亮”，且 unsupported 文案优先呈现。  
**Why human:** 浏览器原生 tooltip、读屏器表现和视觉层级无法只靠现有 Vitest 完整覆盖。

### Gaps Summary

自动化层面未发现阻塞 Phase 26 目标达成的代码缺口，11/11 个 must-haves 均已验证。当前剩余的是必须人工完成的 UI/交互验收，因此状态为 `human_needed`，而不是 `passed`。

补充的非阻塞测试风险：
- `LeafletMapStage.spec.ts` 的“single resolved overseas hit”用的是 California 路径，说明 direct-resolve 节奏已锁住，但浏览器中仍建议手动再点一次 Tokyo / Gangwon 这类本阶段新增国家。
- `/records` 已验证“支持面外 payload 被拒绝”，但当前没有单独的 e2e 用例专测“placeId 合法但 displayName/typeLabel/subtitle 被篡改”的 400 分支；源码校验已存在，不构成本次 blocking gap。

---

_Verified: 2026-04-16T09:13:55Z_  
_Verifier: Claude (gsd-verifier)_
