# Phase 13: 行政区数据与几何交付 - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 13 负责把 v3.0 所需的中国市级与海外一级行政区几何数据来源、版本清单、ID 映射、静态资产交付方式，以及坐标适配验证规则固定下来。它的交付目标是让后续 `Leaflet` 主链路可以按需获取稳定可追踪的几何资源，而不是在这一阶段完成完整的 `Leaflet` 页面迁移、记录 CRUD，或复杂的服务端几何服务化。

</domain>

<decisions>
## Implementation Decisions

### 几何资源入口与服务端职责
- **D-01:** `server` 继续承担 canonical 权威引用边界，但 Phase 13 的几何交付采用“`server` 返回边界引用 / asset key / datasetVersion，前端再按引用获取版本化静态几何资产”的模式。
- **D-02:** Phase 13 不采用“前端完全自行猜测本地几何路径、`server` 完全不管几何入口”的方案，也不采用“`server` 直接内联返回完整 GeoJSON”的重型返回方式。
- **D-03:** `API-03` 的实现方向应围绕“地点摘要 + 边界引用 + 几何资源入口”展开，让前端可以按需加载与缓存，而不是把整套 GeoJSON 预先塞进前端 bundle 或数据库。

### 静态几何资产切分
- **D-04:** 几何静态资产采用分片交付，而不是中国/海外各自一个超大整包，也不是一条 `boundaryId` 对应一个独立文件。
- **D-05:** 中国侧优先按省级或同等可维护区域分片，单个分片内包含该区域下属市级几何；海外侧优先按国家分片，单个分片内包含该国家下的 `admin-1` 几何。
- **D-06:** 每个分片都要挂在统一 manifest / index 之下，保证前端能先解析引用，再定位需要加载的静态资产分片。

### Canonical 边界身份与可渲染几何映射
- **D-07:** 保留“canonical `boundaryId` -> geometry asset id / renderable geometry id”的显式映射层，不强行要求两者在 Phase 13 完全同名同值。
- **D-08:** canonical `boundaryId` 继续作为跨端共享身份锚点；几何资产内部的 renderable id 可以独立演进，但必须能被 manifest 稳定映射、追踪和回放。
- **D-09:** 当前 `apps/web/src/services/city-boundaries.ts` 里的手工映射表属于过渡实现；Phase 13 应把这层映射升级为随数据版本管理的正式 manifest 资产，而不是继续散落在前端代码里长期维护。

### 坐标标准与验证规则
- **D-10:** Phase 13 采用“统一收口到单一对外坐标标准 + 固定转换规则 + 自动化代表性验点”的策略，而不是只写文档做人工验收，也不是一次性扩成大规模 GIS 校验体系。
- **D-11:** 自动化验证至少要覆盖中国与海外的代表性样例，明确锁定中国与海外边界在后续 `Leaflet` 渲染中不会出现明显错位、popup anchor 偏移或点击语义漂移。
- **D-12:** 北京、香港、California 这类跨中国直辖市 / 特别行政区 / 海外一级行政区的样例，应作为优先代表性验点进入构建或测试校验基线。

### the agent's Discretion
- manifest 的精确字段命名、`asset key` 结构、目录组织方式，以及分片文件名规范，只要满足“版本化、可追踪、可映射”原则。
- 中国分片与海外分片的具体边界切分策略，只要整体符合“中国按省级或同等维护单元、海外按国家”的主方向。
- 几何资产最终对外统一采用哪一种标准坐标表达，以及内部是否需要中间转换步骤，只要对 `web` / `Leaflet` 的消费侧保持单一稳定规则。
- 自动化验点采用单元测试、集成测试还是构建检查脚本，只要能稳定证明代表性中国/海外样例不会发生坐标错位。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and requirement contract
- `.planning/ROADMAP.md` — `Phase 13: 行政区数据与几何交付` 的目标、成功标准与执行顺序；明确本阶段先固化几何交付，再进入 `Leaflet` 主链路迁移。
- `.planning/REQUIREMENTS.md` — `GEOX-03` 到 `GEOX-07` 与 `API-03` 定义了中国/海外正式数据源、双图层分离、统一 ID / 版本清单，以及几何资源入口约束。
- `.planning/PROJECT.md` — `Current Milestone: v3.0 全栈化与行政区地图重构`、`Constraints` 与 `Current State` 明确了“不引入复杂基础设施、地图将迁移到 Leaflet、几何先用版本化静态资产交付”的产品约束。

### Prior phase contracts that carry forward
- `.planning/phases/11-monorepo/11-CONTEXT.md` — 固定 `web + server + contracts` monorepo 基线、共享字段边界与“不提前引入对象存储 / PostGIS / 复杂基础设施”的约束。
- `.planning/phases/12-canonical/12-CONTEXT.md` — 固定 canonical `placeId` / `boundaryId` / `datasetVersion` 的权威语义，以及 `server` 作为 canonical resolve 真源的前提。
- `.planning/phases/08-城市边界高亮语义/08-CONTEXT.md` — 固定 `boundaryId` 作为边界高亮与重开恢复锚点、多面域整体高亮、以及边界身份不能被弱化成临时 marker 语义的产品合同。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/services/city-boundaries.ts`：当前负责静态 GeoJSON 读取、`boundaryId` 查询和 canonical/renderable id 映射，是 Phase 13 升级为 manifest + asset loader 的直接落点。
- `apps/web/src/components/WorldMapStage.vue`：当前消费标准化边界 polygon、生成高亮 path、计算 popup anchor，后续会直接受益于稳定的几何交付与坐标规则。
- `packages/contracts/src/place.ts`：已经固定了 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 的共享契约，可继续承载 Phase 13 需要暴露的几何引用字段。
- `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts`：当前 canonical fixture 已包含 `boundaryId` 与 `datasetVersion`，后续可扩展为返回几何引用或 manifest 入口的权威来源。

### Established Patterns
- 前端当前通过本地静态 GeoJSON + 单一 `datasetVersion` 使用边界数据，说明项目已经接受“版本化静态几何资产”的交付方向。
- 当前项目已存在“canonical id 不一定直接等于可渲染 boundary id”的事实，并通过显式映射兜底 unsupported geometry。
- popup、drawer、已保存记录和地图高亮都依赖同一套 canonical `boundaryId` 字段，说明 Phase 13 不能把几何交付设计成脱离 canonical 身份的另一套主键体系。

### Integration Points
- `apps/server/src/modules/canonical-places` 与 `apps/web/src/services/api/canonical-places.ts`：适合作为“返回边界引用 / asset key / datasetVersion”这层入口合同的接入点。
- `apps/web/src/services/city-boundaries.ts`：适合作为前端几何 manifest 解析、分片加载和 renderable geometry 规范化的接入点。
- `apps/web/src/stores/map-points.ts` 与 `apps/web/src/components/WorldMapStage.vue`：会继续消费 `boundaryId`、`datasetVersion` 与 geometry support-state，是 Phase 13 对后续 UI 最直接的集成面。

</code_context>

<specifics>
## Specific Ideas

- 用户明确选择让 `server` 返回几何引用，而不是直接内联完整 GeoJSON。
- 用户明确选择让几何资产按区域分片交付：中国优先省级分片，海外优先国家分片，并通过 manifest 统一索引。
- 用户明确选择保留 canonical `boundaryId` 到 renderable geometry id 的显式映射层。
- 用户明确选择用“统一坐标标准 + 自动化代表性验点”的方式固定坐标适配，并点名北京、香港、California 这类样例应进入验证基线。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-行政区数据与几何交付*
*Context gathered: 2026-03-31*
