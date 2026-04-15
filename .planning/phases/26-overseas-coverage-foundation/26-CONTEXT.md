# Phase 26: Overseas Coverage Foundation - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只交付一组优先海外国家/地区的 admin1 识别与点亮基础覆盖，并补齐“已支持地区可稳定点亮、已保存记录跨刷新/重开/跨设备后标题与副标题保持一致、未支持地区有可解释反馈”这三条闭环。全球城市级统一覆盖、更细粒度海外层级、实时同步、复杂翻译体系和新地图交互模式不属于本阶段。

</domain>

<decisions>
## Implementation Decisions

### 首批覆盖范围
- **D-01:** 首批海外 admin1 覆盖国家/地区锁定为 `JP / KR / TH / SG / MY / AE / AU / US`，优先服务东亚、东南亚与少量远程热门目的地。
- **D-02:** v5.0 只承诺这组优先国家/地区的 admin1 可稳定识别与点亮，不扩展成“全球任意国家都应该可点亮”的承诺口径。

### 未支持地区反馈
- **D-03:** 对暂未支持点亮的海外区域，反馈以当前地点 popup 内的明确说明为主，不额外弹全局 `interactionNotice`。
- **D-04:** 未支持地区仍允许展示识别结果，但必须明确表达“该地区暂不支持点亮”，避免用户把无保存能力误解为点击失效或网络错误。

### 海外命名与记录展示
- **D-05:** 海外 admin1 的 `displayName` 以英文 canonical 名为主，不在 Phase 26 引入系统级中文翻译表作为主标题真源。
- **D-06:** `typeLabel` 继续沿用当前中文体系，海外 admin1 统一使用类似“一级行政区”的中文类型标签。
- **D-07:** `subtitle` 采用稳定的英文国家名 + 中文类型说明格式，例如 `United States · 一级行政区`，确保保存后刷新、重开和跨设备仍保持一致。

### 候选确认交互
- **D-08:** 单一且明确的 canonical 命中结果直接进入正常地点详情与点亮链路，不额外增加确认步骤。
- **D-09:** 只有在多候选或边界模糊的 `ambiguous` 情况下，才进入候选确认流程；Phase 26 不把“每次海外点亮都先确认”作为默认交互。

### the agent's Discretion
- 首批 8 个国家/地区的具体计划拆分顺序、按国家还是按数据链路切 plan，可由 planner 决定，只要不突破已锁定范围。
- popup 内“暂不支持点亮”的具体中文文案、视觉层级和是否附带轻量说明句，可由 the agent 决定，但不能变成全局 notice 主导。
- 英文 admin1 名称是否保留缩写、连字符或 source 数据的标准拼写，可由 researcher / planner 在不破坏稳定性的前提下微调，但必须保证同一记录链路前后显示一致。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and product constraints
- `.planning/ROADMAP.md` § Phase 26 — 本阶段目标、依赖、成功标准与 UI hint。
- `.planning/REQUIREMENTS.md` § Overseas Coverage（OVRS-01 / OVRS-02 / OVRS-03）— 海外覆盖、记录稳定展示与未支持地区反馈的正式 requirement。
- `.planning/PROJECT.md` § Current Milestone: v5.0 账号体系与云同步基础版 — 当前 milestone 对海外覆盖的总体边界与 out-of-scope 约束。
- `.planning/STATE.md` § Blockers/Concerns — Phase 26 规划前必须先锁定优先国家/地区与 canonical/boundary 兼容策略。

### Upstream phase decisions
- `.planning/phases/23-auth-ownership-foundation/23-CONTEXT.md` — 账号、会话与地图主舞台不拆页的上游约束。
- `.planning/phases/24-session-boundary-local-import/24-CONTEXT.md` — auth-session / map-points 分工、轻量 modal/notice 交互与边界清理语义。
- `.planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md` — canonical `placeId` / `boundaryId` 真源、same-user refresh 语义与轻量 popup/notice 路线。

### Overseas canonical and geometry sources
- `packages/contracts/src/place.ts` — `PlaceKind`, `CanonicalPlaceSummary`, `typeLabel`, `subtitle` 的 contract 真源。
- `packages/contracts/src/resolve.ts` — canonical resolve / ambiguous / failed 响应契约。
- `packages/contracts/src/records.ts` — TravelRecord 保存字段，尤其是 `displayName` / `typeLabel` / `subtitle` 的持久化真源。
- `packages/contracts/src/generated/geometry-manifest.generated.ts` — 当前 CN / OVERSEAS 边界 manifest 真源，决定哪些 canonical boundary 已进入可渲染数据集。
- `apps/web/src/data/geo/geometry-source-catalog.json` — 当前海外 admin1 使用 Natural Earth 10m admin-1 数据源的来源说明。

