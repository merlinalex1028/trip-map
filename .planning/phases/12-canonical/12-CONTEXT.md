# Phase 12: Canonical 地点语义 - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把“用户点击地图后，系统如何返回稳定 canonical 地点身份”这件事锁定为明确合同：`server` 成为 canonical resolve 的权威来源，正式地点语义收口为“中国侧正式行政单位 / 海外一级行政区”两大体系，并确保 popup、drawer、已保存记录与后续边界高亮都消费同一套 canonical 身份。

本阶段不交付中国与海外几何数据清单、GeoJSON 版本化资产、`Leaflet` 图层迁移、记录 CRUD、点亮 / 取消点亮 mutation 或旧数据迁移；这些分别属于 Phase 13-15。

</domain>

<decisions>
## Implementation Decisions

### 中国侧 canonical 归类与真实称谓
- **D-01:** 中国侧 canonical 结果不把所有地点统一伪装成“城市”；前端必须按真实行政称谓展示正式地点类型。
- **D-02:** 北京、上海、天津、重庆在产品中明确展示为“直辖市”，而不是泛化成普通城市标签。
- **D-03:** 港澳在产品中明确展示为“特别行政区”，不伪装成“城市”，但仍归中国侧语义体系处理，而不是归入海外一级行政区语义。
- **D-04:** 中国侧其他正式地点若属于自治州、地区、盟等非“市”地级单位，前端保持真实行政称谓展示，不统一抹平成“城市”。

### Canonical resolve 与候选确认链路
- **D-05:** `server` 从 Phase 12 开始成为 canonical area resolve 的权威来源；前端不再长期维护另一套正式判定逻辑。
- **D-06:** 对于存在歧义的点击结果，系统继续保留候选确认链路，不把不确定结果伪装成唯一正确答案。
- **D-07:** 候选确认所需的 canonical 候选集、推荐项与必要提示信息由 `server` 返回，前端只负责展示与确认，不再自行生成正式候选集。
- **D-08:** 候选列表上限继续保持最多 3 个，延续 Phase 7 的轻确认密度，避免把确认表面重新做成搜索页。

### 跨表面语义展示合同
- **D-09:** popup、drawer、已保存记录与后续地图高亮引用的地点摘要，都必须消费同一套 canonical 身份与真实类型语义，不能在不同表面把同一地点叫成不同层级。
- **D-10:** 地点主标题旁明确显示真实类型标签，例如“直辖市”“特别行政区”“自治州”“一级行政区”，不再省略或弱化层级语义。
- **D-11:** 地点副标题统一采用“上级归属 + 类型语义”的结构，例如“中国 · 直辖市”“中国 · 特别行政区”“United States · 一级行政区”，确保用户一眼区分中国侧与海外侧正式语义。

### 失败口径与 canonical 边界
- **D-12:** 当系统无法可靠命中到中国侧正式地点或海外一级行政区时，必须严格失败，不创建任何 fallback 记录。
- **D-13:** Phase 12 不再沿用“按国家/地区继续记录”作为正式兜底路径；这类点击只给明确失败反馈，避免产生伪 canonical 记录。
- **D-14:** “严格失败”优先于“不中断流程”，Phase 12 的首要目标是把 canonical 边界做准，而不是在不确定场景下继续创建更粗粒度记录。

### the agent's Discretion
- 中国侧正式地点类型在契约中的具体编码方式，以及它与现有 `PlaceKind` 的扩展或映射策略，只要不破坏“中国侧 / 海外一级行政区”主边界。
- `server` 返回候选集时的精确 payload 结构、推荐项字段命名、失败 reason 枚举与置信度表达，只要前端能稳定消费并做一致反馈。
- 跨表面类型标签的具体文案、排序、视觉样式与是否补充别名，只要不削弱真实行政语义。
- 海外一级行政区的主标题采用何种主名 / 别名策略，只要保证 canonical 身份稳定且 UI 语义一致。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and phase requirements
- `.planning/ROADMAP.md` — Phase 12 的目标、依赖、requirements 映射与成功标准
- `.planning/REQUIREMENTS.md` — `ARC-02`、`PLC-01`、`PLC-02`、`PLC-03`、`PLC-04`、`PLC-05`、`UIX-04` 的正式约束
- `.planning/PROJECT.md` — v3.0 对“中国市级 / 海外一级行政区”语义、后端权威来源与旧数据退场的全局原则
- `.planning/STATE.md` — 当前 milestone 位置，以及 Phase 12 是 Phase 11 之后的 canonical 语义收口阶段

