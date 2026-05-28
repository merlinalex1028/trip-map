# Phase 42: UI Primitives 与 Yume Kawaii Theme Bridge - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11T03:33:58Z
**Phase:** 42-UI Primitives 与 Yume Kawaii Theme Bridge
**Areas discussed:** shadcn-vue 接入边界, Yume Kawaii theme bridge 的视觉严格度, 组件基座是否需要 showcase / smoke 页面, 图标策略与离线约束, ECharts 基座深度

---

## shadcn-vue 接入边界

| Option | Description | Selected |
|--------|-------------|----------|
| 只建基座 | 生成并主题化基础 primitives，既有 AuthDialog / ConfirmDialog 暂不迁移，降低本 phase 风险。 | ✓ |
| 迁移核心弹窗 | 同时把 AuthDialog、ConfirmDialog 等核心弹窗切到新 Dialog/Button，提前验证真实业务场景。 | |
| 只装依赖 | 只完成依赖、alias 和最小导入验证，把组件主题化留到后续 phase。 | |

**User's choice:** 只建基座。
**Notes:** 用户后续确认 full primitive list、standard `@/components/ui` alias，并要求留下迁移指引但不迁移业务组件。

| Option | Description | Selected |
|--------|-------------|----------|
| 按 roadmap 全量清单 | 一次接入 Button、Card、Dialog、Popover、Calendar、Tabs、Sidebar、Dropdown Menu、Skeleton、Scroll Area。 | ✓ |
| 先接高频核心 | 只接 Button、Card、Dialog、Popover、Calendar、Skeleton。 | |
| 最小可运行验证 | 只接 Button、Card、Dialog。 | |

**User's choice:** 按 roadmap 全量清单。
**Notes:** 清单对应 DS-02 和 Phase 42 success criteria。

| Option | Description | Selected |
|--------|-------------|----------|
| 标准 `@/components/ui` | 配置 Vite/TS 的 `@` alias，生成到 `apps/web/src/components/ui/*`。 | ✓ |
| 自定义 `@/ui` | 生成到 `apps/web/src/ui/*`。 | |
| 保留相对路径 | 不引入 `@/` alias。 | |

**User's choice:** 标准 `@/components/ui`。
**Notes:** 满足 DS-01 的稳定 `@/` 导入目标。

| Option | Description | Selected |
|--------|-------------|----------|
| 写迁移指引 | 标明 AuthDialog、ConfirmDialog、TripDateForm、popup 内按钮/卡片为后续迁移对象。 | ✓ |
| 不写迁移指引 | 只交付新 primitives。 | |
| 只标高风险组件 | 只标 TripDateForm 和弹窗类组件。 | |

**User's choice:** 写迁移指引。
**Notes:** Phase 42 不改它们。

---

## Yume Kawaii theme bridge 的视觉严格度

| Option | Description | Selected |
|--------|-------------|----------|
| 高保图优先校准 | 以 `prd/v8.0/UI` 高保图为目标，允许重校颜色、圆角、玻璃材质和 shadow。 | ✓ |
| 现有 token 优先 | 尽量不改 `tokens.css` 的基线。 | |
| 双层 token | 新增一层 `v8` / `ui` token。 | |

**User's choice:** 高保图优先校准。
**Notes:** 用户指出高保图在 `prd/v8.0/UI`，部分元素切图在 `prd/v8.0/切图`。后续实现要查看切图文件夹，使用到的元素复制到 web assets 并改成英文短横线命名。

| Option | Description | Selected |
|--------|-------------|----------|
| 只制定资产规则 | Phase 42 不批量复制切图，只锁定后续复制和命名规则。 | ✓ |
| 复制共享装饰资产 | Phase 42 先挑共享资产放入 web assets。 | |
| 全部复制并重命名 | Phase 42 全量整理切图。 | |

**User's choice:** 只制定资产规则。
**Notes:** 用户补充 `世界足迹` UI 图左侧菜单下面的图有误且没有切图，以 `旅途回忆` 和 `旅途手帐` 的为准。

| Option | Description | Selected |
|--------|-------------|----------|
| 重校现有全局 token | 直接调整现有 `--color-*`、`--radius-*`、`--shadow-*`、`--motion-*`。 | ✓ |
| 新增 v8 token 层 | 保留现有 token，新增 `--v8-*` / `--ui-*`。 | |
| 只映射 shadcn 变量 | 不主动改现有 token。 | |

**User's choice:** 重校现有全局 token。
**Notes:** 全站和 shadcn primitives 共用同一套 v8 视觉基线。

| Option | Description | Selected |
|--------|-------------|----------|
| 默认就是 v8 高保风格 | primitives 默认呈现柔粉玻璃、深靛紫文字、大圆角、轻阴影。 | ✓ |
| 保留基础中性 variant | 默认偏 v8，但保留 neutral / plain variant。 | |
| 只主题化页面级容器 | primitives 自身保持克制。 | |

**User's choice:** 默认就是 v8 高保风格。
**Notes:** 不保留 shadcn 中性默认态作为主路径。

---

## 组件基座是否需要 showcase / smoke 页面

| Option | Description | Selected |
|--------|-------------|----------|
| 做隐藏开发路由 | 新增 `/__ui`，集中展示全部 primitives。 | ✓ |
| 只做测试组件 | 不暴露路由，只写 spec fixture。 | |
| 不做 showcase | 只靠后续真实页面验证。 | |

**User's choice:** 做隐藏开发路由。
**Notes:** 用于集中验证导入、默认主题和基础交互。

