---
phase: 22
slug: v4-kawaii-audit-closure
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-09
---

# Phase 22 — Validation Strategy

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

- **After every task commit:** Run `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts`
- **After every plan wave:** If the wave only updates docs, keep using the quick run above; if the quick run conflicts with existing evidence, escalate to `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/App.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts src/components/map-popup/PointSummaryCard.spec.ts && pnpm --filter @trip-map/web typecheck`
- **Before `/gsd-verify-work`:** `20-VERIFICATION.md` and the updated `v4.0-v4.0-MILESTONE-AUDIT.md` must agree with the underlying summaries / validation sources, and the quick run must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 22-01 | 1 | STYLE-03, STYLE-04, STYLE-05, INTER-01, INTER-02, INTER-03 | T-22-01 | `20-VERIFICATION.md` 只从 `20-VALIDATION.md`、`20-01/02/03/04-SUMMARY.md` 与现有 kawaii specs 回填 requirement coverage，不发明新的 UI 行为或人工结论 | docs + unit | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts src/components/map-popup/MapContextPopup.kawaii.spec.ts src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ✅ `apps/web/src/App.kawaii.spec.ts`, `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts`, `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` | ⬜ pending |
| 22-01-02 | 22-01 | 1 | STYLE-03, STYLE-04, STYLE-05, INTER-01, INTER-02, INTER-03 | T-22-02 | `20-VERIFICATION.md` 的 evidence rows 必须逐条回链到真实 summary / validation / spec，不把旧 `drawer` wording 或未挂载组件写回范围 | docs + rg | `rg -n "STYLE-03|STYLE-04|STYLE-05|INTER-01|INTER-02|INTER-03|20-VALIDATION.md|20-01-SUMMARY.md|20-02-SUMMARY.md|20-03-SUMMARY.md|20-04-SUMMARY.md" .planning/phases/20-kawaii/20-VERIFICATION.md` | ✅ `.planning/phases/20-kawaii/20-VALIDATION.md` | ⬜ pending |
| 22-02-01 | 22-02 | 2 | STYLE-03, STYLE-04, STYLE-05, INTER-01, INTER-02, INTER-03 | T-22-03 | `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` 必须原位更新为 re-audit 结论，并把 Phase 20 六项 requirement 从 `orphaned` 重算为有 verification source 的 satisfied 候选 | docs + rg | `rg -n "STYLE-03|STYLE-04|STYLE-05|INTER-01|INTER-02|INTER-03|20-VERIFICATION.md|satisfied|passed" .planning/v4.0-v4.0-MILESTONE-AUDIT.md` | ✅ `.planning/v4.0-v4.0-MILESTONE-AUDIT.md` | ⬜ pending |
| 22-02-02 | 22-02 | 2 | STYLE-03, STYLE-04, STYLE-05, INTER-01, INTER-02, INTER-03 | T-22-04 | 如 planner 选择同步 tracking，`REQUIREMENTS.md` / `ROADMAP.md` 只能做 phase closure 相关元数据更新，不得扩展产品 scope | docs + rg | `rg -n "STYLE-03|STYLE-04|STYLE-05|INTER-01|INTER-02|INTER-03|Phase 22" .planning/REQUIREMENTS.md .planning/ROADMAP.md` | ✅ `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/web/src/App.kawaii.spec.ts` — 已覆盖 thin shell / roomy spacing 的 STYLE-05 合同
- [x] `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` — 已覆盖 popup light shell / outer chrome 的 STYLE-04 合同
- [x] `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` — 已覆盖 cloud card、pill hierarchy 与 motion family，对应 STYLE-03/04/05、INTER-01/02/03

---

## Manual-Only Verifications

All phase behaviors have automated verification or document cross-checks. 仅当 quick run 与现有 approved evidence 冲突时，才升级为新的人工浏览器复验。

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
