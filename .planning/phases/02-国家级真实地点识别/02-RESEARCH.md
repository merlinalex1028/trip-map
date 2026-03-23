# Phase 02: 国家级真实地点识别 - Research

**Researched:** 2026-03-23
**Domain:** 固定投影地图反算、国家边界命中、离线识别反馈链路
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 用户点击地图后的第一反馈是在点击位置显示轻量脉冲点，不先打断地图主视觉
- 识别中的等待感保持克制，只需要让用户确认“系统已收到点击”
- 识别成功后直接在对应位置生成新点位，并自动打开抽屉进入后续查看/编辑流程
- 如果识别耗时超过短暂瞬间，需要升级为带文案的状态提示，但仍避免重遮罩或锁死地图
- 当国家与特殊地区信息同时存在时，展示上优先使用地区名，而不是强行并入国家名
- 香港、澳门这类区域在第一版按独立地区信息展示
- 整体结果口径优先贴近用户直觉地理认知，而不是只追求政治/行政归属文案
- 抽屉信息层级保持为“地点名是标题，国家/地区是副行”
- 点击海洋、无效区域或无法识别位置时，用页面级 toast 做失败提示
- 提示语气保持温和，重点引导“请点击有效陆地区域”
- 失败后地图上不保留失败标记或残留点位，提示消失后界面恢复原状
- 如果用户连续多次点到无效区域，提示可以升级为更明确的引导文案
- 靠近国界或海岸线时，整体策略偏保守，只有高置信度才返回结果
- 国家边界命中不够稳定时，不创建点位，提示用户重新点击
- 海岸线附近如果陆地/海洋难以可靠区分，优先判无效，也不要“猜一个”
- 对用户的解释文案不强调技术细节，只提示“请点击更靠近目标区域的位置”

### Claude's Discretion
- 轻量脉冲点、toast 和状态文案的具体视觉样式与动画节奏
- 成功识别与失败提示的文案措辞细节
- 特殊地区展示时副标题与坐标排版的具体样式
- 连续失败时提示升级的阈值与冷却方式

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope

</user_constraints>

<research_summary>
## Summary

Phase 2 的核心不是“把点击事件接起来”这么简单，而是先把地图舞台变成一个真正有投影契约的地理表面。当前仓库里的 [src/assets/world-map.svg](/Users/huangjingping/i/trip-map/src/assets/world-map.svg) 是海报化抽象洲块，只适合视觉展示，不能可靠支撑 `x/y <-> lng/lat` 反算，也无法和国家边界数据做可信一致的命中。因此本阶段的第一原则必须是让底图、投影服务和命中数据共享同一套坐标规则。

在实现策略上，最稳的路线是：先固定一套简单且可逆的世界投影契约，再基于静态国家/地区边界数据做离线命中，并把结果以“保守优先”的方式接回当前的地图交互流。Phase 2 不需要完成持久化 CRUD，但需要让地图能对有效陆地点击给出真实国家/地区结果，对无效区域给出清晰且温和的反馈。

**Primary recommendation:** 按“投影契约与点击反算 → 边界数据命中与失败反馈”拆成 2 个 plan；第一份 plan 必须先解决当前装饰性底图与真实地理识别不一致的问题。
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `d3-geo` | repo-managed current | 世界投影、正投影/逆投影、地图路径生成 | 既能做 `invert()`，也能让底图渲染与识别共享同一投影公式 |
| Vue + Pinia | repo-managed current | 交互状态、地图反馈、抽屉联动 | 当前仓库已建立这套 UI 状态模式，延续成本最低 |
| Vitest | repo-managed current | 投影和命中逻辑单测 | 纯函数服务最适合用现有测试基座做快速校验 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@turf/boolean-point-in-polygon` | repo-managed current | 点落多边形判断 | 如果执行阶段希望直接用成熟库处理 Polygon / MultiPolygon |
| `topojson-client` | repo-managed current | 读取压缩后的国界数据 | 如果最终引入 TopoJSON 资源而不是 GeoJSON |
| `zod` | repo-managed current | 地理数据和识别结果校验 | 当静态边界元数据或识别结果需要严格校验时使用 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 轻量投影 + 静态边界数据 | Leaflet / MapLibre | 地图引擎更重，超出当前 Phase 2 的必要复杂度 |
| `d3-geo` + `geoContains`/Turf | 手写 point-in-polygon | 岛屿、洞区、MultiPolygon 和 dateline 处理很容易出错 |
| 本地静态边界文件 | 在线逆地理编码 API | 违背产品“前端本地离线识别”的硬约束 |

**Installation:**
```bash
pnpm add d3-geo @turf/boolean-point-in-polygon
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
src/
├── assets/                # 投影一致的地图 SVG / 背景资源
├── components/            # 地图舞台、反馈层、抽屉
├── data/
│   └── geo/               # 国家/地区边界数据与元数据
├── services/              # projection / geo-lookup 纯函数服务
├── stores/                # map-ui 交互状态
└── types/                 # geo result / preview payload 类型
```

### Pattern 1: Projection Contract Before Lookup
**What:** 先固定地图视口、投影公式、容器归一化坐标和地理坐标之间的双向换算，再接命中逻辑。  
**When to use:** 当前底图不是地理精确图，且后续所有命中判断都依赖同一坐标系时。  
**Example:**
```ts
export interface ProjectionConfig {
  viewBoxWidth: number
  viewBoxHeight: number
  viewportInset: { left: number; top: number; right: number; bottom: number }
}

