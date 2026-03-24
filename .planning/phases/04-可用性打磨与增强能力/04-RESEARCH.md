# Phase 04: 可用性打磨与增强能力 - Research

**Researched:** 2026-03-24
**Domain:** 地图点位层级强化、抽屉可访问性与长文本韧性、异常降级体验、城市级增强入口
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 普通已保存点位提升到中等亮度，平时就能被清楚看见，但仍保持地图主视觉优先
- 当前选中点位通过更强发光与外圈描边拉开，不依赖整套换色
- 草稿点位保持更暖、更活的临时态表达，并持续带轻微呼吸/脉冲
- 某个点位被选中后，其他点位略微退后一步
- 键盘聚焦到点位时，视觉表现接近悬停态，但额外给明确焦点框
- 点位标签默认不常驻，只在悬停、聚焦或选中时出现
- 抽屉打开时，焦点先落到标题或抽屉容器本身
- 抽屉打开后启用焦点限制，`Tab` 先留在抽屉内部直到关闭
- `Esc` 没有未保存更改时直接关闭，有未保存更改时才确认
- 地图点位的键盘触发只要求 `Enter`
- 抽屉关闭按钮需要比当前更明显
- 移动端查看态与编辑态高度整体保持稳定
- 移动端编辑态的保存/取消操作固定在底部
- 移动端键盘弹出时优先保证当前输入框可见；保存按钮可通过滚动到达
- 无效点击提示区分两类：海洋/无效陆地区域，与边界不确定区域
- 识别模块加载失败时继续使用顶部提示，不锁定地图，不禁用继续尝试
- 本地存档异常延续顶部提示方案，不再额外给地图主舞台叠加重型异常态
- 长简介不允许撑坏抽屉；顶部关键信息与底部操作保持稳定，只让简介内容区自身滚动
- 移动端查看态遇到长简介时，先展示一部分，再通过独立滚动区继续查看
- 地图容器边缘点击时允许点位贴边显示，不因为视觉压线就判无效
- 城市级增强默认对用户无感，系统在后台静默尝试
- 城市级高置信命中时，抽屉标题使用城市名，副标题显示国家/地区，并额外附上可信度说明
- 城市级只是“可能位置”时，只做轻提示，提示内容紧贴城市结果本身
- 城市级高置信结果一旦命中，应与点位一起持久化
- 城市级未命中但国家/地区级命中时，需要明确说明“未识别到更精确城市，已回退到国家/地区”
- 城市级未命中并回退到国家/地区级时，需要给读屏用户明确播报回退结果
- 草稿点位需要带“未保存地点”这一类明确状态语义
- 地图点位的 `aria-label` 保持偏完整，包含名称、国家/地区、坐标等核心信息

### Claude's Discretion
- 点位降亮、发光、焦点框与轻微脉冲的具体视觉参数与动画节奏
- 边界点击的具体文案拆分逻辑与不同提示之间的切换阈值
- 移动端抽屉中“预览一部分 + 独立滚动区”的具体排版实现方式
- 城市级可信度说明的措辞、图标样式与在抽屉中的精确位置
- 读屏文案是否通过 `aria-live`、描述文本或状态标签组合实现

### Deferred Ideas (OUT OF SCOPE)
- 真正完整的城市级高精度识别能力与更可靠的数据源体系
- 在线逆地理编码、外部城市数据库或后端同步识别结果
- 更复杂的点位筛选、聚类、统计面板或地图控制器

</user_constraints>

<research_summary>
## Summary

Phase 4 的关键不是再加一条新主流程，而是把现有 Phase 1-3 已能工作的链路变成“更稳、更清楚、更有韧性”的产品体验。当前仓库已经具备地图点击识别、草稿点位、抽屉编辑和本地持久化这些主能力，但点位层级、键盘流、长文本布局、异常降级说明和城市级增强入口都还停留在“可用但不完整”的状态。若继续零散补 patch，执行阶段很容易在样式、语义和持久化结构之间出现新一轮串态。

