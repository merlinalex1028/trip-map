---
phase: 37-store-api
plan: 01
subsystem: api
tags: [vue, pinia, optimistic-update, fetch, vitest]

requires:
  - phase: 36-data-layer-extension
    provides: "PATCH/DELETE backend endpoints + UpdateTravelRecordRequest type"
provides:
  - "updateTravelRecord API function (PATCH /records/:id)"
  - "deleteSingleRecord API function (DELETE /records/record/:id)"
  - "updateRecord store method with optimistic update + rollback"
  - "deleteSingleRecord store method with optimistic delete + rollback"
  - "travelRecordRevision extended with startDate/endDate/notes/tags"
affects: [38-timeline-edit-delete-ui, 39-map-popup-integration]

tech-stack:
  added: []
  patterns: [optimistic-update-rollback, api-function-extension, revision-computed-extension]

key-files:
  created:
    - apps/web/src/services/api/records.spec.ts
  modified:
    - apps/web/src/services/api/records.ts
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/views/StatisticsPageView.vue
    - apps/web/src/views/StatisticsPageView.spec.ts

key-decisions:
  - "Store method names match API function names; import aliases with Api suffix to avoid conflict"
  - "updateRecord uses PATCH semantics with spread merge (only overwrite provided fields)"
  - "No pendingRecordIds tracking for update/deleteSingleRecord — Phase 38 UI manages its own loading state"

patterns-established:
  - "Optimistic update pattern: snapshot previousRecords, mutate optimistically, API call, replace with server data or rollback"
  - "API function pattern: apiFetchJson with method/path/body for JSON responses, responseType: 'none' for 204"

requirements-completed: [SYNC-01, SYNC-02, SYNC-03, SYNC-04]

duration: 15min
completed: 2026-04-29
---

# Phase 37 Plan 01: API + Store + Stats Refresh Summary

**updateTravelRecord/deleteSingleRecord API functions with store-level optimistic update/rollback and automatic timeline re-sort + stats refresh on edit/delete**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-29T12:00:00Z
- **Completed:** 2026-04-29T12:15:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added `updateTravelRecord` (PATCH) and `deleteSingleRecord` (DELETE) API functions with full test coverage
- Implemented `updateRecord` store method with optimistic PATCH semantics — spreads request onto existing record, replaces with server data on success, rolls back on failure
- Implemented `deleteSingleRecord` store method with optimistic delete — filters record out immediately, restores on failure
- Extended `travelRecordRevision` computed to include `startDate`, `endDate`, `notes`, `tags` so editing these fields triggers stats refresh
- All 333 tests pass across 37 test files

## Task Commits

Each task was committed atomically:

1. **Task 1: API layer** - `d199c83` (feat)
2. **Task 2: Store layer + stats revision** - `cfc1496` (feat)

## Files Created/Modified

- `apps/web/src/services/api/records.ts` - Added updateTravelRecord and deleteSingleRecord API functions
- `apps/web/src/services/api/records.spec.ts` - New test file for API functions (10 tests)
- `apps/web/src/stores/map-points.ts` - Added updateRecord and deleteSingleRecord store methods with optimistic update/rollback
- `apps/web/src/stores/map-points.spec.ts` - Extended mocks and added 13 new test cases for updateRecord/deleteSingleRecord
- `apps/web/src/views/StatisticsPageView.vue` - Extended travelRecordRevision to include startDate/endDate/notes/tags
- `apps/web/src/views/StatisticsPageView.spec.ts` - Added 2 tests for notes/tags triggering stats refresh

## Decisions Made

- Store method names match API function names; import aliases with `Api` suffix to avoid naming conflict
- `updateRecord` uses PATCH semantics with spread merge (`{ ...targetRecord, ...request }`) — only overwrites provided fields
- No `pendingRecordIds` tracking for update/deleteSingleRecord operations — Phase 38 UI layer manages its own loading state
- `travelRecordRevision` uses `tags.join(',')` to serialize tags array into a stable string for comparison

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 38 (Timeline Edit/Delete UI) can now consume `store.updateRecord` and `store.deleteSingleRecord` for edit/delete operations
- `tripsByPlaceId` computed already provides per-place record grouping for date conflict checking (EDIT-04)
- Timeline auto-re-sort and stats auto-refresh are fully wired — no additional work needed in Phase 38

---
*Phase: 37-store-api*
*Completed: 2026-04-29*
