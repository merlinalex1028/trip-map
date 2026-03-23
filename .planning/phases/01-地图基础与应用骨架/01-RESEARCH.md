# Phase 01: 地图基础与应用骨架 - Research

**Researched:** 2026-03-23
**Domain:** Vue 3 单页应用骨架、固定投影地图壳层、响应式抽屉布局
**Confidence:** HIGH

## User Constraints

### Locked Decisions
- 首页整体风格定为探索感海报风，不走极简工具风或杂志编排风
- 视觉氛围进一步锁定为复古旅行海报感
- 地图底图采用做旧纸质地图感，而不是干净现代的纯矢量地图
- 地图必须是首页绝对主角，首页大部分面积优先留给地图
- 首页只保留主标题和一句引导文案，不展示副标题或大段说明
- Phase 1 不展示访问统计、点位统计或明显信息卡片模块
- Phase 1 需要放少量示例点位，让地图第一屏看起来已经“活着”
- 示例点位以低调发光形式展示，不做过强高亮
- 示例点位与用户未来创建的点位要做轻微区分，避免混淆
- 只给少数示例点位展示常驻标签，不为所有点位显示名称
- 页面初次进入时，抽屉默认收起，不主动占据地图空间
- Phase 1 中只有点击点位才会打开抽屉，不额外设置欢迎弹层或说明入口
- 抽屉在第一版更像预览卡片，优先展示地点信息，而不是强调编辑或引导

### Claude's Discretion
- 主标题的具体文案与引导句措辞
- 复古海报风中的具体字体、纹理强度、装饰元素和动画细节
- 示例点位与用户点位的具体视觉差异实现方式
- 抽屉中的信息排版、按钮样式和空白留白节奏

### Deferred Ideas
- None — discussion stayed within phase scope

## Summary

Phase 1 的最佳规划方式不是把“地图”当成一个随便铺满页面的背景，而是把它当成应用壳层的核心舞台来搭建。这个阶段真正要做的是建立一个稳定、可延续的 Vue 3 前端骨架，让世界地图、标题层、示例点位和响应式抽屉形成一个完整但克制的首页结构，同时不要提前混入真实地点识别、点位编辑闭环或统计模块。

从后续阶段依赖来看，本阶段最重要的规划目标有两个：第一，尽早固定世界地图资产与组件分层，让 Phase 2 的投影和命中逻辑可以无痛接入；第二，保证示例点位和抽屉展示不是一次性 demo，而是可复用的 `MapPoint` 展示通道。换句话说，Phase 1 不是“先做个好看的页面”，而是“先把以后所有地图交互要站的舞台搭稳”。

**Primary recommendation:** 按 “应用壳层与数据骨架 → 地图舞台与视觉契约 → 点位与抽屉联动” 的顺序拆成 3 个 plan，避免把脚手架、视觉实现和交互状态耦在一份 plan 里。

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | 3.5.x | UI 组件与响应式渲染 | 项目既定主框架，适合地图与抽屉这类状态驱动界面 |
| Vite | 8.x | 项目开发与构建 | greenfield Vue 项目默认高效工具链 |
| TypeScript | 5.9.x | 模型、组件 props、状态层类型约束 | 有助于后续 `MapPoint`、服务层和 UI 契约收敛 |
| Pinia | 3.x | 选中点位、抽屉开关、预置点位状态 | 后续 Phase 2/3 会持续沿用，Phase 1 就应建立模式 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `d3-geo` | 3.x | 为后续投影服务预留同类依赖 | 本阶段不必实现识别，但目录和接口应给它留位置 |
| `nanoid` | current | 稳定点位 ID | 示例点位和后续用户点位都可统一采用 |
| `zod` | 4.x | 示例数据与状态结构校验 | 当种子数据格式开始固定时使用 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pinia 状态层 | 纯组合式函数 | 早期可行，但后续点位与抽屉共享状态更容易发散 |
| 静态 SVG / 图片地图壳层 | Leaflet / MapLibre | Phase 1 过重，会提前引入地图引擎复杂度 |
| 先做复杂动画与统计 | 先做地图主舞台 | 后者更符合已锁定的低密度海报风决策 |

