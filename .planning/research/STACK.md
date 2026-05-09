# Technology Stack — v8.0 Yume Kawaii 视觉重构与登录地图体验

**研究日期:** 2026-05-09  
**研究范围:** v8.0 落地页、登录门禁、Yume Kawaii 应用壳、日期弹窗、旅途手账、旅途回忆图表和地图覆盖扩展  
**结论:** 当前项目没有通用 UI 组件库；v8.0 应引入成熟第三方依赖承接基础组件、日期选择、图表与图标，避免在高风险基础设施上重复造轮子。

## 当前栈现状

| 层 | 当前技术 | 评价 |
|---|---|---|
| 前端框架 | Vue 3.5 + `<script setup>` | 继续沿用 |
| 路由 | Vue Router 4 | 继续沿用，需新增 landing route 和更严格 auth guard |
| 状态管理 | Pinia 3 | 继续沿用，auth/map/stats store 仍是真源 |
| 样式 | Tailwind CSS 4 + 自有 token | 继续沿用，作为 Yume Kawaii 皮肤层 |
| 地图 | Leaflet 1.9 + GeoJSON shards | 继续沿用，样式和交互改造 |
| 浮层定位 | `@floating-ui/dom` | 继续沿用，地图 anchored popup 仍适用 |
| 图表 | 无 | v8.0 需要新增 |
| 通用 UI 库 | 无 | v8.0 建议新增 |
| 图标 | 无统一图标库 | v8.0 建议新增 |

## UI 库评估

### 推荐：Naive UI

适合 v8.0 的原因：
- Vue 3 + TypeScript 友好，组件覆盖完整，包含 Modal、Drawer、Menu、Tabs、DatePicker、ConfigProvider 等常用能力。
- 主题系统可通过 JS theme overrides 定制，不要求 Less/Sass 变量或额外 webpack loader，更容易贴合现有 Tailwind token。
- 官方说明组件可 tree-shaking，且无需导入全局 CSS，降低和现有 Tailwind/Tokens 冲突概率。

主要使用边界：
- 只承接基础交互控件：日期选择、弹窗、抽屉/菜单、按钮、空状态、骨架、消息。
- 不把 Naive 默认视觉直接暴露给用户，所有 v8.0 页面仍用项目 Yume Kawaii token 做外层皮肤。
- 不用 Naive 的 Result 图形素材，避免引入与当前少女旅行风不一致的资源。

### 备选：Element Plus

优势：
- Vue 3 成熟 UI 库，DatePicker 支持 `shortcuts`、`daterange`、`value-format`，能直接覆盖“今天/明天/本周末/其他日期”和 `YYYY-MM-DD` 数据格式。
- Dialog、Drawer、Menu、Tabs、Form 等组件完备。
- 中文生态熟悉，团队维护和资料可得性好。

劣势：
- 默认视觉更偏后台系统，需要较多 CSS 覆盖才能贴合高保图的柔粉玻璃拟态。
- 如果全量导入会增加样式面和 bundle；若采用按需导入，还需要引入 auto-import / components resolver 或手动导入样式策略。

### 不建议本轮选型

| 方案 | 原因 |
|---|---|
| Vuetify / Ant Design Vue | 默认设计语言强，重皮肤成本高，不贴合 Yume Kawaii |
| 只用 Headless UI | Vue 生态与复杂日期选择/图表仍需额外依赖，组合成本不低 |
| 全部手写 Modal / DatePicker / Menu | 可控但会消耗 v8.0 主要精力，且可访问性和键盘交互容易遗漏 |

## 图表库评估

### 推荐：Apache ECharts + vue-echarts

适合 v8.0 的原因：
- ECharts 官方支持折线、柱状、饼/环、雷达、地图/热力等类型，刚好覆盖旅途回忆设计图。
- `vue-echarts` v7 提供 Vue 组件封装，可用 `echarts/core` 按需注册 chart/component，减少 bundle。
- 图表主题、渐变、圆角、tooltip、animation 都能定制，能实现糖果色、低对比、发光节点、面积渐变等视觉。

推荐引入：
- `echarts`
- `vue-echarts`

实现要求：
- 必须按需注册 LineChart、BarChart、PieChart、RadarChart、Tooltip、Legend、Grid、CanvasRenderer。
- 所有图表 option 从 `computed` 派生，不在 template 内临时构造。
- 图表容器必须有稳定高度和 responsive constraints，避免空白或布局跳动。
- 对 `prefers-reduced-motion` 提供 animation 降级。

## 日期选择

两条可行路线：

1. **随 UI 库走**：如果选 Naive UI 或 Element Plus，优先使用其 DatePicker。  
   适合减少依赖数量，日期弹窗的 Modal + DatePicker + Button 同源。

2. **专用日期库**：`@vuepic/vue-datepicker`。  
   适合日期需求变复杂时使用，支持单日、范围、多日历、locale、周数、键盘和可访问性，当前项目 Vue 版本满足其 Vue 3.5 要求。

推荐 v8.0 先走路线 1，除非 UI 库 DatePicker 无法实现高保图日历交互，再切换 `@vuepic/vue-datepicker`。

## 图标库

推荐：`@iconify/vue`

原因：
- 官方 Vue 组件可用统一语法访问 200+ icon sets，SVG 渲染，适合设计图里的地图、手账、图鉴、奖章、日历、相机、星星等图标。
- 可通过 `addIcon` / `addCollection` 做离线注册，避免运行时依赖外部 Iconify API。

执行约束：
- v8.0 需要稳定离线体验时，应把实际使用的 icon data 注册到本地，而不是运行时向公网拉取。
- 插画/照片感素材不由 Iconify 承接，仍需本地 SVG/图片资源或 CSS 插画位。

## 动效库

暂不强制新增动效库。v8.0 高保图动效需求主要是 hover 上浮、fade-up、scale-in、漂浮星星/樱花/云朵、节点呼吸光效，这些用 CSS transition/keyframes 足够。

只有出现复杂 timeline layout transition 或拖拽/弹性编排时，再评估：
- `@vueuse/motion`：Vue 生态轻量 motion 封装
- GSAP：仅用于独立 scrolltelling，不要和常规 UI 动效混用

## 推荐依赖组合

首选组合：

```bash
pnpm --filter @trip-map/web add naive-ui echarts vue-echarts @iconify/vue
```

备选组合：

```bash
pnpm --filter @trip-map/web add element-plus @element-plus/icons-vue echarts vue-echarts @iconify/vue
pnpm --filter @trip-map/web add -D unplugin-vue-components unplugin-auto-import
```

如果 DatePicker 需要专用库：

```bash
pnpm --filter @trip-map/web add @vuepic/vue-datepicker
```

## Sources

- Naive UI npm / README — Vue 3、TypeScript、主题可定制、tree-shaking、无需导入全局 CSS
- Element Plus official DatePicker docs — `shortcuts`、`daterange`、`value-format`
- Element Plus quick start docs — 全量导入和按需导入策略
- Apache ECharts official features / handbook — line、bar、pie、radar、map、heatmap 等图表能力
- vue-echarts npm / README — Vue 组件封装、`echarts/core` 按需注册
- Vue Datepicker official docs — Vue 3.5 要求、range/multi-calendar/locale 等日期能力
- Iconify Vue official docs — Vue 组件、SVG 渲染、200+ icon sets、按需加载/本地注册能力
