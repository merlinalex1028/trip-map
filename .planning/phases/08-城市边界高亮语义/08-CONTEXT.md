# Phase 8: 城市边界高亮语义 - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把 Phase 7 已确认的城市身份，进一步绑定到真实城市边界表达上：用户选中的城市、已保存的城市记录，以及后续重新打开的城市记录，都需要以同一套真实边界语义在地图上稳定呈现。

交付重点包括城市边界主表达、已保存与当前选中之间的视觉层级、边界状态切换的归位规则，以及边界身份的持久化恢复口径。

本阶段不扩展到 popup 主舞台交互、完整视觉风格重构、在线边界服务、旧点位自动升级工具或新的地图交互模型；这些分别属于 Phase 9、Phase 10 或未来阶段。

</domain>

<decisions>
## Implementation Decisions

### 边界主表达
- **D-01:** 城市边界将替代单点 marker 成为地图上的主表达，默认采用“半透明面填充 + 明确描边”的组合，而不是只依赖单点发光或纯 marker。
- **D-02:** 小 marker 仍可保留，但只作为当前选中城市的辅助定位元素，不再承担“这座城市是否被点亮”的主语义。
- **D-03:** 不采用“只显示边界、不显示任何 marker”的极简方案，也不采用“边界和 marker 同等强调”的双主语义方案，避免地图层次混乱。

### 已保存、当前选中与回退层级
- **D-04:** 已保存城市默认常驻弱高亮边界，表达“这座城市已记录过”，但视觉强度必须明显弱于当前选中城市。
- **D-05:** 当前选中城市在已保存常驻层之上进一步强化为更亮的填充、更清晰的描边，并可叠加辅助 marker，形成明确的当前焦点。
- **D-06:** 未保存草稿只有在用户已经确认到具体城市后，才显示城市边界；尚未确认前不提前点亮城市面域。
- **D-07:** 当用户回退到国家或地区继续记录时，不显示城市边界，避免把“未可靠确认城市”的结果伪装成已确认城市。

### 状态切换与归位规则
- **D-08:** 不做 hover 触发的临时城市边界预览；城市边界只跟随“已保存常驻层”和“当前选中层”两套正式状态。
- **D-09:** 切换城市时，旧选中边界必须立即退回已保存态或直接消失，不允许遗留错误面域；可以使用非常轻的淡出过渡，但过渡不能改变最终状态归属。
- **D-10:** 关闭面板后，不保留一层额外的“最后一次强高亮”；边界状态应回到 store 中真实存在的已保存/选中状态，而不是留下 UI 记忆态。
- **D-11:** “状态稳定”优先于炫技动效，任何过渡都不能引入残影、串态或错误归位。

### 边界身份与持久化恢复
- **D-12:** v2 城市记录在已存在的稳定 `cityId` 之上，还需要额外持久化 `boundaryId`，必要时再附带边界数据集版本字段，用于恢复同一城市对应的同一片边界语义。
- **D-13:** 重开应用或重新选中已保存城市时，恢复逻辑优先按 `boundaryId` 找对应边界；如果该边界不存在，再回退到 `cityId` 对应的当前边界数据。
- **D-14:** `cityId` 继续作为跨阶段共享的城市身份主键；`boundaryId` 是边界表达与恢复锚点，不替代城市身份本身。
- **D-15:** v1 旧点位由于没有 `cityId` / `boundaryId`，默认不参与城市边界高亮，必须继续保持可读、可编辑，但不能被错误解释成某个城市边界记录。

### 多面域城市边界
- **D-16:** 同一 `boundaryId` 下的所有面域需要整体一起高亮，包括岛屿、飞地或分离的多面域，不只点亮主城区或点击最近的一块。
- **D-17:** 多面域整体点亮的优先级高于“只亮一块更省事”的实现方式，因为本阶段的核心语义是“真实城市边界整体高亮”。

### the agent's Discretion
- 常驻弱高亮、当前选中强化态与辅助 marker 的具体颜色、透明度、阴影和动画参数
- 边界淡入淡出的精确时长与 easing，只要不制造状态歧义
- 多面域数据的简化、缓存与渲染优化策略，只要不破坏“同一 `boundaryId` 整体高亮”的语义
- `boundaryId` 与边界版本字段的具体命名方式、存储结构和兼容策略
- 当 `boundaryId` 缺失或数据集升级导致边界找不到时的轻提示文案

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and milestone constraints
- `.planning/ROADMAP.md` — Phase 8 的目标、边界、依赖与成功标准，明确本阶段只处理城市边界高亮语义
- `.planning/REQUIREMENTS.md` — `BND-01`、`BND-02`、`BND-03` 与 `DAT-06` 的正式 requirement 映射
- `.planning/PROJECT.md` — v2.0 对“城市优先 + 真实城市边界点亮 + 本地离线架构”的总约束
- `.planning/STATE.md` — 当前 milestone 位置与“Phase 8 在 popup / 风格重构之前完成”的阶段顺序约束