**Installation:**
```bash
npm install vue pinia nanoid zod
npm install d3-geo
npm install -D vite @vitejs/plugin-vue typescript vitest @vue/test-utils happy-dom eslint
```

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── components/        # 地图、点位层、标题块、抽屉组件
├── data/              # 示例点位与静态展示数据
├── stores/            # 点位与 UI 状态
├── types/             # MapPoint 与展示模型
├── styles/            # 全局 token、纹理、字体与主题变量
└── assets/            # 地图底图、纹理资源、装饰图形
```

### Pattern 1: App Shell First
**What:** 先建立应用入口、页面骨架、主题变量和响应式布局，再接地图与点位内容。  
**When to use:** greenfield 项目且后续阶段会持续依赖同一地图舞台时。  
**Example:**
```ts
// Root shell owns page framing and delegates feature UI to map-stage components.
<AppShell>
  <PosterTitleBlock />
  <WorldMapStage />
  <PointPreviewDrawer />
</AppShell>
```

### Pattern 2: Stage + Overlay Decomposition
**What:** 地图底图、点位层、标题层、抽屉层职责分离，不让任何单组件同时承担视觉舞台和业务状态。  
**When to use:** 需要后续把真实地点识别、用户点位、状态同步逐步挂上同一地图时。  
**Example:**
```ts
WorldMapStage
  -> MapSurface
  -> SeedMarkerLayer
  -> OptionalTitleOverlay
```

### Pattern 3: Selection State Drives Drawer
**What:** 抽屉是否打开，不由独立“modal”逻辑控制，而由当前是否存在选中点位驱动。  
**When to use:** Phase 1 只允许点击点位打开抽屉，且不需要复杂表单流程时。  
**Example:**
```ts
const selectedPointId = ref<string | null>(null)
const drawerOpen = computed(() => selectedPointId.value !== null)
```

### Anti-Patterns to Avoid
- **把地图当作普通背景图塞进页面布局里：** 后续难以承接点位层和投影逻辑
- **让抽屉和点位各自维护独立选中态：** Phase 3 很容易出现状态冲突
- **在 Phase 1 混入真实地点识别逻辑：** 会模糊阶段边界并拖慢规划质量
- **首页加入统计卡、说明模块、欢迎层：** 直接违背已锁定的视觉取向

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 全局共享 UI 状态 | 手写分散的跨组件 emit 链 | Pinia store | 后续点位、抽屉、选择态都会依赖统一状态 |
| 点位唯一 ID | 临时数组 index | `nanoid` | 顺序变化后不会造成标识漂移 |
| 后续投影接口位置 | 把识别逻辑硬塞进组件 | 预留 `services/` 分层 | Phase 2 能无缝接入真实地点判断 |
| 视觉 token 管理 | 到处写散落颜色与间距 | CSS variables / 主题 token 文件 | UI-SPEC 已锁定设计合同，执行时应可追踪 |

**Key insight:** 本阶段应该 hand-roll 的是“项目自己的视觉舞台”和“组件分层”，不应该 hand-roll 的是状态共享、ID 规则和未来服务边界。

## Common Pitfalls

### Pitfall 1: 地图资产定得太晚
**What goes wrong:** 先写了一堆布局和点位定位，再发现底图比例、留白、装饰风格不适配。  
**Why it happens:** 把地图底图当成可替换细节，而不是舞台契约。  
**How to avoid:** Plan 中应明确先锁定地图资源、容器比例和基本 framing。  
**Warning signs:** 组件名已经很多，但还没有确定地图资产路径和容器结构。

### Pitfall 2: 抽屉被做成“右侧后台面板”
**What goes wrong:** 抽屉视觉过重，地图主角地位被削弱。  
**Why it happens:** 直接套常见 dashboard side panel 模式。  
**How to avoid:** 把 drawer 明确定义为 preview-card-like surface，并限制内容密度。  
**Warning signs:** 抽屉里出现表单脚手架、工具条、过多按钮。

### Pitfall 3: 示例点位太多或太亮
**What goes wrong:** 首页变成噪声地图，海报感和后续用户点位语义都被冲淡。  
**Why it happens:** 想靠更多点位让页面“看起来不空”。  
**How to avoid:** 计划中限定示例点位数量和层级，少量常驻标签即可。  
**Warning signs:** 一屏出现大量标签或所有点位都带高对比 glow。

### Pitfall 4: Phase 1 组件结构没有给 Phase 2 预留服务边界
**What goes wrong:** 真实地点识别阶段需要重写地图主组件。  
**Why it happens:** 过早把展示和识别耦在一起。  
**How to avoid:** 计划中明确 `WorldMapStage`、点位层、drawer、store 分开。  
**Warning signs:** 地图组件开始同时处理布局、点位、识别、文案和抽屉。

## Code Examples

Verified planning patterns for this phase:

### UI State Ownership
```ts
// src/stores/map-ui.ts
export interface SelectedPreview {
  id: string
}

