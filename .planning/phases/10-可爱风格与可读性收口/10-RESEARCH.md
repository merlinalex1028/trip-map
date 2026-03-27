# Phase 10: 可爱风格与可读性收口 - Research

**Researched:** 2026-03-27
**Domain:** Vue 3 地图主舞台视觉系统收口、状态语义可读性、交互安全
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### 视觉母题与整体气质
- **D-01:** Phase 10 的“可爱风”主方向锁定为“轻旅行手账 + 少女感细节”，而不是强 IP 角色绑定，也不是明确的陪伴角色系统。
- **D-02:** 整体视觉配色偏暖粉、淡蓝的柔和彩度组合，形成更轻盈的原创可爱气质，而不是继续沿用当前偏复古牛皮纸/土棕色作为主色。
- **D-03:** 标题区、卡片壳子、按钮、marker 和边界都需要带出更明确的二次元可爱语言，但仍保持“旅行地图产品”而不是“角色页”或“游戏主菜单”的产品感。
- **D-14:** 项目内用户可见表面默认优先使用圆角语言，包括卡片、popup、drawer、按钮、输入框和 marker 标签；只有在确有语义需要时才保留尖角或更硬的几何边。

### 地图舞台改造力度
- **D-04:** 世界地图底图采用“中度可爱化”方案：允许更柔和的海洋/陆地色彩、轻纹理和更统一的氛围处理，但不做会影响识别语义的重卡通化重绘。
- **D-05:** 可爱风的主要发力点优先放在地图边框、边界高亮、marker、popup、详情表面、按钮和标题氛围，而不是把全部风格压力压在底图本体上。
- **D-06:** 底图本体不采用会干扰地理识别与地图阅读的大面积贴纸覆盖、强装饰遮罩或高对比角色元素；大陆/海洋可做轻纹理与柔和渐层，但必须继续服务地图主链路。

### 状态辨识合同
- **D-07:** 状态辨识采用“颜色 + 轮廓/描边 + 纹理/徽章语义”共同拉开的方案，不只依赖单一配色变化。
- **D-08:** 关键状态的主配色映射锁定为：当前选中 = 暖粉主高亮；已记录 = 淡蓝或蓝绿色次高亮；低置信回退 = 更浅、更冷的蓝灰提示态；未记录 = 中性浅底。
- **D-09:** popup、drawer、marker、边界和主要按钮中的状态表达必须共享同一套语义映射，不能出现“地图上是一个状态、卡片上像另一个状态”的风格漂移。
- **D-10:** 即使加入贴纸感、纹理、边框装饰或更强视觉语言，桌面端和移动端都仍要一眼区分“未记录 / 已记录 / 当前选中 / 低置信回退”这四类关键状态。

### 装饰与动效预算
- **D-11:** Phase 10 允许“明显装饰化”的可爱风表达，但装饰和动效的主要落点集中在边框、边界、marker、popup、按钮和标题氛围，不把大面积连续装饰直接压到地图命中层上。
- **D-12:** 动效可以比当前更积极，允许更明显的呼吸、漂浮、闪烁、贴纸感反馈或进出场氛围，但必须优先服从 `VIS-03`：不遮挡点击命中区，不破坏 popup / marker / 地图交互。
- **D-13:** 地图底图本体的装饰强度低于表层 UI；底图只做柔和彩色和轻纹理，不做会与边界高亮、marker 命中、popup 锚点竞争注意力的大装饰覆盖。

