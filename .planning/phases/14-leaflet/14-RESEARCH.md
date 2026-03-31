# Phase 14: Leaflet 地图主链路迁移 - Research

**Researched:** 2026-03-31
**Domain:** Leaflet 1.9 + Vue 3 地图迁移、GeoJSON 图层管理、@floating-ui 坐标同步、瓦片底图选型
**Confidence:** HIGH（核心 Leaflet API）/ MEDIUM（底图选型）/ HIGH（集成模式）

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**底图与瓦片**
- D-01: 底图使用 **Bing Maps** 瓦片服务，支持中英双语地名显示。
- D-02: API key 通过环境变量配置，具体集成方式由 Claude 判断。
- D-03: 地图初始视图以**中国为中心**展示，符合主要用户群体习惯。
- D-04: 缩放级别设置**最小/最大范围限制**，避免缩得太小看不到行政区边界或放得太大底图无意义。具体缩放范围由 Claude 判断。
- D-05: 底图视觉风格偏**淡雅简洁**，让行政区高亮和点亮状态更突出，与现有可爱风 UI 协调。

**图层加载策略**
- D-06: 中国市级与海外 admin-1 两个 GeoJSON 图层采用**按需加载**策略，复用 Phase 13 的 shard loader + 缓存机制。
- D-07: **已点亮地点对应的分片优先预加载**，确保已点亮边界在地图启动时即可见。
- D-08: 已点亮地点的边界在地图上**始终可见**，无论缩放级别。
- D-09: 加载反馈（loading 状态、失败重试等细节）由 Claude 判断。

**点击→识别→popup 链路**
- D-10: 用户**点击瓦片底图**触发识别，Leaflet 提供经纬度坐标后调用 server canonical resolve API。
- D-11: 点击识别过程中，先在点击位置显示**临时标记 + loading 状态**，识别完成后替换为 popup。
- D-12: 点击已点亮行政区边界时，**直接打开对应记录的 popup**，跳过 server resolve。

**高亮与 popup 锚定**
- D-13: 边界高亮使用 **Leaflet 原生 GeoJSON layer style**，通过 style 函数区分已点亮/当前选中/未记录三种状态。
- D-14: popup 锚定**继续使用 @floating-ui**，锚点从 SVG 元素改为 Leaflet 坐标点转换的屏幕位置。
- D-15: 高亮状态维持**三态区分**：已点亮（填充色）、当前选中（边框突出 + 填充）、未记录（无样式）。
- D-16: popup 视觉风格保留可爱风主视觉，允许小幅调整尺寸、位置或动画以适配 Leaflet 交互特性。

### Claude's Discretion

- Bing Maps API key 的具体集成方式（Leaflet 插件选型、加载方式）
- 缩放级别的具体数值范围
- 底图淡雅风格的具体实现（是否使用 Bing Maps 的 Light 主题或 CSS 滤镜处理）
- 图层加载时的 loading 状态指示器、加载失败重试策略
- popup 在地图拖动/缩放时与 @floating-ui 的同步策略
- 候选确认在 Leaflet 中的具体交互形式
- 识别失败时的视觉反馈形式
- 高亮状态三态的具体配色方案
- 临时标记的视觉设计

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GEOX-05 | 系统不在底层预合并中国与海外 GeoJSON，在前端 Leaflet 中直接加载两个独立图层 | L.geoJSON() 分别创建 CN 层和 OVERSEAS 层；shard loader 按需加载各自分片 |
| MAP-04 | 前端地图主引擎切换为 Leaflet，保持点击、选中、高亮和弹层交互能力 | L.map() 替换 WorldMapStage 中的 SVG 渲染；`map.on('click')` 触发 canonical resolve |
| MAP-05 | 地图同时渲染海外一级行政区图层与中国市级图层，视觉与交互保持统一体验 | 两个 L.geoJSON layer 共享同一 style 函数规范；同一 onEachFeature handler |
| MAP-06 | 用户选中地点后，地图以该行政区完整 GeoJSON 边界高亮，不退回单点 marker | `layer.setStyle()` 按 selectedBoundaryId 状态更新样式；不使用 L.marker 作为主表达 |
| MAP-08 | 地图切换选中对象、关闭 popup、重开已有记录时，不残留错误高亮或双重选中状态 | 维护单一 `currentSelectedLayer` 引用；切换前 `resetStyle()` 旧选中层 |
| UIX-01 | 用户选中地点后，仍通过 popup + drawer 双层表面完成摘要查看与深度编辑，不因换图引擎退化 | @floating-ui VirtualElement 锚定到 Leaflet `latLngToContainerPoint`；map `move` 事件刷新锚点 |
</phase_requirements>

