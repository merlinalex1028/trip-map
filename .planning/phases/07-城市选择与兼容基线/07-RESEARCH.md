# Phase 07: 城市选择与兼容基线 - Research

**Researched:** 2026-03-25
**Domain:** 城市优先候选确认、轻量搜索补充、低置信回退、重复城市复用、v1 兼容持久化
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 点击地图后先进入候选先行的轻确认面板，不在高置信时直接替用户落到单一城市
- 轻确认面板默认显示轻量搜索框
- 默认展示最多 3 个候选
- 候选项展示“城市名 + 国家/上级区域 + 简短状态提示”
- 低置信城市可以显示，但不默认选中
- 多候选按与点击位置的接近程度排序
- 没有可靠城市时，主动作是“回退到国家/地区继续记录”
- 回退提示语气采用明确解释型
- 已记录城市再次命中时默认打开现有记录，不创建重复草稿
- 复用主键采用稳定城市身份 ID，而不是 `cityName` 文本
- 搜索与地图点击统一遵守同一套复用规则
- 发生复用时给轻提示，不打断流程
- v1 旧点位默认保持原样，不自动迁移为城市记录
- 旧点位未来可以手动补城市，但不是 Phase 7 主交付
- v2 新建城市记录最少持久化“稳定城市 ID + 展示名 + 所属国家/上级区域”
- 旧点位缺少城市身份字段时仍必须可读、可编辑、可持久化

### the agent's Discretion
- 搜索框和候选列表的具体布局
- 候选状态提示与复用提示的最终文案细节
- 距离排序以外的次级稳定性因子
- 城市身份字段的具体命名和嵌套结构

### Deferred Ideas (OUT OF SCOPE)
- 旧点位显式“升级为城市记录”的产品入口
- popup 主舞台交互
- 真实城市边界高亮与恢复语义

</user_constraints>

<research_summary>
## Summary

Phase 7 的关键不是简单把当前 `city-high` 能力“调大一点”，而是把现有试探性的城市增强，升级成一条完整且可信的城市主选择链路。仓库当前已经有 `geo-lookup.ts`、`city-candidates.ts`、`map-points.ts`、`WorldMapStage.vue` 和 `PointPreviewDrawer.vue` 这些基础拼图，但它们仍停留在“单一推荐城市 + 国家级回退 + 草稿预览”的早期形态，距离 milestone 里要求的“候选确认、搜索补充、重复复用、旧数据兼容”还差一层明确的身份模型和交互分流。

最稳的实现路线是把 Phase 7 拆成两份 plan：第一份先做城市身份、候选结果、持久化兼容和复用索引这些地基；第二份再把候选先行确认面板、轻量搜索、回退动作和复用提示接进现有 drawer / map 交互。这样既延续了现有 `WorldMapStage -> map-points -> PointPreviewDrawer -> point-storage` 的结构，也能把风险最大的“身份模型”和“交互流”分开验收，避免一份 plan 同时改服务层、状态层和视图层后难以回归。

**Primary recommendation:** 保持 2 份 execute plan：
1. `07-01` 聚焦候选数据模型、稳定城市 ID、geo lookup 输出、持久化兼容与复用索引；
2. `07-02` 聚焦候选先行 UI、搜索补充、低置信回退、复用提示与端到端交互回归。
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 Composition API | repo-managed current | 承接候选确认面板、搜索输入与交互状态 | 当前仓库全量采用 `<script setup>` |
| Pinia setup store | repo-managed current | 统一管理候选结果、草稿/复用分流、轻提示与旧数据兼容 | `map-points` / `map-ui` 已是稳定状态边界 |
| Vitest + Vue Test Utils | repo-managed current | 覆盖候选排序、回退文案、重复复用和持久化兼容 | 当前测试基线已完整覆盖地图、抽屉、store、storage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `d3-geo` | repo-managed current | 继续沿用国家/地区几何命中判断 | 不需要替换现有识别底座 |
| 浏览器 `localStorage` | built-in | 继续保存 `seed + overlay` 结构，并扩展城市身份字段 | Phase 7 保持本地优先 |
| 原生字符串归一化 / 数组过滤 | platform built-in | 支撑轻量城市搜索 | 当前候选数据量较小，没必要引入搜索库 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 在现有 `city-candidates.ts` 基础上扩展稳定身份和上下文标签 | 引入外部 geocoding / search API | 与“离线识别”方向冲突，也会让候选排序失去可控性 |
| 在 `map-points` 内统一处理“复用已有城市 vs 创建新草稿” | 另起一个 `city-selection` store | 状态源分裂，后续 popup / 边界恢复更容易串态 |
| 简单内存过滤做城市搜索 | 引入 Fuse.js 或全文检索库 | 当前数据体量小，额外依赖会增加复杂度和维护面 |

