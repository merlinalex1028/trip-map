---
phase: 14
slug: leaflet
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-31
updated: 2026-04-03
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
| 14-01-P01 | 14-01 | 1 | MAP-04 | unit | `pnpm --filter @trip-map/web test` | ✅ `LeafletMapStage.vue` | ✅ green |
| 14-01-P01 | 14-01 | 1 | MAP-06 | unit | `pnpm --filter @trip-map/web test` | ✅ `LeafletMapStage.spec.ts` | ✅ green |
| 14-01-P02 | 14-02 | 1 | GEOX-05 | unit | `pnpm --filter @trip-map/web test` | ✅ `useGeoJsonLayers.ts` | ✅ green |
| 14-01-P02 | 14-02 | 1 | MAP-05 | unit | `pnpm --filter @trip-map/web test` | ✅ `useGeoJsonLayers.spec.ts` | ✅ green |
| 14-01-P03 | 14-03 | 1 | MAP-08 | unit | `pnpm --filter @trip-map/web test` | ✅ `useLeafletPopupAnchor.ts` | ✅ green |
| 14-01-P03 | 14-03 | 1 | UIX-01 | unit | `pnpm --filter @trip-map/web test` | ✅ `useLeafletPopupAnchor.spec.ts` | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Update Leaflet-related test infrastructure (mock `L.map`, `L.geoJSON` etc.)
- [x] Existing `WorldMapStage.spec.ts` tests rewritten as `LeafletMapStage.spec.ts` for Leaflet DOM
- [x] happy-dom environment configured with Leaflet CSS stubs

*Leaflet-specific mocking established in `LeafletMapStage.spec.ts`, `useGeoJsonLayers.spec.ts`, and `useLeafletPopupAnchor.spec.ts`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Pass Criteria | Result |
|----------|-------------|------------|---------------|--------|
| Bing Maps tile rendering | MAP-04 | Requires visual verification of tile quality | Map loads with Bing tiles at zoom 2-18; fallback to CartoDB Positron when Bing API unavailable; no blank tiles at any zoom level | ✅ pass |
| China/overseas visual consistency | MAP-05 | Visual comparison of two layer styles | China GeoJSON layer and overseas GeoJSON layer both render with consistent fill/stroke style; no z-index overlap artifacts between layers | ✅ pass |
| Popup anchoring during pan/zoom | UIX-01 | @floating-ui + Leaflet move sync | Popup stays anchored to correct map position during continuous pan and zoom; no jitter or detachment visible; VirtualElement updates on every moveend/zoomend | ✅ pass |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (2026-04-03)
