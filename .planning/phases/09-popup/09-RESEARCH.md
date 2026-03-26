# Phase 09: Popup 主舞台交互 - Research

**Researched:** 2026-03-26
**Domain:** Vue 3 地图主舞台 popup 锚点定位、轻交互摘要面与移动端 peek 回退
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### 主入口形态与状态接力
- **D-01:** `candidate-select` 不再以边缘 drawer 作为主入口，城市候选确认也进入地图内 popup。
- **D-02:** popup 成为“城市候选确认 + 已确认草稿摘要 + 已保存点位摘要”的统一轻交互主入口，避免候选 drawer 和结果 popup 两段式割裂。
- **D-03:** popup 仍然是轻量入口而不是完整工作台；当用户需要完整详情或更深编辑时，必须通过显式入口接力到 drawer。
- **D-04:** 候选确认 popup 需要继续承接 Phase 7 已锁定的轻量搜索、同城复用提示和“按国家/地区继续记录”回退动作，不能因主入口迁移而削弱既有语义。

### 快捷操作边界
- **D-05:** popup 内允许直接执行高频操作，包括保存草稿、进入详情/编辑，以及点亮状态切换。
- **D-06:** popup 内也允许直接暴露删除、隐藏等破坏性动作，不要求强制留到 drawer 中再处理。
- **D-07:** popup 的目标不是只读摘要卡，而是“地图主舞台里的轻操作中枢”；但完整表单编辑、长文本编辑和更深层设置仍不在 popup 内完成。

### 锚点与移动端回退
- **D-08:** 桌面端 popup 必须保持地图内锚定，不采用固定右侧或固定角落浮层作为主模式。
- **D-09:** 移动端 popup 需要自动避开视口边缘；当锚定式小卡不再安全或可用时，回退到底部 `peek` 或等效轻量展示。
- **D-10:** popup 的锚点与回退切换不能破坏 Phase 8 已锁定的边界高亮语义；关闭 popup、切换城市、返回已有点位时，高亮状态仍只跟随真实选中状态变化，不允许出现残留记忆态。

### 信息密度与内容结构
- **D-11:** popup 采用中等密度摘要卡，而不是极简气泡或压缩版 drawer。
- **D-12:** 摘要卡默认展示核心身份信息（城市/地点名、国家或上级区域）、当前状态提示、必要的回退/边界支持提示、简短摘要，以及一排快捷操作。
- **D-13:** 不要求在 popup 中长期展示完整坐标、长简介、完整编辑表单或深层设置；当内容深度超过摘要卡容量时，应显式接力到 drawer。

### Claude's Discretion
- 候选确认态、草稿态、已保存态在桌面端的具体锚点算法，例如优先跟随 marker、边界视觉中心或 pending 命中点，只要保持“锚定地图语境”这一主原则。
- 移动端从锚定式 popup 回退到底部 `peek` 的具体阈值与碰撞检测策略，只要优先保证可读性、可点性和安全边距。
- popup 中破坏性动作的确认形式、防误触细节和提示文案，只要不把确认流程做成重型模式切换。
- 摘要卡中的字段排序、按钮排布和文案细节，只要维持中等密度并避免重新长成小抽屉。

### Deferred Ideas (OUT OF SCOPE)
- popup、marker、边界和详情面板的统一原创可爱风格语言、装饰动效与视觉资产收口 — 属于 Phase 10
- 缩放、拖拽、hover 预览等更复杂的地图交互模型 — 属于未来扩展能力，不纳入本阶段
- 把完整编辑表单、长文本工作流或深层设置长期塞进 popup — 超出本阶段“轻量主入口”的边界
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POP-01 | 用户选中城市或已有点位后，可以看到锚定在地图上下文中的悬浮 popup 摘要卡 | 推荐引入 `@floating-ui/dom` 做锚点定位与碰撞处理，并把 popup surface 放在 `WorldMapStage.vue` 内而不是页面边缘 |
| POP-02 | 用户可以在 popup 中完成高频快捷操作，并通过显式入口进入完整详情或编辑视图 | 推荐抽离共享摘要卡内容/动作层，popup 直接复用 store 动作，drawer 只承接深层查看与编辑 |
| POP-03 | 用户在移动端使用时，popup 会自动避开视口边缘，必要时回退为安全的底部 peek 或等效轻量展示 | 推荐桌面 anchored popup + 移动端 capability-based peek fallback，使用 `flip`/`shift`/`size` 和 safe-area 约束 |
</phase_requirements>

