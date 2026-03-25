---
phase: 07-城市选择与兼容基线
verified: 2026-03-25T05:31:24Z
status: passed
score: "5/5 must-haves verified"
---

# Phase 07: 城市选择与兼容基线 Verification Report

**Phase Goal:** 让城市成为默认优先的记录目标，同时保留明确的候选确认、国家/地区回退与 v1 legacy 数据兼容。
**Verified:** 2026-03-25T05:31:24Z
**Status:** passed
**Re-verification:** No - inline after wave completion

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 地图点击后先进入候选确认态，而不是直接生成城市 draft | ✓ VERIFIED | `07-02-SUMMARY.md` 记录 `candidate-select` 方案。`src/components/WorldMapStage.spec.ts` 覆盖点击后进入候选态，`src/components/PointPreviewDrawer.spec.ts` 覆盖默认最多 3 个候选与 `搜索城市` 输入。 |
| 2 | 候选行会显示城市名、上下文和清晰状态提示 | ✓ VERIFIED | `src/components/PointPreviewDrawer.vue` 渲染 `cityName`、`contextLabel` 和 `更接近点击位置` / `可能位置，需要确认` / `已存在记录`。`src/components/PointPreviewDrawer.spec.ts` 覆盖 `已存在记录` 与低置信提示。 |
| 3 | 无可靠城市时，用户能通过明确 CTA 回退到国家/地区继续记录 | ✓ VERIFIED | `src/components/PointPreviewDrawer.vue` 包含精确 CTA `按国家/地区继续记录` 和 explanatory copy `未能可靠确认城市，已提供国家/地区继续记录`。`src/components/PointPreviewDrawer.spec.ts` 与 `src/components/WorldMapStage.spec.ts` 分别覆盖 CTA 与真实 fallback 场景。 |
| 4 | 点击候选与搜索结果都按 `cityId` 统一复用已有记录或创建新 draft | ✓ VERIFIED | `src/stores/map-points.ts` 通过 `confirmPendingCitySelection` 统一收口。`src/stores/map-points.spec.ts` 覆盖 reuse/new draft/fallback 三条路径，`src/components/WorldMapStage.spec.ts` 覆盖 `已打开你记录过的` 提示前缀。 |
| 5 | legacy 已保存点位缺失城市身份时仍可正常查看和编辑 | ✓ VERIFIED | `src/services/point-storage.ts` 继续把缺失 `cityId` / `cityContextLabel` 的旧快照归一化为 `null`。`src/App.spec.ts` 明确覆盖 legacy saved point 的查看与编辑路径。 |

**Score:** 5/5 truths verified

## Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `07-01-SUMMARY.md` | 稳定 `cityId`、候选排序与旧快照兼容基线 | ✓ VERIFIED | 为本报告提供数据契约前提。 |
| `07-02-SUMMARY.md` | 候选先行抽屉、回退 CTA 与统一复用实现记录 | ✓ VERIFIED | 记录本 phase UI/交互闭环和最终代码提交。 |
| `07-VALIDATION.md` | Nyquist 级验证契约已转绿 | ✓ VERIFIED | 已更新为 `approved / true / true`，任务状态全部 green。 |

## Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `07-01-SUMMARY.md` | `src/stores/map-points.ts` | stable `cityId` -> reuse helper -> pending selection | WIRED | wave 1 的 `findSavedPointByCityId` 直接被 wave 2 的候选确认逻辑复用。 |
| `src/components/WorldMapStage.vue` | `src/components/PointPreviewDrawer.vue` | click detection -> candidate-select drawer | WIRED | 点击地图后只写入 pending selection，抽屉消费同一份候选与 fallback 数据。 |
| `src/components/PointPreviewDrawer.vue` | `src/stores/map-points.ts` | candidate/search/fallback -> same action path | WIRED | 候选按钮与搜索筛选结果都走 `confirmPendingCitySelection`，fallback 走 `continuePendingWithFallback`。 |
| `src/stores/map-points.ts` | `src/App.vue` | reuse notice / drawer-open layout | WIRED | 复用提示经 `map-ui` 冒到 app notice，候选态也会触发 drawer-open 布局。 |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| 候选确认、回退 CTA 与 legacy 路径回归 | `pnpm test -- src/components/WorldMapStage.spec.ts src/components/PointPreviewDrawer.spec.ts src/App.spec.ts` | 通过；组件、抽屉与 app 壳层相关用例全部 green | ✓ PASS |
| `cityId` 统一复用与 fallback 收口 | `pnpm test -- src/stores/map-points.spec.ts` | 通过；reuse/new draft/fallback 三条 store 路径全部 green | ✓ PASS |
| Phase 7 构建级类型与产物验证 | `pnpm build` | 通过；存在 Vite chunk size warning，但不影响 phase correctness | ✓ PASS |

## Requirements Coverage

| Requirement | Description | Status | Evidence |
| --- | --- | --- | --- |
| `DEST-01` | 城市成为主选择目标并保持稳定身份 | ✓ SATISFIED | `07-01-SUMMARY.md` + `src/components/WorldMapStage.spec.ts` + `src/stores/map-points.spec.ts`。 |
| `DEST-02` | 候选与搜索入口帮助用户确认目标城市 | ✓ SATISFIED | `src/components/PointPreviewDrawer.vue` / `.spec.ts` 覆盖候选列表和 `搜索城市`。 |
| `DEST-03` | 无可靠城市时回退到国家/地区继续记录 | ✓ SATISFIED | `src/components/PointPreviewDrawer.spec.ts` 与 `src/components/WorldMapStage.spec.ts` 覆盖 CTA 和 explanatory copy。 |
| `DEST-04` | 候选显示上下文并支持轻确认 | ✓ SATISFIED | `src/components/PointPreviewDrawer.vue` 渲染上下文与状态提示，spec 覆盖最多 3 候选与提示文本。 |
| `DEST-05` | 已记录城市通过 `cityId` 直接复用 | ✓ SATISFIED | `src/stores/map-points.ts` + `src/stores/map-points.spec.ts` + `src/components/WorldMapStage.spec.ts`。 |
| `DAT-05` | v1 旧点位继续可读可编辑，不强制迁移 | ✓ SATISFIED | `src/services/point-storage.ts` 的兼容归一化与 `src/App.spec.ts` legacy case。 |

## Residual Notes

- `geo-lookup` 构建产物仍然很大，`pnpm build` 会给出 chunk size warning。它不阻塞 Phase 7 验收，但在 Phase 8/10 若继续增加地理数据，建议评估更细的动态拆分。

---

_Verified: 2026-03-25T05:31:24Z_
_Verifier: Codex inline execution_
