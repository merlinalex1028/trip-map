---
phase: 12
slug: canonical
status: revised
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-30
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest` |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts/vitest.config.ts` |
| **Quick run command** | `pnpm --dir packages/contracts exec vitest run src/contracts.spec.ts && pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts && pnpm --dir apps/web exec vitest run src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` |
| **Full suite command** | `pnpm test && pnpm typecheck` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run that task's exact `<automated>` command from its plan
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | PLC-01, PLC-02 | contract types | `pnpm --dir packages/contracts exec vitest run src/contracts.spec.ts` | ✅ extend | ⬜ pending |
| 12-01-02 | 01 | 1 | PLC-04, UIX-04 | fixtures + contract assertions | `pnpm --dir packages/contracts exec vitest run src/contracts.spec.ts` | ✅ extend | ⬜ pending |
| 12-02-01 | 02 | 2 | ARC-02, PLC-01, PLC-04 | server module + bootstrap e2e | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts` | ❌ create in-task | ⬜ pending |
| 12-02-02 | 02 | 2 | ARC-02, PLC-02, PLC-04 | authoritative resolve e2e | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts` | ✅ extend | ⬜ pending |
| 12-03-01 | 03 | 2 | PLC-03, PLC-05 | store + storage | `pnpm --dir apps/web exec vitest run src/services/point-storage.spec.ts src/stores/map-points.spec.ts` | ✅ extend | ⬜ pending |
| 12-03-02 | 03 | 2 | ARC-02, PLC-03, PLC-05 | component + store integration | `pnpm --dir apps/web exec vitest run src/components/WorldMapStage.spec.ts src/stores/map-points.spec.ts src/services/point-storage.spec.ts` | ✅ extend | ⬜ pending |
| 12-04-01 | 04 | 3 | UIX-04, PLC-05 | component render | `pnpm --dir apps/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ extend | ⬜ pending |
| 12-04-02 | 04 | 3 | UIX-04, PLC-05 | component regression | `pnpm --dir apps/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

无额外 Wave 0 任务。本次修订后每个计划任务都拥有可在该任务内直接运行的 `<automated>` 校验：

- `12-02-01` 先创建 `apps/server/test/canonical-resolve.e2e-spec.ts` 的最小可运行版本，再运行同一文件的 e2e 命令
- 其余 7 个任务全部复用已有或在任务内扩展的 spec，不再存在“先引用、后创建”的缺口

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 中国真实行政称谓在 popup、drawer 与已保存摘要中的可读性 | UIX-04, PLC-05 | 自动化测试可校验字符串存在，但无法完全判断中文层级语义是否“看起来不像城市” | 1. 触发中国直辖市、特别行政区、自治州样例 2. 检查标题旁类型标签与副标题是否分别显示真实类型和上级归属 3. 确认没有任何表面把它们统称为“城市” |
| 歧义候选确认链路的可理解性 | PLC-04, UIX-04 | 自动化可覆盖状态切换，但用户是否清楚“推荐项”和“非唯一命中”仍需人工判断 | 1. 构造 ambiguous resolve fixture 2. 在 popup/drawer 中查看最多 3 个候选的推荐项和提示文案 3. 确认没有出现“系统已确定唯一地点”的误导文案 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** revised and aligned with plans on 2026-03-30
