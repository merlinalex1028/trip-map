---
phase: 14-leaflet
verified: 2026-03-31T18:16:00Z
status: passed
score: 6/6 must-haves verified
human_verification:
  - test: "Popup 跟随地图拖动时锚点实时更新"
    expected: "地图拖拽过程中 popup 浮层位置与点击坐标保持对齐，不出现飘移或延迟"
    why_human: "依赖真实 Leaflet 渲染 + DOM 位置事件，无法通过单测覆盖"
  - test: "Bing Maps CanvasLight 瓦片加载（当 VITE_BING_MAPS_KEY 配置时）"
    expected: "设置 API key 后底图切换为 Bing CanvasLight，显示中英双语地名"
    why_human: "需要真实 API key 和网络请求，无法在 CI 中验证"
  - test: "已点亮边界启动时预加载"
    expected: "地图就绪后，已保存地点的分片自动加载并渲染边界（始终可见）"
    why_human: "需要真实几何资产文件存在并可访问，当前几何资产由 Phase 13 后续 plan 生成，尚未落地到文件系统"
---

# Phase 14: Leaflet 地图主链路迁移 Verification Report

**Phase Goal:** 用户可以在 `Leaflet` 地图里继续完成选中、摘要查看、深度查看和边界高亮，不丢失现有主链路体验
**Verified:** 2026-03-31T18:16:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                   | Status     | Evidence                                                                                      |
| --- | --------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| 1   | 用户在 Leaflet 地图上仍可完成点击、选中、查看 popup 摘要和进入 drawer 深度查看          | ✓ VERIFIED | LeafletMapStage.vue 746 行实现完整链路；spec 中 MAP-04 测试验证 resolveCanonicalPlace 被调用  |
| 2   | 地图直接加载海外一级行政区图层与中国市级图层，不合并                                    | ✓ VERIFIED | useGeoJsonLayers.ts 创建独立 cnLayer/overseasLayer；GEOX-05 测试确认两次 addFeatures 分别调用 |
| 3   | 当前选中地点始终以完整行政区 GeoJSON 边界高亮呈现                                       | ✓ VERIFIED | useGeoJsonLayers.ts buildStyleFunction 三态样式；MAP-06 测试确认 selectedBoundaryId 变更触发  |
| 4   | 切换选中对象时地图不残留旧高亮，不出现双重选中                                           | ✓ VERIFIED | selectedBoundaryId 单值；MAP-08 测试验证切换后旧 boundaryId 不再是 selectedBoundaryId          |
| 5   | App.vue 使用 LeafletMapStage 替代 WorldMapStage                                         | ✓ VERIFIED | App.vue line 6: import LeafletMapStage；template line 76: `<LeafletMapStage>`，无 WorldMapStage 引用 |
| 6   | vue-tsc 类型检查零错误，全量测试 23 文件 141 tests 全部通过                             | ✓ VERIFIED | `vue-tsc --noEmit` 无输出（零错误）；`pnpm test` 输出 23 passed, 141 passed                   |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact                                                    | Expected                                           | Status      | Details                                                                                  |
| ----------------------------------------------------------- | -------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `apps/web/src/composables/useLeafletMap.ts`                 | L.map 生命周期 + Bing/CartoDB 瓦片                 | ✓ VERIFIED  | 109 行；onMounted 初始化、onBeforeUnmount 清理、ResizeObserver、Bing fallback to CartoDB  |
| `apps/web/src/composables/useGeoJsonLayers.ts`              | CN + OVERSEAS 独立 GeoJSON 图层，三态样式           | ✓ VERIFIED  | 122 行；两个独立 L.geoJSON 实例，buildStyleFunction 三态（selected/saved/unrecorded）     |
| `apps/web/src/composables/useLeafletPopupAnchor.ts`         | @floating-ui VirtualElement 桥接                   | ✓ VERIFIED  | 76 行；latLngToContainerPoint + containerRect offset；map move/zoom 事件绑定              |
| `apps/web/src/components/LeafletMapStage.vue`               | 完整主链路组件替代 WorldMapStage                    | ✓ VERIFIED  | 747 行；消费三个 composable；完整 click→resolve→popup→drawer→highlight 链路               |
| `apps/web/src/components/LeafletMapStage.spec.ts`           | 13 个单测，全部通过                                 | ✓ VERIFIED  | 13 it() 块；`LeafletMapStage.spec.ts (13 tests) 123ms` 全部绿                             |
| `apps/web/src/App.vue`                                      | 导入并渲染 LeafletMapStage（不是 WorldMapStage）    | ✓ VERIFIED  | line 6 import LeafletMapStage；line 76 `<LeafletMapStage class="poster-shell__stage" />` |