---

## Summary

Phase 14 将现有 SVG + d3-geo 世界地图替换为 Leaflet 瓦片地图，并在 Leaflet 中完整恢复主链路：点击底图 → canonical resolve → popup 摘要 → drawer 深度查看 → 行政区边界高亮。核心迁移目标是 `WorldMapStage.vue`，该组件目前混合了 SVG 渲染、坐标投影、popup 锚定和事件处理逻辑，迁移后这些职责将分别由 Leaflet 原生 API 和调整后的 @floating-ui 组合承担。

底图方面存在一个重要风险：用户决策 D-01 指定使用 Bing Maps，但 Bing Maps 免费账户已于 2025 年 6 月 30 日停止服务。现有 `leaflet-bing-layer` 包（3.3.1）已 6 年未更新，且与未来 Leaflet 2.0 的兼容性存疑。Claude 的裁量权（D-02 集成方式）覆盖了这一问题，因此推荐将实现方式调整为通过 Bing Maps REST Imagery Metadata API 手写 `L.TileLayer`（无需第三方插件），或在 Bing key 不可用时提供 CartoDB Positron 作为回退。

图层管理上，将 Phase 13 的 `geometry-loader.ts` shard loader 与 `geometry-manifest.ts` 直接集成到 Leaflet GeoJSON 图层的按需加载流程中，无需改变 loader 实现。已点亮地点的边界分片需要在地图 `ready` 后立即批量预加载，然后按 `boundaryId` 对每个 feature 着色。

**Primary recommendation:** 使用 Leaflet 原生 API（`L.map`、`L.geoJSON`、`L.tileLayer`）直接集成，不引入 `@vue-leaflet/vue-leaflet` 包装层——该包装层增加了 Vue 3 异步加载限制，且对 GeoJSON layer 引用的直接控制不如原生 Leaflet API 灵活。

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| leaflet | 1.9.4 | 地图引擎核心 | 稳定版本，TypeScript 类型完整，GeoJSON 图层内建 |
| @types/leaflet | 1.9.21 | TypeScript 类型 | 与 leaflet 1.9.4 配套，覆盖所有 API |
| @floating-ui/dom | ^1.7.6（已有） | popup 锚定 | 已在项目中使用，VirtualElement 支持动态锚点 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| leaflet/dist/leaflet.css | （随 leaflet 包） | 地图默认样式 | 必须在入口文件导入，否则地图控件丢失 |

> 不引入 `@vue-leaflet/vue-leaflet` —— 详见「Anti-Patterns to Avoid」。

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 原生 Leaflet API | @vue-leaflet/vue-leaflet 0.10.1 | vue-leaflet 提供 Vue 3 语法糖，但需异步加载 Leaflet 组件，对 GeoJSON layer ref 的直接控制受限，且 issue 显示存在计时问题（#108）。原生 API 在 `onMounted` 中直接创建地图更可控 |
| 手写 Bing TileLayer | leaflet-bing-layer 3.3.1 | leaflet-bing-layer 已 6 年未更新，与 Bing Maps REST API 的动态元数据请求逻辑可以手写实现（~30 行），且不引入维护风险 |
| CartoDB Positron | Bing Maps | CartoDB Positron 是无需 API key 的开源方案，淡雅简洁，但中文地名标注依赖 OSM 贡献者的 name:zh 数据，覆盖率不均匀 |

**Installation:**
```bash
pnpm --filter @trip-map/web add leaflet
pnpm --filter @trip-map/web add -D @types/leaflet
```

**Version verification (已执行):**
- `leaflet`: 1.9.4（npm view 确认，2024-03 发布）
- `@types/leaflet`: 1.9.21（npm view 确认）

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── components/
│   ├── LeafletMapStage.vue        # 替换 WorldMapStage.vue 的 Leaflet 地图容器（主重构目标）
│   ├── map-popup/                  # 复用现有 MapContextPopup.vue、PointSummaryCard.vue
│   └── PointPreviewDrawer.vue      # 复用，不需大改
├── composables/
│   ├── useLeafletMap.ts            # 封装 L.map 生命周期（创建、销毁、resize）
│   ├── useGeoJsonLayers.ts         # 封装 CN/OVERSEAS 两个 GeoJSON layer + 样式管理
│   ├── useLeafletPopupAnchor.ts    # 封装 latLngToContainerPoint + map.on('move') → VirtualElement
│   └── usePopupAnchoring.ts        # 已有，继续复用 @floating-ui 计算层
└── services/
    ├── geometry-loader.ts          # 已有，直接复用
    └── geometry-manifest.ts        # 已有，直接复用