### Prior phase decisions that still constrain Phase 8
- `.planning/phases/07-城市选择与兼容基线/07-CONTEXT.md` — 稳定 `cityId`、回退语义、旧点位兼容与“候选确认后再进入草稿/复用”的前置决策
- `.planning/phases/07-城市选择与兼容基线/07-RESEARCH.md` — Phase 7 已明确“稳定 identity 需要为后续边界高亮与 popup 继续复用”，并建议把身份判断留在领域状态层
- `.planning/phases/04-可用性打磨与增强能力/04-CONTEXT.md` — 继承“城市级增强应偏保守、失败不要伪装成确定结果、异常提示保持轻量”的可用性基线
- `.planning/phases/03-点位闭环与本地持久化/03-CONTEXT.md` — 继承旧点位兼容、草稿/保存语义与本地存储结构演进原则

### Product and data-model background
- `PRD.md` §7-10 — 现有地点模型、真实地点识别链路、静态地理数据职责与持久化背景

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/stores/map-points.ts`: 已经集中维护 `draft / saved / pendingCitySelection / selectedPointId / drawerMode`，适合作为“边界当前态 + 常驻态 + 恢复态”的唯一状态入口
- `src/services/point-storage.ts`: 已经能容错持久化 `cityId`、`cityName`、`cityContextLabel` 等 v2 字段，是扩展 `boundaryId` 与边界版本字段的自然入口
- `src/components/WorldMapStage.vue`: 当前地图点击、待识别 marker 与主舞台 overlay 都在这里，新增真实城市边界图层最适合从这里接入
- `src/components/SeedMarkerLayer.vue`: 现有 marker 层已经区分 selected / dimmed，可调整为“辅助定位层”，不必继续承担主边界语义
- `src/services/geo-lookup.ts`: 当前输出已经包含稳定 `cityId`、`cityName` 和候选排序，是建立 `cityId -> boundaryId` 对应关系的服务层起点
- `src/types/map-point.ts` 与 `src/types/geo.ts`: 已经定义城市级精度和城市身份字段，便于补充边界相关类型

### Established Patterns
- 城市身份已在 Phase 7 锁定为稳定 `cityId`，复用和恢复都不再靠 `cityName` 文本比对
- 当前页面结构仍是“地图主舞台 + drawer 接力”，因此边界状态必须服务于现有 drawer/point 流，而不是提前引入 popup 状态机
- 本地存储采用版本化快照和旧字段容错，说明新增边界字段必须兼容旧快照而不能强制迁移
- 当前地图 overlay 主要承载 pending marker，说明 Phase 8 需要在不破坏现有识别反馈的前提下，引入新的边界面域层
- 现有实现里还没有 `boundaryId`、城市 polygon 数据或城市边界缓存层，这意味着 Phase 8 需要补齐一整条“边界数据 -> 状态映射 -> 渲染”链路

### Integration Points
- `src/components/WorldMapStage.vue` 需要新增城市边界渲染层，并把当前选中城市、已保存城市和 pending / fallback 状态映射到边界可见性
- `src/stores/map-points.ts` 需要扩展城市记录的边界身份字段，并提供“当前强高亮 vs 已保存弱高亮”的派生状态或选择器
- `src/services/point-storage.ts` 需要升级快照结构和恢复逻辑，支持 `boundaryId` 与边界版本字段，同时保持 v1/v2 旧数据继续可读
- `src/services/geo-lookup.ts` 或新的边界服务模块，需要建立 `cityId -> boundaryId -> geometry` 的稳定查找链路
- `src/components/PointPreviewDrawer.vue` 需要继续展示与边界身份一致的城市名称和回退语义，但不承担边界渲染本身

</code_context>

<specifics>
## Specific Ideas

- 边界高亮应成为“去过这座城市”的主视觉语言，marker 降级为辅助定位，不再与边界争夺主语义
- 已保存城市平时就应带弱边界，当前选中时再明显强化，让地图本身也能表达旅行进度，而不是只能点开详情才知道
- 状态切换以稳定可靠为第一原则，不做 hover 临时预览，不留下“最后一次强高亮”的记忆态
- 同一城市的多面域要整体一起亮，避免用户看到被切碎的半座城市
- `boundaryId` 应服务于“恢复同一片边界”，但不替代 `cityId` 作为城市身份主键

</specifics>

<deferred>
## Deferred Ideas

- 候选项 hover 时直接预览边界或地图内联预览候选城市边界 — 更适合后续 popup 主舞台或更强交互阶段
- 把关闭面板后的最后一次选中高亮做成持久记忆态 — 超出本阶段“状态稳定”主目标，且容易引入串态
- 在线边界数据服务、按缩放层级动态加载边界、多级行政区边界切换 — 超出当前离线静态架构与 milestone 范围

</deferred>

---

*Phase: 08-城市边界高亮语义*
*Context gathered: 2026-03-25*
