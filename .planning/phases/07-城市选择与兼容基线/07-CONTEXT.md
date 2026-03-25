# Phase 7: 城市选择与兼容基线 - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把“城市优先选择”收敛成稳定主链路，并补齐与旧数据兼容、重复城市复用相关的基础口径。交付范围包括城市候选确认、搜索补充入口、低置信回退到国家/地区、重复城市优先复用，以及 v1 旧点位继续可用的数据兼容策略。

本阶段不扩展到真实城市边界高亮、popup 主舞台交互、旧点位批量升级工具或完整视觉重构；这些分别属于后续 phase。

</domain>

<decisions>
## Implementation Decisions

### 城市确认入口
- **D-01:** 用户点击地图后，先进入候选先行的轻确认面板，而不是在高置信命中时直接替用户落到单一城市。
- **D-02:** 轻确认面板默认显示轻量搜索框，用户无需离开当前流即可改找目标城市。
- **D-03:** 点击后默认展示最多 3 个城市候选，保持轻确认而不是展开成完整搜索结果页。
- **D-04:** 每个候选项默认展示“城市名 + 国家/上级区域 + 一句简短状态提示”，例如“更接近点击位置”或“已存在记录”。

### 歧义与回退
- **D-05:** 当系统只能给出低置信城市时，可以把它作为候选显示，但不默认选中，避免把不确定结果伪装成确定答案。
- **D-06:** 当存在同名城市或多个接近候选时，候选列表默认按与点击位置的接近程度排序。
- **D-07:** 当没有任何城市足够可靠时，面板主动作就是“回退到国家/地区继续记录”，而不是阻断流程。
- **D-08:** 回退提示采用明确解释型语气，直接说明“未能可靠确认城市，已提供国家/地区继续记录”。

### 重复城市复用
- **D-09:** 当用户再次命中已记录城市时，默认直接打开现有记录，不再进入新的重复草稿流程。
- **D-10:** “同一城市”的复用主键采用稳定城市身份 ID，而不是仅靠 `cityName` 文本。
- **D-11:** 搜索入口与地图点击统一遵守同一套复用规则；搜索命中已记录城市时也优先打开旧记录。
- **D-12:** 发生复用时，界面给一句轻提示，说明系统已打开这座已记录城市的现有记录，但不打断流程。

### 兼容与数据升级
- **D-13:** v1 旧点位升级到 v2.0 后默认保持原样，不自动补城市，也不强制迁移成城市记录。
- **D-14:** 旧点位未来可以支持手动补成城市记录，但这不是 Phase 7 的主交付，当前只需保证旧点位可继续查看和编辑。
- **D-15:** v2 新建城市记录在现有 `lat/lng`、`x/y` 和地点展示字段之外，最少还要持久化“稳定城市 ID + 展示名 + 所属国家/上级区域”这组城市身份信息。
- **D-16:** 旧点位在缺少城市身份字段的情况下仍必须继续可读、可编辑、可持久化，不能因为新字段缺失而报错或被迫升级。

### the agent's Discretion
- 轻量搜索框的具体样式、展开细节和空结果提示文案
- 候选项状态提示的精确措辞，例如“更接近点击位置”“已存在记录”的文案细节
- 低置信候选与可靠候选在视觉层级上的具体差异实现
- 近似排序除距离外是否叠加少量稳定性因子，只要不改变“按接近程度优先”的主规则
- 持久化字段的具体命名方式与数据结构，只要满足稳定城市身份可复用、可恢复的语义

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and milestone constraints
- `.planning/ROADMAP.md` — Phase 7 的目标、边界、依赖与成功标准
- `.planning/REQUIREMENTS.md` — `DEST-01` 到 `DEST-05` 与 `DAT-05` 的正式 requirement 映射
- `.planning/PROJECT.md` — v2.0 milestone 级非目标、架构约束与“城市优先、国家兜底”的产品方向
- `.planning/STATE.md` — 当前 milestone 位置与“Phase 7 先于边界高亮 / popup”的阶段顺序约束

