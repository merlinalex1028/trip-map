# Phase 03: 点位闭环与本地持久化 - Research

**Researched:** 2026-03-24
**Domain:** 旅行点位草稿流、详情抽屉闭环、`seed + localStorage` 覆盖持久化
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 识别成功后不自动落盘，而是进入“新建草稿”状态
- 地图上会立即显示一个明显的临时点位，用来表达“这个位置已识别但尚未保存”
- 新建草稿关闭抽屉时，视为取消创建，临时点位直接消失，不保留未保存草稿
- 如果已有未保存草稿时再次点击新的有效地点，新点击会覆盖当前草稿，并先给出“旧草稿将被丢弃”的提示
- 新识别出的草稿点位，抽屉默认先展示识别结果，不直接进入编辑态
- 用户已保存的点位，再次打开时默认进入查看态，需要用户主动点击“编辑”
- 预置 `seed` 点位允许编辑，且只开放 `名称`、`简介`、`点亮状态` 三个字段
- Phase 3 不加入图片、标签、游记或时间线等富内容字段
- 预置 `seed` 点位的编辑结果保存到本地覆盖层，而不是复制成新的用户点位
- 编辑已保存点位时，如果存在未保存修改，关闭抽屉前需要二次确认；没有改动则直接关闭
- 已保存点位在编辑态点击“取消”后，回到查看态，并恢复到上一次保存的内容
- 删除用户自建点位时需要二次确认，确认后立即删除
- 预置 `seed` 点位允许被用户隐藏，不仅仅是恢复默认覆盖
- 编辑预置 `seed` 点位时，本地层保存同 `id` 的覆盖记录，运行时覆盖原始 `seed`
- 隐藏预置 `seed` 点位时，合并结果中直接移除该点位，不保留弱化占位态
- 本地持久化结构拆分为三个集合：`userPoints`、`seedOverrides`、`deletedSeedIds`
- 当本地存储损坏、字段非法或版本不兼容时，Phase 3 采用显式告知策略：提示用户本地存档异常，并要求用户手动清空后继续，而不是静默自动回退

### Claude's Discretion
- 草稿点位、正式点位和选中点位之间的具体视觉差异实现
- “旧草稿将被丢弃”与“存在未保存修改”的具体提示文案和展现位置
- 查看态与编辑态在同一个抽屉中的排版方式
- 本地存储异常提示中的按钮样式、文案细节和清空流程入口

### Deferred Ideas (OUT OF SCOPE)
- 更平滑的本地存储损坏自动回退与部分字段抢救策略
- 草稿点、正式点、选中点之间更强的视觉分层与焦点表现
- 长文本简介的极限布局和抽屉内容韧性
- 城市级识别成功后的字段扩展与结果创建策略

</user_constraints>

<research_summary>
## Summary

Phase 3 的关键不是“给抽屉加几个输入框”，而是把当前 Phase 2 的临时识别结果升级为一个可靠的点位状态机。现有实现里，识别成功后的 `detected` 点只存在于 `map-ui` 的 `selectedPoint` 里，而地图上的可持久点来自 `preview-points` 的一次性加载结果。这意味着如果继续在组件里直接拼数据，执行阶段很容易把“草稿点、已保存点、预置点、隐藏覆盖、脏表单”混成一团。

最稳的路径是把 Phase 3 拆成三个层次推进：先建立一个独立的点位域状态源，统一管理草稿、已保存点和 seed 覆盖；再在抽屉里补上“识别预览 / 查看 / 编辑”三种模式与取消、删除、隐藏闭环；最后把所有写入都收口到一个版本化的本地存储仓库，显式处理损坏与恢复。这样既能延续现有 Vue + Pinia 架构，也能避免把 `localStorage` 读写散落到地图组件和抽屉组件里。

**Primary recommendation:** 按 roadmap 固定拆分为 3 份 plan：
1. `03-01` 先建立 `MapPoint` 域模型和 CRUD 状态流；
2. `03-02` 再升级抽屉为查看/编辑闭环；
3. `03-03` 最后统一完成持久化、覆盖合并、存档异常提示和回归验证。
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 Composition API | repo-managed current | 抽屉模式切换、表单状态、地图交互联动 | 当前仓库已经稳定采用 `<script setup>` |
| Pinia setup store | repo-managed current | 点位域状态与 UI 状态协作 | 已存在 `map-ui`，继续扩展成本最低 |
| `nanoid` | repo-managed current | 自建用户点位 ID 生成 | 仓库已安装，足以支撑本地持久化 ID |
| Vitest + Vue Test Utils | repo-managed current | store、组件、持久化回归验证 | 当前测试基座健康，`pnpm test` 约 1.34s |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| 浏览器 `localStorage` | built-in | 本地点位持久化 | Phase 3 主持久化路径 |
| `structuredClone` or shallow object copy | runtime built-in | 编辑态草稿副本与取消恢复 | 保持实现轻量即可 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pinia 域 store + 仓库函数 | 组件局部 `ref` + emit 链 | 草稿、选中和持久化状态会迅速失控 |
| 结构化本地快照对象 | 继续沿用单数组 `preview-points` | 难以表达 `seedOverrides` 与 `deletedSeedIds` |
| 原生 `window.confirm` 最小确认闭环 | 自定义模态系统 | 当前阶段不需要新增 modal 复杂度 |

