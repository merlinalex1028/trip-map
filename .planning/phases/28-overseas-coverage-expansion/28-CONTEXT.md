# Phase 28: Overseas Coverage Expansion - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

把 Phase 26 已建立的 8 国 overseas admin1 authoritative support catalog 扩展到更广的优先国家/地区，保持 manifest-backed metadata 规范、区域均衡覆盖和 admin1 粒度，同时确保扩展后在地图、bootstrap 恢复和统计视图中的标题、类型标签与归类信息保持一致。

</domain>

<decisions>
## Implementation Decisions

### 扩展范围与粒度
- **D-01:** 按地理区域均衡覆盖，而非按用户旅行频次
- **D-02:** admin1 粒度是必须的，国家级 fallback 不可接受；如果某国家没有可用的 admin1 边界数据，则暂不开放该国家
- **D-03:** 一次性完成扩展目标范围内的所有国家/地区

### Metadata 规范
- **D-04:** 新增国家沿用 Phase 26 的 manifest-backed catalog 机制，扩展 catalog 文件
- **D-05:** 新增国家的 displayName / typeLabel / parentLabel / subtitle 规范全部沿用 Phase 26 的规则
- **D-06:** displayName 使用英文或本地化的地区名称；typeLabel 使用 "State" / "Province" / "Region" 等标准标签

### Catalog 维护
- **D-07:** Catalog 拆分为多个文件（按区域或字母），不再使用单一 JSON 文件
- **D-08:** 新增 country entry 需要完整验证：admin1 resolve 生成 authoritative record、metadata 显示正确、bootstrap 恢复和地图展示一致性

### Agent's Discretion
- 具体拆分数量和命名方式由规划阶段决定
- 新增国家的验证测试策略由规划阶段设计

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope & Product Boundary
- `.planning/ROADMAP.md` — `Phase 28: Overseas Coverage Expansion` 的目标、成功标准和 `GEOX-01`、`GEOX-02` requirements
- `.planning/PROJECT.md` — v6.0 milestone 定位、overseas coverage 作为核心增强方向

### Requirements
- `.planning/REQUIREMENTS.md` — `GEOX-01`、`GEOX-02` 的正式定义

### Prior Phase Context
- `.planning/phases/27-multi-visit-record-foundation/27-CONTEXT.md` — Phase 27 的多次旅行记录决策，Phase 28 扩展的 overseas catalog 需要与后续时间轴、统计视图保持一致
- `.planning/phases/26-overseas-authoritative-support/26-CONTEXT.md` — Phase 26 的 overseas catalog 机制、metadata 规范和 manifest-backed pattern（必须沿用）

### Existing Code
- `apps/web/src/stores/overseas-catalog.ts` — Phase 26 的 overseas catalog store 实现
- `apps/server/src/modules/overseas/overseas.service.ts` — Phase 26 的 overseas resolve 逻辑
- `.planning/phases/26-overseas-authoritative-support/` — Phase 26 的 plan/summary 文件（需读取以了解已实现的 8 国 catalog）

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- Phase 26 的 manifest-backed catalog 模式：`apps/web/src/stores/overseas-catalog.ts` 加载 JSON manifest 文件，解析 admin1 边界数据
- Phase 26 的 metadata 规范：displayName / typeLabel / parentLabel / subtitle 字段定义和生成逻辑

### Established Patterns
- overseas record 的 metadata 在 bootstrap 恢复和地图展示时需要保持一致
- admin1 resolve 需要找到对应的 authoritative record 才能点亮
- Phase 26 已验证这套模式在 8 国范围内工作正常

### Integration Points
- 新增国家的 catalog entry 需要与 `apps/web/src/stores/overseas-catalog.ts` 集成
- 需要在 `apps/server/src/modules/overseas/` 中添加新的 resolve 逻辑
- 新增国家需要添加到测试 fixture 中

</codebase_context>

<specifics>
## Specific Ideas

- 新增国家的扩展需要与 Phase 29（时间轴）和 Phase 30（统计）兼容，不能只考虑地图展示
- 按区域拆分 catalog 文件，每个区域可能有不同的 typeLabel 前缀（如 Asia、Europe）

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 28-overseas-coverage-expansion*
*Context gathered: 2026-04-21*