### Claude's Discretion
- 在暖粉与淡蓝主方向内，具体补充哪些奶油中性色、珊瑚色或蓝绿色作为辅助 token
- 贴纸感、闪光感、缎带感、手账边框感分别在标题、popup、按钮、边界和 marker 上的具体分配比例
- 各状态在不同组件上的纹理、描边、阴影、玻璃感或纸感实现方式，只要不破坏统一语义
- 动效的精确时长、easing 和触发时机，只要不制造遮挡、残影或点击干扰

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIS-01 | 用户在地图、城市边界、marker、popup、详情面板和主要按钮中看到统一的原创二次元美少女可爱风格 | 统一采用 token-first 视觉系统；保留 `WorldMapStage`/`SeedMarkerLayer`/`PointSummaryCard`/`PointPreviewDrawer` 现有结构，只重构表层样式与语义 token |
| VIS-02 | 用户在桌面端和移动端都能清晰区分未记录、已记录、当前选中和低置信度回退等关键状态，不会因新风格降低可读性 | 强制四状态语义合同：颜色 + 描边/边框 + 纹理/徽章 + 受控动效；测试先覆盖 marker、boundary、popup notice、CTA 语义钩子 |
| VIS-03 | 用户进行地图点击、marker 点击和 popup 操作时，装饰图层和反馈动效不会遮挡命中区域或破坏交互 | 装饰只挂在 inert 背景层、frame 或 pseudo-element；保持 overlay `pointer-events: none`、marker `44px` 命中区、popup 锚点和事件边界不变 |
</phase_requirements>

## Summary

Phase 10 不是“重新做一套 UI”，而是在已经稳定的 Phase 8/9 交互结构上，把视觉语言统一收口。当前代码库已经有明确入口：全局 token 在 `src/styles/tokens.css`，页面底色与排版在 `src/styles/global.css`，地图主舞台在 `src/components/WorldMapStage.vue`，状态 marker 在 `src/components/SeedMarkerLayer.vue`，摘要表面在 `src/components/map-popup/PointSummaryCard.vue`，深层表面在 `src/components/PointPreviewDrawer.vue`，标题氛围在 `src/components/PosterTitleBlock.vue`。最小风险路线是继续沿用这些结构，只改 token、state hook 和组件 scoped CSS，不引入设计系统、动画库或新的浮层模型。

当前最大的规划风险原本不是技术，而是文档基线冲突。`ROADMAP.md` 与 `REQUIREMENTS.md` 一度仍写着“桌面端和移动端”，但 `STATE.md` 记录 2026-03-27 的 quick task `260327-dgz` 已移除移动端兼容，仓库中 `MobilePeekSheet` 也已不存在，而现有 `10-UI-SPEC.md` 明确把平台基线写成“Desktop anchored popup + deep drawer only”。该冲突现已由用户在 planning gate 中明确裁定为 **desktop-only**，因此后续计划应统一按“当前桌面 anchored popup + deep drawer 主链路”执行，不重新拉回移动端 `peek`。

**Primary recommendation:** 按“现有桌面主舞台结构 + token-first 语义收口 + 交互安全护栏”来拆 Phase 10，不重新引入移动端兼容壳层。

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vue` | repo `^3.5.21`; registry `3.5.31` (verified 2026-03-27, modified 2026-03-26) | 组件、响应式状态和样式承载 | 当前所有主舞台组件都基于 Vue SFC；本阶段无理由切换框架 |
| `pinia` | repo `^3.0.3`; registry `3.0.4` (verified 2026-03-27, modified 2025-11-05) | popup/drawer/selection 单一事实源 | `summarySurfaceState`、`selectedBoundaryId`、`savedBoundaryIds` 已锁定为视觉语义根源 |
| `@floating-ui/dom` | repo `^1.7.6`; registry `1.7.6` (verified 2026-03-27, modified 2026-03-03) | anchored popup 定位 | 当前 popup 已经基于 `usePopupAnchoring`；不要为 Phase 10 重写定位逻辑 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vite` | repo `^8.0.1`; registry `8.0.3` (verified 2026-03-27, modified 2026-03-26) | 本地构建与 dev server | 样式和组件调整的日常开发 |
| `vitest` | repo `^3.2.4`; registry `4.1.2` (verified 2026-03-27, modified 2026-03-26) | 组件与 store 回归 | Phase 10 继续扩充现有 UI 语义测试，不升级框架 |
| `@vue/test-utils` | repo `^2.4.6`; registry `2.4.6` (verified 2026-03-27, modified 2024-05-07) | 挂载 Vue 组件并断言 DOM/类名/交互 | popup、marker、drawer、App 壳层回归 |
| `happy-dom` | repo `^17.6.3`; registry `20.8.9` (verified 2026-03-27, modified 2026-03-24) | Vitest DOM 环境 | 现有组件测试已在此环境通过 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 继续使用 token + scoped CSS | 引入 Tailwind / shadcn / 设计系统 | 会把 Phase 10 从“收口”变成“重构基础设施”，风险远高于收益 |
| 继续使用 `usePopupAnchoring` | 自写 popup 锚点与碰撞处理 | 会重复踩 Phase 9 已解决的碰撞与层级问题 |
| 继续使用 CSS transition/animation | 新增 GSAP / motion library | 对本阶段的装饰预算过重，也更难统一 reduced-motion 护栏 |

