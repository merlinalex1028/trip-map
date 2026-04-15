---
phase: 25
slug: sync-semantics-multi-device-hardening
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-15
---

# Phase 25 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| stale device snapshot -> current-user delete endpoint | 已落后的本地状态可能把“已删除”误当成错误，必须保证同账号 stale delete 收敛为幂等成功。 | `sid` cookie、`userId`、`placeId` |
| current-user mutation -> other session bootstrap | 多 session 需要通过服务端权威快照收敛，而不是依赖各自本地缓存。 | 当前账号 `records` snapshot |
| same authenticated user -> foreground refresh path | 同 user refresh 若误走切账号路径，会清空当前上下文或制造错误 notice。 | `sid` cookie、`currentUser`、`records` |
| browser focus / visibility events -> network bootstrap | 焦点事件可能触发重复刷新；刷新仍必须只信任服务端 bootstrap 真值。 | `/auth/bootstrap` 响应、会话状态 |
| mutation result -> user-facing notice | 成功、普通失败和需重新登录若混淆，用户会误解当前账号状态。 | notice 文案、当前账号同步状态 |
| foreground bootstrap snapshot -> local mutation state | 同账号前台刷新返回的是权威快照，但本地可能仍在处理 optimistic mutation。 | pending `placeId`、authoritative `records` |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-25-01 | Tampering | stale delete semantics | mitigate | `apps/server/src/modules/records/records.repository.ts` 对 `{ userId, placeId }` 使用 `deleteMany`；`apps/server/test/records-sync.e2e-spec.ts` 与 `apps/server/test/records-travel.e2e-spec.ts` 锁定 same-user stale delete `204`。 | closed |
| T-25-02 | Information Disclosure | multi-session bootstrap consistency | mitigate | `apps/server/test/records-sync.e2e-spec.ts` 验证 session A create/delete 后，session B 经 `/auth/bootstrap` 看到一致 `records`。 | closed |
| T-25-03 | Repudiation | sync contract ambiguity | mitigate | `apps/server/src/modules/records/records.service.ts` 删除了“缺失记录抛错”的歧义路径，sync e2e 明确 delete/bootstrap 预期。 | closed |
| T-25-04 | Denial of Service | foreground sync trigger | mitigate | `apps/web/src/stores/auth-session.ts` 通过 `refreshPromise` 复用 in-flight refresh；`apps/web/src/App.vue` 只在 authenticated 前台恢复时触发刷新。 | closed |
| T-25-05 | Information Disclosure | same-user refresh vs switch-account boundary | mitigate | `apps/web/src/stores/auth-session.ts` 在 same-user refresh 时调用 `applyAuthoritativeTravelRecords()`，不走 `resetTravelRecordsForSessionBoundary()`；`apps/web/src/stores/auth-session.spec.ts` 验证不出现“已切换到 ...”提示。 | closed |
| T-25-06 | Spoofing | refresh source of truth | mitigate | foreground refresh 继续只使用 `/auth/bootstrap` 结果与当前 `sid`，`bootstrap.authenticated === false` 或 `401/session-unauthorized` 均回退到匿名态。 | closed |
| T-25-07 | Repudiation | sync feedback semantics | mitigate | `apps/web/src/stores/map-points.ts` 将点亮成功、取消点亮成功、普通失败、会话失效四类路径分流到明确 notice；`apps/web/src/stores/map-points.spec.ts` 和 `apps/web/src/components/LeafletMapStage.spec.ts` 有回归覆盖。 | closed |
| T-25-08 | Denial of Service | silent unilluminate failure | mitigate | `apps/web/src/stores/map-points.ts` 在取消点亮普通失败时恢复完整 `previousRecords` 并落 warning notice，避免静默失败。 | closed |
| T-25-09 | Information Disclosure | stale delete UI rollback | mitigate | 服务端 stale delete 幂等成功与前端删除成功路径配合，`apps/web/src/stores/map-points.spec.ts` 验证 stale delete 仍收敛为未点亮。 | closed |
| T-25-10 | Tampering | `apps/web/src/stores/map-points.ts` | mitigate | `applyAuthoritativeTravelRecords()` 对 pending `placeId` 做 pending-aware 协调，避免 foreground refresh 的 stale snapshot 覆盖 in-flight mutation。 | closed |
| T-25-11 | Denial of Service | `apps/web/src/stores/auth-session.ts` | mitigate | `boundaryVersion` 与 same-user 轻刷新路径避免 session-boundary reset 把并发交互“看起来搞失败”；`apps/web/src/stores/map-points.spec.ts` 验证旧会话异步结果不会回写。 | closed |
| T-25-12 | Repudiation | `apps/web/src/stores/map-points.ts` / `apps/web/src/stores/auth-session.ts` | mitigate | overlap 回归继续区分普通失败与 `401/session expired`；`apps/web/src/stores/auth-session.spec.ts`、`apps/web/src/stores/map-points.spec.ts`、`apps/web/src/App.spec.ts` 锁定成功/失败/失效语义。 | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

No accepted risks.

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-15 | 12 | 12 | 0 | Codex (`$gsd-secure-phase`) |

---

## Audit Notes

- 输入状态判定为 State B：Phase 25 已执行完成，存在 `25-01..04-PLAN.md` 与对应 `SUMMARY.md`，此前不存在 `25-SECURITY.md`。
- 四份 `SUMMARY.md` 未单独声明 `## Threat Flags`，本次审计以各 plan 的 `<threat_model>` 为准，并回到实现与测试文件核对 mitigation 证据。
- 本次审计范围仅验证已登记 threat 的 mitigation 是否落地；未扩展为新威胁建模。

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-15