```

### Pattern 1: Leaflet 地图在 Vue 3 `onMounted` 中初始化

**What:** Leaflet 需要 DOM 元素存在后才能创建地图实例。必须在 `onMounted` 中初始化，不能在 `setup()` 顶层调用 `L.map()`。

**When to use:** 所有 Leaflet 实例创建（map、tileLayer、geoJSON layer）。

**Example:**
```typescript
// Source: Leaflet official docs — leafletjs.com/reference.html
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { onMounted, onBeforeUnmount, shallowRef } from 'vue'

export function useLeafletMap(containerRef: Ref<HTMLElement | null>) {
  const map = shallowRef<L.Map | null>(null)

  onMounted(() => {
    if (!containerRef.value) return
    map.value = L.map(containerRef.value, {
      center: [35.0, 105.0],  // 中国居中
      zoom: 4,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
    })
  })

  onBeforeUnmount(() => {
    map.value?.remove()
    map.value = null
  })

  return { map }
}
```

### Pattern 2: 手写 Bing Maps TileLayer（绕过插件）

**What:** Bing Maps REST Imagery Metadata API 返回动态 tile URL。通过一次 metadata 请求获取 tile URL 模板，再传给 `L.tileLayer()`。

**When to use:** D-01 要求 Bing Maps 底图时。

**Example:**
```typescript
// Source: Bing Maps REST docs — learn.microsoft.com/en-us/bingmaps/rest-services/imagery/get-imagery-metadata
async function createBingTileLayer(apiKey: string): Promise<L.TileLayer> {
  const metaUrl = `https://dev.virtualearth.net/REST/V1/Imagery/Metadata/CanvasLight?output=json&uriScheme=https&culture=zh-CN&key=${apiKey}`
  const resp = await fetch(metaUrl)
  const data = await resp.json()
  const resource = data.resourceSets[0].resources[0]
  // Bing 使用 {subdomain} {zoom} {x} {y} 占位符格式
  const urlTemplate = resource.imageUrl
    .replace('{subdomain}', '{s}')
    .replace('{zoom}', '{z}')
    .replace('{x}', '{x}')
    .replace('{y}', '{y}')
  return L.tileLayer(urlTemplate, {
    subdomains: resource.imageUrlSubdomains,
    attribution: '© Microsoft Bing Maps',
    maxZoom: 19,
  })
}
```

**注意：** Bing Maps `CanvasLight` 是淡雅风格，符合 D-05。`culture=zh-CN` 参数使地名优先显示中文。

### Pattern 3: GeoJSON 图层按需加载 + 样式三态

**What:** 两个独立 GeoJSON layer（CN、OVERSEAS）分别管理。通过 `onEachFeature` 绑定 click 事件，通过 `style` 函数根据当前 Pinia store 状态返回样式。

**When to use:** GEOX-05、MAP-05、MAP-06、MAP-08。

**Example:**
```typescript
// Source: Leaflet GeoJSON guide — leafletjs.com/examples/geojson/
// Source: Leaflet Choropleth example — leafletjs.com/examples/choropleth/

function getFeatureStyle(
  feature: GeoJSON.Feature,
  savedBoundaryIds: Set<string>,
  selectedBoundaryId: string | null,
): L.PathOptions {
  const bId = feature.properties?.boundaryId as string | undefined
  if (!bId) return { opacity: 0, fillOpacity: 0 }

  if (bId === selectedBoundaryId) {
    return {
      color: 'rgba(244, 143, 177, 0.96)',
      weight: 3.2,
      fillColor: 'rgba(244, 143, 177, 0.28)',
      fillOpacity: 0.28,
      opacity: 1,
    }
  }
  if (savedBoundaryIds.has(bId)) {
    return {
      color: 'rgba(132, 199, 216, 0.82)',
      weight: 2.4,
      fillColor: 'rgba(132, 199, 216, 0.24)',
      fillOpacity: 0.24,
      opacity: 1,
    }
  }
  return { opacity: 0, fillOpacity: 0 }
}
```

**切换选中时清除旧高亮（MAP-08）：**
```typescript
// 维护单一 selectedLayer 引用，切换时 resetStyle + setStyle
let currentSelectedLayer: L.Path | null = null

