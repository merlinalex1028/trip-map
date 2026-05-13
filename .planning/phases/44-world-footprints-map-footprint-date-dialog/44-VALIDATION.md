---
phase: 44
slug: world-footprints-map-footprint-date-dialog
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-13
---

# Phase 44 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x for Vue component/unit tests |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test -- PointSummaryCard FootprintDateDialog` |
| **Full suite command** | `pnpm --filter @trip-map/web test` plus `pnpm --filter @trip-map/web build` |
| **Estimated runtime** | ~60-180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test -- PointSummaryCard FootprintDateDialog`
- **After every plan wave:** Run `pnpm --filter @trip-map/web test -- LeafletMapStage PointSummaryCard MapContextPopup SeedMarkerLayer FootprintDateDialog map-points`
- **Before `$gsd-verify-work`:** `pnpm --filter @trip-map/web test` and `pnpm --filter @trip-map/web build` must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 44-01-01 | 44-01 | 0 | MAP-03, MAP-04, MAP-05, DATE-01, DATE-05, DATE-06 | T-44-01 / T-44-04 | Popup, dialog, snapshot, focus, and feedback behavior have regression tests before UI rewiring | component | `pnpm --filter @trip-map/web test -- FootprintDateDialog PointSummaryCard LeafletMapStage MapContextPopup` | No - Wave 0 creates `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` and adds missing focused specs | pending |
| 44-02-01 | 44-02 | 1 | MAP-01, MAP-02 | T-44-05 / T-44-06 / T-44-07 | Leaflet click resolve and marker/sidebar visual state remain intact while static assets are copied | component/integration | `pnpm --filter @trip-map/web test -- SeedMarkerLayer AuthenticatedAppShell` | Yes | pending |
| 44-03-01 | 44-03 | 2 | MAP-03, MAP-04, MAP-05 | T-44-08 / T-44-09 / T-44-10 | Popup shows factual place info and opens independent date dialog without saved history | component | `pnpm --filter @trip-map/web test -- PointSummaryCard MapContextPopup` | Yes | pending |
| 44-04-01 | 44-04 | 2 | DATE-01, DATE-02, DATE-03, DATE-04, DATE-06 | T-44-11 / T-44-12 / T-44-13 / T-44-14 / T-44-15 | Date dialog submits only `YYYY-MM-DD` payloads and preserves accessible close/cancel/submitting/failure paths | component | `pnpm --filter @trip-map/web test -- FootprintDateDialog` | No - implementation creates `apps/web/src/components/map-popup/FootprintDateDialog.vue` | pending |
| 44-05-01 | 44-05 | 3 | MAP-04, MAP-06, DATE-05, DATE-06 | T-44-16 / T-44-17 / T-44-18 / T-44-19 / T-44-20 | Save uses frozen place snapshot and keeps auth/unavailable/saving/error/success close, cleanup, and focus feedback | integration/store/full gate | `pnpm --filter @trip-map/web test -- LeafletMapStage map-points && pnpm --filter @trip-map/web build` | Yes | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` - tests for shortcut selection, custom date selection, `YYYY-MM-DD` payloads, disabled/saving states, cancel/close behavior, and accessible labels.
- [ ] `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - update expectations so saved points no longer render `PopupTripRecord`, inline `TripDateForm`, `data-record-again`, or the text `再留一次足迹`.
- [ ] `apps/web/src/components/LeafletMapStage.spec.ts` - add snapshot race regression proving a dialog opened for place A still saves place A after active map point changes to place B.
- [ ] `apps/web/src/components/map-popup/MapContextPopup.spec.ts` - keep factual place-name/type/region popup contract covered after popup composition changes.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| World footprint visual polish and transparent character/marker assets | MAP-02, DATE-02 | Asset quality and composition are visual acceptance checks | Run `pnpm --filter @trip-map/web dev`, open the map, click a location, open the footprint dialog, and inspect desktop/mobile screenshots for non-overlap, readable text, and clean transparent assets. |
| Keyboard focus feel across Leaflet popup and modal dialog | MAP-06, DATE-06 | Component tests can assert labels/events, but final focus restoration is best checked in browser | Open popup with keyboard, activate `留下足迹`, close with Escape and cancel button, then confirm focus returns to a meaningful map/popup control. |

---

## Validation Sign-Off

- [x] All tasks have automated verification or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
