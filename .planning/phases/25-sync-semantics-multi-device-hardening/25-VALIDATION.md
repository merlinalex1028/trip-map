---
phase: 25
slug: sync-semantics-multi-device-hardening
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-15
updated: 2026-04-15
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Web / Server / Contracts 全部使用 Vitest |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `apps/server/scripts/vitest-run.mjs` |
| **Quick run command** | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` |
| **Full suite command** | `pnpm typecheck && pnpm test` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** 运行该任务最近邻 spec 或 `rg/test -f` 级检查。
- **After every plan:** 运行该 plan `<verification>` 中的 web/server tests + typecheck。
- **After every wave:** `pnpm typecheck && pnpm test`。
- **Before `/gsd-verify-work 25`:** Full suite + server sync e2e 必须为绿。
- **Max feedback latency:** 30 seconds for quick checks.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Runtime Target | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|----------------|--------|
| 25-01-01 | 01 | 1 | SYNC-03, SYNC-04 | T-25-01 | multi-session server e2e 能证明同 user 的 create/delete/bootstrap 收敛语义 | server e2e | `cd /Users/huangjingping/i/trip-map && test -f apps/server/test/records-sync.e2e-spec.ts && pnpm --filter @trip-map/server test -- test/records-sync.e2e-spec.ts` | <=30s | ⬜ pending |
| 25-01-02 | 01 | 1 | SYNC-03 | T-25-01 | `DELETE /records/:placeId` 对当前 user 缺失记录幂等成功，不再把 stale delete 视为错误 | server e2e + typecheck | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/server test -- test/records-sync.e2e-spec.ts test/records-travel.e2e-spec.ts && pnpm --filter @trip-map/server typecheck` | <=30s | ⬜ pending |
| 25-02-01 | 02 | 1 | SYNC-04 | T-25-02 | 同 user foreground refresh 会重新拉取 bootstrap snapshot，不误走 switch-account 清场 | web store/app | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/App.spec.ts` | <=30s | ⬜ pending |
| 25-02-02 | 02 | 1 | SYNC-04, SYNC-05 | T-25-03 | refresh 网络失败保留当前 snapshot；401 仍走现有 unauthorized 语义 | web store/app + typecheck | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/App.spec.ts && pnpm --filter @trip-map/web typecheck` | <=30s | ⬜ pending |
| 25-03-01 | 03 | 2 | SYNC-03, SYNC-05 | T-25-04 | 取消点亮普通失败会 warning，stale delete 不会把 UI 回滚成旧状态 | web store | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts` | <=30s | ⬜ pending |
| 25-03-02 | 03 | 2 | SYNC-05 | T-25-05 | 点亮/取消点亮/refresh 的成功、普通失败、需重新登录提示可区分 | web store/component + typecheck | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts src/App.spec.ts && pnpm --filter @trip-map/web typecheck` | <=30s | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/server/test/records-sync.e2e-spec.ts` — 新建 multi-session sync 语义回归
- [ ] `apps/web/src/stores/auth-session.spec.ts` — 新增 same-user refresh / foreground sync 覆盖
- [ ] `apps/web/src/App.spec.ts` — 新增 foreground refresh trigger 覆盖
- [ ] `apps/web/src/stores/map-points.spec.ts` — 新增 unilluminate 失败提示与 stale delete 收敛覆盖
- [ ] 现有 `LeafletMapStage.spec.ts` 继续承接 notice / popup surface 行为断言

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 设备 A 取消点亮后，设备 B 回到前台或刷新后看到相同未点亮状态 | SYNC-03, SYNC-04 | 需要真实双设备/双窗口链路确认最终一致 | 准备同账号双窗口，A 取消点亮后切到 B，执行刷新或前台回归，确认地点不再显示为已点亮 |
| 点亮成功、取消成功、普通失败、需要重新登录的提示语义可直观看出差别 | SYNC-05 | 需要真实 notice 节奏与交互感知 | 分别模拟成功、断网和 session 失效，确认文案与 tone 不混淆 |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command or Wave 0 dependency
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 gaps are explicit and actionable
- [x] No watch-mode flags
- [x] Feedback latency target <= 30 seconds for nearest-neighbor checks
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
