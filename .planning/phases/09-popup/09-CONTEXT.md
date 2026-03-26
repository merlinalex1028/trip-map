# Phase 9: Popup 主舞台交互 - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把地点轻交互主入口从固定边缘抽屉重构为“锚定地图上下文的 popup”。交付重点是：让城市候选确认、已确认草稿和已保存点位都优先在地图主舞台中完成轻量确认与高频操作，再通过显式入口进入完整详情或编辑视图。

本阶段不扩展到完整视觉风格重构、地图缩放/拖拽模型、在线地点服务，也不把完整编辑表单长期塞进 popup；这些分别属于 Phase 10 或未来阶段。

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- 候选确认态、草稿态、已保存态在桌面端的具体锚点算法，例如优先跟随 marker、边界视觉中心或 pending 命中点，只要保持“锚定地图语境”这一主原则。
- 移动端从锚定式 popup 回退到底部 `peek` 的具体阈值与碰撞检测策略，只要优先保证可读性、可点性和安全边距。
- popup 中破坏性动作的确认形式、防误触细节和提示文案，只要不把确认流程做成重型模式切换。
- 摘要卡中的字段排序、按钮排布和文案细节，只要维持中等密度并避免重新长成小抽屉。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and milestone constraints
- `.planning/ROADMAP.md` — Phase 9 的目标、成功标准与“轻量 popup 成为主入口”的阶段边界
- `.planning/REQUIREMENTS.md` — `POP-01`、`POP-02`、`POP-03` 的正式 requirement，以及与 popup 紧耦合的 `BND-02`、`BND-03` 约束
- `.planning/PROJECT.md` — v2.0 milestone 对“悬浮弹窗替代抽屉主模式”“地图主舞台优先”和离线本地架构的总约束
- `.planning/STATE.md` — 当前 milestone 位置与“popup 仍应是轻量摘要面，完整详情继续保留接力”的现阶段共识

### Prior phase decisions that still constrain Phase 9
- `.planning/phases/07-城市选择与兼容基线/07-CONTEXT.md` — 候选确认、轻量搜索、国家/地区回退、稳定 `cityId` 复用与旧记录优先打开规则
- `.planning/phases/08-城市边界高亮语义/08-CONTEXT.md` — popup、详情与边界身份一致性，以及 close / switch / reopen 时的边界归位规则
- `.planning/phases/04-可用性打磨与增强能力/04-CONTEXT.md` — 轻量 notice、关闭语义、焦点管理与移动端可操作性基线

### Product background
- `PRD.md` §5.3、§7-10 — v1 抽屉基线、地点详情职责、地图主链路与移动端可用性背景，作为 Phase 9 重构前的产品起点

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/PointPreviewDrawer.vue`: 已经承接 `candidate-select / detected-preview / view / edit` 四种模式，字段、按钮和轻量搜索逻辑可复用到 popup / drawer 拆分中。
- `src/stores/map-points.ts`: 已集中维护 `pendingCitySelection`、`activePoint`、`drawerMode` 以及保存、更新、删除、隐藏、城市复用等动作，是 popup 状态接力的单一事实源。
- `src/components/WorldMapStage.vue`: 已拥有地图点击、pending marker、真实边界 overlay 和地图容器，是接入锚定 popup 与碰撞避让的自然入口。
- `src/components/SeedMarkerLayer.vue`: 已有 marker 选中、hover、focus 和标签显隐逻辑，可作为 popup 锚点语义与选中反馈的现成基础。
- `src/App.vue`: 当前通过 `drawer-open` / `drawer-edit` 调整舞台留白，是从“抽屉主模式”迁移到“popup 主模式”的主要布局切入点。

### Established Patterns
- 当前代码采用 Pinia setup store + Vue 3 Composition API，交互状态已经集中在 store 中，不需要为 popup 再造一套平行状态系统。
- Phase 7 已把“先候选确认，再生成草稿或复用旧记录”锁定为主链路，所以 popup 迁移必须保留这条分流逻辑。
- Phase 8 已把边界高亮状态锁定在 store 与地图 overlay 侧，说明 popup 只能消费这些状态，不能自己制造独立高亮记忆态。
- 当前移动端已有底部 drawer 结构，说明 `peek` 回退可以基于现有底部表面经验演进，而不必完全从零发明。

### Integration Points
- `src/components/WorldMapStage.vue` 需要新增 popup 锚点计算、视口碰撞避让和地图内定位逻辑，并与 pending / selected / saved 状态对齐。
- `src/stores/map-points.ts` 可能需要把当前 `drawerMode` 演进为“popup 摘要态 + drawer 深层态”的更明确状态模型，同时继续复用已有动作函数。
- `src/components/PointPreviewDrawer.vue` 的内容区和动作区适合抽离为共享片段，让 popup 与 drawer 使用同一套数据与动作而不是复制分叉。
- `src/App.vue` 需要从“给 drawer 预留空间”的布局逻辑，迁移到“舞台上叠加 popup，drawer 仅在深层模式接管”的布局策略。
- `src/components/SeedMarkerLayer.vue` 与边界 overlay 可能需要暴露更稳定的 anchor 信息，帮助 popup 在 marker 与边界主语义之间找到一致锚点。

</code_context>

<specifics>
## Specific Ideas

- popup 应尽量把轻交互留在地图主舞台里，而不是继续维持“候选 drawer + 结果 popup”的两段式体验。
- popup 不是纯提示气泡，而是中等密度摘要卡：要能同时承接身份信息、状态提示、候选确认和一排高频操作。
- 删除、隐藏这类破坏性动作允许进入 popup，但需要明确的防误触与确认设计，不能因为主舞台化而变成危险捷径。
- 桌面端优先保持“跟着地图对象走”的主舞台感；移动端则把安全边距、点击可达性和遮挡控制放在更高优先级，必要时回退到底部 `peek`。

</specifics>

<deferred>
## Deferred Ideas

- popup、marker、边界和详情面板的统一原创可爱风格语言、装饰动效与视觉资产收口 — 属于 Phase 10
- 缩放、拖拽、hover 预览等更复杂的地图交互模型 — 属于未来扩展能力，不纳入本阶段
- 把完整编辑表单、长文本工作流或深层设置长期塞进 popup — 超出本阶段“轻量主入口”的边界

</deferred>

---

*Phase: 09-popup*
*Context gathered: 2026-03-26*
