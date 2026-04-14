# Phase 24: Session Boundary & Local Import - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只交付 4 件事：未登录用户继续浏览地图时的保存拦截方式、首次登录且检测到本地旧记录时的导入选择、导入到账号时的 canonical 去重与结果反馈，以及退出登录/切换账号后的 records 边界清空与重载提示。多设备最终一致、取消点亮同步、设备管理、OAuth、逐条冲突处理都不属于本阶段。

</domain>

<decisions>
## Implementation Decisions

### 匿名保存拦截
- **D-01:** 未登录用户在匿名状态下尝试“点亮 / 保存地点”时，直接打开统一的 `AuthDialog` 登录弹层，不走“只提示不拦截”的轻提醒方案。
- **D-02:** 打开登录弹层时必须保留当前地图上下文，包括当前识别结果、地图位置和用户正在看的地点，不允许把用户踢回空白初始态。

### 首登本地记录选择
- **D-03:** 只有在检测到“本地存在旧记录”时，登录成功后才出现一次明确选择弹层；如果没有本地记录，则不插入迁移决策步骤。
- **D-04:** 这个选择弹层只提供两条主路径：`导入本地记录到当前账号` 与 `以当前账号云端记录为准`，不做静默默认覆盖。

### 导入去重与结果反馈
- **D-05:** 本地记录导入账号时按 canonical `placeId` 自动去重合并，不做逐条冲突确认。
- **D-06:** 导入完成后必须给出轻量结果摘要，至少说明导入了多少条本地记录、合并了多少个重复地点，以及当前账号最终有多少个地点。

### 退出登录与切账号边界
- **D-07:** 退出登录时立即清掉上一账号的点亮记录与相关选中态，同时给出明确 notice，例如“已退出当前账号”。
- **D-08:** 切换到另一账号时同样走“明确 notice + 立即清边界”的语义，让用户清楚知道界面正在加载新账号对应的数据，而不是静默切换。

### the agent's Discretion
- 导入选择弹层的视觉布局、按钮文案细节与结果摘要的具体排版可由 planner / executor 自行决定，但不能削弱“用户主动选择”的语义。
- 匿名保存时登录弹层前后的过渡动画、notice 的展示时长与语气可由 the agent 决定，但必须保留地图上下文。
- 切账号时 notice 的精确文案与是否带用户名可由 the agent 决定，只要能明确表达当前边界已切换。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and milestone constraints
- `.planning/ROADMAP.md` § Phase 24 — 本阶段目标、依赖、成功标准与 UI hint。
- `.planning/REQUIREMENTS.md` § AUTH-04, MIGR-01, MIGR-02, MIGR-03, MIGR-04 — 未登录浏览、首次导入、去重与会话边界的正式 requirement 口径。
- `.planning/PROJECT.md` § Current Milestone / Current State — v5.0 的整体边界与“只清理直接阻塞账号化 / 同步 / 覆盖扩展的技术债”原则。
- `.planning/STATE.md` § Decisions / Blockers — 当前 milestone 的进度、已完成的 Phase 23 结论与 Phase 24 的关注点。

### Upstream auth and records decisions
- `.planning/phases/23-auth-ownership-foundation/23-CONTEXT.md` — Phase 23 已锁定的 auth shell、session restore、ownership 真源与 out-of-scope 约束。
- `.planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md` — Phase 23 的正式通过证据，尤其是 auth bootstrap 和 current-user records 已成立的前提。
- `.planning/phases/23-auth-ownership-foundation/23-UAT.md` — 本阶段需要承接关闭的真实用户边界问题与已解决 gap 的历史背景。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/stores/auth-session.ts`：已经集中处理 `restoreSession/login/logout` 与 anonymous / authenticated snapshot 切换，是插入“首次登录迁移决策”的主接点。
- `apps/web/src/stores/map-points.ts`：已经有 `replaceTravelRecords()` 与 `resetTravelRecordsForSessionBoundary()`，适合承接“云端记录替换”和“切账号清场”。
- `apps/web/src/stores/map-ui.ts`：已有全局 `interactionNotice`，适合承接导入结果摘要、退出登录提示和切账号过渡提示。
- `apps/web/src/components/auth/AuthDialog.vue`：现有统一认证弹层可直接复用为匿名保存拦截入口，不需要新建独立登录页。
- `apps/web/src/components/auth/AuthTopbarControl.vue`：已有匿名/已登录顶栏入口和退出动作，后续可以挂接更明确的边界反馈。

### Established Patterns
- Web 端当前采用 `auth-session` 作为会话真源、`map-points` 作为 records 真源的双 store 分工，Phase 24 应继续沿用，而不是把迁移逻辑塞进组件。
- App 首屏通过 `App.vue -> restoreSession()` 启动恢复链路，说明“首次登录后的本地导入选择”更适合挂在 auth bootstrap 之后，而不是 LeafletMapStage 内部。
- 现有产品已经使用轻量 notice 和 modal，而不是独立整页状态切换；本阶段的导入选择与边界反馈应延续这种轻量交互。

### Integration Points
- `apps/web/src/stores/auth-session.ts`：登录成功后当前会直接 hydrate 云端 bootstrap，Phase 24 需要在这一步前后插入“检测本地记录并弹选择”的流程。
- `apps/web/src/stores/map-points.ts`：需要支持“本地旧记录快照”与“账号云端记录快照”之间的迁移、去重和切换。
- `apps/web/src/App.vue`：适合承接首登导入选择弹层与切账号过渡态的挂载位置。
- `apps/web/src/components/LeafletMapStage.vue`：只应消费已经建立好的 records 边界，不应自己决定迁移策略。
- 当前 `apps/web/src` 下没有明显暴露的本地旧记录迁移模块，planner / researcher 需要显式确认旧本地记录来源并决定如何接入。

</code_context>

<specifics>
## Specific Ideas

- 匿名用户想点亮地点时，不要先把他打回首页或清空当前识别结果；应该像“把当前动作升级为登录后继续”。
- 首次登录的迁移选择应该是一道清楚、一次性的决策，不应让用户猜系统默认帮他合并了什么。
- 导入结果摘要要让用户对“导入了多少、合并了多少”有基本感知，但不要演变成逐条冲突处理流程。
- 退出登录或切账号后的提示要帮助用户理解“为什么当前地图上的点亮状态刚刚变了”。

</specifics>

<deferred>
## Deferred Ideas

- 逐条冲突确认或高级 merge 策略 — 更适合未来的同步增强阶段，不在 Phase 24。
- 多设备最终一致、取消点亮同步语义与更细粒度同步状态提示 — 属于 Phase 25。
- 设备管理、退出所有设备、登录历史 — 超出当前会话边界与首次导入范围。
- 本地导入后的撤销 / 回滚体验 — 未来如有需要可单独成 phase 或 backlog。

</deferred>

---

*Phase: 24-session-boundary-local-import*
*Context gathered: 2026-04-14*