function selectLayer(newLayer: L.Path, boundaryId: string) {
  if (currentSelectedLayer && currentSelectedLayer !== newLayer) {
    geojsonLayer.resetStyle(currentSelectedLayer)  // 恢复为 style function 返回值
  }
  newLayer.setStyle(selectedStyle)
  currentSelectedLayer = newLayer
}
```

### Pattern 4: @floating-ui VirtualElement 跟随地图移动

**What:** popup 使用 @floating-ui 锚定，锚点改为 Leaflet 坐标→屏幕坐标的 VirtualElement。地图 `move` 事件触发 `latLngToContainerPoint` 重算，更新 VirtualElement 的 `getBoundingClientRect`。

**When to use:** D-14、UIX-01。

**Example:**
```typescript
// Source: Leaflet reference — leafletjs.com/reference.html#map-latlngtocontainerpoint
// Source: @floating-ui VirtualElement — floating-ui.com/docs/virtual-elements

function createLeafletVirtualElement(
  map: L.Map,
  latlng: L.LatLng,
): VirtualElement {
  return {
    getBoundingClientRect(): DOMRect {
      const point = map.latLngToContainerPoint(latlng)
      // 需要加上地图容器在视口中的偏移
      const containerRect = map.getContainer().getBoundingClientRect()
      const x = containerRect.left + point.x
      const y = containerRect.top + point.y
      return {
        width: 0, height: 0,
        x, y,
        left: x, right: x,
        top: y, bottom: y,
        toJSON: () => ({}),
      } as DOMRect
    },
  }
}

