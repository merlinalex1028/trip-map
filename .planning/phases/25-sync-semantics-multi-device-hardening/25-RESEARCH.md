# Phase 25: Sync Semantics & Multi-Device Hardening - Research

**Researched:** 2026-04-15  
**Domain:** current-user records sync semantics, multi-session bootstrap refresh, Vue 3 + Pinia optimistic mutation feedback [VERIFIED: codebase grep]  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from ROADMAP / CONTEXT)

### Locked Decisions
- **D-01:** stale 设备再次取消已被其他设备移除的地点时，最终状态仍必须收敛为“未点亮”，不能因为 `404` 回滚成旧状态。 [VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]
- **D-02:** 本阶段继续只以 canonical `placeId` 为同步目标，不引入 tombstone、冲突弹窗或逐条合并。 [VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]
- **D-03:** v5.0 只承诺基础版最终一致，不承诺实时协同；另一台设备登录、刷新或当前页面回到前台时应看到权威 records snapshot。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]
- **D-04:** 同 user 的 refresh 不能误走 switch-account 清场路径。 [VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]
- **D-05:** 成功、普通网络失败、需要重新登录三类同步反馈必须明确区分，且继续复用现有 notice 体系。 [VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]

### Deferred Ideas (OUT OF SCOPE)
- WebSocket / SSE 实时同步。 [VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]
- 离线队列、后台重试和同步中心。 [VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]
- 最近同步历史、设备管理、多设备协同编辑。 [VERIFIED: .planning/phases/25-sync-semantics-multi-device-hardening/25-CONTEXT.md]
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SYNC-03 | 登录后用户取消点亮地点时，云端对应记录会同步删除或标记取消。 [VERIFIED: .planning/REQUIREMENTS.md] | 当前 server 已提供 `DELETE /records/:placeId`，但 missing record 返回 `404`；在 stale device 场景下，这会让前端误回滚。最小修正是把 delete 语义改成对当前 user 幂等。 [VERIFIED: codebase grep][VERIFIED: apps/server/test/records-travel.e2e-spec.ts] |
| SYNC-04 | 同一账号在另一台设备登录后，可以看到与原设备一致的旅行记录。 [VERIFIED: .planning/REQUIREMENTS.md] | `/auth/bootstrap` 已返回当前账号 `records` 真源；缺口主要在于缺少“同 user 轻刷新”路径与跨 session e2e 证明。 [VERIFIED: codebase grep][VERIFIED: apps/server/test/auth-bootstrap.e2e-spec.ts] |
| SYNC-05 | 点亮、取消点亮与拉取记录失败时，用户能得到明确的同步成功、失败或需要重新登录提示。 [VERIFIED: .planning/REQUIREMENTS.md] | 当前 `illuminate` 的普通失败已有 warning notice，但 `unilluminate` 的普通失败只回滚不提示；成功态和 refresh 失败也缺乏明确语义。 [VERIFIED: codebase grep][VERIFIED: apps/web/src/stores/map-points.ts] |
</phase_requirements>

## Summary

Phase 25 的主矛盾不在“有没有 server records”，而在“stale snapshot 遇到删除时是否还能收敛”和“用户能否理解同步到底成功了、失败了，还是需要重新登录”。当前代码里 `createTravelRecord` 已经通过 `upsert` 获得天然幂等，但 `deleteTravel` 仍把 missing record 当成 `404` 错误；这对单设备是合理的，对多设备 stale state 则会制造假失败。 [VERIFIED: codebase grep]

另一个明显缺口是最终一致刷新：当前 `App.vue` 只在首挂 `restoreSession()`，而 `restoreSession()` 还有 `hasRestoredOnce` 短路，因此同一个已登录用户在页面回到前台后不会自动重拉云端 records。Phase 25 最小可行路线不是引入实时同步，而是在 `auth-session` 中新增“same-user lightweight refresh”路径，并用 app foreground/focus 事件触发。 [VERIFIED: codebase grep]

