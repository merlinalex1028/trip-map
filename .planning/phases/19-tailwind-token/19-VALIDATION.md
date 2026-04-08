---
phase: 19
slug: tailwind-token
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-08
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/tailwind-token.spec.ts` |
| **Full suite command** | `pnpm --filter @trip-map/web test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/tailwind-token.spec.ts`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | INFRA-01 | T-19-01, T-19-02 | Tailwind v4 与 `@tailwindcss/vite` 仅安装在 `apps/web`，且 `vite.config.ts` 维持 `plugins: [tailwindcss(), vue()]`，把工具链篡改面压在目标包范围内 | static/unit | `pnpm --filter @trip-map/web exec vitest run src/tailwind-token.spec.ts` | ❌ created in 19-01 | ⬜ pending |
| 19-02-01 | 02 | 2 | INFRA-02, INFRA-03, STYLE-01, STYLE-02 | T-19-03 | `src/style.css` 保持 Tailwind 在前、Leaflet 在后、legacy CSS 作为兼容层的 import hub，`main.ts` 导入 Nunito，`@theme` 暴露 12 个最小 token 与 `--font-sans` | static/unit | `pnpm --filter @trip-map/web exec vitest run src/tailwind-token.spec.ts && pnpm --filter @trip-map/web exec node -e "const pkg=require('./package.json'); const ok=pkg.devDependencies?.['@fontsource-variable/nunito']==='^5.2.7'; process.exit(ok?0:1)"` | ✅ spec from 19-01 | ⬜ pending |
| 19-02-02 | 02 | 2 | STYLE-01, STYLE-02 | T-19-04 | `App.vue` 只迁移壳层级 Tailwind utility，保留 `LeafletMapStage` 主舞台和地图业务逻辑边界，不在地图容器引入 transform/filter 风险类 | unit/component | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/tailwind-token.spec.ts && pnpm --filter @trip-map/web exec vue-tsc --noEmit` | ✅ existing App.spec.ts | ⬜ pending |
| 19-03-01 | 03 | 3 | INFRA-04 | T-19-05 | 最终自动化质量门覆盖静态契约、App shell smoke、typecheck 与生产构建，保证发货前所有已规划 gate 为绿色 | integration/build | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/tailwind-token.spec.ts && pnpm --filter @trip-map/web exec vue-tsc --noEmit && pnpm --filter @trip-map/web build` | ✅ prior plans provide inputs | ⬜ pending |
| 19-03-02 | 03 | 3 | INFRA-04 | T-19-06 | 浏览器冒烟必须输出到 `.planning/phases/19-tailwind-token/19-03-SUMMARY.md`，把 `approved` 或失败清单沉淀为可审计证据 | manual browser smoke | `pnpm --filter @trip-map/web exec vitest run src/App.spec.ts src/tailwind-token.spec.ts && pnpm --filter @trip-map/web exec vue-tsc --noEmit && pnpm --filter @trip-map/web build` | ❌ summary created in 19-03 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/tailwind-token.spec.ts` — 静态校验 `apps/web/package.json`、`vite.config.ts`、`main.ts`、`style.css` 中的 Tailwind / Nunito / Leaflet 顺序与 token 合同
- [ ] `apps/web/src/App.spec.ts` — 扩展或确认壳层 smoke，覆盖奶油白背景、字体基线或最小 Tailwind 壳层输出
- [ ] `.planning/phases/19-tailwind-token/19-03-SUMMARY.md` — 记录浏览器手动冒烟结果，至少确认 Leaflet 缩放按钮、归因链接、图层控件、popup 在 Tailwind preflight 接入后未崩坏

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Leaflet 缩放按钮、归因链接、图层控件视觉与交互稳定 | INFRA-04 | `happy-dom` 不能可靠复现真实浏览器下的第三方 CSS reset 影响 | 启动 `apps/web`，打开地图页面，确认 zoom controls、attribution、layer controls 样式正常，无错位、无被裁切、无按钮失真 |
| 页面背景呈现奶油白而非纯白硬底 | STYLE-01 | 需要确认真实视觉基调与地图首屏的整体观感 | 打开首页，确认根画布与壳层背景位于 `#FAFAFA` / `#FFF5F5` 范围，且不会压暗地图内容 |
| 全站默认字体明显切换为 Nunito Variable | INFRA-03, STYLE-02 | 自动化可校验导入与 token，但不能完全替代真实字形观感判断 | 刷新页面，对比标题栏与正文的英文/数字字形，确认已呈现圆润字体特征，不再落回旧 sans-serif 基线 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