export function screenPointToLatLng(
  normalizedX: number,
  normalizedY: number,
  config: ProjectionConfig
) {
  // container normalized -> projected viewport -> lng/lat
}
```

### Pattern 2: Geo Lookup As Pure Service
**What:** 国家/地区识别作为纯函数服务存在，输入 `lat/lng`，输出标准化识别结果与置信状态。  
**When to use:** 需要对多个点击样本做稳定单测，并让 UI 只关心结果显示时。  
**Example:**
```ts
export interface GeoLookupResult {
  kind: 'country' | 'region' | 'invalid'
  countryCode: string | null
  countryName: string | null
  regionName: string | null
  confidence: 'high' | 'low'
}
```

### Pattern 3: Interaction State Machine In Store
**What:** 地图点击后的状态从 `idle -> resolving -> resolved|invalid` 统一收口到 store，而不是散落在组件局部状态里。  
**When to use:** 识别中脉冲、toast、抽屉开关和临时识别点需要共享时。  
**Example:**
```ts
type ResolveStatus = 'idle' | 'resolving' | 'resolved' | 'invalid'
```

### Anti-Patterns to Avoid
- **继续沿用当前抽象海报 SVG 直接做地理反算：** 视觉可用，但地理结果从根上不可信
- **把投影换算和点面判断写进组件事件处理里：** 后续难测、难复用，也会放大 Phase 3 改动面
- **边界模糊时“猜一个国家”：** 会直接破坏产品最核心的可信度
- **为了减少数据准备成本只按国家包围盒判断：** 海洋、岛屿和边界区域会大量误判
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 世界投影正反算 | 自己手推整套地图投影公式 | `d3-geo` projection + invert | 已有成熟实现，且后续渲染也能复用同一投影 |
| 国家命中几何判断 | 手写 polygon / multipolygon 遍历 | `geoContains` 或 `booleanPointInPolygon` | 洞区、岛屿、边界孔洞和 dateline 都是典型坑 |
| 地图点击反馈状态分发 | 跨组件 emit 链 + 局部 ref | Pinia 单一状态源 | 当前仓库已经验证过 selected-preview 的单源模式 |
| 运行时拉远程边界数据 | 点击时 fetch GeoJSON | 本地静态边界资源 | 离线约束 + 性能稳定性都要求本地化 |

**Key insight:** Phase 2 应该 hand-roll 的是“产品自己的结果口径和失败体验”，不应该 hand-roll 的是投影数学和复杂几何判断。
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Decorative Map Asset Pretending To Be Geographic
**What goes wrong:** 用户点到的视觉位置和反算出的地理结果对不上，整个识别链路表面工作、实际不可信。  
**Why it happens:** 复用 Phase 1 的抽象海报 SVG，默认它可以承载真实经纬度。  
**How to avoid:** 在 Phase 2 的第一份 plan 中显式替换或重构为投影一致的地图资产/路径生成方案。  
**Warning signs:** 需要靠大量 magic number 去“校正”点击结果。

### Pitfall 2: Country Lookup Without Conservative Confidence Gate
**What goes wrong:** 国界和海岸线附近频繁误判，用户很快失去信任。  
**Why it happens:** 只要命中最近 polygon 就返回结果，不判断是否处于模糊区域。  
**How to avoid:** 为 coast / border 模糊区引入保守判定；低置信度直接走 invalid。  
**Warning signs:** 海岸线附近测试样本经常“一会儿海洋一会儿陆地”。

### Pitfall 3: UI Feedback Coupled To Final Persistence
**What goes wrong:** 为了展示识别结果，提前把 Phase 3 的完整点位保存链路一并做掉。  
**Why it happens:** 把“识别成功可预览”误当成“必须立刻持久化保存”。  
**How to avoid:** Phase 2 只建立临时识别结果与失败反馈；持久化闭环留给 Phase 3。  
**Warning signs:** Phase 2 的计划开始出现 localStorage 写回、删除、取消新建回滚等逻辑。
</common_pitfalls>

<code_examples>
## Code Examples

Verified planning patterns for this phase:

### Projection Service Boundary
```ts
export interface GeographicPoint {
  lat: number
  lng: number
}