最后，反馈语义已经有一半基础：Phase 23/24 已经把 `401/session expired` 和 `restore failed` 区分开，也有全局 notice surface；真正缺的是 mutation 成功与普通网络失败的区分，尤其是取消点亮失败。 [VERIFIED: codebase grep][VERIFIED: .planning/phases/23-auth-ownership-foundation/23-VERIFICATION.md]

**Primary recommendation:** 把 Phase 25 拆成 3 个计划：  
1. 服务端删除幂等与多 session e2e 真值；  
2. 同 user 的前台刷新与最终一致收敛；  
3. 点亮/取消点亮/refresh 的反馈语义补齐。  
这样既不把 scope 扩成实时同步，也能完整覆盖 `SYNC-03/04/05`。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: codebase grep]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Current sync truth | `/auth/bootstrap` 已返回 authenticated `user + records` snapshot；`auth-session.applyAuthenticatedSnapshot()` 会把 records 注入 `map-points`。 [VERIFIED: codebase grep] | **Code edit**：增加 same-user refresh 路径，不再只靠首挂 restore。 |
| Mutation semantics | `createTravelRecord` 走 `upsert`；`deleteTravelRecordByPlaceId` 找不到时返回 `null`，service 再抛 `404`。 [VERIFIED: codebase grep] | **Code edit**：删除对当前 user 改为幂等成功。 |
| UI feedback | `map-ui` 只有 `info | warning`；`illuminate` 普通失败会给 warning，`unilluminate` 普通失败不会提示。 [VERIFIED: codebase grep] | **Code edit**：补 delete / refresh 的 notice 语义，并复用现有 tone。 |
| Session expiry path | `auth-session.handleUnauthorized()` 已能清边界并显示“账号会话已失效，请重新登录”。 [VERIFIED: codebase grep] | **Reuse**：Phase 25 不要新造第二套 re-login 提示。 |

## Common Pitfalls

### Pitfall 1: 继续把删除不存在的记录当硬错误

**What goes wrong:**  
设备 A 已经删除某地点后，设备 B 仍显示旧 snapshot，再次取消点亮会收到 `404`，前端把它当失败回滚，导致 UI 与云端再次分叉。 [VERIFIED: codebase grep][ASSUMED]

**How to avoid:**  
把 `DELETE /records/:placeId` 对“当前 user 已不存在该 `placeId`”改成幂等 `204`，并用多 session e2e 锁住。 [VERIFIED: codebase grep]

### Pitfall 2: 用 restoreSession 复用同 user refresh，结果把用户当前上下文整页清空

**What goes wrong:**  
`restoreSession()` 走的是完整 bootstrap/anonymous fallback 路径，还带 `hasRestoredOnce` 短路；如果强行复用，很容易让前台 refresh 清掉当前 popup、selection 和 summary state。 [VERIFIED: codebase grep]

**How to avoid:**  
新增 same-user refresh action，只替换当前账号 records snapshot；只有 user 变更或 session 失效时才走 Phase 24 的边界清场。 [VERIFIED: codebase grep][ASSUMED]

### Pitfall 3: 只有失败提示，没有成功或“需重登”区分

**What goes wrong:**  
用户看到“点亮已变灰”但不知道是不是已同步；取消点亮失败时又没有 notice，网络失败和 session 失效也容易混淆。 [VERIFIED: codebase grep][ASSUMED]