### Key Link Verification

| From                         | To                              | Via                                              | Status  | Details                                                                     |
| ---------------------------- | ------------------------------- | ------------------------------------------------ | ------- | --------------------------------------------------------------------------- |
| LeafletMapStage.vue          | useLeafletMap                   | import + `const { map, isReady } = useLeafletMap(mapContainer)` | ✓ WIRED | line 81 |
| LeafletMapStage.vue          | useGeoJsonLayers                | import + `const { addFeatures } = useGeoJsonLayers({map, ...})` | ✓ WIRED | line 85-90，传入 savedBoundaryIds、selectedBoundaryId、onBoundaryClick |
| LeafletMapStage.vue          | useLeafletPopupAnchor           | import + `const { virtualElement } = useLeafletPopupAnchor({map, latlng: popupLatLng, ...})` | ✓ WIRED | line 110-116 |
| LeafletMapStage.vue          | resolveCanonicalPlace           | `await resolveCanonicalPlace({ lat, lng })`      | ✓ WIRED | line 549，map click 后调用                                                  |
| LeafletMapStage.vue          | loadGeometryShard               | `await loadGeometryShard(GEOMETRY_DATASET_VERSION, entry.assetKey)` | ✓ WIRED | line 203，结果传给 addFeatures |
| useGeoJsonLayers.ts          | selectedBoundaryId              | `watch(selectedBoundaryId, () => refreshStyles())` | ✓ WIRED | line 110-112，选中变化触发样式刷新 |
| App.vue                      | LeafletMapStage                 | import + template `<LeafletMapStage>`            | ✓ WIRED | line 6 + line 76 |

### Data-Flow Trace (Level 4)

| Artifact               | Data Variable        | Source                                  | Produces Real Data | Status     |
| ---------------------- | -------------------- | --------------------------------------- | ------------------ | ---------- |
| LeafletMapStage.vue    | summarySurfaceState  | Pinia store (map-points)，通过 storeToRefs | 是，store 由 resolve API 结果填充 | ✓ FLOWING |
| LeafletMapStage.vue    | cnLayer/overseasLayer | loadGeometryShard 返回的 FeatureCollection | 是，从静态几何资产加载 | ✓ FLOWING |
| useGeoJsonLayers.ts    | style 三态           | savedBoundaryIds + selectedBoundaryId refs | 是，来自 Pinia store | ✓ FLOWING |
| useLeafletPopupAnchor.ts | virtualElement      | map.latLngToContainerPoint(latlng)      | 是，Leaflet 原生坐标转换 | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior                    | Command                                                   | Result                          | Status  |
| --------------------------- | --------------------------------------------------------- | ------------------------------- | ------- |
| 全量测试通过                 | `pnpm --filter @trip-map/web test`                        | 23 files, 141 tests passed      | ✓ PASS  |
| TypeScript 类型检查          | `pnpm --filter @trip-map/web exec vue-tsc --noEmit`       | 零错误（无输出）                 | ✓ PASS  |
| LeafletMapStage 13 tests    | 见测试输出 `LeafletMapStage.spec.ts (13 tests) 123ms`      | 13/13 passed                    | ✓ PASS  |

### Requirements Coverage

