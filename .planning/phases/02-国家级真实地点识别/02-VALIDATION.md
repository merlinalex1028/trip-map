---
phase: 02
slug: 国家级真实地点识别
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Vue Test Utils |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | GEO-01 | unit | `pnpm test -- src/services/map-projection.spec.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | GEO-01 | component | `pnpm test -- src/components/WorldMapStage.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | GEO-02 | unit | `pnpm test -- src/services/geo-lookup.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | GEO-03 | component | `pnpm test -- src/components/WorldMapStage.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/map-projection.spec.ts` — 覆盖投影正反算、边界 clamp 与无效点返回
- [ ] `src/services/geo-lookup.spec.ts` — 覆盖国家命中、海洋无效、特殊地区口径
- [ ] `src/components/WorldMapStage.spec.ts` — 覆盖点击反馈、toast、无效不创建与成功预览

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 海报风地图在替换为地理一致底图后仍保持主视觉稳定 | GEO-01 | 视觉比例与质感难以完全自动断言 | 启动页面，检查替换后的底图仍保持地图主舞台视觉，不被识别反馈 UI 破坏 |
| 连续点击无效区域时提示语气仍保持温和、不压屏 | GEO-03 | 体验语气与节奏需要人工判断 | 连续点海洋或地图边缘，确认 toast 升级但不出现重遮罩或错误残留 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