**Installation:**
```bash
# Phase 3 使用现有依赖即可，无需新增库
pnpm test
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
src/
├── components/
│   ├── WorldMapStage.vue
│   ├── SeedMarkerLayer.vue
│   └── PointPreviewDrawer.vue
├── services/
│   └── point-storage.ts          # 新增：本地快照读写与合并
├── stores/
│   ├── map-ui.ts                 # UI 视图态、toast、抽屉关闭等
│   └── map-points.ts             # 新增：草稿/已保存点/seed 覆盖单源
└── types/
    └── map-point.ts              # 扩展：显示模型 + 持久化模型 + 编辑模型
```

### Pattern 1: Domain Store Owns Point Lifecycle
**What:** 点位域 store 负责草稿创建、覆盖旧草稿、保存、更新、删除和隐藏 seed。  
**When to use:** 当地图点击、点位选择、抽屉编辑都需要共享同一事实来源时。  
**Example:**
```ts
type DrawerMode = 'detected-preview' | 'view' | 'edit'

interface PointStorageSnapshot {
  version: 1
  userPoints: PersistedMapPoint[]
  seedOverrides: SeedPointOverride[]
  deletedSeedIds: string[]
}
```

### Pattern 2: UI Store Handles Presentation State, Not Data Ownership
**What:** `map-ui` 保留提示、抽屉开关、识别中状态和“脏编辑关闭确认”等视图态；点位数据本体不再只挂在 `selectedPoint` 单个 ref 上。  
**When to use:** 当前仓库已有 `interactionNotice` 和识别状态，需要平滑演进而不是推倒重来时。  
**Example:**
```ts
const drawerMode = shallowRef<DrawerMode | null>(null)
const hasUnsavedChanges = computed(() => draftBufferChanged.value)
```

### Pattern 3: Repository Merge Before Render
**What:** 地图层只消费“已合并完成的 displayPoints”，不直接知道 `userPoints / seedOverrides / deletedSeedIds` 的内部结构。  
**When to use:** 既要保留 seed，又要允许本地覆盖和隐藏时。  
**Example:**
```ts
const displayPoints = computed(() =>
  mergeSeedAndLocalPoints(seedPoints, userPoints, seedOverrides, deletedSeedIds)
)
```

### Anti-Patterns to Avoid
- **把本地存储读写留在 `WorldMapStage.vue` 里：** 地图点击逻辑会同时承担识别、草稿、选择、持久化四类职责
- **继续用 `loadPreviewPoints()` 返回一个扁平数组当全部数据源：** 无法精确表达 seed 覆盖和隐藏语义
- **让编辑表单直接改动当前显示对象：** 取消编辑时无法恢复保存前内容
- **损坏存档时静默 `catch -> []`：** 会违背 Phase 3 的显式告知决策
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 复杂表单库 | 引入完整 form framework | Vue 响应式对象 + 明确字段副本 | 字段只有 `name / description / isFeatured`，额外抽象不值 |
| 覆盖合并规则 | 组件里 `map/filter` 直接拼数组 | `point-storage.ts` 中的纯函数 `mergeSeedAndLocalPoints` | 更容易单测，也避免 UI 层隐式规则 |
| 删除/关闭确认系统 | 新增全局 modal infrastructure | Phase 3 先用原生确认或轻量内联确认 | 当前阶段核心是闭环正确性，不是模态组件库 |
| 本地容错 | `try/catch { return [] }` 全吞 | 返回 `ok/corrupt` 状态并显式提示 | 用户必须知道存档异常，而不是悄悄丢数据 |

**Key insight:** Phase 3 应该 hand-roll 的是“旅行点位的产品状态机”，不应该 hand-roll 的是重型表单系统或复杂持久化框架。
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Draft Point And Selected Point Are Treated As The Same Thing
**What goes wrong:** 关闭抽屉、连续点图、点击已有点位时状态相互覆盖，导致草稿残留或错误消失。  
**Why it happens:** 继续沿用 `selectedPoint` 作为唯一数据入口，没有把“草稿是否已保存”显式建模。  
**How to avoid:** 在域 store 中单独建模 `draftPointId / draftPoint` 与 `selectedPointId` 或显式 `pointStatus`。  
**Warning signs:** 计划里还在使用 “detected point = selected point = save target” 的模糊说法。

