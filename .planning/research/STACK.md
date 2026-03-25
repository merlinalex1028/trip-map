# Technology Stack

**Project:** 旅行世界地图 v2.0
**Scope:** 仅覆盖新增能力：城市优先选择、真实城市边界高亮、浮层详情、原创二次元可爱风重设计
**Researched:** 2026-03-25
**Overall confidence:** MEDIUM-HIGH

## Recommended Additions

### Runtime additions

| Technology | Version | Purpose | Why this matters | Integration points |
|------------|---------|---------|------------------|--------------------|
| `@floating-ui/vue` | `1.1.9` | 地图点位/城市高亮的浮层定位、碰撞翻转、视口内偏移 | 现有详情是抽屉；新增“悬浮详情”需要稳定锚定到 SVG/DOM 标记，不值得自己维护定位和边界修正 | `src/components/WorldMapStage.vue` 新增 popup anchor；`src/stores/map-ui.ts` 增加 popup open/close state |
| `kdbush` | `4.0.2` | 城市中心点静态空间索引 | 现有 `cityCandidatesByContext` 是顺序扫描；城市优先选择一旦扩大到更多城市，必须先做邻近候选裁剪 | `src/services/geo-lookup.ts`；新建 `src/services/city-index.ts` |
| `geokdbush` | `2.0.1` | 基于经纬度的最近城市查询 | 适合“点击地图后优先落到最近候选城市”与搜索结果排序，且不需要引入更重 GIS 引擎 | `src/services/geo-lookup.ts` 城市候选 shortlist |
| `topojson-client` | `3.1.0` | 浏览器端把简化后的城市边界 `TopoJSON` 转回渲染用 `GeoJSON` | 项目已存在该依赖，但当前在 `devDependencies`。如果运行时解码城市边界，需要提升到 `dependencies` | `src/services/city-boundary-lookup.ts`；`WorldMapStage.vue` SVG overlay |

### Dev/data tooling additions

| Tool | Version | Purpose | Why this matters | Integration points |
|------|---------|---------|------------------|--------------------|
| `mapshaper` | `0.6.111` | GeoJSON/TopoJSON 简化、裁剪、字段过滤、格式转换 | 真实城市边界原始数据通常过重；没有构建前简化，SPA 首屏和交互都会退化 | 新增 `scripts/geo/*` 或 `pnpm` data build script；产出写入 `src/data/geo/` |

## Data Sources And File Formats

### 1. City-first selection seed

| Source | Recommended use | Format in repo | Why |
|--------|------------------|----------------|-----|
| Natural Earth `Populated Places` `v5.1.2` | 作为全球城市入口索引和默认搜索/候选池 | 原始下载保留为 `GeoJSON` 或源文件；运行时产出 `city-index.json` | 它提供全球城市/城镇点位与名称属性，适合作为“先选城市”的轻量全局入口，不需要先装入全球城市面数据 |

**Recommendation:**  
把“全球城市入口”与“真实城市边界”拆成两层数据，不要试图一开始就把全球所有城市 polygon 全量塞进前端。

### 2. True city-boundary highlighting

| Source | Recommended use | Format in repo | Why |
|--------|------------------|----------------|-----|
| OpenStreetMap `boundary=administrative` relations，经 Overpass/导出工具离线抓取 | 作为主边界来源，覆盖本 milestone 支持的重点城市 | 原始 `GeoJSON`；运行时按国家或区域分包为 `TopoJSON` | 产品要的是“真实城市边界高亮”，OSM 的 municipality/city relation 更贴近这个语义，但必须离线固化，不能在线查 |
| geoBoundaries `gbOpen` `ADM2-ADM5` | 作为补充/校验源，不作为全局唯一真相 | 原始 `GeoJSON`；仅对少量国家做人工映射后再转 `TopoJSON` | geoBoundaries 的行政层级全球更整齐，但“哪个 ADM level 才等于用户认知里的城市”并不统一，适合补缺，不适合直接全自动上线 |