### Current implementation anchors
- `apps/server/src/modules/canonical-places/canonical-places.service.ts` — 当前 authoritative canonical resolve / confirm 逻辑与 `OUTSIDE_SUPPORTED_DATA` 失败语义。
- `apps/server/src/modules/auth/auth.service.ts` — 当前账号 bootstrap 返回 TravelRecord 文本字段的服务端真源。
- `apps/web/src/components/LeafletMapStage.vue` — 地图点击、resolve、fallback、ambiguous 确认与点亮入口的主编排。
- `apps/web/src/stores/map-points.ts` — TravelRecord -> popup display 的映射、boundary coverage 状态与保存记录展示真源。
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — 当前 popup 对 fallback 文案、boundary support notice、点亮按钮与候选确认的表现层。
- `apps/web/src/services/city-boundaries.ts` — 当前 boundary coverage 判断与 renderable boundary 映射规则。
- `apps/web/src/services/geo-lookup.ts` — 当前 `OUTSIDE_SUPPORTED_DATA` 时的国家/地区 fallback 识别基础。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/server/src/modules/canonical-places/canonical-places.service.ts`：已经能从 geometry shard 中读取 canonical place metadata，并区分 `resolved / ambiguous / failed`，适合作为首批海外国家 admin1 扩展的 authoritative 真源。
- `packages/contracts/src/generated/geometry-manifest.generated.ts`：当前 manifest 已包含大量 `OVERSEAS` boundary，可复用为“哪些 admin1 已有几何交付”的清单来源。
- `apps/web/src/components/LeafletMapStage.vue`：已有地图点击 -> canonical resolve -> ambiguous 确认 -> illuminate 的完整链路，不需要新建海外专用交互壳。
- `apps/web/src/components/map-popup/PointSummaryCard.vue`：已有 fallback notice 与 boundary support notice 区域，天然适合承接“该地区暂不支持点亮”的 popup 内说明。
- `apps/web/src/stores/map-points.ts`：已经把 TravelRecord 文本字段映射到 popup display，可直接承接海外 `displayName / typeLabel / subtitle` 的稳定展示验证。

### Established Patterns
- canonical 真源由 server 提供，web 只消费 `ResolvedCanonicalPlace` 和 `TravelRecord`，因此 Phase 26 应优先保证服务端 metadata 稳定，而不是在前端拼凑海外命名。
- 当前 app 继续围绕地图主舞台 + popup + 轻量 notice 的交互模式展开，未支持地区反馈应沿用 popup 解释，而不是引入新页面或重型状态中心。
- 当前保存链路依赖 `displayName / typeLabel / subtitle / boundaryId` 全量写入 TravelRecord，再通过 `/auth/bootstrap` 回放，因此海外文本一致性要在“resolve -> save -> bootstrap”整链路上验证。

### Integration Points
- `apps/server/src/modules/canonical-places/canonical-places.service.ts` 需要明确首批国家 admin1 的 canonical metadata 是否完整，以及 `OUTSIDE_SUPPORTED_DATA` 与“已识别但暂不支持点亮”之间如何分流。
- `apps/web/src/components/LeafletMapStage.vue` 当前在 `OUTSIDE_SUPPORTED_DATA` 时会回退到 `geo-lookup` 结果；Phase 26 需要在这里把“可识别但不支持点亮”的产品语义说清楚。
- `apps/web/src/stores/map-points.ts` 与 `apps/server/src/modules/auth/auth.service.ts` 共同决定海外记录在刷新、重开、跨设备后的标题/副标题一致性，是 OVRS-02 的主要落点。
- `apps/web/src/services/city-boundaries.ts` 的 boundary coverage 判断规则会影响 popup 是否显示“仅保存文本信息 / 暂不支持边界高亮”之类提示，需要与首批国家策略保持一致。

</code_context>

<specifics>
## Specific Ideas

- 第一批范围不要追求“国家数好看”，而要像一个真实能用的旅行覆盖包，优先服务 `JP / KR / TH / SG / MY / AE / AU / US`。
- 海外标题优先稳定而不是花哨本地化：主标题用英文 canonical 名，辅助说明继续用当前中文类型体系。
- 未支持地区的反馈要尽量贴着当前地点 popup，让用户知道“识别到了，但现在不能点亮”，而不是像报错或静默失败。
- 候选确认保持最小侵入：只有 `ambiguous` 时才要求用户选，不要给每次海外点亮都增加确认门槛。

</specifics>

<deferred>
## Deferred Ideas

- 全球范围海外 admin1 全量覆盖
- 海外城市级统一覆盖或比 admin1 更细粒度的海外层级
- 系统级多语言翻译表、按语言切换海外地名展示
- 海外点亮后的专用说明面板、同步中心或更复杂的 unsupported 区域帮助中心

</deferred>

---

*Phase: 26-overseas-coverage-foundation*
*Context gathered: 2026-04-15*
