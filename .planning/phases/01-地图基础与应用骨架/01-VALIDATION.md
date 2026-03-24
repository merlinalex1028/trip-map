---
phase: 01
slug: 地图基础与应用骨架
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 01 Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Vue Test Utils |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/App.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/PointPreviewDrawer.spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run the relevant targeted spec command
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Phase 1 UI shell, marker, and drawer specs must stay green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | MAP-01 | component | `pnpm test -- src/App.spec.ts` | ✅ yes | ✅ green |
| 01-02-01 | 02 | 1 | MAP-02 | component | `pnpm test -- src/components/SeedMarkerLayer.spec.ts` | ✅ yes | ✅ green |
| 01-02-02 | 02 | 1 | DAT-01 | component | `pnpm test -- src/App.spec.ts` | ✅ yes | ✅ green |
| 01-03-01 | 03 | 1 | DRW-01 | component | `pnpm test -- src/components/PointPreviewDrawer.spec.ts` | ✅ yes | ✅ green |
| 01-03-02 | 03 | 1 | DRW-02 | component | `pnpm test -- src/components/PointPreviewDrawer.spec.ts` | ✅ yes | ✅ green |

*Status: ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/App.spec.ts` 覆盖应用壳层、地图舞台挂载以及 seed/localStorage 读取基线
- [x] `src/components/SeedMarkerLayer.spec.ts` 覆盖点位渲染、层级高亮与标签显隐语义
- [x] `src/components/PointPreviewDrawer.spec.ts` 覆盖桌面/移动抽屉、关闭行为与基础可访问性

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 海报式世界地图首屏观感与视觉层级 | MAP-01 | 版式、氛围和海报感不适合完全用 DOM 断言替代 | 打开首页，确认标题区、地图区和抽屉关闭时的主视觉保持稳定 |
| 桌面右侧抽屉与移动端底部抽屉的空间观感 | DRW-01, DRW-02 | 响应式空间占比与触感节奏需要人工判断 | 在桌面与窄屏视口各点击一个点位，确认抽屉方向与布局符合 Phase 1 约定 |

---

## Validation Sign-Off

- [x] All tasks have automated verification coverage
- [x] Sampling continuity maintained across the phase
- [x] Wave 0 references are backed by real spec files
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