// 在 composable 中监听 map move 事件触发 @floating-ui updatePosition()
map.on('move zoom', () => {
  void updatePosition()  // usePopupAnchoring 暴露的 updatePosition
})
```

### Pattern 5: 已点亮分片预加载策略

**What:** 地图 `ready` 后，根据 `savedBoundaryIds` 查询 manifest，批量预加载对应分片。预加载使用 `Promise.allSettled` 避免单个失败阻塞全部。

**When to use:** D-07、D-08。

**Example:**
```typescript
// Source: geometry-loader.ts (Phase 13)
async function preloadSavedBoundaryShards(
  savedBoundaryIds: string[],
): Promise<void> {
  const refs = savedBoundaryIds
    .map(id => getGeometryManifestEntry(id))
    .filter((entry): entry is GeometryManifestEntry => entry !== null)

  // 去重 assetKey，避免重复请求同一分片（多个 boundaryId 可能共享分片）
  const uniqueAssetKeys = [...new Set(refs.map(r => `${r.geometryDatasetVersion}:${r.assetKey}`))]

  await Promise.allSettled(
    uniqueAssetKeys.map(key => {
      const [version, assetKey] = key.split(':')
      return loadGeometryShard(version!, assetKey!)
    })
  )
}
```

### Anti-Patterns to Avoid

- **在 `setup()` 顶层初始化 L.map()：** DOM 尚不存在，map 会抛错。必须在 `onMounted` 中初始化。
- **用 `@vue-leaflet/vue-leaflet` 管理 GeoJSON layer 引用：** vue-leaflet 的 `LGeoJson` 异步加载机制会延迟 layer ref 可用时机，导致计时问题（已有 issue #108）。对于需要精确控制 `layer.setStyle()`、`layer.resetStyle()` 的场景，直接使用原生 Leaflet API 更可靠。
- **忘记 `leaflet/dist/leaflet.css` 导入：** 不导入 CSS 会导致地图控件（缩放按钮）和瓦片显示异常（z-index 错乱）。
- **在 Leaflet `style` 函数中直接读取 Vue `ref` 值：** Leaflet 的 `style` 函数在图层创建时被调用，不是响应式的。需要通过 `eachLayer` + `setStyle` 重新应用，或在 watch 中重建 layer。
- **双重选中：** 同时存在 `selectedBoundaryGroup`（SVG 时代）和 Leaflet 的 selected layer。迁移后应只有 Leaflet layer 的 `setStyle` 控制选中状态，不保留旧 SVG 逻辑残留。
- **GeoJSON 底图点击与 `map.on('click')` 冲突：** 点击已有 GeoJSON feature 时，`map.on('click')` 和 `layer.on('click')` 都会触发（除非 `L.DomEvent.stopPropagation(e)` 阻止冒泡）。D-12 要求点击已点亮边界直接开 popup，需要在 feature click handler 里 `stopPropagation`。

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 坐标→像素转换 | 手写经纬度→CSS 像素公式 | `map.latLngToContainerPoint(latlng)` | Leaflet 内部处理投影、缩放、平移；手写公式在缩放/平移时会偏移 |
| GeoJSON feature 点击检测 | 手写 point-in-polygon 检测 | `L.geoJSON` 的 `onEachFeature` + `layer.on('click')` | Leaflet 内建 hit-testing 处理多边形、MultiPolygon、反转路径等边界情况 |
| 图层事件传播控制 | 手写事件捕获/冒泡逻辑 | `L.DomEvent.stopPropagation(e)` | Leaflet 封装了跨浏览器的 DOM 事件控制，直接用 `event.stopPropagation()` 可能不够 |
| 地图容器 resize 响应 | `ResizeObserver` 手动调整 | `map.invalidateSize()` | Leaflet 内建重算；必须在容器尺寸变化后调用，否则地图会错位 |
| Bing tile URL 构造 | 手写 Quadkey → tile URL 算法 | Bing REST Metadata API 返回 URL 模板 | Bing tile 使用 Quadkey 编码（非 XYZ），metadata API 直接返回可用模板 |

**Key insight:** Leaflet 的 GeoJSON layer 内建了完整的 hit-testing 和样式管理，不需要在 Vue 层复现这些逻辑。

---

## Runtime State Inventory

> 本阶段是功能迁移（SVG→Leaflet），非 rename/refactor，无 runtime state 需要迁移。

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | 无 — 地图引擎变更不影响 localStorage 中的 userPoints/seedOverrides | 无 |
| Live service config | 无 — 无外部服务配置依赖图引擎 | 无 |
| OS-registered state | 无 | 无 |
| Secrets/env vars | `VITE_BING_MAPS_KEY`（新增）— 需要在 `.env` 中配置 Bing Maps API key | 新增 env var；不涉及已有 state 迁移 |
| Build artifacts | 无需变更 — `world-map.svg` 静态资产会被删除，但不影响已编译产物 | 删除 `apps/web/src/assets/world-map.svg` 引用 |

---

## Common Pitfalls

### Pitfall 1: Leaflet CSS 未导入导致地图渲染异常

**What goes wrong:** 地图瓦片显示但 z-index 混乱，或控件（缩放按钮）不可见/位置错误。
**Why it happens:** Leaflet 依赖自己的 CSS 管理图层叠加顺序（`.leaflet-pane` 的 z-index 体系）。不导入则所有 pane 都在默认 z-index，导致冲突。
**How to avoid:** 在 `apps/web/src/main.ts` 中导入 `import 'leaflet/dist/leaflet.css'`。
**Warning signs:** 地图可见但瓦片不完整，或 GeoJSON layer 被 tile layer 覆盖。

### Pitfall 2: Vitest + happy-dom 下 Leaflet 初始化失败

**What goes wrong:** 测试中 `L.map()` 报错，因为 happy-dom 缺少 Leaflet 依赖的某些 canvas/SVG API。
**Why it happens:** Leaflet 内部使用了 `createElementNS('http://www.w3.org/2000/svg', ...)` 和 canvas，happy-dom 对这些的支持不完整。
**How to avoid:** 在 `vitest.config.ts` 的 `server.deps.inline` 中添加 `leaflet`（强制 Vitest 内联处理），或在测试中 `vi.mock('leaflet')` 用存根替代。对于 `WorldMapStage` 的集成测试，mock 整个 `useLeafletMap` composable，只测试业务逻辑（与现有 `vi.mock('../composables/usePopupAnchoring')` 模式一致）。
**Warning signs:** 测试报 `createElementNS is not a function` 或 `Cannot read properties of undefined (reading 'addLayer')`。

### Pitfall 3: map.on('click') 与 GeoJSON feature click 双重触发

**What goes wrong:** 点击已点亮的行政区边界时，既执行了 D-12 的"直接打开 popup"逻辑，又触发了 D-10 的"调用 canonical resolve API"逻辑，导致 API 多余请求或 popup 状态覆盖。
**Why it happens:** Leaflet 的事件默认冒泡：`layer.on('click', handler)` 之后事件还会冒泡到 `map.on('click', handler)`。
**How to avoid:** 在 GeoJSON feature 的 click handler 末尾调用 `L.DomEvent.stopPropagation(e)` 阻止冒泡到地图层。
**Warning signs:** 点击已点亮区域后，Network tab 出现多余的 `/places/resolve` 请求。

### Pitfall 4: 地图拖动/缩放时 @floating-ui popup 位置不跟随

**What goes wrong:** popup 在地图静止时位置正确，拖动或缩放后 popup 停留在旧位置，与边界脱节。
**Why it happens:** @floating-ui 的 `autoUpdate` 只监听 scroll/resize 等 DOM 事件，不监听 Leaflet 内部的地图移动。Leaflet 的 pan/zoom 是修改容器内 layer pane 的 CSS transform，DOM 结构不变化。
**How to avoid:** 在 `map.on('move zoom', handler)` 中手动调用 `updatePosition()`（`usePopupAnchoring` 暴露的方法）。同时更新 VirtualElement 的 `getBoundingClientRect` 使其每次调用时重新计算 `latLngToContainerPoint`（不缓存旧值）。
**Warning signs:** 拖动地图后 popup 明显偏离行政区中心点。

### Pitfall 5: Bing Maps free/basic key 已失效（2025-06-30 到期）

**What goes wrong:** 使用 Bing Maps 免费 key 时，底图瓦片请求返回 401/403 或空白。
**Why it happens:** Bing Maps for Enterprise 免费账户已于 2025-06-30 停止服务。
**How to avoid:**
1. 如果开发者持有 Enterprise 账户（有效期至 2028-06-30），则可继续使用。
2. 如果只有 Basic 账户或没有 key，则在 `VITE_BING_MAPS_KEY` 未配置时自动回退到 CartoDB Positron 底图（无需 API key，淡雅风格符合 D-05）。
3. 实现中应检测 `import.meta.env.VITE_BING_MAPS_KEY`，有值则尝试 Bing，无值则直接使用回退底图。
**Warning signs:** 地图容器可见但无底图瓦片加载；控制台出现 CORS 或 401 错误。

### Pitfall 6: GeoJSON style 函数是静态的，不会随 Pinia store 变化自动更新

**What goes wrong:** 保存新地点后，该地点的行政区边界颜色不从"无样式"变为"已点亮"色。
**Why it happens:** `L.geoJSON({ style: fn })` 中的 `style` 函数只在 feature 首次添加到图层时调用一次，之后 store 变化不会自动触发重绘。
**How to avoid:** 用 `watch(savedBoundaryIds, () => geoJsonLayer.setStyle(styleFunction))` 触发全量样式刷新（注意性能：`setStyle` 会遍历所有 feature，对于大型 GeoJSON 数据集需考虑增量更新）。或者，通过 `eachLayer` 只更新变化的 feature 层。
**Warning signs:** 保存地点后地图高亮不更新，刷新页面后才显示正确颜色。

---

## Code Examples

Verified patterns from official sources:

### Leaflet GeoJSON 图层创建和 onEachFeature
```typescript
// Source: leafletjs.com/examples/geojson/
const geojsonLayer = L.geoJSON(featureCollection, {
  style: (feature) => getFeatureStyle(feature, savedBoundaryIds, selectedBoundaryId),
  onEachFeature: (feature, layer) => {
    layer.on('click', (e) => {
      L.DomEvent.stopPropagation(e)
      const boundaryId = feature.properties?.boundaryId as string
      handleBoundaryClick(boundaryId, e.latlng)
    })
  },
}).addTo(map)
```

### Leaflet 点击底图获取经纬度
```typescript
// Source: leafletjs.com/reference.html#map-click
map.on('click', (e: L.LeafletMouseEvent) => {
  const { lat, lng } = e.latlng
  handleMapClick({ lat, lng })
})
```

### 临时标记（识别中状态）
```typescript
// Source: leafletjs.com/reference.html#circlemarker
const pendingMarker = L.circleMarker([lat, lng], {
  radius: 8,
  color: 'rgba(244, 143, 177, 0.96)',
  fillColor: 'rgba(244, 143, 177, 0.94)',
  fillOpacity: 0.94,
  weight: 1.5,
  className: 'pending-marker--recognizing',
}).addTo(map)
// 识别完成后：pendingMarker.remove()
```

### `latLngToContainerPoint` 用于 @floating-ui 锚定
```typescript
// Source: leafletjs.com/reference.html#map-latlngtocontainerpoint
const containerRect = map.getContainer().getBoundingClientRect()
const point = map.latLngToContainerPoint(popupLatLng)
const absoluteX = containerRect.left + point.x
const absoluteY = containerRect.top + point.y
// 传入 @floating-ui VirtualElement.getBoundingClientRect()
```

### Vitest 中 mock Leaflet
```typescript
// Source: vitest.dev/guide/mocking — 与现有 WorldMapStage.spec.ts 模式一致
vi.mock('../composables/useLeafletMap', () => ({
  useLeafletMap: () => ({
    map: shallowRef(null),
    isReady: shallowRef(false),
  }),
}))
vi.mock('../composables/useGeoJsonLayers', () => ({
  useGeoJsonLayers: () => ({
    addFeaturesToLayer: vi.fn(),
    setSelectedBoundary: vi.fn(),
  }),
}))
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `L.BingLayer`（leaflet-plugins/shramov）| Bing REST Metadata API + `L.tileLayer` | 2024-2025（Bing Enterprise 弃用） | 不再需要第三方插件；metadata 请求本身是免费的 billable 调用 |
| `@vue-leaflet/vue-leaflet` 异步组件模式 | 原生 Leaflet API 在 `onMounted` 中直接调用 | 2023-2024（vue-leaflet 0.10.x 已知计时 issue） | 更直接的 layer 引用控制；更少的响应式封装开销 |
| `L.popup()` Leaflet 原生 popup | @floating-ui VirtualElement | Phase 10（可爱风合同） | 保留自定义样式自由度；代价是需要手动跟随地图移动 |