| Option | Description | Selected |
|--------|-------------|----------|
| dev-only guard | `/__ui` 只在 `import.meta.env.DEV` 下可访问，生产环境重定向到 `/`。 | ✓ |
| 任何环境都可访问但不导航入口 | 知道 URL 就能打开。 | |
| 不接 router，只靠测试挂载 | 需要测试或临时改代码才能看。 | |

**User's choice:** dev-only guard。
**Notes:** 避免生产暴露组件展厅。

| Option | Description | Selected |
|--------|-------------|----------|
| 全状态矩阵 | 每个 primitive 覆盖 default / disabled / loading 或 skeleton / focus-visible；弹出类和 Calendar 可交互。 | ✓ |
| 基础示例即可 | 每个 primitive 只展示默认例子。 | |
| 按后续页面场景展示 | 按未来场景组合展示。 | |

**User's choice:** 全状态矩阵。
**Notes:** 视觉细节仍由后续视觉 QA 收口。

| Option | Description | Selected |
|--------|-------------|----------|
| 加轻量单测/组件测试 | Vitest + Vue Test Utils 验证关键 primitive 渲染、按钮可点击、弹层可打开。 | ✓ |
| 只手动验收 | 自动测试留到后续。 | |
| 加截图验证 | Phase 42 引入 Playwright/截图验证。 | |

**User's choice:** 加轻量单测/组件测试。
**Notes:** 截图验证留给 Phase 48。

---

## 图标策略与离线约束

| Option | Description | Selected |
|--------|-------------|----------|
| 本地注册白名单图标 | Iconify 通过本地白名单/封装使用，避免运行时公网拉取。 | ✓ |
| 直接用 `@iconify/vue` 按需图标名 | 页面里直接传图标名。 | |
| 不用 Iconify，改用 lucide-vue | 简单离线但彩色趣味不足。 | |

**User's choice:** 本地注册白名单图标。
**Notes:** 需要项目 wrapper。

| Option | Description | Selected |
|--------|-------------|----------|
| 线性图标 + 粉紫容器 | 统一线性图标，外层表达可爱感。 | |
| 彩色插画感图标优先 | 尽量使用高保切图或彩色图标。 | ✓ |
| 按场景混用 | nav 线性，dashboard 彩色，CTA 装饰混用。 | |

**User's choice:** 彩色插画感图标优先。
**Notes:** wrapper 需要控制尺寸、命名和使用范围。

| Option | Description | Selected |
|--------|-------------|----------|
| 切图优先，Iconify 补齐 | 高保切图有的图标/装饰优先使用切图，没有的用本地白名单 Iconify。 | ✓ |
| Iconify 彩色图标优先 | 主要从 Iconify 彩色图标集中挑。 | |
| 项目自绘 SVG 优先 | 关键图标由项目内自绘 SVG 组件实现。 | |

**User's choice:** 切图优先，Iconify 补齐。
**Notes:** 切图复制规则与 theme bridge 区域一致。

| Option | Description | Selected |
|--------|-------------|----------|
| 语义名 API | `KawaiiIcon name="map" | "journal" | ...`。 | ✓ |
| 文件名 / icon id 直传 | wrapper 只负责渲染。 | |
| 按场景拆组件 | `NavIcon`、`StatIcon` 等。 | |

**User's choice:** 语义名 API。
**Notes:** 页面代码不直接接触 Iconify id 或 asset 文件名。

---

## ECharts 基座深度

| Option | Description | Selected |
|--------|-------------|----------|
| 主题 + BaseChart wrapper | 安装 ECharts/vue-echarts，注册主题，提供处理尺寸和状态的 BaseChart。 | ✓ |
| 只安装和主题注册 | wrapper 留给 Phase 47。 | |
| 直接做 dashboard chart 示例 | 提前做折线、环图、柱状、雷达示例配置。 | |

**User's choice:** 主题 + BaseChart wrapper。
**Notes:** 后续旅途回忆直接复用。

| Option | Description | Selected |
|--------|-------------|----------|
| 不接真实数据 | BaseChart 只吃传入 option 和状态 props；`/__ui` 用 demo option。 | ✓ |
| 接 stats store 的只读数据 | 用真实数据 demo。 | |
| 提供数据适配器雏形 | 做业务 chart option builder。 | |

**User's choice:** 不接真实数据。
**Notes:** 避免提前进入 Phase 47 的统计口径。

| Option | Description | Selected |
|--------|-------------|----------|
| 按需注册本轮图表类型 | 集中注册 Line、Pie、Bar、Radar 及必要 components/renderers。 | ✓ |
| 全量导入 ECharts | 开发省事但体积更大。 | |
| 每个 chart 单独注册 | 局部清晰但容易重复。 | |

**User's choice:** 按需注册本轮图表类型。
**Notes:** 建议模块位置 `apps/web/src/lib/charts`。

| Option | Description | Selected |
|--------|-------------|----------|
| 贴近旅途回忆高保图 | 柔和粉、紫、蓝、绿、橙色；淡网格；玻璃 tooltip；深靛紫文字。 | ✓ |
| 跟随全局 token 即可 | 只从 token 取主色/辅色。 | |
| 更克制的数据可读性优先 | 降低装饰强化可读性。 | |

**User's choice:** 贴近旅途回忆高保图。
**Notes:** 参考 `prd/v8.0/UI/旅途回忆.png`。

---

## the agent's Discretion

None.

## Deferred Ideas

None.
