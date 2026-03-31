---
phase: 13
slug: 行政区数据与几何交付
status: draft
nyquist_compliant: true
wave_0_complete: true
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
| **Quick run command** | Per-task targeted command from the map below; no shared shortcut spec |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | task checks ~10-45s each; full suite ~90 seconds |

---

## Sampling Rate

- **After every task commit:** 运行该任务 `<verify><automated>` 中的精确命令，不使用通用 shortcut spec 代替
- **After every plan wave:** 重新运行该 wave 内所有计划列出的 targeted commands，确认拆分后的依赖边界仍然成立
- **Before `$gsd-verify-work`:** Full suite must be green via `pnpm test` and `pnpm typecheck`
- **Max feedback latency:** 60 seconds for targeted checks; full suite only at phase gate

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirements | Test Type | Automated Command | Status |
|---------|------|------|--------------|-----------|-------------------|--------|
| 13-01-01 | 01 | 1 | GEOX-06, API-03 | contracts | `pnpm --filter @trip-map/contracts test` | ⬜ pending |
| 13-01-02 | 01 | 1 | GEOX-06, API-03 | contracts | `pnpm --filter @trip-map/contracts test` | ⬜ pending |
| 13-02-01 | 02 | 2 | GEOX-03, GEOX-04, GEOX-06 | build | `pnpm --filter @trip-map/web run geo:build` | ⬜ pending |
| 13-02-02 | 02 | 2 | GEOX-07, GEOX-06 | build | `pnpm --filter @trip-map/web run geo:build` | ⬜ pending |
| 13-03-01 | 03 | 3 | GEOX-05, GEOX-06 | build | `pnpm --filter @trip-map/web run geo:build` | ⬜ pending |
| 13-03-02 | 03 | 3 | GEOX-05, GEOX-07 | integration | `pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts src/services/geometry-validation.spec.ts` | ⬜ pending |
| 13-04-01 | 04 | 4 | API-03, GEOX-06 | e2e | `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` | ⬜ pending |
| 13-04-02 | 04 | 4 | GEOX-05, GEOX-06 | unit | `pnpm --filter @trip-map/web test src/services/geometry-loader.spec.ts` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None. Phase 13 当前所有计划任务都已声明精确的 `<automated>` 命令，不再依赖伪 Wave 0 测试占位。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 中国 GeoAtlas 样例经过构建期 `GCJ-02 -> WGS84` 转换后，Leaflet 舞台上不出现肉眼可见的整体偏移 | GEOX-07 | 自动化可以锁代表性点位，但最终视觉偏移仍需人眼确认 | 启动 web，加载北京与香港代表性边界，对照点击落点、边界中心与 popup anchor 是否一致 |
| 海外 admin-1 分片加载后，中国区域不会在海外 layer 中重复出现 | GEOX-05 | 自动化可检验 manifest 与过滤规则，但图层叠加后的视觉重复更适合手工复核 | 在地图中依次查看中国与美国样例，确认海外 layer 不出现中国 feature |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify commands
- [ ] All tasks have exact per-task `<automated>` verify commands with no shortcut substitution
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s for targeted checks
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
