---
phase: 13
slug: 行政区数据与几何交付
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-31
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test src/services/city-boundaries.spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test src/services/city-boundaries.spec.ts` or the newly added targeted geometry spec for that task
- **After every plan wave:** Run `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` and `pnpm --filter @trip-map/contracts test`
- **Before `$gsd-verify-work`:** Full suite must be green via `pnpm test` and `pnpm typecheck`
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | GEOX-03 | unit | `pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | GEOX-04 | unit | `pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 1 | GEOX-06 | contracts | `pnpm --filter @trip-map/contracts test` | ✅ | ⬜ pending |
| 13-02-02 | 02 | 1 | API-03 | e2e | `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` | ✅ | ⬜ pending |
| 13-03-01 | 03 | 2 | GEOX-05 | unit | `pnpm --filter @trip-map/web test src/services/geometry-loader.spec.ts` | ❌ W0 | ⬜ pending |
| 13-03-02 | 03 | 2 | GEOX-07 | integration | `pnpm --filter @trip-map/web test src/services/geometry-validation.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/services/geometry-manifest.spec.ts` — source catalog、分片 manifest 与映射关系断言，覆盖 `GEOX-03` / `GEOX-04` / `GEOX-06`
- [ ] `apps/web/src/services/geometry-loader.spec.ts` — `CN` / `OVERSEAS` 分层加载与禁止合并总包断言，覆盖 `GEOX-05`
- [ ] `apps/web/src/services/geometry-validation.spec.ts` — 北京、香港、California 代表性坐标 / bounds / anchor 验点，覆盖 `GEOX-07`
- [ ] `packages/contracts/src/contracts.spec.ts` 扩展 `geometryRef` 类型与字段断言，覆盖 `API-03` / `GEOX-06`
- [ ] `apps/server/test/canonical-resolve.e2e-spec.ts` 扩展 `geometryRef` 响应断言，覆盖 `API-03`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 中国 GeoAtlas 样例经过构建期 `GCJ-02 -> WGS84` 转换后，Leaflet 舞台上不出现肉眼可见的整体偏移 | GEOX-07 | 自动化可以锁代表性点位，但最终视觉偏移仍需人眼确认 | 启动 web，加载北京与香港代表性边界，对照点击落点、边界中心与 popup anchor 是否一致 |
| 海外 admin-1 分片加载后，中国区域不会在海外 layer 中重复出现 | GEOX-05 | 自动化可检验 manifest 与过滤规则，但图层叠加后的视觉重复更适合手工复核 | 在地图中依次查看中国与美国样例，确认海外 layer 不出现中国 feature |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
