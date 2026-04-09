---
phase: 20
slug: kawaii
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-09
updated: 2026-04-09
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/App.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts && pnpm --filter @trip-map/web typecheck` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every 20-01 task commit:** Run `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/App.spec.ts && pnpm --filter @trip-map/web typecheck`
- **After every 20-02 task commit:** Run `pnpm --filter @trip-map/web test -- src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts && pnpm --filter @trip-map/web typecheck`
- **After every 20-03 task commit:** Run `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts && pnpm --filter @trip-map/web typecheck`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/App.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts && pnpm --filter @trip-map/web typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 20-01 | 1 | STYLE-05 | T-20-01, T-20-02 | App shell 保持 thin topbar、pill notice、roomy map shell，且 notice 继续使用纯文本插值、地图宿主不承接 transform/filter | unit + typecheck | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/App.spec.ts && pnpm --filter @trip-map/web typecheck` | ✅ `apps/web/src/App.kawaii.spec.ts` | ✅ pass |
| 20-02-01 | 20-02 | 1 | STYLE-04 | T-20-03, T-20-04 | Popup outer shell 退回 light shell，arrow 保持 `pointer-events-none`，`PointSummaryCard` 继续作为内层主表面 | unit + typecheck | `pnpm --filter @trip-map/web test -- src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts && pnpm --filter @trip-map/web typecheck` | ✅ `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` | ✅ pass |
| 20-03-01 | 20-03 | 1 | STYLE-03, STYLE-04, STYLE-05 | T-20-05, T-20-06 | Inner cloud card、badge/type pill/CTA 层级和宽松 spacing 在 `PointSummaryCard` 内部锁定，文本 surface 保持安全插值 | unit + typecheck | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts && pnpm --filter @trip-map/web typecheck` | ✅ `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ pass |
| 20-03-02 | 20-03 | 1 | INTER-01, INTER-02, INTER-03 | T-20-07 | Cloud root、primary CTA、secondary CTA 统一到 `duration-300 ease-out` 家族，并在 reduced-motion 下移除 scale/translate | unit + typecheck | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts && pnpm --filter @trip-map/web typecheck` | ✅ `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ pass |

*Status: ✅ pass · ❌ fail · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/web/src/App.kawaii.spec.ts` — STYLE-05 shell spacing / notice / map-host contracts 已存在并通过
- [x] `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` — STYLE-04 light shell / arrow pointer-safety contracts 已存在并通过
- [x] `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` — STYLE-03 / STYLE-04 / STYLE-05 / INTER-01 / INTER-02 / INTER-03 contracts 已存在并通过

---

## Automated Evidence

- `2026-04-09`: `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/App.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` → `6 passed (30 tests)`
- `2026-04-09`: `pnpm --filter @trip-map/web typecheck` → pass
- `2026-04-09`: 手工验收发现两个额外问题并回流修复：长城市名会挤压 type pill / primary CTA；web-only dev 环境下 records bootstrap 缺少明确 warning notice

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hover / active motion feels airy rather than jittery on real popup placement | INTER-01, INTER-02, INTER-03 | Automated tests can assert classes, but not real pointer feel against anchored popup positioning | Start the full dev environment with `pnpm dev`, open a popup from the map, hover primary CTA, secondary CTA, and inner cloud card; confirm lift is subtle and popup anchor does not drift |
| Topbar sweetness increases without reclaiming first-screen map height | STYLE-05 | Visual density and first-screen balance depend on actual viewport rendering | In the same `pnpm dev` session, compare homepage before/after on desktop width, confirm header stays at `h-14 md:h-16` and map remains the main first-screen surface |
| Long city names remain readable beside type pill and primary CTA | STYLE-03, STYLE-05 | Layout overlap risk only appears with realistic long labels and actual popup width | Open a popup for a long-name place (for example `Phongsaly`-style label), confirm the title wraps/shrinks without being covered by the type pill or `点亮` button |
| Records bootstrap degrades with an explicit warning when backend is absent | INFRA-04 | Network errors are visible in browser runtime, not only in unit tests | If testing web-only mode, run `pnpm dev:web` without `pnpm dev:server`; confirm the app shows a warning notice telling the developer to start `pnpm dev` or `pnpm dev:server` |

---

## Validation Sign-Off

- [x] All automated task verifies are green and mapped to real plan/task/requirement/threat pairs
- [x] Sampling continuity updated to match `20-01`, `20-02`, `20-03` real commands
- [x] Wave 0 covers App shell, popup outer shell, and point-summary cloud card contracts
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] Manual browser verification completed
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending manual browser verification