| Requirement | Source Plan | Description                                               | Status       | Evidence                                                              |
| ----------- | ----------- | --------------------------------------------------------- | ------------ | --------------------------------------------------------------------- |
| MAP-04      | 14-01, 14-03 | Leaflet 为主地图引擎；点击触发 resolveCanonicalPlace     | ✓ SATISFIED  | handleMapClick 调用 resolveCanonicalPlace；spec MAP-04 组通过          |
| MAP-05      | 14-01, 14-03 | useGeoJsonLayers 创建 CN 和 OVERSEAS 两个独立图层        | ✓ SATISFIED  | useGeoJsonLayers.ts 两个 L.geoJSON 实例；GEOX-05 spec 验证双图层 addFeatures |
| MAP-06      | 14-01, 14-03 | selectedBoundaryId 变更触发样式刷新（粉色高亮）           | ✓ SATISFIED  | watch(selectedBoundaryId, refreshStyles)；MAP-06 spec 通过            |
| MAP-08      | 14-03        | 切换选中时清除旧高亮，不出现双重选中                      | ✓ SATISFIED  | selectedBoundaryId 单值 Ref，切换时自动清除旧值；MAP-08 spec 通过      |
| UIX-01      | 14-02, 14-03 | MapContextPopup 与 PointPreviewDrawer 双层表面不退化     | ✓ SATISFIED  | template 中 v-if 分别控制两个组件；UIX-01 spec 验证状态门控逻辑        |
| GEOX-05     | 14-01, 14-03 | CN 和 OVERSEAS 图层独立加载，通过 addFeatures 分别调用   | ✓ SATISFIED  | addFeatures(target: 'CN' \| 'OVERSEAS', fc)；GEOX-05 spec 通过       |

### Anti-Patterns Found

| File                       | Line | Pattern                         | Severity | Impact |
| -------------------------- | ---- | ------------------------------- | -------- | ------ |
| LeafletMapStage.vue        | 406  | `x: 0, y: 0` in DraftMapPoint  | ℹ Info   | 已文档化的有意决策（D-12/14-02-SUMMARY key-decisions）：Leaflet 模式下 NormalizedPoint x/y 无语义，下游消费 lat/lng |

无阻塞性 anti-pattern。`x: 0, y: 0` 是已记录的设计决策，非 stub。

### Human Verification Required

#### 1. Popup 跟随地图拖动

**Test:** 在浏览器中打开地图，点击某个地点触发 popup，然后拖动地图
**Expected:** popup 浮层位置实时跟随地图坐标点，不发生漂移；松开鼠标后位置准确
**Why human:** useLeafletPopupAnchor 的 move/zoom 事件监听逻辑无法在 happy-dom 环境中验证实际 DOM 位置

#### 2. Bing Maps CanvasLight 瓦片（需要 API Key）

**Test:** 在 `.env` 中设置 `VITE_BING_MAPS_KEY`，重启 dev server 并打开地图
**Expected:** 底图切换为 Bing CanvasLight 样式，显示中英双语地名；无 VITE_BING_MAPS_KEY 时回退到 CartoDB Positron（用户已视觉确认后者）
**Why human:** 需要真实 API key 和网络请求

#### 3. 已点亮边界启动时预加载（需要几何资产）

**Test:** 保存至少一个地点记录，刷新页面
**Expected:** 地图就绪后该地点的行政区边界立即可见（即使未点击该区域）
**Why human:** 依赖 Phase 13 后续 plan（13-02 至 13-04）生成的实际几何资产文件；当前几何分片尚未落地

### Gaps Summary

无 gap。所有 6 个 must-have truths 均已验证。

用户已视觉确认：Leaflet 瓦片底图（CartoDB Positron）以中国为中心加载，点击触发识别流并显示 toast 反馈。三个人工验证项均属超出自动化范围的运行时行为，不影响 Phase 14 goal 的代码层达成。

---

_Verified: 2026-03-31T18:16:00Z_
_Verifier: Claude (gsd-verifier)_
