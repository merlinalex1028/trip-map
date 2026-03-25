---
phase: 07-城市选择与兼容基线
verified: 2026-03-25T08:42:00Z
status: passed
score: "5/5 must-haves verified"
---

# Phase 07: 城市选择与兼容基线 Verification Report

**Phase Goal:** 让城市成为默认优先的记录目标，同时保留明确的候选确认、国家/地区回退与 v1 legacy 数据兼容。
**Verified:** 2026-03-25T08:42:00Z
**Status:** passed
**Re-verification:** Yes - gap closure after UAT diagnosis

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 地图点击后先进入候选确认态，而不是直接生成城市 draft | ✓ VERIFIED | `07-02-SUMMARY.md` 建立 `candidate-select` 方案，`07-04-SUMMARY.md` / `07-05-SUMMARY.md` 把候选数据与消费者扩展到真实可用范围。`src/components/WorldMapStage.spec.ts` 现在同时覆盖 Kyoto、Paris、Budapest 这类点击。 |
| 2 | 候选行会显示城市名、上下文和清晰状态提示，且常见点击不再大面积空列表 | ✓ VERIFIED | `src/services/geo-lookup.ts` 现在从覆盖审计后的离线城市目录产出 top 3 候选。`src/services/geo-lookup.spec.ts` 覆盖 Paris / New York / Budapest / Nairobi / Kyoto 等样例，`src/components/PointPreviewDrawer.spec.ts` 仍覆盖 `已存在记录` 与低置信提示。 |
| 3 | 无可靠城市时，用户能通过明确 CTA 回退到国家/地区继续记录 | ✓ VERIFIED | `src/components/PointPreviewDrawer.vue` 包含精确 CTA `按国家/地区继续记录` 和 explanatory copy `未能可靠确认城市，已提供国家/地区继续记录`。`src/components/PointPreviewDrawer.spec.ts` 与 `src/components/WorldMapStage.spec.ts` 分别覆盖 CTA 与真实 fallback 场景。 |
| 4 | 点击候选与搜索结果都按 `cityId` 统一复用已有记录或创建新 draft | ✓ VERIFIED | `src/stores/map-points.ts` 继续通过 `confirmPendingCitySelection` 统一收口。`src/services/city-search.ts` 返回 `GeoCityCandidate` 形状，`src/components/PointPreviewDrawer.spec.ts` 现在覆盖空候选池下的中文搜索和扩展目录搜索复用已有记录。 |
| 5 | legacy 已保存点位缺失城市身份时仍可正常查看和编辑 | ✓ VERIFIED | `src/services/point-storage.ts` 继续把缺失 `cityId` / `cityContextLabel` 的旧快照归一化为 `null`。`src/App.spec.ts` 明确覆盖 legacy saved point 的查看与编辑路径。 |

**Score:** 5/5 truths verified

## Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `07-01-SUMMARY.md` | 稳定 `cityId`、候选排序与旧快照兼容基线 | ✓ VERIFIED | 为本报告提供数据契约前提。 |
| `07-02-SUMMARY.md` | 候选先行抽屉、回退 CTA 与统一复用实现记录 | ✓ VERIFIED | 记录本 phase UI/交互闭环和最终代码提交。 |
| `07-03-SUMMARY.md` | gap closure：更广离线城市索引与中文/英文搜索 | ✓ VERIFIED | 记录第一次 gap closure 的基础搜索修复。 |
| `07-04-SUMMARY.md` | gap closure：coverage-audited 离线城市目录 | ✓ VERIFIED | 记录 328 城 / 228 国家码的目录扩容与覆盖统计导出。 |
| `07-05-SUMMARY.md` | gap closure：lookup/search/drawer 消费扩展目录 | ✓ VERIFIED | 记录 top 3 候选、保守 fallback 与 UAT 风格回归。 |
| `07-UAT.md` | 对话式验收中暴露的真实问题与诊断结果 | ✓ VERIFIED | 保留为 gap closure 的问题来源与 root cause 证据。 |
| `07-VALIDATION.md` | Nyquist 级验证契约已覆盖 07-05 | ✓ VERIFIED | 已更新为 9 个任务全部 green，并纳入 coverage stats / sparse-country regression。 |

## Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `07-01-SUMMARY.md` | `src/stores/map-points.ts` | stable `cityId` -> reuse helper -> pending selection | WIRED | wave 1 的 `findSavedPointByCityId` 直接被 wave 2 的候选确认逻辑复用。 |
| `src/services/geo-lookup.ts` | `src/components/WorldMapStage.vue` | broader offline index -> candidate-select drawer | WIRED | 点击地图后带入的 `cityCandidates` 现在来自扩展目录，且只暴露 top 3 给 UI。 |
| `src/components/PointPreviewDrawer.vue` | `src/services/city-search.ts` | query -> offline search -> candidate items | WIRED | 搜索查询存在时，抽屉改为走离线索引检索，而不是只过滤当前候选池。 |
| `src/components/PointPreviewDrawer.vue` | `src/stores/map-points.ts` | candidate/search/fallback -> same action path | WIRED | 默认候选和搜索结果都继续调用 `confirmPendingCitySelection`，fallback 走 `continuePendingWithFallback`。 |
| `src/stores/map-points.ts` | `src/App.vue` | reuse notice / drawer-open layout | WIRED | 复用提示经 `map-ui` 冒到 app notice，候选态也会触发 drawer-open 布局。 |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| 候选确认、中文搜索与非 demo 点击回归 | `pnpm test -- src/services/geo-lookup.spec.ts src/services/city-search.spec.ts src/components/PointPreviewDrawer.spec.ts src/components/WorldMapStage.spec.ts` | 通过；Paris / New York / Budapest / Nairobi / 中文搜索 / 空候选池救援全部 green | ✓ PASS |
| 覆盖规模与关键国家目录审计 | `pnpm test -- src/data/geo/city-candidates.spec.ts` | 通过；328 城、228 国家码、关键国家多城市分布全部 green | ✓ PASS |
| `cityId` 统一复用与 fallback 收口 | `pnpm test -- src/stores/map-points.spec.ts src/components/PointPreviewDrawer.spec.ts src/App.spec.ts` | 通过；reuse/new draft/fallback 与 legacy 路径全部 green | ✓ PASS |
| Phase 7 构建级类型与产物验证 | `pnpm build` | 通过；存在 Vite chunk size warning，但不影响 phase correctness | ✓ PASS |

## Requirements Coverage

| Requirement | Description | Status | Evidence |
| --- | --- | --- | --- |
| `DEST-01` | 城市成为主选择目标并保持稳定身份 | ✓ SATISFIED | `07-01-SUMMARY.md` + `src/components/WorldMapStage.spec.ts` + `src/stores/map-points.spec.ts`。 |
| `DEST-02` | 候选与搜索入口帮助用户确认目标城市 | ✓ SATISFIED | `src/components/PointPreviewDrawer.vue` / `.spec.ts` + `src/services/city-search.ts` / `.spec.ts` 覆盖候选列表、扩展目录中文/英文搜索与空候选池救援。 |
| `DEST-03` | 无可靠城市时回退到国家/地区继续记录 | ✓ SATISFIED | `src/components/PointPreviewDrawer.spec.ts` 与 `src/components/WorldMapStage.spec.ts` 覆盖 CTA 和 explanatory copy。 |
| `DEST-04` | 候选显示上下文并支持轻确认 | ✓ SATISFIED | `src/services/geo-lookup.spec.ts` 与 `src/components/WorldMapStage.spec.ts` 现在覆盖 Kyoto 之外的 Paris / New York / Budapest / Nairobi 候选上下文。 |
| `DEST-05` | 已记录城市通过 `cityId` 直接复用 | ✓ SATISFIED | `src/stores/map-points.ts` + `src/stores/map-points.spec.ts` + `src/components/PointPreviewDrawer.spec.ts` + `src/components/WorldMapStage.spec.ts`。 |
| `DAT-05` | v1 旧点位继续可读可编辑，不强制迁移 | ✓ SATISFIED | `src/services/point-storage.ts` 的兼容归一化与 `src/App.spec.ts` legacy case。 |

## Residual Notes

- `07-UAT.md` 仍保留了问题被发现时的原始诊断记录；代码层 gap closure 已实现，但如果要把对话式验收记录一并转绿，建议在下一步再跑一次 `$gsd-verify-work 7` 做简短复验。
- `geo-lookup` 构建产物仍然很大，`pnpm build` 会给出 chunk size warning。它不阻塞 Phase 7 验收，但在 Phase 8/10 若继续增加地理数据，建议评估更细的动态拆分。

---

_Verified: 2026-03-25T08:42:00Z_
_Verifier: Codex inline execution_