export const useMapUiStore = defineStore('map-ui', () => {
  const selectedPreviewId = ref<string | null>(null)

  function selectPreview(id: string) {
    selectedPreviewId.value = id
  }

  function clearPreview() {
    selectedPreviewId.value = null
  }

  return { selectedPreviewId, selectPreview, clearPreview }
})
```

### Seed Data Separation
```ts
// src/data/seed-points.ts
export const seedPoints: MapPoint[] = [
  // phase 1 demo points only; user-created points come later
]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 先做重 dashboard，再塞地图 | 先做 map-first stage，再叠点位和抽屉 | 近年交互地图产品更强调沉浸式首屏 | 更符合旅行海报风与移动端体验 |
| 抽屉视作辅助面板 | 抽屉作为地图内容预览的一部分 | UI patterns 更强调 context-preserving surfaces | 有利于保持地图主舞台不被切断 |

**Deprecated/outdated:**
- 用大面积工具栏、统计卡来“填满首页” —— 与当前已锁定的产品体验冲突

## Open Questions

1. **Phase 1 使用哪一张确切的世界地图底图资源**
   - What we know: 必须是做旧纸质感、复古旅行海报方向
   - What's unclear: 实际采用 SVG、插画化 raster 还是混合资源
   - Recommendation: planner 应把“选择并固定地图资产”放进第一份计划

2. **字体资源的接入方式**
   - What we know: UI-SPEC 已锁定 Display/Heading 与 Body/Label 的字体组合
   - What's unclear: 本地打包、自托管还是使用外部字体服务
   - Recommendation: Phase 1 规划时优先用最稳定的引入方式，避免在执行阶段反复调整

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Vue Test Utils |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --runInBand` |
| Full suite command | `npm test` |

### Validation Layers

1. **Structure validation**
   - Verify project scaffold, root app shell, map stage component, drawer component, and seed data module all exist.
2. **Rendering validation**
   - Verify seed points render from built-in data and responsive drawer container mounts in desktop/mobile layouts.
3. **Contract validation**
   - Verify implementation aligns with `01-CONTEXT.md` and `01-UI-SPEC.md` for map-first layout, low-density seed markers, and closed-by-default drawer behavior.

### Fast Checks

- `rg "WorldMapStage|WorldMapView" src`
- `rg "seedPoints" src`
- `rg "drawer" src`
- `npm test`

### Must-Verify Behaviors

- App boots into a map-first home screen with title + guiding line only
- Seed points are visible without overwhelming the map
- Clicking a seed point opens the preview drawer
- Drawer is closed on initial load
- Desktop and mobile layouts both preserve the map as the dominant surface
