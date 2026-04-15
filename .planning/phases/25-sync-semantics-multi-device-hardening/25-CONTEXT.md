# Phase 25: Sync Semantics & Multi-Device Hardening - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只交付 3 件事：取消点亮后的云端删除语义与幂等收口、同一账号在另一台设备或同一设备回到前台时的基础版最终一致刷新，以及点亮/取消点亮/记录拉取在成功、失败或需要重新登录时的明确反馈。实时协同、离线队列、最近同步历史、设备管理、WebSocket 推送都不属于本阶段。

</domain>

<decisions>
## Implementation Decisions

### 取消点亮与云端语义
- **D-01:** 取消点亮的服务端语义必须对当前账号幂等成立；如果某个地点已经在另一台设备被移除，当前设备再次执行取消点亮时，最终状态仍应收敛为“未点亮”，不能因为 `404` 把本地 UI 回滚成旧状态。
- **D-02:** 点亮/取消点亮继续以 canonical `placeId` 为唯一目标身份，不引入软删除 tombstone、冲突弹窗或逐条合并策略。

### 基础版最终一致
- **D-03:** v5.0 只承诺“基础版最终一致”，不承诺实时协同；同一账号在另一台设备登录、刷新或当前页面回到前台时，应能重新拉取当前账号的权威 records snapshot。
- **D-04:** 同一账号的后台刷新不能误走“切账号”清场路径；如果还是同一个 user，只允许无闪屏地替换 records snapshot，不要把用户当前地图上下文整页清空。

### 同步反馈语义
- **D-05:** 点亮成功、取消点亮成功、普通网络失败、需要重新登录这四类结果要能被用户明确区分；继续复用现有轻量 notice 体系，不新增同步中心或整页阻断流程。
- **D-06:** `401/session expired` 继续沿用 Phase 23/24 已建立的账号失效语义；普通网络失败不应被误报成“会话已失效”。

### the agent's Discretion
- 成功提示是落在点亮/取消点亮后、还是只在真正发生云端同步时出现，可由 planner 决定，但必须保持轻量，不打断地图主链路。
- 前台刷新采用 `window focus`、`visibilitychange`、显式 refresh action，还是两者的最小组合，可由 planner 决定，但必须避免重复请求风暴。
- 失败提示的精确中文文案与展示时长可由 planner / executor 决定，只要能区分“网络失败”和“需要重新登录”。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and milestone constraints
- `.planning/ROADMAP.md` § Phase 25 — 本阶段目标、依赖、成功标准与 UI hint。
- `.planning/REQUIREMENTS.md` § SYNC-03, SYNC-04, SYNC-05 — 取消点亮同步、多设备一致与反馈语义的正式 requirement。
- `.planning/PROJECT.md` § Current Milestone / Core Value — v5.0 只做基础版最终一致，不引入实时协同。
- `.planning/STATE.md` § Blockers/Concerns — 已明确要求本阶段锁定取消点亮语义、最终一致策略和失败反馈分层。

### Upstream phase outcomes
- `.planning/phases/24-session-boundary-local-import/24-VERIFICATION.md` — Phase 24 已通过，说明匿名保存拦截、首登导入与账号边界语义已闭环。
- `.planning/phases/24-session-boundary-local-import/24-SECURITY.md` — Phase 24 的 trust boundaries，尤其是“server bootstrap 是真源、auth-session / map-points 分工不变”。
- `.planning/phases/24-session-boundary-local-import/24-04-SUMMARY.md` — 当前切账号/退出登录边界已稳定，Phase 25 要在此之上继续做 sync 语义。

### Current code sources of truth
- `apps/web/src/stores/auth-session.ts` — 当前 `restoreSession/login/logout`、bootstrap snapshot 与会话失效提示真源。
- `apps/web/src/stores/map-points.ts` — 当前点亮/取消点亮 optimistic 行为与 records snapshot 真源。
- `apps/web/src/stores/map-ui.ts` — 当前 info / warning notice 真源。
- `apps/web/src/App.vue` — 当前 app shell、notice、restore 生命周期挂载点。
- `apps/web/src/services/api/records.ts` — 当前 records GET/POST/DELETE/import API 封装。
- `apps/server/src/modules/auth/auth.service.ts` — `/auth/bootstrap` 当前账号权威 snapshot 真源。
- `apps/server/src/modules/records/records.controller.ts` / `records.service.ts` / `records.repository.ts` — 当前用户 records 读写删除语义真源。
- `apps/server/test/auth-bootstrap.e2e-spec.ts` / `apps/server/test/records-travel.e2e-spec.ts` — 当前 session/bootstrap 和单设备 records 行为的回归基线。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auth-session` 已经能区分 `anonymous/restoring/authenticated`，并在 unauthorized / restore failure 时给出明确 warning notice。
- `map-points` 已经把点亮/取消点亮收口到 `illuminate()` / `unilluminate()`，是本阶段补同步语义的主入口。
- `/auth/bootstrap` 已经返回 `user + records` 权威快照，天然适合做“另一台设备登录后的一致状态”真源。
- `UserTravelRecord (userId, placeId)` 已经是唯一键真源，因此点亮天然幂等；本阶段重点是把取消点亮也收口成最终一致。

### Established Patterns
- 当前仓库把账号快照真源放在 `auth-session`，把地图 records 真源放在 `map-points`；Phase 25 应继续保持这条边界，而不是让组件自行决定同步策略。
- 当前 notice 体系只有 `info | warning` 两种 tone；成功/失败/重新登录三类反馈应尽量复用这套轻量机制。
- 当前 app shell 已经允许在不卸载地图的前提下恢复/切换会话，因此前台 refresh 应优先做“同 user 轻刷新”，不要整页 reset。

### Integration Points
- `map-points.unilluminate()` 目前在非 `401` 失败时只回滚、不提示，这正是 `SYNC-05` 的明确缺口。
- `records.service.deleteTravel()` 目前对“已经不存在的 placeId”抛 `404`；在多设备 stale state 下，这会让后到达的取消操作误被当作失败。
- `App.vue` 当前只在 `onMounted()` 做一次 `restoreSession()`；若要交付基础版最终一致，需要明确前台回归或再次进入页面时的 refresh 策略。

</code_context>

<specifics>
## Specific Ideas

- stale 设备再次取消已被其他设备移除的地点，应该收敛成“已经移除成功”，而不是把地点重新弹回地图。
- 同一账号从另一台设备新增或取消点亮后，当前设备不必实时推送，但应在重新登录、刷新或回到前台时看到权威结果。
- 成功、失败、需要重新登录三类状态最好用轻量但可区分的文案，不要让“网络失败”和“账号失效”混成一种提示。

</specifics>

<deferred>
## Deferred Ideas

- WebSocket / SSE 实时同步
- 离线 mutation queue、后台重试和冲突解决中心
- 最近同步时间、同步历史或详细状态面板
- 多设备同时编辑的冲突提示与人工合并

</deferred>

---

*Phase: 25-sync-semantics-multi-device-hardening*
*Context gathered: 2026-04-15*