最稳的实现路径是保持 roadmap 里的两份 plan 拆分：第一份 plan 专注于前端交互可靠性，把点位层级、键盘焦点、抽屉关闭语义、移动端编辑区和长文本韧性统一打磨完；第二份 plan 再收口到异常与降级体验，补城市级静默尝试、国家级回退文案、附加字段持久化和整体视觉反馈优化。这样可以延续现有 `WorldMapStage -> map-points/map-ui -> PointPreviewDrawer -> point-storage` 的结构，而不是在一个 plan 里同时改 UI、服务层和存档格式。

**Primary recommendation:** 保持 roadmap 既定的 2 份 plan：
1. `04-01` 聚焦可访问性、焦点态、关闭行为、长文本和点位层级；
2. `04-02` 聚焦异常降级、城市级静默增强、字段扩展持久化与回退提示。
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 Composition API | repo-managed current | 抽屉焦点流、地图交互状态、视图语义增强 | 当前仓库全量采用 `<script setup>` |
| Pinia setup store | repo-managed current | 点位来源、抽屉模式、异常与城市级附加字段统一管理 | `map-points` / `map-ui` 已是稳定状态边界 |
| Vitest + Vue Test Utils | repo-managed current | 组件可访问性、焦点语义、降级文案与存储回归覆盖 | 当前测试基础健康且运行快 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| 浏览器 `localStorage` | built-in | 扩展城市级高置信字段与继续沿用损坏回退路径 | Phase 4 继续沿用现有持久化仓库 |
| `d3-geo` | repo-managed current | 如需对城市级候选结果做进一步几何判断/采样 | 继续沿用现有离线识别技术基底 |
| `aria-live` / 原生 ARIA 属性 | platform built-in | 抽屉、草稿、回退说明、读屏状态播报 | Phase 4 无障碍增强首选原生语义 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 原生焦点管理 + ARIA 语义 | 引入完整无障碍 overlay/dialog 库 | 当前抽屉结构不复杂，先在现有组件上强化更低风险 |
| 延续 `map-points` 存储结构并扩展字段 | 另起一个城市增强 store | 状态源会被拆散，增加抽屉与持久化串态风险 |
| 顶部 notice + 抽屉内轻说明 | 新增重型错误页或全屏锁定层 | 与当前地图主视觉优先原则冲突 |

**Installation:**
```bash
# Phase 4 使用现有依赖即可，无需新增库
pnpm test && pnpm build
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
src/
├── components/
│   ├── SeedMarkerLayer.vue
│   ├── WorldMapStage.vue
│   └── PointPreviewDrawer.vue
├── services/
│   ├── geo-lookup.ts
│   └── point-storage.ts
├── stores/
│   ├── map-points.ts
│   └── map-ui.ts
└── types/
    ├── geo.ts
    └── map-point.ts
```

### Pattern 1: Accessibility And Visual Hierarchy Stay In Presentation Components
**What:** 点位层级、焦点态、标签显隐和抽屉焦点管理优先落在展示组件，不把视觉/语义判断回流进持久化层。  
**When to use:** 当 Phase 4 目标主要是可靠交互和可访问性，而不是重做业务模型时。  
**Example:**
```ts
const isSelected = point.id === selectedPointId
const isKeyboardFocus = focusedPointId.value === point.id
```

### Pattern 2: Keep Domain Store As The Single Fact Source, Extend It Rather Than Fork It
**What:** 城市级高置信结果、草稿未保存语义和新的读屏辅助字段应继续挂在 `map-points` 现有模型上，而不是再造一层平行数据结构。  
**When to use:** 当国家级创建主链路已经稳定，需要在其上增加“更精细但不破坏”的增强层时。  
**Example:**
```ts
interface MapPointDisplay {
  cityName?: string | null
  cityConfidence?: 'high' | 'possible' | null
}
```

### Pattern 3: Graceful Degradation Should Be Explicit In UI Copy And Data Shape
**What:** 城市级未命中、识别加载失败、存档损坏等异常，不应只靠内部状态吞掉，而要以明确 UI 文案和可测试状态落点表现出来。  
**When to use:** 当 Phase 4 成功标准明确要求“异常时安全回退且不破坏国家级结果创建”时。  
**Example:**
```ts
type GeoPrecision = 'country' | 'region' | 'city-high' | 'city-possible'
type StorageHealth = 'ready' | 'empty' | 'corrupt'
```

