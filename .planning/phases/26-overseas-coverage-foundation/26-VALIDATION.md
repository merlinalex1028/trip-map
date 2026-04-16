---
phase: 26
slug: overseas-coverage-foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-16
---

# Phase 26 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest 4.1.3` via workspace commands |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test apps/web/src/components/LeafletMapStage.spec.ts` or `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run the smallest affected command from:
  - `pnpm --filter @trip-map/web test apps/web/src/components/LeafletMapStage.spec.ts`
  - `pnpm --filter @trip-map/web test apps/web/src/components/map-popup/PointSummaryCard.spec.ts`
  - `pnpm --filter @trip-map/web test apps/web/src/stores/map-points.spec.ts`
  - `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts`
  - `pnpm --filter @trip-map/server test test/auth-bootstrap.e2e-spec.ts`
  - `pnpm --filter @trip-map/server test test/records-sync.e2e-spec.ts`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test` and `pnpm --filter @trip-map/server test`
- **Before `/gsd-verify-work`:** `pnpm test` and `pnpm typecheck` must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 1 | OVRS-01 | T-26-01 / — | 仅锁定的 8 国 admin1 能进入 authoritative supported catalog；`geo:build:check` 与 support catalog/manifest 检查能证明过滤在 build 产物阶段已生效 | unit / build | `pnpm --filter @trip-map/web run geo:build:check` | ✅ | ⬜ pending |
| 26-01-02 | 01 | 1 | OVRS-01 | T-26-01 / — | `SG / AE / AU` 等异常源数据经过国家级 allowlist / override 后，返回结果符合产品支持面 | unit | `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` | ✅ | ⬜ pending |
| 26-02-01 | 02 | 2 | OVRS-02 | T-26-02 / T-26-07 | `/records` 对 overseas payload 走 authoritative support + metadata 校验，且 backfill 证明 lookup 来自 manifest/support catalog | e2e / script | `pnpm --filter @trip-map/server test test/records-travel.e2e-spec.ts` | ✅ | ⬜ pending |
| 26-02-02 | 02 | 2 | OVRS-02 | T-26-02 / — | 海外记录写入后通过 `/auth/bootstrap`、multi-session `/records` 回放与 popup store 消费时，`displayName` / `typeLabel` / `subtitle` 完整一致 | e2e / unit | `pnpm --filter @trip-map/server test test/auth-bootstrap.e2e-spec.ts && pnpm --filter @trip-map/server test test/records-sync.e2e-spec.ts && pnpm --filter @trip-map/web test apps/web/src/stores/map-points.spec.ts` | ✅ | ⬜ pending |
| 26-03-01 | 03 | 2 | OVRS-03 | T-26-03 / — | unsupported 海外区域仅在 popup 内解释，不由全局 `interactionNotice` 主导 | component | `pnpm --filter @trip-map/web test apps/web/src/components/LeafletMapStage.spec.ts` | ✅ | ⬜ pending |
| 26-03-02 | 03 | 2 | OVRS-03 | T-26-03 / T-26-06 | `candidate-select` 只在 `ambiguous` 时出现，单一明确命中不强制二次确认，且 disabled CTA 契约继续成立 | component | `pnpm --filter @trip-map/web test apps/web/src/components/LeafletMapStage.spec.ts && pnpm --filter @trip-map/web test apps/web/src/components/map-popup/PointSummaryCard.spec.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/server/test/canonical-resolve.e2e-spec.ts` — 新增 priority-country support catalog 覆盖，锁定 `JP / KR / TH / SG / MY / AE / AU / US`
- [x] `apps/server/test/canonical-resolve.e2e-spec.ts` — 增加至少一个非 California 的真实海外 admin1 命中样例
- [x] `apps/web/src/components/LeafletMapStage.spec.ts` — 断言 unsupported 解释停留在 popup，而不是 `interactionNotice`
- [x] `apps/server/test/records-travel.e2e-spec.ts` 或等价脚本验证 — 若本 phase 引入 metadata backfill，需证明 lookup 来源于 manifest/support catalog，而非旧 fixture

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 首批国家真实点击体验在地图主舞台中是否“像一个真实能用的覆盖包” | OVRS-01 | 需要人工判断 popup 信息密度、候选确认节奏与视觉理解成本 | 在本地依次点击 `JP / KR / TH / SG / MY / AE / AU / US` 的至少一个支持 admin1，确认能识别、展示英文主标题、中文类型标签并正常点亮 |
| unsupported 海外区域的解释是否足够清楚但不过度打扰 | OVRS-03 | 需要人工判断 popup 文案是否清楚、notice 是否未误走全局 | 点击一个明确不在首批支持范围内的 overseas 区域，确认 popup 内出现 unsupported 说明且页面未弹全局 `interactionNotice` |
| 已保存海外记录跨刷新/重开/跨设备后的产品感知是否一致 | OVRS-02 | 自动化可验证文本一致，但真实体验仍需看 UI 回放是否顺畅 | 在支持国家点亮后刷新页面、重开应用并在第二个会话中登录同账号，确认标题、type pill、副标题与保存时一致 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready for planning verification