**Installation:**
```bash
# Phase 7 继续使用现有依赖，无需新增库
pnpm test && pnpm build
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Detection Should Return Candidate Semantics, Not Just One Display String
**What:** `geo-lookup.ts` 不应再只返回一个 `displayName` 和单个 `cityName`，而应能表达“推荐城市 / 低置信候选 / 国家级回退目标 / 排序依据”的候选结果结构。  
**When to use:** 当 Phase 7 要求从“后台静默增强”升级为“用户可确认的城市主路径”时。  
**Example:**
```ts
interface GeoCityCandidate {
  id: string
  name: string
  contextLabel: string
  matchLevel: 'high' | 'possible'
  distanceKm: number
}
```

### Pattern 2: Stable City Identity Must Enter The Persisted Point Model
**What:** 城市复用和后续边界高亮都要求新点位持有稳定城市身份，而不是只保留 `cityName` 文本。  
**When to use:** 当需求明确要求“再次选择已记录城市时优先定位到现有记录”，并且后续 Phase 8 还要恢复同一城市语义时。  
**Example:**
```ts
interface PersistedMapPoint {
  cityId: string | null
  cityName: string | null
  cityContextLabel: string | null
}
```

### Pattern 3: Reuse Decision Belongs In Domain State, Not In The Drawer Component
**What:** “打开已有记录还是创建新草稿”应在 `map-points` 这样的领域状态层做判断，drawer 只负责展示候选、搜索和结果说明。  
**When to use:** 当点击与搜索都要复用同一规则时。  
**Example:**
```ts
const existingPoint = findSavedPointByCityId(candidate.cityId)
if (existingPoint) {
  openExistingPoint(existingPoint.id)
} else {
  startDraftFromCityCandidate(candidate)
}
```

### Anti-Patterns to Avoid
- **继续让 `WorldMapStage` 直接把单个检测结果塞成 draft：** 会把候选确认、搜索补充和复用判断都压回组件层。
- **只给 `cityName` 不给稳定 `cityId`：** 同名城市、后续边界恢复和重复复用都会变脆。
- **让搜索和点击走两套选择逻辑：** 用户会因为入口不同得到不同结果，破坏 Phase 7 的一致性。
- **自动尝试把 v1 旧点位升级成城市记录：** 与 `DAT-05` 明确冲突，也会引入误迁移风险。
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 城市搜索 | 完整全文索引或重量级搜索库 | 对静态城市列表做归一化字符串过滤 | 当前体量不值得引入新依赖 |
| 候选确认 | 新页面或全屏向导 | 在现有 drawer 结构上扩展轻确认面 | 符合用户锁定的 Phase 7 节奏 |
| 城市复用 | 在组件里临时比较 `cityName` | 在 store 中维护稳定 `cityId` 复用入口 | 便于后续 popup / boundary 继续复用 |
| 旧数据兼容 | 一次性迁移脚本或自动补城市 | 对缺失城市字段保持容错读取 | 更符合 milestone “旧点位继续可用”目标 |

**Key insight:** Phase 7 真正需要 hand-roll 的是“候选确认和复用语义”，不需要 hand-roll 新的搜索基础设施、地图引擎或迁移工具。
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Candidate UI Exists, But Service Layer Still Only Emits One City
**What goes wrong:** UI 看起来有候选列表，但底层还是单个 `city-high / city-possible` 结果，导致排序、低置信提示和搜索插入点都很脆。  
**Why it happens:** 只改 drawer 组件，没有先把 `geo-lookup.ts` 的输出形态升级成候选模型。  
**How to avoid:** 在第一份 plan 里先定义候选结构、稳定 ID、回退目标和排序元数据。  
**Warning signs:** 计划里提到候选列表，但 `files_modified` 没有 `src/services/geo-lookup.ts` 或 `src/types/geo.ts`。

### Pitfall 2: Reuse Logic Uses `cityName`, Then Fails On Same-Name Cities
**What goes wrong:** 搜索或点击“Springfield”之类同名城市时，系统错误复用到另一个国家/上级区域下的旧记录。  
**Why it happens:** 只保存 `cityName`，没有稳定 `cityId` 或上下文标签。  
**How to avoid:** 在持久化模型里加入稳定城市身份，并让复用基于 `cityId` 而不是文本。  
**Warning signs:** 计划里用语仍是“按城市名比较是否重复”。

### Pitfall 3: Old Snapshots Read Fine Until Save, Then New Fields Break Them
**What goes wrong:** v1 快照初次加载没问题，但进入编辑/保存后因为缺少新增城市字段而报错、覆盖异常或写回失败。  
**Why it happens:** 只在读取时做兼容，没有在归一化、默认值和写回路径上把新字段设计成可空。  
**How to avoid:** `point-storage.ts` 和 `map-point.ts` 同步扩展，并把城市字段默认视为 `null` / optional。  
**Warning signs:** 计划里修改了 types，却没有同步列出 `src/services/point-storage.ts` 和对应 spec。

### Pitfall 4: Search And Click Drift Into Two Different Main Flows
**What goes wrong:** 点击命中已记录城市会复用，但搜索命中同一城市却还能新建；或反过来。  
**Why it happens:** 搜索实现被塞进 drawer 局部状态，没有走同一套 domain action。  
**How to avoid:** 设计统一的 `selectCityCandidate` / `reuseOrCreateFromCity` 入口，让点击和搜索都走它。  
**Warning signs:** 计划里分别写“点击时复用”“搜索时新建”之类分叉行为。
</common_pitfalls>

<code_examples>
## Code Examples

Verified planning patterns for this phase:

### Stable Candidate Contract
```ts
interface CityCandidateMatch {
  cityId: string
  cityName: string
  contextLabel: string
  statusHint: '更接近点击位置' | '可能位置，需要确认' | '已存在记录'
}
```

### Legacy-Compatible Point Shape
```ts
interface PersistedMapPoint {
  cityId: string | null
  cityName: string | null
  cityContextLabel: string | null
}
```

### Unified Reuse Entry
```ts
function selectCityCandidate(candidate: CityCandidateMatch) {
  const existingPoint = findSavedPointByCityId(candidate.cityId)
  return existingPoint ? openExistingPoint(existingPoint.id) : startDraftFromCandidate(candidate)
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| 地图点击后系统直接替用户选定唯一城市 | 更强调候选确认 + 轻搜索补充，尤其在小尺度地图和歧义城市场景 | 更符合“可信而不是自作主张”的地点选择体验 |
| 去重靠名称文本比对 | 更强调稳定 identity + 语义恢复 | 更适合跨阶段继续复用到边界高亮和 popup |
| 兼容升级靠一次性迁移 | 更偏向 lazy compatibility：旧记录继续工作，新记录写入新字段 | 对本地优先应用风险更低 |

**New tools/patterns to consider:**
- 对小规模离线城市数据，优先使用明确字段和可测试排序，而不是引入搜索黑盒
- 把“回退到国家/地区继续记录”设计成明确主动作，而不是失败后的隐式副路径

**Deprecated/outdated:**
- 只把城市增强当成 `city-high / city-possible` 文案补丁，不升级身份模型和复用链路
</sota_updates>

<open_questions>
## Open Questions

1. **稳定城市 ID 的最终编码规则**
   - What we know: Phase 7 必须有稳定城市 identity，不能只靠 `cityName`
   - What's unclear: ID 是直接写在静态候选数据里，还是运行时用 `countryCode + slug` 生成
   - Recommendation: planner 允许执行阶段先采用写入静态候选数据的显式 `id`，避免运行时规则漂移

2. **搜索范围是否只覆盖当前国家上下文还是全量城市索引**
   - What we know: 用户要有轻量搜索入口，但不希望变成完整搜索页
   - What's unclear: 首版是否限定在当前候选上下文
   - Recommendation: 先支持全量受控城市集过滤，但默认结果排序仍以点击上下文和接近程度优先

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
- 第一份 plan 重点用 `geo-lookup.spec.ts`、`point-storage.spec.ts`、`map-points.spec.ts` 验证候选模型、稳定城市 ID、兼容读取和复用索引
- 第二份 plan 重点用 `WorldMapStage.spec.ts`、`PointPreviewDrawer.spec.ts`、`App.spec.ts` 验证候选面板、轻量搜索、回退主动作和复用提示
- 每个 task 都必须带至少一条精确字符串或结构字段的 acceptance criteria，避免执行阶段只做模糊“对齐”

### Required Coverage
- `DEST-01` 必须验证高置信点击优先进入城市候选 / 城市结果，而不是直接只剩国家级文本
- `DEST-02` 必须验证候选面板内存在搜索入口，并可通过搜索命中目标城市
- `DEST-03` 必须验证无可靠城市时出现解释型提示，并允许“按国家/地区继续记录”
- `DEST-04` 必须验证候选项能带国家或上级区域信息，并按接近程度排序
- `DEST-05` 必须验证点击和搜索两条入口都能复用已记录城市，且给轻提示
- `DAT-05` 必须验证旧快照缺失城市字段时仍可正常读取和保存

### Recommended Test Additions
- 扩展 `src/services/geo-lookup.spec.ts`，覆盖多候选排序、低置信候选保留、稳定 `cityId` 输出
- 扩展 `src/services/point-storage.spec.ts` 与 `src/stores/map-points.spec.ts`，覆盖旧快照兼容与 `cityId` 复用判断
- 扩展 `src/components/WorldMapStage.spec.ts` 与 `src/components/PointPreviewDrawer.spec.ts`，覆盖候选先行面板、搜索框、回退主动作与轻提示