**Deprecated/outdated:**
- `world-map.svg` + `d3-geo` 投影：将被完全替换，`map-projection.ts` 中的 `normalizedPointToGeoCoordinates` / `geoCoordinatesToNormalizedPoint` 等函数将退场（`NormalizedPoint` 类型本身也可能随之废弃）
- `worldMapUrl` 导入：从 `WorldMapStage.vue` 移除
- `SeedMarkerLayer.vue`：在 Leaflet 地图中，seed 点亮标记将由 GeoJSON layer 样式（已点亮填充色）替代，`SeedMarkerLayer` 可能可以退场（需确认有无其他用途）

---

## Open Questions

1. **Bing Maps API key 获取问题**
   - What we know: Bing Maps 免费账户于 2025-06-30 已停止接受新用户。
   - What's unclear: 开发者目前是否持有有效的 Bing Maps Enterprise key。
   - Recommendation: 计划中同时实现 Bing Maps 主路径和 CartoDB Positron 回退路径。通过 `VITE_BING_MAPS_KEY` 环境变量控制，未配置时静默回退。

2. **GeoJSON 图层是否按缩放级别显隐**
   - What we know: D-08 要求已点亮边界始终可见。
   - What's unclear: 在极小缩放级别（zoom 2-3）下显示所有已点亮分片是否有性能问题（取决于用户已点亮地点数量）。
   - Recommendation: 初始版本不做缩放级别显隐，若性能有问题可后续通过 `maxZoom`/`minZoom` on layer 优化。