**Important constraint:**  
OSM 官方文档明确说明 `admin_level` 在不同国家只“近似对应”；同样“city/town/municipality”可能从 `admin_level=4` 到 `10`。这意味着本 milestone 需要“支持城市白名单 + 每国映射规则”，而不是尝试做全球自动推断。

### 3. Shipping format

| Layer | Ship format | Why |
|-------|-------------|-----|
| 全球城市索引 | `JSON` | 只保留 `id / name / aliases / countryCode / lat / lng / bbox / boundaryId` 等轻字段，便于搜索和最近邻 |
| 城市边界 | `TopoJSON` | 多边形共享弧段，体积显著小于直接 shipping 大量 `GeoJSON` |
| 高亮渲染结果 | 运行时转 `GeoJSON` feature 或 `SVG path` | 便于沿用现有 SVG overlay 与 `d3-geo` 投影体系 |

## Recommended Data Contract

### New files

| File | Purpose |
|------|---------|
| `src/data/geo/city-index.json` | 全局城市入口索引，供搜索、最近邻候选、城市优先落点使用 |
| `src/data/geo/city-boundary-manifest.json` | `boundaryId -> chunk path / countryCode / bbox / source / license` 映射 |
| `src/data/geo/city-boundaries/{countryCode}.topo.json` | 按国家或区域切分后的真实城市边界包，按需懒加载 |

### Suggested shape

```ts
interface CityIndexEntry {
  id: string
  name: string
  aliases: string[]
  countryCode: string
  countryName: string
  lat: number
  lng: number
  bbox: [number, number, number, number]
  boundaryId: string | null
  boundarySource: 'osm' | 'geoboundaries'
  selectionPriority: number
}
```

## Integration With Existing App

### Geo pipeline

1. 保留现有 `country/region` 命中作为第一层安全网。  
2. 命中国家后，用 `kdbush + geokdbush` 从 `city-index.json` 取最近城市 shortlist。  
3. 如果 shortlist 命中带 `boundaryId` 的城市，则懒加载对应 `TopoJSON` 分包。  
4. 对 shortlist 内边界做精确 polygon contains；命中则返回真实城市边界与中心点。  
5. 若边界未命中但最近城市足够近，可回退到“城市可疑命中”；否则继续回退到现有国家/地区逻辑。

### Code-level integration

| Existing area | Change needed |
|---------------|---------------|
| `src/services/geo-lookup.ts` | 从“国家命中后扫 `cityCandidatesByContext`”升级为“国家命中 -> 空间索引 shortlist -> 边界精确命中 -> 回退” |
| `src/types/geo.ts` | 增加 `cityId`、`boundaryId`、`boundarySource`、`boundaryBBox`、`selectionMode` |
| `src/types/map-point.ts` | 持久化增加 `cityId` / `boundaryId`，为之后重复选中和高亮同城边界做准备 |
| `src/stores/map-ui.ts` | 增加 `activePopupPointId`、`highlightedBoundaryId`、`citySearchQuery`、`citySearchResults` |
| `src/components/WorldMapStage.vue` | 在现有 SVG overlay 中新增城市边界 path、高亮态、popup anchor 参考元素 |
| `src/components/PointPreviewDrawer.vue` | 保留抽屉作为完整编辑面板；浮层只承接轻量查看与快捷操作，不替代编辑表单 |
| `src/styles/tokens.css` | 重写为新视觉 token 集：色板、圆角、阴影、字体层级、插画/贴纸装饰色，不引入 UI 框架 |

## Visual Redesign Stack

### Add

| Addition | Purpose | Why |
|----------|---------|-----|
| 一套新的 CSS design tokens | 统一二次元可爱风配色、阴影、圆角、排版比例 | 当前 `tokens.css` 是复古海报风，直接在旧 token 上微调会留下风格残影 |
| 本地静态 SVG 资产 | 星星、云朵、贴纸、边框、角标、地图 hover 装饰 | “原创”视觉更依赖自有资产，而不是第三方 UI 组件库 |
| 自托管字体文件 `woff2` | 标题/正文的稳定风格控制 | 比在线字体更符合离线产品方向，也避免运行时外链依赖 |