**How to avoid:**  
继续复用 `map-ui` 的 `info/warning`，把“同步成功”“普通失败”“需重新登录”落成三套稳定文案，不引入重型同步中心。 [VERIFIED: codebase grep][ASSUMED]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Web / Server / Contracts 全部使用 `Vitest`。 [VERIFIED: package.json][VERIFIED: codebase grep] |
| Config file | `apps/web/vitest.config.ts`，`apps/server/vitest.config.ts`，server 单测脚本走 `apps/server/scripts/vitest-run.mjs`。 [VERIFIED: codebase grep] |
| Quick run command | `pnpm --filter @trip-map/server test -- test/records-sync.e2e-spec.ts`，`pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts`。 [ASSUMED] |
| Full suite command | `pnpm typecheck && pnpm test`。 [VERIFIED: package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-03 | stale 设备再次取消已被移除的地点时，最终仍保持“未点亮”。 [VERIFIED: .planning/REQUIREMENTS.md] | server multi-session e2e + web store | `pnpm --filter @trip-map/server test -- test/records-sync.e2e-spec.ts` and `pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts` | ❌ new spec required [ASSUMED] |
| SYNC-04 | 同一账号在另一台设备登录或当前页面回到前台后，能重新拿到云端权威 snapshot。 [VERIFIED: .planning/REQUIREMENTS.md] | auth bootstrap e2e + auth-session/App integration | `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts test/records-sync.e2e-spec.ts` and `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/App.spec.ts` | ✅/❌ mixed [VERIFIED: codebase grep][ASSUMED] |
| SYNC-05 | 点亮、取消点亮与刷新失败时，成功 / 失败 / 重新登录提示可区分。 [VERIFIED: .planning/REQUIREMENTS.md] | web store/component integration | `pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts src/App.spec.ts` | ✅ existing files, cases missing [VERIFIED: codebase grep][ASSUMED] |

### Sampling Rate

- **Per task commit:** 跑该任务最近邻 spec，目标在 30 秒内返回。
- **Per plan:** 跑 plan `<verification>` 中的 web/server package tests 与 typecheck。
- **Phase gate:** `pnpm typecheck` + 相关 web/server specs 通过，再进 `/gsd-verify-work 25`。

### Wave 0 Gaps

- [ ] `apps/server/test/records-sync.e2e-spec.ts` — 锁 multi-session create/delete/bootstrap consistency。
- [ ] `apps/web/src/stores/auth-session.spec.ts` — 锁 same-user foreground refresh 与 unauthorized fallback。
- [ ] `apps/web/src/App.spec.ts` — 锁 foreground refresh trigger，不误走 switch-account notice。
- [ ] `apps/web/src/stores/map-points.spec.ts` — 锁取消点亮失败提示与 stale delete 收敛语义。

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V3 Session Management | yes | `sid` cookie + `/auth/bootstrap` 当前 user snapshot。 [VERIFIED: codebase grep] |
| V4 Access Control | yes | records 删除与拉取仍只允许当前 user。 [VERIFIED: codebase grep] |
| V5 Input Validation | yes | 不新增复杂输入面；主要风险来自 stale state 与错误语义，而非新表单。 [VERIFIED: codebase grep][ASSUMED] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| stale 设备再次删除已被移除记录，导致假失败回滚 | Tampering / Repudiation | 对当前 user delete 走幂等成功，并用 multi-session e2e 锁住。 |
| same-user refresh 误走 switch-account 清场，导致当前页面状态闪断 | Information Disclosure / DoS | 同 user refresh 只 replace records，不走 boundary reset。 |
| 网络失败被误报成 session expired | Repudiation | 保留 `handleUnauthorized()` 仅处理 `401`；普通失败走独立 warning notice。 |

## Sources

- `apps/web/src/stores/map-points.ts`
- `apps/web/src/stores/auth-session.ts`
- `apps/web/src/App.vue`
- `apps/web/src/services/api/records.ts`
- `apps/server/src/modules/records/records.service.ts`
- `apps/server/src/modules/records/records.repository.ts`
- `apps/server/test/auth-bootstrap.e2e-spec.ts`
- `apps/server/test/records-travel.e2e-spec.ts`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/24-session-boundary-local-import/24-VERIFICATION.md`
- `.planning/phases/24-session-boundary-local-import/24-SECURITY.md`

---

*Phase: 25-sync-semantics-multi-device-hardening*
*Researched: 2026-04-15*