## Summary

Phase 9 不是“再做一个新弹层”，而是把现有 `candidate-select`、`detected-preview`、`view` 的轻交互承载位置从边缘 drawer 重组到地图主舞台里。现有代码已经把识别、候选、草稿、已保存点位、边界身份和高频动作都集中在 [src/stores/map-points.ts](/Users/huangjingping/i/trip-map/src/stores/map-points.ts) 与 [src/components/PointPreviewDrawer.vue](/Users/huangjingping/i/trip-map/src/components/PointPreviewDrawer.vue)，因此本阶段最稳妥的实现不是重写业务流，而是抽离共享摘要卡内容与动作，再增加一个“锚点定位层 + 桌面/移动端展示策略层”。

现有项目没有浮层定位/碰撞系统，手写会同时落入滚动、resize、元素尺寸变化、边缘翻转、clipping ancestor、移动端安全区等多个坑。`@floating-ui/dom` 的 `computePosition()`、`autoUpdate()`、`flip()`、`shift()`、`size()` 正好覆盖这个阶段最难的部分，并且不要求切换现有 Vue/Pinia 架构。结合现有 store 和组件边界，本阶段应优先做“共享摘要内容 + anchored popup shell + mobile peek shell + drawer handoff”，而不是继续扩展现有 drawer 成为两用怪物。

当前测试基线健康：相关 4 个测试文件共 47 个测试全部通过，耗时 2.18s。这意味着 planner 可以放心把 Wave 0 聚焦在新增 popup/anchor 测试，而不是先修旧基线。

**Primary recommendation:** 保持 `map-points` 为单一事实源，抽离共享摘要卡内容，并新增 `@floating-ui/dom` 驱动的地图内 popup shell；移动端不硬撑锚定小卡，条件不安全时直接回退到底部 `peek`。

## Standard Stack

没有 repo-local `CLAUDE.md`，也没有 `.claude/skills/` 或 `.agents/skills/` 项目技能目录；研究结论仅受 `AGENTS.md`、`CONTEXT.md`、现有代码和官方文档约束。

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vue` | `3.5.21` installed; registry latest `3.5.31` published `2026-03-25` | 组件、响应式、地图舞台与 popup shell 组合 | 现有项目已全面采用 Vue 3 SFC + Composition API，Phase 9 不应引入新 UI runtime |
| `pinia` | `3.0.3` installed; registry latest `3.0.4` published `2025-11-05` | 统一维护 `pendingCitySelection`、`draftPoint`、`activePoint`、`drawerMode` | popup/drawer/highlight 共享同一状态源，不能分叉成第二套 popup store |
| `@floating-ui/dom` | registry latest `1.7.6` published `2026-03-03` | popup 锚点定位、碰撞避让、边缘翻转、尺寸约束、自动重算 | 这是本阶段唯一值得新增的库，能显著降低手写定位逻辑的复杂度和回归风险 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | `3.2.4` installed; registry latest `4.1.1` published `2026-03-23` | 单元/组件测试 | 继续沿用当前测试栈；本 phase 不做工具升级 |
| `@vue/test-utils` | `2.4.6` installed; registry latest `2.4.6` published `2024-05-07` | 挂载 popup shell、mock 响应式状态与 DOM 定位 | 用于 popup/peek 行为、按钮 handoff、移动端回退断言 |
| `happy-dom` | `17.6.3` installed | DOM 环境 | 用于 `getBoundingClientRect`、`matchMedia`、`ResizeObserver`/尺寸变更 mock |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@floating-ui/dom` | 手写 `DOMRect + clamp + scroll/resize listeners` | 初期看似轻，但会把 collision、flip、size、cleanup、resize 监听全部手写，风险最高 |
| `@floating-ui/dom` | `@floating-ui/vue` `1.1.11` | Vue wrapper 更高层，但本项目只需少量 DOM ref 与显式生命周期；`dom` 包更直接、改动面更小 |
| 地图内 anchored popup | 继续以边缘 drawer 为主入口 | 直接违背 D-01 / D-02 / D-08，且保留两段式体验裂缝 |