### Anti-Patterns to Avoid
- **把焦点管理和关闭语义继续停留在“能点就行”层面：** 很容易出现桌面端键盘流断裂、移动端操作区不可达。
- **城市级增强只加展示不改数据结构：** 高置信结果无法持久化，后续回归时容易丢失精细结果。
- **在多个组件里各自拼接异常文案：** 海洋、边界不确定、加载失败、城市回退会失去统一口径。
- **为了处理长文本直接让整个抽屉无限增长：** 会破坏移动端可用性，也与“地图仍是主舞台”冲突。
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 复杂 focus trap 系统 | 新建一整套弹层管理器 | 在现有抽屉内做最小可用 focus trap | 当前只有一个主要抽屉，可控性更高 |
| 城市级增强入口 | 新建独立“精确识别”流程或页面 | 先做静默尝试 + 抽屉轻说明 | 避免破坏国家级主链路 |
| 长文本韧性 | 让整个抽屉或页面跟着无限拉长 | 固定关键信息 + 让简介区独立滚动 | 最符合用户已锁定的体验方向 |
| 异常回退 | `catch` 后无文案静默吞掉 | 明确 notice / drawer copy / storageHealth 状态 | Phase 4 要求异常可解释 |

**Key insight:** Phase 4 应该 hand-roll 的是“产品语义和交互韧性”，不应该 hand-roll 的是新的状态体系或重型 UI 基础设施。
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Visual Hierarchy Fixes Drift Away From Keyboard Semantics
**What goes wrong:** 鼠标悬停时看起来层级清楚，但键盘 focus 到点位后没有同等强度反馈，`UX-01` 实际仍未完成。  
**Why it happens:** 只改 `.hover` 和 `.selected` 样式，没有把 `.focus-visible`、`aria-label` 与 selected/focus 状态一起设计。  
**How to avoid:** 把点位 hover、focus、selected、draft 四种状态一起规划，并在组件测试里覆盖键盘触发路径。  
**Warning signs:** 计划只写“优化 marker 样式”，没提 `Enter`、focus ring、ARIA。

### Pitfall 2: Drawer Layout Stability Is Solved On Desktop But Not On Mobile
**What goes wrong:** 桌面端看起来稳定，但移动端编辑态、长简介或软键盘弹出时，底部按钮仍然不可达。  
**Why it happens:** 只在宽屏视口调布局，没有把移动端操作区和滚动容器拆开。  
**How to avoid:** 明确区分“固定操作区”和“独立滚动内容区”，并把移动端视口作为验证重点。  
**Warning signs:** 计划里没有任何“sticky/fixed action area”或“scroll container”。

### Pitfall 3: City Fallback Text Exists But Persistence Still Drops Precision
**What goes wrong:** 抽屉能显示城市级或回退说明，但刷新后城市级高置信结果丢失，等于增强层是假的。  
**Why it happens:** 只改显示模型，不改 `point-storage` 和 `map-point` 数据结构。  
**How to avoid:** 若用户已锁定“高置信城市结果要持久化”，必须在同一 plan 中扩展类型和存储仓库。  
**Warning signs:** 计划目标提到 city fallback，但 `files_modified` 没有 `src/types/map-point.ts` 或 `src/services/point-storage.ts`。

### Pitfall 4: Error And Degradation Copy Fragments Across Components
**What goes wrong:** 海洋点击、边界点击、加载失败、城市回退各说各话，产品语气和用户理解成本都变差。  
**Why it happens:** 每个组件各自决定提示文案，没有统一 notice contract。  
**How to avoid:** 把错误/降级文案继续收口到 `map-ui` / drawer copy contract，并让 tests 校验 exact strings。  
**Warning signs:** 计划里出现多处“按组件自行提示”而没有 notice source of truth。
</common_pitfalls>