### Do not add for redesign

| Not now | Why |
|---------|-----|
| Tailwind / UnoCSS / 大型组件库 | 当前项目已是小型定制 SPA；为一个 milestone 换 UI 体系只会增加迁移成本 |
| Framer Motion / GSAP / Lottie | 本 milestone 重点不是复杂动画；CSS 动画足够支撑轻量呼吸、漂浮、闪烁效果 |
| 设计系统生成器或主题编辑器 | 产品体量还不需要这类抽象层 |

## What Should NOT Be Added Yet

| Do not add yet | Why not in this milestone |
|----------------|---------------------------|
| 在线逆地理编码 / Places API / 地图搜索 API | 与项目离线识别方向冲突，也会把城市命中质量交给外部服务 |
| `MapLibre GL JS` / `Leaflet` / `OpenLayers` | 当前是固定投影海报地图，不是 slippy map；引入整套地图引擎属于架构切换，不是增量增强 |
| 全量全球 municipality polygon 包一次性随首屏加载 | 体积和解析成本太高，移动端风险明显 |
| `Fuse.js` 一类模糊搜索库 | 若本 milestone 仅支持城市优先选择和有限搜索，前缀匹配 + alias 归一化通常已足够；等城市规模和搜索体验被验证后再加 |
| 后端、账号、同步、分享 | 与本 milestone 的新增交互无直接依赖 |
| 重 GIS 计算库或 WebWorker GIS 平台化改造 | 现有能力是单页应用上的轻 GIS；先验证边界高亮体验，不提前工程过度 |

## Installation Snapshot

```bash
pnpm add @floating-ui/vue kdbush geokdbush
pnpm add topojson-client
pnpm add -D mapshaper
```

## Decision Summary

- **应该加**：`@floating-ui/vue`、`kdbush`、`geokdbush`、`mapshaper`，以及新的离线城市索引 + 按需加载边界包。
- **应该继续沿用**：`Vue 3 + Vite + TypeScript`、`Pinia`、`d3-geo`、现有 SVG overlay、现有离线 country/region lookup。
- **数据上应该改**：从“国家命中后扫少量城市候选”升级为“全球城市索引 + 重点城市真实边界包 + 国家级安全回退”。
- **本 milestone 不应做**：地图引擎替换、在线地理服务、全量全球边界一次性打包、UI 体系重建。

## Sources

- Repo context: `.planning/PROJECT.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`, `package.json`, `src/services/geo-lookup.ts`
- Floating UI Vue docs: https://floating-ui.com/docs/vue
- `@floating-ui/vue` package: https://www.npmjs.com/package/%40floating-ui/vue/v/1.1.9
- `kdbush` package: https://www.npmjs.com/package/kdbush
- `geokdbush` package: https://www.npmjs.com/package/geokdbush
- `topojson-client` package/docs: https://www.npmjs.com/package/topojson-client
- `mapshaper` package: https://www.npmjs.com/package/mapshaper
- GeoJSON spec RFC 7946: https://www.rfc-editor.org/rfc/rfc7946
- Natural Earth populated places: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/
- geoBoundaries API: https://www.geoboundaries.org/api.html
- geoBoundaries overview: https://www.geoboundaries.org/
- OpenStreetMap `admin_level` docs: https://wiki.openstreetmap.org/wiki/Key%3Aadmin_level
- Overpass API language guide: https://wiki.openstreetmap.org/Overpass_API/Language_Guide

## Confidence Notes

- **HIGH**: 浮层定位库、空间索引库、数据压缩工具、文件格式建议。
- **MEDIUM**: 全球“真实城市边界”数据源策略。原因不是工具不成熟，而是不同国家对城市/municipality/admin level 的定义不统一，必须通过白名单和离线映射控制范围。