**Installation:**
```bash
npm install @floating-ui/dom
```

**Version verification:** 2026-03-26 已通过 `npm view` 验证推荐包与当前工程基础包版本。
```bash
npm view vue version
npm view pinia version
npm view vite version
npm view vitest version
npm view @vue/test-utils version
npm view @floating-ui/dom version
```

**Upgrade policy for this phase:** 不在 Phase 9 顺手升级 `vue`/`pinia`/`vite`/`vitest`。当前目标是交互重组，不是工具链迁移。

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── components/
│   ├── map-popup/
│   │   ├── MapContextPopup.vue      # 桌面锚定 popup shell
│   │   ├── MobilePeekSheet.vue      # 移动端 peek surface
│   │   └── PointSummaryCard.vue     # 共享摘要内容与动作
├── composables/
│   └── usePopupAnchoring.ts         # computePosition/autoUpdate 包装
├── stores/
│   └── map-points.ts                # 继续做唯一状态源
└── components/
    ├── WorldMapStage.vue            # 锚点注册、popup/peek 装配
    └── PointPreviewDrawer.vue       # 仅保留深层查看/编辑 handoff
```

### Pattern 1: Shared Summary Surface, Split Shells
**What:** 把现有 drawer 中“身份信息 + 提示文案 + 候选列表/摘要 + 高频动作”抽成共享 `PointSummaryCard`；桌面 popup 和移动端 peek 只负责壳层与定位，不复制业务内容。
**When to use:** 候选确认态、未保存草稿态、已保存点位查看态。`edit` 和长内容仍走 drawer。
**Example:**
```typescript
// Source: existing repo patterns in src/stores/map-points.ts + src/components/PointPreviewDrawer.vue
const summarySurface = computed(() => {
  if (pendingCitySelection.value) {
    return {
      kind: 'candidate',
      point: pendingCitySelection.value.fallbackPoint
    }
  }

  if (activePoint.value && drawerMode.value !== 'edit') {
    return {
      kind: activePoint.value.source === 'detected' ? 'draft' : 'saved',
      point: activePoint.value
    }
  }

  return null
})
```

### Pattern 2: Anchor Is Derived, Not Stored
**What:** store 继续保存“真实选中对象”，锚点元素或几何信息由 `WorldMapStage.vue` 根据当前 surface kind 推导，不把 DOM anchor 持久化进 store。
**When to use:** marker、pending 命中点、边界视觉中心三类 anchor 来源之间切换时。
**Example:**
```typescript
// Source: Floating UI docs + current WorldMapStage.vue overlay model
const cleanup = autoUpdate(referenceEl, floatingEl, async () => {
  const { x, y, placement } = await computePosition(referenceEl, floatingEl, {
    strategy: 'absolute',
    placement: preferredPlacement.value,
    middleware: [
      offset(12),
      flip({ crossAxis: 'alignment', fallbackAxisSideDirection: 'end', padding: 16 }),
      shift({ padding: 16 }),
      size({
        padding: 16,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.max(280, Math.min(360, availableWidth))}px`,
            maxHeight: `${Math.max(0, availableHeight)}px`
          })
        }
      })
    ]
  })

  Object.assign(floatingEl.style, {
    left: `${x}px`,
    top: `${y}px`
  })
  currentPlacement.value = placement
})
```

### Pattern 3: Capability-Based Mobile Fallback
**What:** 不把移动端当成“缩小版桌面 popup”。当视口宽度不足、anchor 过近边缘、可用高度不足、输入聚焦可能触发键盘时，直接切到底部 `peek`。
**When to use:** `candidate-select`、长候选列表、顶部 notice/安全区占位、或任何定位后剩余空间不足以容纳摘要卡时。
**Example:**
```typescript
// Source: locked decisions in 09-CONTEXT.md + MDN env() safe area guidance
const shouldUsePeek = computed(() => {
  if (!summarySurface.value) {
    return false
  }

  if (viewportWidth.value < 960) {
    return true
  }

  return collisionState.value === 'unsafe'
})
```

### Anti-Patterns to Avoid
- **复制 Drawer 模板到 Popup:** 会产生两套候选列表、两套按钮文案和两套删除/隐藏确认逻辑，后续很快串态。
- **把 popup 自己变成选中状态源:** 边界高亮已锁定在 store 与 overlay，popup 只能消费，不得制造“最后一次高亮记忆态”。
- **移动端硬撑锚定小卡:** `candidate-select` 带搜索框与 CTA，本身就不是 tooltip 体量；空间不够时应直接回退 `peek`。
- **保持 `drawerMode` 语义不变硬塞 popup:** 需要把“summary surface”和“deep surface”拆清，不然 `candidate-select` / `view` / `edit` 很容易互相污染。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 锚点定位与碰撞避让 | 手写 `getBoundingClientRect` + 各种 clamp/flip/scroll 监听 | `@floating-ui/dom` 的 `computePosition` + `autoUpdate` + `flip` + `shift` + `size` | 官方中间件已覆盖 viewport/clipping/resize/scroll 边界，且有明确 cleanup 语义 |
| popup / drawer 内容同步 | 两套候选列表和摘要动作模板 | 共享 `PointSummaryCard` | 现有 drawer 已证明候选、fallback、boundary notice、快捷动作能共存，抽共享块成本最低 |
| popup 业务动作 | 新建 popup 专用 action 层 | 直接复用 `map-points` 现有动作 | 保存、删除、隐藏、进入编辑都已经在 store 内，重复封装只会增加分叉 |
| 边界身份判断 | 从 popup 文本反推城市/边界 | 继续使用 `cityId` / `boundaryId` / `selectedBoundaryId` | Phase 8 已明确身份与边界语义绑定，UI 不应重新猜测 |

**Key insight:** 本阶段真正新增的是“表面层”和“定位层”，不是“领域动作层”。业务动作、城市身份、边界状态已经存在，重复实现只会放大串态风险。

## Common Pitfalls

### Pitfall 1: Popup 和边界高亮脱钩
**What goes wrong:** popup 显示的是 A 城市，但地图仍高亮 B 城市，或关闭 popup 后留下错误强高亮。
**Why it happens:** 新 popup 自己缓存了“当前对象”，没有完全依赖 `selectedPointId` / `selectedBoundaryId` / `pendingCitySelection`。
**How to avoid:** popup 只消费 store 派生状态；关闭、切换、fallback 都调用现有 store 动作。
**Warning signs:** 关闭 popup 后 `.world-map-stage__boundary--selected` 仍存在，或 popup 标题与边界 `data-boundary-id` 不一致。

### Pitfall 2: 手写定位逻辑只处理一次
**What goes wrong:** 初次打开位置正确，但窗口缩放、顶部 notice 出现、页面滚动或元素尺寸变化后 popup 漂移。
**Why it happens:** 只在 mount 时测一次位置，没有处理 ancestor scroll / resize / element resize / layout shift。
**How to avoid:** 只在 popup 打开时挂 `autoUpdate()`，关闭时立刻 cleanup。
**Warning signs:** marker 不动但 popup 明显错位，或 popup max-height 长时间残留。

### Pitfall 3: 把移动端 fallback 做成样式压缩
**What goes wrong:** 小屏上 popup 虽然“还在锚点附近”，但搜索框、候选列表、危险操作按钮都挤压到不可用。
**Why it happens:** 只做 `max-width`/`font-size` 缩小，没有独立的 `peek` 展示语义。
**How to avoid:** 定义明确的 `shouldUsePeek` 条件；`candidate-select` 在窄屏可直接优先 `peek`。
**Warning signs:** popup 贴边、按钮低于 44px、输入框被键盘或安全区覆盖。

### Pitfall 4: Popup 重新长成小 Drawer
**What goes wrong:** popup 越做越高，最后承载长简介、完整编辑表单、更多设置，主舞台再次被侧面工作台替代。
**Why it happens:** 没有为“轻摘要 vs 深编辑”设硬边界。
**How to avoid:** popup 只承载中等密度摘要和高频动作；进入编辑或长内容一律 handoff 到 drawer。
**Warning signs:** popup 出现 textarea、多段表单或需要内部滚很久才能到底。

### Pitfall 5: 破坏性动作确认过重或过轻
**What goes wrong:** 删除/隐藏要跳出重模态，或反过来一击即删，造成主舞台节奏割裂或误触。
**Why it happens:** 没有把“轻确认”当成本阶段专门约束。
**How to avoid:** 使用 inline confirm / 二次点击 / 小型确认行，不引入重型模式切换。
**Warning signs:** 删除一触即发，或每次删除都弹浏览器 blocking `confirm()` 抢焦点。

## Code Examples

Verified patterns from official sources and current repo conventions:

### Anchored Popup Positioning
```typescript
// Source: https://floating-ui.com/docs/computeposition
// Source: https://floating-ui.com/docs/autoupdate
// Source: https://floating-ui.com/docs/flip
// Source: https://floating-ui.com/docs/shift
// Source: https://floating-ui.com/docs/size
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'

export function mountPopup(referenceEl: HTMLElement, floatingEl: HTMLElement) {
  return autoUpdate(referenceEl, floatingEl, async () => {
    const { x, y } = await computePosition(referenceEl, floatingEl, {
      strategy: 'absolute',
      placement: 'top',
      middleware: [
        offset(12),
        flip({ crossAxis: 'alignment', fallbackAxisSideDirection: 'end', padding: 16 }),
        shift({ padding: 16 }),
        size({
          padding: 16,
          apply({ availableWidth, availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxWidth: `${Math.max(0, Math.min(360, availableWidth))}px`,
              maxHeight:
                availableHeight >= elements.floating.scrollHeight ? '' : `${Math.max(0, availableHeight)}px`
            })
          }
        })
      ]
    })

    Object.assign(floatingEl.style, {
      left: `${x}px`,
      top: `${y}px`
    })
  })
}
```

### Shared Summary Card Handoff
```typescript
// Source: current repo action patterns in src/stores/map-points.ts
function handlePrimaryAction(surface: SummarySurface) {
  if (surface.kind === 'candidate') {
    confirmPendingCitySelection(surface.primaryCandidate)
    return
  }

  if (surface.kind === 'draft') {
    saveDraftAsPoint()
    return
  }

  enterEditMode()
}
```

### Mobile Peek Safe Area Padding
```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env */
.mobile-peek {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding:
    0.75rem
    1rem
    calc(0.75rem + env(safe-area-inset-bottom, 0px));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 边缘 drawer 作为候选确认与摘要主入口 | 地图内 anchored popup 作为轻交互主入口，drawer 只负责深层 handoff | 2026-03-26 Phase 9 决策锁定 | 用户操作回到地图主舞台，减少“两段式确认”割裂 |
| 手写静态定位或纯 CSS 偏移 | 中间件式定位：`computePosition` + `flip` + `shift` + `size` + `autoUpdate` | Floating UI 1.x 成熟后已成主流 | 可靠处理窄视口、滚动、元素 resize 和 overflow |
| 仅靠 `100vh` 容器高度 | 使用 `env(safe-area-inset-*)` 和受限 `maxHeight` 保护移动端可见区域 | `env()` 跨浏览器可用自 2020 起 | 减少刘海屏、工具栏、动态键盘对底部 surface 的遮挡 |

**Deprecated/outdated:**
- 继续用 `window.confirm()` 作为 popup 删除/隐藏的长期确认方案：能工作，但会破坏主舞台节奏，建议只作为临时过渡。
- 让 `candidate-select` 同时存在 drawer 主入口与 popup 主入口：直接制造双入口语义冲突。

## Open Questions

1. **桌面端三种状态的 anchor 优先级是否统一**
   - What we know: saved 点位天然跟 marker；pending candidate 有 `pendingGeoHit`；已保存城市也有边界几何。
   - What's unclear: 已保存城市是否永远跟 marker，还是在 marker 被边界覆盖时切到边界视觉中心更稳。
   - Recommendation: 计划阶段先锁定“有 marker 跟 marker；无 marker 才退到几何中心”，避免一次引入过多 anchor 策略。

2. **移动端 candidate-select 是否应直接默认 peek**
   - What we know: 候选确认态包含搜索输入、候选列表、fallback CTA，交互密度最高。
   - What's unclear: 是否还要尝试在某些大屏手机上保留锚定小卡。
   - Recommendation: 先以保守策略计划为“窄屏 candidate-select 直接 peek”，后续若空间足够再迭代 anchored candidate 卡。

3. **破坏性动作确认形式**
   - What we know: D-06 允许删除/隐藏进入 popup，但不希望引入重模态。
   - What's unclear: 采用 inline confirm、二次点击还是轻量二段按钮。
   - Recommendation: 计划阶段把它拆成独立决策点，优先选择 inline confirm row，避免阻塞整个 popup 状态机。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite/Vitest 执行与本地开发 | ✓ | `v22.22.1` | — |
| npm | 安装 `@floating-ui/dom` 与运行测试 | ✓ | `10.9.4` | — |
| `@floating-ui/dom` | popup 锚点定位与碰撞处理 | ✗ (未安装) | registry latest `1.7.6` | 手写 DOMRect 逻辑，不推荐 |

**Missing dependencies with no fallback:**
- None

**Missing dependencies with fallback:**
- `@floating-ui/dom` — technically 可手写，但不建议 planner 采用该 fallback，除非用户明确拒绝加依赖。

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `vitest` `3.2.4` + `@vue/test-utils` `2.4.6` + `happy-dom` |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- src/components/PointPreviewDrawer.spec.ts src/components/WorldMapStage.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POP-01 | 选中城市/点位后出现锚定在地图语境中的摘要 popup | component + integration | `npm test -- src/components/MapContextPopup.spec.ts -t "anchors summary popup"` | ❌ Wave 0 |
| POP-02 | popup 内执行保存/编辑/删除/隐藏等高频动作，并显式 handoff 到 drawer | component + integration | `npm test -- src/components/MapContextPopup.spec.ts -t "runs quick actions and opens drawer handoff"` | ❌ Wave 0 |
| POP-03 | 窄屏/危险边缘时自动回退 peek，桌面端仍保持锚定与碰撞避让 | unit + component | `npm test -- src/composables/usePopupAnchoring.spec.ts src/components/MapContextPopup.spec.ts -t "falls back to peek on unsafe viewport"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- src/components/PointPreviewDrawer.spec.ts src/components/WorldMapStage.spec.ts src/stores/map-points.spec.ts src/App.spec.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/MapContextPopup.spec.ts` — 覆盖 POP-01 / POP-02 的 shell、anchor、快捷动作与 handoff
- [ ] `src/composables/usePopupAnchoring.spec.ts` — 覆盖 POP-03 的 collision、flip、shift、size 和 cleanup
- [ ] `src/App.spec.ts` 扩展 — 断言 drawer 不再是默认主入口，只在 deep mode 接管
- [ ] `src/components/WorldMapStage.spec.ts` 扩展 — 断言 anchor 来源切换不破坏 `selectedBoundaryId` / `savedBoundaryIds`

## Sources

### Primary (HIGH confidence)
- Current repo code and tests:
  - [src/stores/map-points.ts](/Users/huangjingping/i/trip-map/src/stores/map-points.ts)
  - [src/components/WorldMapStage.vue](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue)
  - [src/components/PointPreviewDrawer.vue](/Users/huangjingping/i/trip-map/src/components/PointPreviewDrawer.vue)
  - [src/components/PointPreviewDrawer.spec.ts](/Users/huangjingping/i/trip-map/src/components/PointPreviewDrawer.spec.ts)
  - [src/components/WorldMapStage.spec.ts](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.spec.ts)
  - [src/stores/map-points.spec.ts](/Users/huangjingping/i/trip-map/src/stores/map-points.spec.ts)
  - [src/App.spec.ts](/Users/huangjingping/i/trip-map/src/App.spec.ts)
- Floating UI official docs:
  - https://floating-ui.com/docs/computeposition
  - https://floating-ui.com/docs/autoupdate
  - https://floating-ui.com/docs/flip
  - https://floating-ui.com/docs/shift
  - https://floating-ui.com/docs/size
- MDN official docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env
- npm registry verification via `npm view` on 2026-03-26:
  - `vue`, `pinia`, `vite`, `vitest`, `@vue/test-utils`, `@floating-ui/dom`, `@floating-ui/vue`

### Secondary (MEDIUM confidence)
- None

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 现有代码、npm registry 和官方文档都一致，新增库只建议一个
- Architecture: HIGH - 主要结论来自现有 store/component 结构与已锁定 phase 决策，技术方案有官方文档支持
- Pitfalls: HIGH - 直接来自当前代码边界、既有测试骨架和官方定位文档中的常见失误

**Research date:** 2026-03-26
**Valid until:** 2026-04-02