### Pitfall 2: Editing Seed Points By Mutating Seed Data Directly
**What goes wrong:** seed 资产失去只读性，刷新或部署后表现不可预测。  
**Why it happens:** 为了图省事，直接修改 `seedPoints` 数组对象。  
**How to avoid:** 把 seed 永远视为只读基底，用户编辑写入 `seedOverrides`。  
**Warning signs:** 计划出现 “update seed point in place” 或 “write back to seed-points.ts”。

### Pitfall 3: Corrupt Storage Silently Falls Back To Empty
**What goes wrong:** 用户看见自己的点位消失，却没有任何解释。  
**Why it happens:** 当前 `preview-points.ts` 的容错是 `catch { return [] }`。  
**How to avoid:** 读取时区分 `empty / valid / corrupt`，在 `App.vue` 渲染持久提示并提供手动清空入口。  
**Warning signs:** 计划没有任何 `storageHealth`、`storageError` 或 `clear corrupted snapshot` 的动作。

### Pitfall 4: Drawer Modes Are Implicit In Button Presence
**What goes wrong:** “识别预览”“查看”“编辑”三个态互相串味，按钮显示和字段禁用规则难以维护。  
**Why it happens:** 只依赖 `source === 'detected'` 或 `isEditing` 单一布尔判断。  
**How to avoid:** 引入明确的 `drawerMode` 枚举，并按模式收敛文案和操作。  
**Warning signs:** 计划里没有为抽屉状态命名，只写“根据情况显示按钮”。
</common_pitfalls>

<code_examples>
## Code Examples

Verified planning patterns for this phase:

### Persisted Point Model
```ts
export interface PersistedMapPoint {
  id: string
  name: string
  countryName: string
  countryCode: string
  lat: number
  lng: number
  x: number
  y: number
  description: string
  isFeatured: boolean
  source: 'saved'
  createdAt: string
  updatedAt: string
}
```

### Seed Override Model
```ts
export interface SeedPointOverride {
  id: string
  name: string
  description: string
  isFeatured: boolean
  updatedAt: string
}
```

### Storage Health Contract
```ts
export type PointStorageHealth = 'ready' | 'empty' | 'corrupt'
```

### Drawer Mode Contract
```ts
export type DrawerMode = 'detected-preview' | 'view' | 'edit'
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 组件自己读写 `localStorage` | 用 store + repository 管住所有本地持久化 | 近几年前端状态管理更强调 domain ownership | 更容易测试与回归 |
| 抽屉只靠 `isEditing` 布尔值切换 | 用明确 mode 枚举描述不同产品态 | 复杂单页表单交互越来越强调显式 state machine | 关闭、取消、删除行为更不容易串态 |
| seed 和用户点混成同一数组覆盖 | 基底数据 + 覆盖记录 + 删除记录分层 | 本地优先覆盖模式在离线产品里更常见 | 升级 schema 时更可控 |

**New tools/patterns to consider:**
- 让 `SeedMarkerLayer` 只消费合并后的 `displayPoints`，把视觉层完全从持久化结构里解耦
- 用持久化 schema version 标识未来迁移点，即使 Phase 3 先只做到“显式告知”

**Deprecated/outdated:**
- “识别成功就直接保存”为默认行为 —— 已与当前产品决策冲突
</sota_updates>

<open_questions>
## Open Questions

1. **确认文案是否全部用原生 `window.confirm`**
   - What we know: 产品要求二次确认，但没有锁定模态形态
   - What's unclear: 是否要在 Phase 3 引入自定义确认 UI
   - Recommendation: plan 先使用原生确认，保证闭环先成立

2. **存档异常提示是否提供一键清空按钮**
   - What we know: 必须显式告知并要求用户手动清空
   - What's unclear: “手动清空”是指浏览器层面还是应用内按钮
   - Recommendation: plan 中提供应用内“清空本地存档”入口，仍属于用户手动确认
</open_questions>

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Vue Test Utils |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test && pnpm build` |
| Current full test runtime | ~1.34s |

### Recommended Test Split
- `src/stores/map-points.spec.ts`：覆盖草稿创建、保存、删除、seed 隐藏与覆盖旧草稿
- `src/services/point-storage.spec.ts`：覆盖 schema 读写、seed 合并、损坏快照告知
- `src/components/PointPreviewDrawer.spec.ts`：覆盖三种抽屉模式、取消恢复、删除/隐藏确认
- `src/components/WorldMapStage.spec.ts`：覆盖识别成功后草稿落点与重复点击替换

### Manual Validation Focus
- 地图仍保持 Phase 1 海报感，新增按钮和表单没有压垮主视觉
- 草稿点、已保存点、隐藏 seed 的视觉区别对用户直觉清晰
- 存档异常提示在桌面和移动端都不会遮住主要地图交互

---
*Phase research for: 03-点位闭环与本地持久化*
*Researched: 2026-03-24*