3. **`SeedMarkerLayer` 的去留**
   - What we know: SeedMarkerLayer 当前用于在 SVG 地图上渲染 seed 点位标记（HTML 元素）。
   - What's unclear: v3.0 已明确不再使用历史 seed 点位，但 SeedMarkerLayer.spec.ts 测试可能仍引用相关逻辑。
   - Recommendation: 迁移过程中先保留 SeedMarkerLayer 文件，在 LeafletMapStage 中不引用它；Phase 15 统一清理。

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| leaflet (npm) | MAP-04 | ✓（待安装） | 1.9.4 | — |
| @types/leaflet (npm) | TypeScript 类型检查 | ✓（待安装） | 1.9.21 | — |
| Bing Maps API key | D-01 底图 | 未知 | — | CartoDB Positron（无需 key） |
| `VITE_BING_MAPS_KEY` env var | D-02 | 未知 | — | 回退到 CartoDB Positron |
| Phase 13 几何资产（`/geo/`） | GEOX-05 图层加载 | ✓（Phase 13 已交付） | 2026-03-31-geo-v1 | — |

**Missing dependencies with no fallback:**
- 无阻塞项（Leaflet npm 包直接安装即可）

**Missing dependencies with fallback:**
- `VITE_BING_MAPS_KEY`：未配置时使用 CartoDB Positron 底图，视觉仍符合 D-05 淡雅简洁要求

---

## Validation Architecture