### Prior phase decisions that still constrain Phase 12
- `.planning/phases/07-城市选择与兼容基线/07-CONTEXT.md` — 候选确认、最多 3 个候选、稳定身份复用与“不可靠时不要伪装成确定结果”的前置交互基线
- `.planning/phases/08-城市边界高亮语义/08-CONTEXT.md` — `boundaryId`、`datasetVersion` 与跨表面身份一致性的既有约束
- `.planning/phases/09-popup/09-CONTEXT.md` — popup / drawer 双层表面的职责边界与轻交互主链路
- `.planning/phases/10-可爱风格与可读性收口/10-CONTEXT.md` — 已交付 UI 中状态辨识与表面一致性的视觉/语义合同
- `.planning/phases/11-monorepo/11-CONTEXT.md` — `server` 作为后续 canonical resolve 权威来源、`contracts` 薄契约层与共享字段边界

### Product and architecture background
- `PRD.md` §7-10 — 原始地点模型、地理识别模块职责与“真实地点信息必须成为保存数据的一部分”的背景

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/contracts/src/place.ts`: 已有 `CanonicalPlaceRef`、`CanonicalPlaceSummary` 和 `PlaceKind`，是扩展 Phase 12 canonical 合同的最直接入口。
- `packages/contracts/src/records.ts`: 已有基于 canonical 摘要的 smoke request/response 形态，可作为后续正式 resolve / records DTO 的字段骨架。
- `apps/web/src/services/geo-lookup.ts`: 当前仍由前端执行国家/地区命中、城市候选排序与 fallback 逻辑，是 Phase 12 需要后移权威判定的现状基线。
- `apps/web/src/types/geo.ts`: 已承载 `GeoDetectionResult`、候选项、边界数据和精度字段，是前端从“城市增强”过渡到 canonical 语义展示的主要类型入口。
- `apps/web/src/types/map-point.ts`: 已包含 `cityId`、`boundaryId`、`boundaryDatasetVersion`、summary surface 状态，是接 canonical identity 到 popup / drawer / record 表面的关键桥接点。
- `apps/server/src/modules/records/records.service.ts`: 现有服务端 smoke path 已验证 canonical 字段能穿过 `server` 与数据库，说明 Phase 12 可直接在服务端扩展正式 resolve 合同。

### Established Patterns
- 现有前端交互偏保守：不可靠命中不会直接伪装成确定城市，而是进入候选确认或 fallback 提示。
- popup / drawer / 已保存记录的主链路已经成立，因此 Phase 12 的语义升级应复用现有表面，不另造平行 UI。
- `contracts` 已经被锁定为薄契约层，说明 canonical 语义需要收口在字段、DTO 和枚举层，而不是把业务判定逻辑搬进共享包。
- 当前前端仍保留本地 `geo-lookup` 逻辑与城市候选流，这正是 Phase 12 需要逐步退场或降级为辅助逻辑的部分。

### Integration Points
- `packages/contracts/src/place.ts` 需要承接中国侧正式地点与海外一级行政区的 canonical 类型扩展或映射约定。
- `apps/server` 需要新增或演进 canonical resolve 入口，使 `server` 成为歧义候选、推荐项与失败口径的正式来源。
- `apps/web/src/types/geo.ts` 与 `apps/web/src/types/map-point.ts` 需要从“城市优先”字段升级到可表达真实行政类型与 canonical 失败状态的前端消费模型。
- `apps/web` 的 popup / drawer 摘要组件需要按“主标题 + 类型标签 + 副标题”合同统一渲染中国侧与海外侧地点。

</code_context>

<specifics>
## Specific Ideas

- 中国侧地点不应再统一叫“城市”，而是让用户直接看到“直辖市 / 特别行政区 / 自治州 / 地区 / 盟 / 地级市”等真实语义。
- 歧义场景继续保留轻量候选确认体验，但候选来源必须改为 `server`，前端不再自己扮演正式判定器。
- 跨表面展示要一眼看懂层级，不允许 popup 里像“城市”、drawer 里像“行政区”、记录列表里又只剩展示名。
- 为了保证 canonical 纯度，Phase 12 允许因为不可靠而直接失败，也不要继续生成更粗粒度 fallback 记录。

</specifics>

<deferred>
## Deferred Ideas

- 中国与海外几何资产的正式数据源、版本清单、字段清洗与交付策略 — 属于 Phase 13
- `Leaflet` 地图图层迁移、GeoJSON 图层加载与点击/高亮迁移 — 属于 Phase 14
- 记录 CRUD、点亮 / 取消点亮 API、统一服务端持久化闭环 — 属于 Phase 15
- 旧 `localStorage` / seed 点位向新 canonical 模型的兼容或迁移 — 明确不纳入 v3.0 正式方案

</deferred>

---

*Phase: 12-canonical*
*Context gathered: 2026-03-30*