<code_examples>
## Code Examples

Verified planning patterns for this phase:

### Accessible Point Trigger Contract
```ts
<button
  type="button"
  :aria-label="`查看 ${point.name}`"
  :aria-pressed="point.id === selectedPointId"
  @click="handlePointSelect(point)"
/>
```

### Explicit Degradation Metadata
```ts
interface GeoPrecisionMeta {
  precision: 'country' | 'region' | 'city-high' | 'city-possible'
  fallbackNotice?: string | null
}
```

### Drawer Close Guard
```ts
function handleClose() {
  if (!confirmDiscardChanges()) {
    return
  }

  clearActivePoint()
}
```

### Storage Health Contract
```ts
type PointStorageHealth = 'ready' | 'empty' | 'corrupt'
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| “键盘支持”只补个 `tabindex` | 更强调完整 focus order、visible focus 与 ARIA 文案一体设计 | 近几年可访问性实践更重视真实可操作路径 | Phase 4 不能只做样式补丁 |
| 降级结果静默回退 | 明确把 fallback 作为用户可感知但不打断的状态说明 | 复杂前端应用越来越强调可解释失败 | 更符合本产品“可信度优先” |
| UI 和存储层分开迭代 | 对增强字段采用“显示 + 持久化同时收口” | 离线优先应用更强调状态一致性 | 避免刷新后信息缩水 |

**New tools/patterns to consider:**
- 用轻量 `aria-live` 区域承接真正需要播报的回退结果，而不是播报所有瞬时状态
- 把 marker 层级、抽屉滚动区、异常提示文案都纳入回归测试，而不只测 happy path

**Deprecated/outdated:**
- 只要 build 通过就认为“可访问性已完成” —— 本阶段必须把交互语义做成用户能感知的行为
</sota_updates>

<open_questions>
## Open Questions

1. **城市级候选数据源在执行阶段如何组织**
   - What we know: 当前 `geo-lookup.ts` 只处理国家/地区级边界命中
   - What's unclear: 城市级增强是否通过静态候选点集、区域中心点，还是更细几何数据实现
   - Recommendation: planner 允许执行阶段先采用轻量候选点/元数据方案，只要不破坏国家级链路

2. **抽屉 focus trap 是否需要兼顾移动端外接键盘**
   - What we know: 用户已要求抽屉内部先完成焦点限制
   - What's unclear: 实现上是否单独区分移动端
   - Recommendation: 先实现统一 focus trap，移动端外接键盘视为自动受益，而不是单独分支

</open_questions>

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Vue Test Utils |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test && pnpm build` |
| Estimated runtime | ~10 seconds |

### Execution Strategy
- 优先用组件测试覆盖点位 focus、抽屉关闭语义、城市级回退文案和持久化扩展
- 纯数据结构变化通过 `map-point` / `point-storage` / `map-points` 的单元与集成测试兜底
- 每个 plan 至少保留一条可 grep 的 acceptance criteria 和一条可执行的自动校验命令

### Required Coverage
- `PNT-04` 必须同时有视觉层级与键盘 focus 行为的自动或半自动验证
- `DRW-04` 必须验证关闭按钮、`Esc`、未保存更改确认和抽屉 focus 范围
- `DAT-04` 必须验证空存档、损坏存档和版本兼容失败的安全回退
- `GEO-04` 必须验证城市级未命中时仍可保留国家/地区级结果创建
- `UX-02` / `UX-03` 必须覆盖长文本与边缘点击显示路径

### Recommended Test Additions
- 新增 `src/components/SeedMarkerLayer.spec.ts` 覆盖 selected/focus/label 语义
- 扩展 `src/components/PointPreviewDrawer.spec.ts` 覆盖 focus trap、`Esc`、长文本滚动和移动端操作区
- 扩展 `src/components/WorldMapStage.spec.ts` 覆盖边界提示分流、城市级回退说明和边缘贴边点位
- 扩展 `src/services/point-storage.spec.ts` / `src/stores/map-points.spec.ts` 覆盖城市级高置信字段持久化与回退兼容
