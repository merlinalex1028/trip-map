---
phase: 24
slug: session-boundary-local-import
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-14
updated: 2026-04-14
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Web: Vitest + `happy-dom`; Server: Vitest via `apps/server/scripts/vitest-run.mjs` |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/scripts/vitest-run.mjs`, root `package.json` turbo scripts |
| **Quick run command** | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` |
| **Full suite command** | `pnpm typecheck && pnpm test` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run the nearest-neighbor command mapped to that task.
- **After every plan:** Run the plan's `<verification>` package-level tests or typecheck.
- **After every wave:** Run `pnpm typecheck && pnpm test`.
- **Before `/gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 30 seconds for quick checks.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Runtime Target | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|----------------|--------|
| 24-01-01 | 01 | 1 | MIGR-01, MIGR-03 | T-24-01 | `POST /records/import` 只允许当前 authenticated user 导入 legacy records | server e2e | `cd /Users/huangjingping/i/trip-map && test -f apps/server/test/records-import.e2e-spec.ts && pnpm --filter @trip-map/server test -- test/records-import.e2e-spec.ts` | <=30s | ⬜ pending |
| 24-01-02 | 01 | 1 | MIGR-03 | T-24-02 | import summary 采用 `userId_placeId` 去重并返回 `importedCount` / `mergedDuplicateCount` / `finalCount` | contracts/build + server e2e | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/contracts build && pnpm --filter @trip-map/server test -- test/records-import.e2e-spec.ts && pnpm --filter @trip-map/server typecheck` | <=30s | ⬜ pending |
| 24-02-01 | 02 | 2 | MIGR-01, MIGR-02 | T-24-04 | authenticated bootstrap 后仅在检测到 `trip-map:point-state:v2` 时打开一次性迁移 gate | web store | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/services/legacy-point-storage.spec.ts src/stores/auth-session.spec.ts` | <=30s | ⬜ pending |
| 24-02-02 | 02 | 2 | MIGR-01, MIGR-02 | T-24-05 | cloud-wins 会清理 legacy snapshot；import 成功会用 authoritative records 替换 map snapshot | web store + typecheck | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/services/legacy-point-storage.spec.ts src/stores/auth-session.spec.ts && pnpm --filter @trip-map/web typecheck` | <=30s | ⬜ pending |
| 24-03-01 | 03 | 3 | AUTH-04, MIGR-01, MIGR-02 | T-24-07 | import decision dialog 只展示两条显式路径，不引入第三条 deferred 选择 | web component/app | `cd /Users/huangjingping/i/trip-map && test -f apps/web/src/components/auth/LocalImportDecisionDialog.spec.ts && pnpm --filter @trip-map/web test -- src/components/auth/LocalImportDecisionDialog.spec.ts src/App.spec.ts` | <=30s | ⬜ pending |
| 24-03-02 | 03 | 3 | AUTH-04 | T-24-08 | 匿名保存只打开登录弹层，不直接写 records，且当前 map context 不被清空 | web component/store | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/App.spec.ts && pnpm --filter @trip-map/web typecheck` | <=30s | ⬜ pending |
| 24-04-01 | 04 | 4 | MIGR-04 | T-24-10 | logout / switch-account / unauthorized 都先 reset 边界再切换 snapshot | web store/app | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` | <=30s | ⬜ pending |
| 24-04-02 | 04 | 4 | MIGR-04, AUTH-04 | T-24-11 | 边界切换会给出 `已退出当前账号` / `已切换到 ...` notice，且顶栏身份与 map records 同步 | web app + typecheck | `cd /Users/huangjingping/i/trip-map && rg -n "已退出当前账号|已切换到" apps/web/src/stores/auth-session.ts apps/web/src/App.spec.ts && pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts && pnpm --filter @trip-map/web typecheck` | <=30s | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/server/test/records-import.e2e-spec.ts` — lock MIGR-03 import de-duplication and summary behavior
- [ ] `apps/web/src/services/legacy-point-storage.spec.ts` — lock `trip-map:point-state:v2` parsing / clear semantics
- [ ] `apps/web/src/stores/auth-session.spec.ts` — add legacy snapshot detect / import gate / cloud-wins / switch-account coverage
- [ ] `apps/web/src/components/auth/LocalImportDecisionDialog.spec.ts` — add explicit two-path decision UI coverage
- [ ] `apps/web/src/App.spec.ts` — add import dialog mount, summary notice, logout/switch-account notice coverage
- [ ] Existing infrastructure covers package-level typecheck/build commands once the missing specs above are added

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 匿名状态点击点亮后打开登录弹层，但地图中心、当前 popup/识别结果与背景舞台不跳变 | AUTH-04 | 需要真实浏览器确认 map context continuity、弹层遮罩和视觉节奏 | 启动应用，在匿名状态点地图并尝试保存；确认 `AuthDialog` 打开后地图仍停留在原位置，当前识别内容没有被清空 |
| 首次登录且存在本地旧记录时，导入选择弹层只出现一次，结果摘要文案准确 | MIGR-01, MIGR-02, MIGR-03 | 涉及 cookie、`localStorage` 与真实 UI copy/notice | 预置 `trip-map:point-state:v2` 后登录，分别走“导入本地记录到账号”和“以当前账号云端记录为准”两条路径，确认摘要与后续刷新行为 |
| 退出登录或切换账号后，上一账号点亮结果立即清空并切到当前会话记录 | MIGR-04 | 需要真实账号切换链路确认没有短暂串号 | 准备两个账号分别拥有不同地点，登录 A 后切到 B，再退出到匿名态，观察点亮状态和 notice 是否符合预期 |

---

## Validation Sign-Off

- [x] All tasks have an automated verify command or Wave 0 dependency
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 gaps are explicit and actionable
- [x] No watch-mode flags
- [x] Feedback latency target <= 30 seconds for nearest-neighbor checks
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