### Prior phase decisions that still constrain Phase 7
- `.planning/phases/02-国家级真实地点识别/02-CONTEXT.md` — 轻提示失败体验、边界不确定时偏保守、不可靠时不要猜
- `.planning/phases/03-点位闭环与本地持久化/03-CONTEXT.md` — 识别成功先进入草稿、默认不自动落盘、已保存点位先看后改
- `.planning/phases/04-可用性打磨与增强能力/04-CONTEXT.md` — 城市增强对用户应尽量无感、回退文案需明确、现有 drawer/提示交互基线
- `.planning/debug/04-city-hit-radius-too-small.md` — 世界地图无缩放交互下的城市命中容差背景，说明为什么 Phase 7 需要候选确认与搜索补充

### Product and data-model background
- `PRD.md` §7-10 — 现有 `MapPoint`、地理识别流程、城市匹配规则、持久化与降级原则的产品背景

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/services/geo-lookup.ts`: 已有国家/地区命中与 `city-high` / `city-possible` 雏形，可作为候选流的识别入口
- `src/data/geo/city-candidates.ts`: 现有静态城市候选数据源，可扩展为候选列表和搜索索引的基础数据
- `src/components/WorldMapStage.vue`: 现有地图点击 -> 地理识别 -> 草稿生成链路，是插入候选确认逻辑的主入口
- `src/stores/map-points.ts`: 已有 `draft / saved / selected / drawerMode` 状态模型，可承接城市复用和候选确认后的草稿/复用分流
- `src/components/PointPreviewDrawer.vue`: 当前最轻的承接面，可在 Phase 7 继续复用为候选先行确认面板
- `src/services/point-storage.ts`: 已经具备版本化快照和旧数据字段容错能力，是扩展城市身份字段的持久化入口

### Established Patterns
- 地图识别成功后先进入 `detected-preview` 草稿态，而不是自动保存
- 识别失败和回退提示采用轻量 notice / toast 风格，不做重型遮罩
- 选中已有点位时会清理无关草稿，已有“复用旧对象优先于保留新草稿”的行为前例
- 本地存储采用版本化快照，并允许旧快照缺失新增城市字段

### Integration Points
- `WorldMapStage.vue` 的点击识别结果，需要从“直接生成一个 draft 点”升级为“先候选确认，再决定复用旧记录或生成新 draft”
- `map-points` store 需要新增稳定城市身份与已记录城市索引，以支撑 DEST-05 的统一复用规则
- `point-storage` 快照结构需要为 v2 城市记录新增城市身份字段，同时保持 v1 快照继续可读
- `PointPreviewDrawer.vue` 需要从纯预览态扩成“候选列表 + 轻量搜索 + 国家/地区回退”的确认面，但仍保留后续进入现有查看/编辑流的接力

</code_context>

<specifics>
## Specific Ideas

- Phase 7 的城市确认优先复用当前 drawer 这类轻量面，而不是提前引入 Phase 9 的 popup 主舞台
- 候选项的理想信息形态类似 `Kyoto, Japan` 加一行短提示，如“更接近点击位置”或“已存在记录”
- 回退提示不应只说“已回退”，而应明确解释“未能可靠确认城市，已提供国家/地区继续记录”
- 搜索入口与地图点击入口不应各自有一套重复规则；用户无论从哪里命中同一城市，都应回到同一个现有记录

</specifics>

<deferred>
## Deferred Ideas

- 为 v1 旧点位提供显式“手动升级为城市记录”的入口 — 保留为未来能力，不纳入 Phase 7 主交付
- 真正锚定地图主舞台的 popup 摘要交互 — 属于 Phase 9
- 基于真实城市边界的持久化恢复与高亮一致性 — 属于 Phase 8

</deferred>

---

*Phase: 07-城市选择与兼容基线*
*Context gathered: 2026-03-25*
