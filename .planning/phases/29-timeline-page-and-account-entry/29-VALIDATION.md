---
phase: 29
slug: timeline-page-and-account-entry
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-23
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts src/components/auth/AuthTopbarControl.spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web typecheck` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts src/App.spec.ts src/views/TimelinePageView.spec.ts src/components/auth/AuthTopbarControl.spec.ts`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 29-01-01 | 01 | 1 | TRIP-04 | — | route setup keeps timeline in same-tab SPA shell and never exposes stale map-only fallback | typecheck | `pnpm --filter @trip-map/web typecheck` | ✅ | ✅ green |
| 29-01-02 | 01 | 1 | TRIP-04 | — | authenticated menu shows timeline CTA and navigation closes menu before route change | component | `pnpm --filter @trip-map/web test -- src/components/auth/AuthTopbarControl.spec.ts` | ✅ | ✅ green |
| 29-02-01 | 02 | 1 | TRIP-05 | — | timeline entries preserve one record per trip and never collapse multi-visit data into one place row | unit | `pnpm --filter @trip-map/web test -- src/services/timeline.spec.ts src/stores/map-points.spec.ts` | ✅ | ✅ green |
| 29-03-01 | 03 | 2 | TRIP-05 | — | timeline page renders authenticated list, anonymous CTA, and empty/restoring states without leaking map-stage-only assumptions | component | `pnpm --filter @trip-map/web test -- src/views/TimelinePageView.spec.ts` | ✅ | ✅ green |
| 29-04-01 | 04 | 3 | TRIP-04, TRIP-05 | — | route, menu, and timeline ordering stay correct end-to-end across map and timeline pages | integration | `pnpm --filter @trip-map/web test -- src/App.spec.ts src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/services/timeline.spec.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/web/src/components/auth/AuthTopbarControl.spec.ts` — 锁定时间轴菜单入口显隐和导航（29-04-SUMMARY: commit 0be15f8）
- [x] `apps/web/src/views/TimelinePageView.spec.ts` — 锁定时间轴页状态与列表渲染（29-04-SUMMARY: commit 6badc58）
- [x] `apps/web/src/services/timeline.spec.ts` — 锁定排序与多次去访拆分（29-02-SUMMARY: commit 15b8e84）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 已登录用户从真实顶栏用户名菜单进入时间轴 | TRIP-04 | happy-dom 很难完整复现真实 fixed 顶栏、外部点击关闭与视觉间距联动 | 登录后打开顶栏菜单，点击“时间轴”，确认地址为 `#/timeline` 且页面仍保留全局顶栏。 |
| 时间轴页不是地图内联模块 | TRIP-04 | 这是页面级体验判断，不只是 DOM 是否存在某个组件名 | 进入 `#/timeline` 后确认主内容区展示时间轴卡片，不出现地图交互舞台。 |
| 已知日期与未知日期的真实阅读顺序 | TRIP-05 | 需要肉眼确认“最早优先”与“未知日期后置”的阅读体验清晰 | 准备既有日期又有未知日期的账号数据，进入时间轴页，检查顺序与标签文案。 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-28
