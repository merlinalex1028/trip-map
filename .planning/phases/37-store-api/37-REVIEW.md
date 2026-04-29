# Phase 37: Store & API Layer — Code Review

**Reviewed:** 2026-04-29
**Depth:** standard
**Files Reviewed:** 6
**Status:** clean

## Summary

Phase 37 adds `updateTravelRecord` (PATCH) and `deleteSingleRecord` (DELETE) API functions, plus corresponding Pinia store methods with optimistic updates and rollback on failure. The implementation correctly follows the existing `illuminate`/`unilluminate` patterns for session boundary checks, 401 handling, and error recovery. The `StatisticsPageView` `travelRecordRevision` is extended to include `startDate`/`endDate`/`notes`/`tags` so statistics refresh when these fields change.

All 333 tests pass (37 test files). The 25 new tests (10 API + 13 store + 2 view) provide thorough coverage of optimistic updates, rollback, 401 routing, session boundary expiry, and edge cases.

No critical or warning-level issues found. Two informational observations below.

## Findings

### IN-01: `travelRecordRevision` tag joining uses comma delimiter

**File:** `apps/web/src/views/StatisticsPageView.vue:52`
**Issue:** `record.tags.join(',')` could produce collisions if a tag itself contains a comma (e.g., `["a,b"]` and `["a", "b"]` both produce `"a,b"`). In practice this is negligible — tags are server-normalized (trimmed, deduplicated, empty-filtered) and the revision string is only used for change detection to trigger a stats re-fetch, not for data integrity.
**Fix:** No action needed. If collision-free fingerprinting is desired later, a JSON serialization or null-byte delimiter could be used, but the current approach is pragmatic.

### IN-02: `deleteSingleRecord` does not clear `selectedPointId` when removing the last record for a place

**File:** `apps/web/src/stores/map-points.ts:584-627`
**Issue:** Unlike `unilluminate` (which checks `stillIlluminated` and clears `selectedPointId`/`summaryMode`), `deleteSingleRecord` does not explicitly clear selection state when the deleted record was the last for its place. This is safe because `displayPoints` deduplicates by `placeId` — once the last record is removed, the point disappears from `displayPoints`, causing `activePoint` and `summarySurfaceState` to return `null`, which closes the summary panel. The map component should also de-highlight the point since it no longer exists in `displayPoints`. No functional issue, just a behavioral difference worth noting.

## Verification Checklist

| Requirement | Status | Evidence |
|---|---|---|
| PATCH semantics (spread merge, only overwrite provided fields) | ✅ | `map-points.ts:539` — `{ ...targetRecord, ...request }` |
| Optimistic update before API call | ✅ | `map-points.ts:539-546` (update), `594` (delete) |
| Rollback on failure via `previousRecords` snapshot | ✅ | `map-points.ts:532,569` (update), `587,614` (delete) |
| Server data replaces optimistic data on success | ✅ | `map-points.ts:556-558` |
| `hasSessionBoundaryChanged` check before applying response | ✅ | `map-points.ts:551,564` (update), `599,609` (delete) |
| 401 routed through `handleUnauthorized` | ✅ | `map-points.ts:571-574` (update), `616-619` (delete) |
| `encodeURIComponent` for ID in URL | ✅ | `records.ts:36,45` |
| IDOR protection (server-side `userId` check) | ✅ | `records.repository.ts:157,164` — `where: { id, userId }` |
| `travelRecordRevision` includes all new fields | ✅ | `StatisticsPageView.vue:48-52` |
| Tests cover optimistic, rollback, 401, session boundary | ✅ | 25 new tests across 3 files |