export function normalizedPointToGeographic(
  x: number,
  y: number,
  config: ProjectionConfig
): GeographicPoint | null {
  // returns null when point lands outside the projected viewport
}
```

### Standardized Geo Result
```ts
export interface GeoDetectionPreview {
  id: string
  source: 'detected'
  name: string
  countryName: string
  countryCode: string
  lat: number
  lng: number
  x: number
  y: number
}
```

### Store-Driven Feedback Contract
```ts
export interface MapInteractionNotice {
  tone: 'info' | 'warning'
  message: string
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 把“地图图片”和“地理识别”看成两套独立东西 | 越来越强调单一投影契约驱动渲染与交互 | 近年轻量前端地理可视化实践更偏统一数据源 | 更容易测试，也更少出现点击偏移 |
| 先接在线逆地理编码验证 MVP | 先用本地静态边界做离线可控识别 | 离线体验与外部依赖成本越来越被重视 | 更适合当前产品约束 |

**New tools/patterns to consider:**
- 用同一份国家边界数据同时驱动底图轮廓与命中判断，避免视觉与识别双轨漂移
- 在 store 中显式建模 `resolving / invalid / resolved` 状态，简化反馈 UI

**Deprecated/outdated:**
- 只保存渲染坐标、不保留真实 `lat/lng` —— 这会让 Phase 3 的真实点位语义失真
</sota_updates>

<open_questions>
## Open Questions

1. **边界数据最终采用 GeoJSON 还是 TopoJSON**
   - What we know: 国家级命中需要简化后的静态本地数据
   - What's unclear: 现阶段仓库里还没有任何边界数据资产
   - Recommendation: planner 允许执行阶段先落一个简化的 GeoJSON/JSON 产物，只要路径和数据口径明确

2. **特殊地区元数据从边界文件内嵌还是单独维护映射表**
   - What we know: 香港、澳门等展示口径已锁定为地区优先
   - What's unclear: 数据源自身是否已经给出满足产品口径的 display name
   - Recommendation: plan 中预留 `metadata map` 文件，让执行阶段按产品口径覆盖原始名称
</open_questions>

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Vue Test Utils |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Validation Layers

1. **Projection unit validation**
   - 验证 `x/y -> lng/lat` 与 `lng/lat -> x/y` 的双向换算在关键锚点上稳定。
2. **Lookup validation**
   - 验证国家/地区命中、海洋无效、特殊地区口径与低置信度边界降级行为。
3. **Interaction validation**
   - 验证点击地图后的 pulse、toast、抽屉预览与“无效不创建”行为。

### Fast Checks

- `rg 'map-projection|geo-lookup' src`
- `rg 'resolving|invalid|toast|notice' src`
- `pnpm test`

### Must-Verify Behaviors

- 地图点击可得到真实 `lat/lng`
- 有效陆地区域返回国家/地区级结果
- 海洋与模糊边界不创建错误点位
- 特殊地区展示口径符合 Phase 2 决策
- 失败反馈温和且不残留错误 UI

<sources>
## Sources

### Primary (HIGH confidence)
- `PRD.md` — 真实点位判断链路、国家/地区识别要求、失败与降级策略
- `.planning/phases/02-国家级真实地点识别/02-CONTEXT.md` — 用户锁定的反馈节奏、结果口径与保守判定原则
- `.planning/research/SUMMARY.md` — 项目级离线地理识别路线与 Phase 2 顺序依据
- `.planning/research/ARCHITECTURE.md` — ProjectionService / GeoLookupService 分层建议
- `.planning/research/PITFALLS.md` — 投影不一致、边界误判与数据体积风险
- `.planning/research/STACK.md` — 相关库与组合建议
- `src/assets/world-map.svg` — 当前抽象底图不具备真实投影契约，已确认为本阶段关键技术风险

</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: 投影反算、国家边界命中、地图交互反馈
- Ecosystem: `d3-geo`、polygon lookup、Vitest
- Patterns: 纯函数 geo 服务、单一投影契约、store-driven feedback
- Pitfalls: 抽象底图误用、海岸线误判、过早耦合持久化

**Confidence breakdown:**
- Standard stack: HIGH - 项目级 research 已锁定主要库方向
- Architecture: HIGH - 现有仓库已具备清晰的地图/抽屉/store 边界
- Pitfalls: HIGH - 当前抽象地图资产已暴露出关键一致性问题
- Code examples: MEDIUM - 计划层示例足够明确，但具体边界数据格式要到执行时落实

**Research date:** 2026-03-23
**Valid until:** 30 days
</metadata>

---

*Phase: 02-国家级真实地点识别*
*Research completed: 2026-03-23*
*Ready for planning: yes*