> `workflow.nyquist_validation: true`，包含此节。

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `apps/web/vitest.config.ts`（合并自 `vite.config.ts`） |
| Quick run command | `pnpm --filter @trip-map/web test src/components/WorldMapStage.spec.ts` |
| Full suite command | `pnpm --filter @trip-map/web test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAP-04 | 点击地图底图触发 canonical resolve，返回 resolved 后创建 draft | unit | `pnpm --filter @trip-map/web test src/components/WorldMapStage.spec.ts` | ✅（改写现有） |
| MAP-05 | CN 和 OVERSEAS 两个 GeoJSON layer 均已加载到地图 | unit | `pnpm --filter @trip-map/web test src/components/WorldMapStage.spec.ts` | ✅（改写现有） |
| MAP-06 | 选中地点后地图渲染该地点的 GeoJSON 边界高亮（非 marker） | unit | `pnpm --filter @trip-map/web test src/components/WorldMapStage.spec.ts` | ✅（改写现有） |
| MAP-08 | 切换选中地点后，旧高亮消失，无双重选中残留 | unit | `pnpm --filter @trip-map/web test src/components/WorldMapStage.spec.ts` | ✅（改写现有） |
| GEOX-05 | 两个图层独立加载，不合并 | unit | `pnpm --filter @trip-map/web test src/composables/useGeoJsonLayers.spec.ts` | ❌ Wave 0 |
| UIX-01 | popup + drawer 双层表面在 Leaflet 地图上正常显示 | unit | `pnpm --filter @trip-map/web test src/components/WorldMapStage.spec.ts` | ✅（改写现有） |

> **注意：** `WorldMapStage.spec.ts` 现有测试覆盖了 SVG 地图逻辑（`.world-map-stage__surface` click、`.world-map-stage__boundary-layer` 等 CSS 类名断言），迁移到 Leaflet 后需要重写这些测试以适配新的 mock 模式（mock `useLeafletMap` 和 `useGeoJsonLayers` composables 替代 mock DOM 元素）。

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web test src/components/WorldMapStage.spec.ts`
- **Per wave merge:** `pnpm --filter @trip-map/web test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/web/src/composables/useGeoJsonLayers.spec.ts` — 覆盖 GEOX-05（CN/OVERSEAS 独立图层加载）
- [ ] `apps/web/src/composables/useLeafletPopupAnchor.spec.ts` — 覆盖 map move → anchor 更新逻辑
- [ ] `apps/web/vitest.config.ts` 中 `server.deps.inline: ['leaflet']` — 防止 happy-dom 下 Leaflet CSS import 失败

---

## Sources

### Primary (HIGH confidence)

- Leaflet 1.9 官方文档 [leafletjs.com/reference.html](https://leafletjs.com/reference.html) — map API、GeoJSON layer、latLngToContainerPoint、event system
- Leaflet GeoJSON 示例 [leafletjs.com/examples/geojson/](https://leafletjs.com/examples/geojson/) — onEachFeature、style function 模式
- Leaflet Choropleth 示例 [leafletjs.com/examples/choropleth/](https://leafletjs.com/examples/choropleth/) — highlight feature、resetStyle 模式
- Bing Maps REST Imagery Metadata [learn.microsoft.com/en-us/bingmaps/rest-services/imagery/get-imagery-metadata](https://learn.microsoft.com/en-us/bingmaps/rest-services/imagery/get-imagery-metadata) — tile URL 模板格式、culture 参数
- Bing Maps Supported Culture Codes [learn.microsoft.com/en-us/bingmaps/rest-services/common-parameters-and-types/supported-culture-codes](https://learn.microsoft.com/en-us/bingmaps/rest-services/common-parameters-and-types/supported-culture-codes)
- Bing Maps deprecation announcement [community.esri.com/t5/arcgis-online-questions/action-required-announcing-bing-maps-for/td-p/1477770](https://community.esri.com/t5/arcgis-online-questions/action-required-announcing-bing-maps-for/td-p/1477770)
- @floating-ui/dom VirtualElement 官方文档 [floating-ui.com/docs/virtual-elements](https://floating-ui.com/docs/virtual-elements)

### Secondary (MEDIUM confidence)

- npm: leaflet 1.9.4 版本确认（npm view leaflet version — 本地执行）
- npm: @types/leaflet 1.9.21 版本确认（npm view @types/leaflet version — 本地执行）
- @vue-leaflet/vue-leaflet GeoJSON timing issue [github.com/vue-leaflet/vue-leaflet/issues/108](https://github.com/vue-leaflet/vue-leaflet/issues/108)
- Leaflet-providers demo [leaflet-extras.github.io/leaflet-providers/preview/](https://leaflet-extras.github.io/leaflet-providers/preview/)
- Vitest server.deps.inline for CSS [vitest.dev/config/](https://vitest.dev/config/)

### Tertiary (LOW confidence)

- CartoDB Positron 中文地名支持程度（依赖 OSM 贡献者数据，未找到官方声明）— 标注为 LOW，建议开发时手动验证中国区域地名显示效果

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — leaflet 和 @types/leaflet 版本通过 npm view 本地验证
- Architecture: HIGH — Leaflet 原生 API 模式来自官方文档，@floating-ui VirtualElement 模式来自官方文档，Phase 13 composable 复用来自已有代码分析
- Pitfalls: MEDIUM-HIGH — Vitest+happy-dom 测试问题来自 WebSearch（已通过 Vitest 文档交叉验证）；Bing Maps 弃用来自官方公告（HIGH）；GeoJSON style 静态性来自 Leaflet 文档（HIGH）
- 底图选型: MEDIUM — Bing Enterprise key 可用性未知；CartoDB Positron 中文覆盖率未经系统验证

**Research date:** 2026-03-31
**Valid until:** 2026-04-30（Leaflet 1.9 稳定期内；Bing Maps Enterprise 状态至 2028 有效）