**Installation:**
```bash
# None — Phase 10 不建议新增依赖
```

**Version verification:** 已通过 `npm view` 在 2026-03-27 验证当前 registry 版本与修改时间；本阶段建议保持现有 repo 依赖，不做升级任务。

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── styles/
│   ├── tokens.css              # 语义 token、圆角、阴影、状态色、动效时长
│   └── global.css              # 页面底色、全局背景和基础排版
├── components/
│   ├── PosterTitleBlock.vue    # 标题氛围入口
│   ├── WorldMapStage.vue       # 地图 frame、底图氛围、boundary/popup 组装
│   ├── SeedMarkerLayer.vue     # marker 四状态表现和命中层
│   ├── PointPreviewDrawer.vue  # 深层查看/编辑表面
│   └── map-popup/
│       ├── MapContextPopup.vue # 桌面 anchored popup shell
│       └── PointSummaryCard.vue# popup/drawer 共享摘要内容
└── **/*.spec.ts                # 现有 Vitest 回归入口
```

### Pattern 1: Token-First Semantic Theming
**What:** 先在 `src/styles/tokens.css` 建立全局视觉语义，再让组件消费变量，不直接散落十几套硬编码十六进制。
**When to use:** 任何颜色、圆角、阴影、边框、动效预算调整都先改 token，再改组件消费点。
**Example:**
```css
/* Source: current codebase pattern in src/styles/tokens.css */
:root {
  --color-stage-bg: #fff7fb;
  --color-stage-support: #e8f4fb;
  --color-state-selected: #f48fb1;
  --color-state-saved: #84c7d8;
  --color-state-fallback: #b8c6d9;
  --radius-surface: 24px;
  --motion-emphasis-duration: 180ms;
}
```

### Pattern 2: Keep Interaction Layers Separate From Decoration Layers
**What:** 地图底图、boundary overlay、marker hit target、popup shell 必须继续保持独立层次；装饰只能落在 inert 背景层、frame 或 pseudo-element。
**When to use:** 调整底图纹理、边界 glow、marker sticker、popup 边框、标题缎带时。
**Example:**
```vue
<!-- Source: current codebase pattern in src/components/WorldMapStage.vue -->
<svg class="world-map-stage__overlay" aria-hidden="true">...</svg>
<SeedMarkerLayer :points="displayPoints" :selected-point-id="selectedPointId" />
<MapContextPopup v-if="isDesktopPopupVisible" ... />
```

### Pattern 3: Drive Visual State From Existing Store Semantics
**What:** 边界、marker、popup、drawer 都应该从现有 store 派生状态拿视觉语义，不要创建组件私有“视觉选中态”。
**When to use:** 映射 selected/saved/draft/fallback 四态时。
**Example:**
```ts
// Source: current codebase pattern in src/stores/map-points.ts
const summarySurfaceState = computed(() => {
  if (summaryMode.value === 'candidate-select' && pendingCitySelection.value) {
    return { mode: 'candidate-select', ...pendingCitySelection.value }
  }

  if ((summaryMode.value === 'detected-preview' || summaryMode.value === 'view') && activePoint.value) {
    return {
      mode: summaryMode.value,
      point: activePoint.value,
      boundarySupportState: activeBoundaryCoverageState.value
    }
  }

  return null
})
```

### Pattern 4: Ornament Budget Decreases With Task Depth
**What:** 标题区和 popup 可以更可爱；drawer 编辑表面要更稳、更清楚；错误/存档异常提示保持“可靠性优先”。
**When to use:** 分配 ribbon、sparkle、纹理、阴影、玻璃感、纸感时。
**Example:**
```css
/* Source: Phase 10 implementation guidance; validate against MDN prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .seed-marker--selected .seed-marker__dot,
  .seed-marker--draft .seed-marker__dot {
    animation: none;
    transform: none;
  }
}
```

### Anti-Patterns to Avoid
- **按组件各自选色:** 会直接破坏 `D-09` 的共享语义映射。
- **重做 popup / drawer 内容结构:** Phase 10 是视觉收口，不是信息架构重做。
- **让装饰进入命中层:** 新增 DOM 层或 pseudo-element 如果落在 marker/popup 之上，会最先打破 `VIS-03`。
- **把移动端 `peek` 当默认工作项:** 这与 2026-03-27 的最新项目状态冲突，除非先明确重开需求。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Popup 锚点与碰撞处理 | 新的 anchor math / viewport collision 逻辑 | 继续使用 `usePopupAnchoring` + `@floating-ui/dom` | 这部分已经在 Phase 9 里稳定，重新实现只会引入回归 |
| 统一视觉系统 | 新设计系统、UI 库或 utility CSS 迁移 | 现有 `tokens.css` + `global.css` + scoped CSS | 本阶段目标是收口，不是基础设施替换 |
| 摘要表面模板 | popup 一份、drawer 再复制一份 | 继续以 `PointSummaryCard` 作为共享摘要块 | 防止 copy、CTA 顺序和 fallback notice 再次漂移 |
| 交互命中安全 | 新的覆盖层、独立 clickable 装饰节点 | 现有 marker button 命中层 + inert 装饰 | `44px` 命中区和 overlay 层级已是可工作的基线 |
| 动效系统 | 大型动画库或全屏连续装饰 | 少量 CSS transition / animation + reduced-motion 护栏 | Phase 10 需要的是可读性与可靠性，不是动画工程 |

**Key insight:** 本阶段最容易失败的地方不是“做得不够可爱”，而是为了可爱打破状态语义、命中层和 popup/drawer 结构边界。

## Common Pitfalls

### Pitfall 1: Requirement Drift Between Mobile Text And Desktop-Only Reality
**What goes wrong:** planner 同时按 `VIS-02` 的“桌面端和移动端”与 `STATE.md`/`10-UI-SPEC.md` 的“桌面-only”拆任务，结果任务范围自相矛盾。
**Why it happens:** 文档更新时间不一致；`ROADMAP.md`/`REQUIREMENTS.md` 仍保留旧文本，而 2026-03-27 的 quick task 已移除移动端兼容。
**How to avoid:** 把“是否重开移动端”列为 planning 前置决策；若未重开，默认按当前桌面基线计划。
**Warning signs:** 计划里同时出现 `peek`、safe-area、移动端触控布局和 desktop-only anchored popup。

### Pitfall 2: Using Color Alone To Distinguish States
**What goes wrong:** selected、saved、fallback 只是不同色调，结果在地图纹理、半透明卡片和 glow 叠加后很难一眼区分。
**Why it happens:** 视觉收口时只改配色，不补 outline、纹理、徽章、文案和动效节制。
**How to avoid:** 强制每个状态至少用两种 cue：颜色 + 描边/纹理/文案/动效之一。
**Warning signs:** design review 时只能靠“更粉/更蓝一点”解释状态差异。

### Pitfall 3: Decoration Leaks Into Clickable Layers
**What goes wrong:** sparkle、ribbon、标签或 glow 新增在 marker/popup 上层，导致地图点击、marker 点击或 popup 内按钮命中异常。
**Why it happens:** 为了做装饰额外加 DOM 层，但没有继承现有 `pointer-events: none` 和 z-layer 约束。
**How to avoid:** 装饰优先用 pseudo-element，且默认 `pointer-events: none`；命中层仍由 button、popup shell、surface 容器负责。
**Warning signs:** 点击 marker 需要更精确、popup 外围出现“点不到”或“误点穿透”。

### Pitfall 4: Over-Animating Saved State Or Background
**What goes wrong:** 已保存 marker、已保存 boundary、背景纹理都在动，用户找不到真正当前选中态。
**Why it happens:** 把“更可爱”误解成“更多持续动画”。
**How to avoid:** 连续动画只允许出现在 selected 或 draft marker；saved/background 保持静态。
**Warning signs:** 页面在 idle 时仍有多个元素持续呼吸、漂浮或闪烁。

### Pitfall 5: Making Drawer As Ornamental As Popup
**What goes wrong:** drawer 的编辑表单被过度装饰，输入框、按钮、错误提示可读性下降。
**Why it happens:** 试图让所有表面拥有同样强度的“可爱感”。
**How to avoid:** 采用“标题 > popup/view > drawer/edit”递减的装饰预算。
**Warning signs:** 编辑表单内出现过多缎带、重纹理、强对比贴纸边框或连续动效。

## Code Examples

Verified codebase patterns that Phase 10 should extend rather than replace:

### Shared Marker State Hooks
```vue
<!-- Source: src/components/SeedMarkerLayer.vue -->
<div
  class="seed-marker"
  :class="{
    'seed-marker--selected': point.id === props.selectedPointId,
    'seed-marker--dimmed': hasSelection && point.id !== props.selectedPointId,
    'seed-marker--featured': point.isFeatured,
    'seed-marker--saved': point.source === 'saved',
    'seed-marker--draft': point.source === 'detected'
  }"
>
```

### Non-Blocking Overlay Layer
```css
/* Source: src/components/WorldMapStage.vue */
.world-map-stage__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

