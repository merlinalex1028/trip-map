# Stack Research

**Domain:** 离线真实地点识别的旅行世界地图单页应用
**Researched:** 2026-03-23
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vue | 3.5.x | 应用 UI 与响应式状态驱动 | Vue 3 是当前官方推荐主线，类型支持与 SFC 体验成熟，适合中等复杂度交互产品 |
| Vite | 8.x | 开发服务器、构建与前端工具链 | 适合 greenfield Vue 项目，反馈快，构建配置轻，生态与 Vitest 紧密配合 |
| TypeScript | 5.9.x | 类型约束、模型定义、地理服务接口约束 | 该项目的数据模型和识别流程边界多，TS 可明显降低后续迭代风险 |
| Pinia | 3.x | 点位、选择态、持久化状态管理 | Vue 官方推荐状态库，适合管理 `MapPoint`、抽屉状态和本地持久化流程 |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `d3-geo` | 3.x | 固定投影下的坐标正投影/逆投影 | 需要将地图点击坐标映射到 `lng/lat`，并把真实坐标投影回 `x/y` 时使用 |
| `@turf/boolean-point-in-polygon` | 7.2.x | 判断点是否落入国家边界多边形 | 做国家/地区级离线命中时直接可用，支持 polygon 和 multipolygon |
| `topojson-client` | 3.x | 读取或转换压缩后的边界数据 | 当国家边界数据以 TopoJSON 形式分发时使用，可减小静态资源体积 |
| `zod` | 4.x | 校验本地存储数据结构与迁移输入 | 用于保护 `localStorage` 读取和版本迁移，避免坏数据击穿 UI |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | 与 Vite 共享配置的单元测试 | 适合验证投影转换、命中规则、存储迁移等纯逻辑模块 |
| Vue Test Utils | Vue 组件测试 | 用于抽屉、地图点击交互、点位渲染等组件行为验证 |
| ESLint | 静态代码检查 | 保持类型、导入与组合式函数使用一致性 |

## Installation

```bash
# Core
npm install vue pinia d3-geo @turf/boolean-point-in-polygon topojson-client zod

# Dev dependencies
npm install -D vite @vitejs/plugin-vue typescript vitest @vue/test-utils happy-dom eslint
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `d3-geo` | Leaflet / MapLibre | 如果未来改为可缩放平铺地图或需要成熟地图交互控件，可切换到地图引擎 |
| Pinia | 组合式函数自管理状态 | 如果项目始终非常轻量、没有复杂状态共享，组合式函数也可胜任 |
| TopoJSON/GeoJSON 静态边界 | 在线逆地理编码 API | 如果后续接受联网依赖并追求更细粒度的地点识别，可考虑在线服务 |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| 直接把在线逆地理编码当作 v1 依赖 | 与“本地离线识别”目标冲突，也会引入费用与可用性问题 | 静态国家边界数据 + 本地点位命中 |
| 未简化的超大 GeoJSON 全量前端遍历 | 会带来首屏包体和点击性能问题 | 预处理后的 TopoJSON/简化 GeoJSON + bbox 预过滤 |
| 只存储渲染坐标 `x/y` | 后续无法可靠回推真实地点，也难以做升级 | 同时存储 `lat/lng` 与 `x/y` |

## Stack Patterns by Variant

**If 继续保持固定投影静态地图：**
- 使用 `SVG + d3-geo + Turf`
- 因为这样更容易控制投影一致性、命中链路和样式表现

**If 后续升级为可缩放/拖拽地图：**
- 评估 `MapLibre` 或 `Leaflet`
- 因为交互地图引擎会提供更成熟的坐标系与事件模型

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `vue@3.5.x` | `pinia@3.x` | 官方生态主线组合 |
| `vite@8.x` | `vitest` 当前主线 | Vitest 官方文档说明与 Vite 共享配置 |
| `typescript@5.9.x` | Vue 3.5 主线类型工具链 | 适合当前 SFC 与组合式 API 的类型推导能力 |

## Sources

- [Vue Releases](https://vuejs.org/about/releases) — 确认 Vue 3 为当前主线
- [Vue TypeScript Guide](https://vuejs.org/guide/typescript/composition-api) — 验证 Vue 3.5 类型能力
- [Vite Releases](https://vite.dev/releases) — 确认 Vite 当前支持版本范围
- [Vite 8 Announcement](https://vite.dev/blog/announcing-vite8) — 确认最新主线版本已到 8.x
- [TypeScript 5.9 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) — 确认 TypeScript 当前主线版本
- [Pinia Introduction](https://pinia.vuejs.org/introduction.html) — 确认 Pinia 仍是 Vue 官方推荐状态方案
- [D3 Geo Projection](https://d3js.org/d3-geo/projection) — 验证投影与逆投影能力适合固定投影地图
- [Turf booleanPointInPolygon](https://turfjs.org/docs/7.2.0/api/booleanPointInPolygon) — 验证 polygon / multipolygon 命中能力
- [PRD.md](/Users/huangjingping/i/trip-map/PRD.md) — 产品约束与 v1 需求来源

---
*Stack research for: 旅行世界地图*
*Researched: 2026-03-23*
