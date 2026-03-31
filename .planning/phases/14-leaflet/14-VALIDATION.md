---
phase: 14
slug: leaflet
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | MAP-04 | unit | `pnpm --filter @trip-map/web test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GEOX-05 | unit | `pnpm --filter @trip-map/web test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | MAP-05 | unit | `pnpm --filter @trip-map/web test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | MAP-06 | unit | `pnpm --filter @trip-map/web test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | MAP-08 | unit | `pnpm --filter @trip-map/web test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | UIX-01 | unit | `pnpm --filter @trip-map/web test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Update Leaflet-related test infrastructure (mock `L.map`, `L.geoJSON` etc.)
- [ ] Existing `WorldMapStage.spec.ts` tests need full rewrite for Leaflet DOM
- [ ] happy-dom environment may need Leaflet CSS stubs

*Existing vitest infrastructure covers the test framework; Leaflet-specific mocking is new.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bing Maps tile rendering | MAP-04 | Requires visual verification of tile quality | Load map, verify tiles render at various zoom levels |
| China/overseas visual consistency | MAP-05 | Visual comparison of two layer styles | Pan between China and overseas, verify consistent look |
| Popup anchoring during pan/zoom | UIX-01 | @floating-ui + Leaflet move sync | Click a point, drag map, verify popup follows smoothly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