### Shared Popup / Drawer Summary Contract
```vue
<!-- Source: src/components/map-popup/MapContextPopup.vue -->
<PointSummaryCard
  :surface="surface"
  :find-saved-point-by-city-id="findSavedPointByCityId"
  @confirm-candidate="emit('confirmCandidate', $event)"
  @continue-with-fallback="emit('continueFallback')"
  @save-draft="emit('savePoint')"
  @open-drawer="emit('openDetail')"
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 复古牛皮纸/土棕主导视觉 | 暖粉 + 淡蓝 + 中性色的语义 token 体系 | Phase 10 context locked on 2026-03-27 | 需要先改 token，再统一组件消费点 |
| 抽屉承担更多入口职责 | anchored popup 负责轻摘要，drawer 只承接深层 view/edit | Phase 9 completed on 2026-03-26 | Phase 10 只能升级表面，不应重排信息架构 |
| 桌面/移动双壳层设想 | 当前真实基线为 desktop anchored popup + deep drawer only | quick task `260327-dgz` on 2026-03-27 | planner 必须先处理与 `VIS-02` 文本的冲突 |

**Deprecated/outdated:**
- `MobilePeekSheet` / 移动端 safe-area fallback：已在 2026-03-27 从当前实现中移除，除非需求重开，否则不应规划回归。
- 继续使用 Phase 9 以前的复古棕色 token 作为主视觉：与 Phase 10 已锁定的暖粉/淡蓝方向冲突。

## Open Questions

1. **Phase 10 是否仍然必须覆盖移动端？**
   - Resolved: 用户已明确确认“Phase 10 不考虑移动端，按 desktop-only 规划”。
   - Effective baseline: 以 `STATE.md`、`10-UI-SPEC.md`、更新后的 `ROADMAP.md` / `REQUIREMENTS.md` 为准，只规划当前桌面 anchored popup + deep drawer 主链路。
   - Planner implication: 不重新引入 `MobilePeekSheet`、safe-area fallback 或移动端壳层恢复任务。

2. **`10-UI-SPEC.md` 是否作为 Phase 10 的执行级设计合同一并维护？**
   - What we know: 该文件已存在，并且内容与 `10-CONTEXT.md`、`STATE.md` 及当前代码结构高度一致。
   - What's unclear: planner 是仅消费它，还是把“更新/校准 UI-SPEC”作为第一波任务的一部分。
   - Recommendation: 将 `10-UI-SPEC.md` 视为当前最接近执行的设计合同；如果实现计划与其有偏差，优先先更新 UI-SPEC 再进入代码。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite/Vitest 运行 | ✓ | `v22.22.1` | — |
| npm | 脚本执行、`npm view` 版本核验 | ✓ | `10.9.4` | — |
| Vitest (local project dep) | 组件/UI 回归 | ✓ | repo `3.2.4` | `npm test` |

**Missing dependencies with no fallback:**
- None

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `Vitest` repo `3.2.4` (`happy-dom`) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIS-01 | 标题、地图、marker、popup、drawer、主要按钮共享同一套 token 与表面语言 | component + manual visual review | `npm test -- src/App.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/WorldMapStage.spec.ts` | ✅ |
| VIS-02 | 未记录 / 已记录 / 当前选中 / 低置信回退四态在 map + summary surfaces 中可区分 | component + semantic-state assertions | `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts` | ✅ |
| VIS-03 | 装饰层和动效不遮挡 map/marker/popup 命中层 | component smoke + manual interaction QA | `npm test -- src/components/WorldMapStage.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/map-popup/MapContextPopup.spec.ts` | ✅ |

### Sampling Rate
- **Per task commit:** `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/SeedMarkerLayer.spec.ts` — 现有测试只覆盖 selected/dimmed 层级，还没显式验证四状态语义钩子和动效预算
- [ ] `src/components/map-popup/PointSummaryCard.spec.ts` — 需要补 fallback notice、saved hint、selected CTA 样式钩子的一致性断言
- [ ] `src/components/WorldMapStage.spec.ts` — 需要补 boundary/surface 装饰不干扰点击和 overlay 层 inert 合同的断言
- [ ] Manual visual QA checklist — 当前没有像素级或对比度自动化；需要人工检查 token 改动后的真实可读性

## Sources

### Primary (HIGH confidence)
- Current repo constraints: `10-CONTEXT.md`, `10-UI-SPEC.md`, `09-UI-SPEC.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md`
- Current implementation scan: `src/styles/tokens.css`, `src/styles/global.css`, `src/components/WorldMapStage.vue`, `src/components/SeedMarkerLayer.vue`, `src/components/map-popup/PointSummaryCard.vue`, `src/components/map-popup/MapContextPopup.vue`, `src/components/PointPreviewDrawer.vue`, `src/components/PosterTitleBlock.vue`, `src/stores/map-points.ts`
- Test baseline verification: `npm test -- src/App.spec.ts src/components/WorldMapStage.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/PointPreviewDrawer.spec.ts` on 2026-03-27, 42 tests passed
- Registry version verification via `npm view`: `vue`, `pinia`, `@floating-ui/dom`, `vite`, `vitest`, `@vue/test-utils`, `happy-dom`

### Secondary (MEDIUM confidence)
- Vue Transition guide: https://vuejs.org/guide/built-ins/transition.html
- Pinia Core Concepts: https://pinia.vuejs.org/core-concepts/
- MDN `pointer-events`: https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/pointer-events
- MDN `prefers-reduced-motion`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- MDN ARIA dialog role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `package.json` + `npm view` + current repo usage are consistent
- Architecture: HIGH - current codebase and Phase 9/10 context documents directly constrain implementation shape
- Pitfalls: MEDIUM - most are strongly supported by codebase structure, but mobile scope conflict remains unresolved

**Research date:** 2026-03-27
**Valid until:** 2026-04-03
