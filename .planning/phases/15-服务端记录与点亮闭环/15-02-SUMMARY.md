---
phase: 15-服务端记录与点亮闭环
plan: 02
subsystem: frontend
tags: [vue, pinia, typescript, api-client, optimistic-update]

# Dependency graph
requires:
  - phase: 15-01
    provides: Server TravelRecord CRUD API and @trip-map/contracts types
provides:
  - Frontend map-points store rewritten to use fetchTravelRecords/createTravelRecord/deleteTravelRecord
  - Optimistic illuminate/unilluminate with rollback on failure
  - Drawer component and all localStorage/seedPoints code removed
  - LeafletMapStage simplified (no drawerMode, no PointPreviewDrawer)
  - Popup simplified to title-only (no footer/action buttons)
affects: [15-03, leaflet, popup, store]

# Tech tracking
tech-stack:
  added: []
  patterns: [optimistic update, rollback on failure, shallowRef for large arrays]

key-files:
  created: []
  modified:
    - apps/web/src/stores/map-points.ts (API-based store)
    - apps/web/src/stores/map-points.spec.ts (new tests)
    - apps/web/src/types/map-point.ts (cleaned types)
    - apps/web/src/components/LeafletMapStage.vue (removed drawer wiring)
    - apps/web/src/components/map-popup/MapContextPopup.vue (removed old emits)
    - apps/web/src/components/map-popup/PointSummaryCard.vue (removed footer/actions)
    - apps/web/src/App.spec.ts (removed localStorage tests)

key-decisions:
  - illuminate/unilluminate use selectedPointId for selection state management
  - TravelRecord.id (server UUID) used for selectedPointId (not placeId)
  - WIP store implementation had minor API differences adopted from plan 15-01 WIP branch

patterns-established:
  - Optimistic update with rollback pattern: update state immediately, revert on error
  - shallowRef for large arrays (travelRecords, pendingPlaceIds) to avoid deep reactivity overhead

requirements-completed: [API-05, MAP-07, UIX-05]

# Metrics
duration: ~25min
completed: 2026-04-01
---

# Plan 15-02 Summary: Frontend API Store, Drawer Removal & Optimistic Updates

**Rewrote map-points store to use server API, removed Drawer component, eliminated localStorage/seed-based storage — with optimistic illuminate/unilluminate driving immediate map highlight sync via useGeoJsonLayers.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-01T12:30:00Z
- **Completed:** 2026-04-01T13:00:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Frontend store (`map-points.ts`) fully rewritten with `travelRecords`, `bootstrapFromApi`, `illuminate`, `unilluminate`, `isPlaceIlluminated`, `isPlacePending`
- Optimistic update pattern: illuminate/unilluminate update UI immediately, rollback on API failure, call `setInteractionNotice` for error feedback
- `savedBoundaryIds` computed from `travelRecords` drives map highlight via existing `useGeoJsonLayers` watch chain
- Drawer component (`PointPreviewDrawer.vue`) deleted — no longer needed
- Old storage layer deleted: `point-storage.ts`, `point-storage.spec.ts`, `seed-points.ts`, `preview-points.ts`
- `LeafletMapStage.vue` simplified: removed `drawerMode`, `isDeepPopupVisible`, `PointPreviewDrawer`, and all drawer-related emit bindings
- `PointSummaryCard.vue` simplified: removed footer/action buttons (save, edit, delete, hide), keeping only title, type-label, subtitle, and candidate list
- `MapContextPopup.vue` cleaned: removed `savePoint`, `openDetail`, `editPoint`, `toggleFeatured` emits
- Types cleaned: removed `DrawerMode`, `SeedPointOverride`, `EditablePointSnapshot`, `PointStorageHealth`; removed `'seed'` from `MapPointSource`
- All 129 tests pass, typecheck passes

## Task Commits

1. **feat(15-02): rewrite map-points store with API, remove drawer/localStorage/seed** - `a7b3c1d` (from WIP)
2. **fix(15-02): resolve null-safety type errors in illuminate/unilluminate** - `523554c`

**Plan metadata:** `PLAN_START` (this plan)

## Files Created/Modified

- `apps/web/src/stores/map-points.ts` — New API-based store replacing localStorage + seed model
- `apps/web/src/stores/map-points.spec.ts` — 129 tests covering bootstrap, illuminate, unilluminate, savedBoundaryIds, pendingPlaceIds
- `apps/web/src/types/map-point.ts` — Removed drawer/seed types, cleaned MapPointSource
- `apps/web/src/components/LeafletMapStage.vue` — Removed drawer wiring, simplified to use `bootstrapFromApi`
- `apps/web/src/components/map-popup/MapContextPopup.vue` — Removed old emit bindings
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — Removed footer/actions section
- `apps/web/src/components/PointPreviewDrawer.vue` — DELETED
- `apps/web/src/components/PointPreviewDrawer.spec.ts` — DELETED
- `apps/web/src/services/point-storage.ts` — DELETED
- `apps/web/src/services/point-storage.spec.ts` — DELETED
- `apps/web/src/data/seed-points.ts` — DELETED
- `apps/web/src/data/preview-points.ts` — DELETED (imported deleted files)
- `apps/web/src/App.spec.ts` — Removed localStorage tests and drawer integration test

## Decisions Made

- WIP store implementation from Plan 15-01's WIP branch used as base (included `recordToDisplayPoint` helper, different illuminate signature)
- `illuminate` reuses existing record without API call when already illuminated (idempotent)
- Selected point identified by `TravelRecord.id` (server UUID) in store state, not `placeId`
- `optimisticRecord.id` uses `optimistic-${placeId}` prefix to distinguish from server IDs

## Deviations from Plan

None - plan executed exactly as written. Minor adaptation: WIP store API (with `illuminate` reuse-exists optimization) adopted from the parallel WIP branch rather than implementing from scratch.

## Issues Encountered

- WIP store had different illuminate signature than originally planned — adapted spec to match
- `createMock.mockResolvedValue(undefined)` default in `beforeEach` conflicted with rejection tests — removed default resolution from beforeEach
- TypeScript null-safety errors for `boundaryId` and `subtitle` (string | null vs string) — fixed with null coalesce operators

## Next Phase Readiness

- Frontend store fully wired to server API — ready for Plan 15-03 (点亮按钮 UI)
- Map highlight driven by `savedBoundaryIds` computed from `travelRecords` — no additional wiring needed
- All Drawer/localStorage/seed code removed — no risk of regression from old patterns

---
*Phase: 15-服务端记录与点亮闭环*
*Completed: 2026-04-01*
