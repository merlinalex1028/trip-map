# v7.0 Architecture: 旅行记录编辑与删除

**Domain:** 现有 trip-map 架构上的记录编辑、元数据与单条删除集成
**Researched:** 2026-04-28
**Confidence:** HIGH

## Existing Architecture Baseline

### Data Model (Prisma `UserTravelRecord`)

```
UserTravelRecord {
  id, userId, placeId, boundaryId, placeKind, datasetVersion,
  displayName, regionSystem, adminType, typeLabel, parentLabel,
  subtitle, startDate?, endDate?, createdAt, updatedAt

  @@unique([userId, placeId, startDate, endDate])
  @@index([userId, placeId])
}
```

**Key constraint**: unique key = `(userId, placeId, startDate, endDate)`. Same user can have multiple trips to the same place with different date ranges.

### Current API Surface

| Method | Path | Purpose | Notes |
|--------|------|---------|-------|
| GET | `/records` | List all user records | Returns `TravelRecord[]` |
| POST | `/records` | Create one record | With date range |
| DELETE | `/records/:placeId` | Delete ALL records for place | `deleteMany` by placeId |
| POST | `/records/import` | Bulk import | Dedup by (placeId, startDate, endDate) |
| GET | `/records/stats` | Aggregate stats | totalTrips, uniquePlaces, visitedCountries |

**Critical gap**: Current `DELETE /records/:placeId` is a **place-level clear** (deletes all trips). v7.0 needs **single record deletion by record ID**.

### Current Frontend Data Flow

```
Map click -> geo-lookup -> canonical resolve -> MapContextPopup
  -> TripDateForm -> illuminate() -> createTravelRecord API
  -> travelRecords ref updates -> timelineEntries / displayPoints recompute

Timeline page reads: mapPointsStore.timelineEntries (computed from travelRecords)
Statistics page reads: statsStore.stats (server-authoritative, re-fetched on travelRecordRevision change)
```

### Current Delete Flow (place-level)

```
PointSummaryCard -> emit('unilluminate')
  -> MapContextPopup -> LeafletMapStage -> mapPointsStore.unilluminate(placeId)
  -> Optimistic: remove all records for placeId from travelRecords
  -> API: DELETE /records/:placeId (deleteMany)
  -> On failure: rollback + notice
```

---

## Integration Points for v7.0

### 1. Prisma Schema Changes

**Add to `UserTravelRecord`**:

```prisma
model UserTravelRecord {
  // ... existing fields ...
  notes        String?   // 备注，可选
  tags         String[]  // 标签数组，PostgreSQL native array
  // startDate, endDate already exist
  // updatedAt already exists
}
```

**Migration**: Additive only -- `notes TEXT`, `tags TEXT[] DEFAULT '{}'`. No data backfill needed. Unique constraint `@@unique([userId, placeId, startDate, endDate])` unchanged.

### 2. Contracts Changes (`packages/contracts/src/records.ts`)

**Modify `TravelRecord` interface** -- add:

```typescript
export interface TravelRecord {
  // ... existing fields ...
  notes: string | null   // NEW
  tags: string[]         // NEW
}
```

**New request type**:

```typescript
export interface UpdateTravelRecordRequest {
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
  tags?: string[]
}
```

**No change to `CreateTravelRecordRequest`** -- notes/tags are optional additions after creation.

### 3. Backend Changes

#### 3a. New Endpoint: `PATCH /records/:id`

```
Controller: RecordsController.patchTravel(id, body) -> RecordsService.updateTravel(userId, id, body)
Service: validate date range, assert record belongs to userId, call repository
Repository: prisma.userTravelRecord.update({ where: { id }, data: { startDate, endDate, notes, tags } })
```

**Response**: Updated `TravelRecord` (full object).

**Validation**:
- `id` must be a valid record ID belonging to the authenticated user
- If both `startDate` and `endDate` provided, `endDate >= startDate`
- `notes` max length (suggest 500 chars)
- `tags` max array length (suggest 10), each tag max 30 chars
- Place fields (placeId, boundaryId, etc.) are NOT editable -- only date + metadata

#### 3b. New Endpoint: `DELETE /records/record/:id` (single record)

**Why not reuse `DELETE /records/:placeId`**: The existing endpoint deletes ALL trips for a place. v7.0 needs single-record deletion. Two approaches:

- **Option A**: `DELETE /records/:id` with a route that distinguishes ID vs placeId -- fragile, IDs are cuid, placeIds are composite strings
- **Option B (recommended)**: `DELETE /records/record/:id` -- unambiguous new route

```
Controller: RecordsController.deleteTravelById(id) -> RecordsService.deleteTravelById(userId, id)
Repository: prisma.userTravelRecord.delete({ where: { id } })
```

**Keep existing `DELETE /records/:placeId`** -- the map popup "取消点亮" still needs place-level clear (removes all trips + unhighlights boundary).

#### 3c. Modify `toContractTravelRecord` mapping

Add `notes` and `tags` to the response mapper in `records.service.ts`:

```typescript
function toContractTravelRecord(record: UserTravelRecord): ContractTravelRecord {
  return {
    // ... existing fields ...
    notes: record.notes ?? null,
    tags: record.tags ?? [],
  }
}
```

### 4. Frontend API Layer (`apps/web/src/services/api/records.ts`)

**New functions**:

```typescript
export async function updateTravelRecord(
  id: string,
  request: UpdateTravelRecordRequest,
): Promise<TravelRecord> {
  return apiFetchJson<TravelRecord>(`/records/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}

export async function deleteTravelRecordById(id: string): Promise<void> {
  return apiFetchJson<void>(
    `/records/record/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { responseType: 'none' },
  )
}
```

**Existing `deleteTravelRecord(placeId)`** -- keep as-is for place-level clear.

### 5. Frontend Store Changes (`map-points.ts`)

#### New state

```typescript
const editingRecordId = shallowRef<string | null>(null)  // Which record is being edited
```

#### New actions

```typescript
async function updateRecord(recordId: string, updates: UpdateTravelRecordRequest) {
  // Optimistic: patch the record in travelRecords
  // API call: updateTravelRecord(recordId, updates)
  // On success: replace with server response
  // On failure: rollback + notice
}

async function deleteSingleRecord(recordId: string) {
  // Optimistic: remove record from travelRecords
  // API call: deleteTravelRecordById(recordId)
  // On success: notice
  // On failure: rollback + notice
}
```

**Optimistic update pattern** follows existing `illuminate`/`unilluminate` pattern -- snapshot previous state, apply optimistic change, rollback on failure.

#### Deletion propagation

When a single record is deleted:
- `travelRecords` ref updates -> `timelineEntries` recomputes automatically (it's a computed)
- `displayPoints` recomputes (uses latest record per placeId)
- If the deleted record was the last trip for that placeId -> place disappears from map highlight
- `tripsByPlaceId` recomputes -> popup trip count updates
- Statistics page watches `travelRecordRevision` which includes record IDs -> triggers re-fetch

**No special propagation logic needed** -- all downstream consumers are derived from `travelRecords`.

### 6. Frontend UI Entry Points

#### 6a. Timeline Page -- Edit & Delete per card

**Modify `TimelineVisitCard.vue`**:

- Add action buttons: "编辑" and "删除" (pill-shaped, kawaii style)
- "编辑" -> opens inline edit form (reuses/adapts `TripDateForm` + adds notes/tags fields)
- "删除" -> confirmation dialog -> `mapPointsStore.deleteSingleRecord(recordId)`

**New component: `TimelineEditForm.vue`**:

- Extends `TripDateForm` pattern with additional fields:
  - Start/end date inputs (pre-filled from existing record)
  - Notes textarea
  - Tags input (comma-separated or pill-chip input)
- Emits `submit: { startDate, endDate, notes, tags }` and `cancel`
- Parent `TimelineVisitCard` handles emit -> `mapPointsStore.updateRecord(recordId, updates)`

#### 6b. Map Popup -- Edit existing trip dates

**Modify `PointSummaryCard.vue`**:

- In the trip summary section (when `isSaved`), add "编辑记录" button alongside existing "再记一次去访"
- "编辑记录" -> emits `editRecord: { recordId }` up to `MapContextPopup` -> `LeafletMapStage`
- This opens an edit form within the popup (similar to how `TripDateForm` expands inline)

**Note**: The popup edit is simpler than timeline -- only date editing. Notes/tags editing is timeline-only to keep the popup compact.

#### 6c. Confirmation Dialog

**New component: `ConfirmDialog.vue`**:

- Generic reusable confirmation modal
- Props: `title`, `message`, `confirmLabel`, `cancelLabel`, `tone` (warning/danger)
- Emits: `confirm`, `cancel`
- Used for:
  - Delete confirmation (timeline card)
  - Edit save confirmation (if date changed significantly -- optional, could skip for simplicity)

### 7. Statistics Propagation

**Current mechanism** (`StatisticsPageView.vue`):
- `travelRecordRevision` computed watches: `id, placeId, createdAt, parentLabel, displayName, typeLabel, subtitle`
- When revision changes -> `statsStore.fetchStatsData()` re-fetches from server

**What needs to change**:
- Add `startDate`, `endDate` to `travelRecordRevision` -- editing dates doesn't change stats numbers but ensures consistency
- Delete propagation: removing a record changes `travelRecordRevision` (fewer entries) -> triggers re-fetch -> stats update

**No stats computation change needed** -- stats remain server-authoritative.

---

## New vs Modified Files Summary

### New Files

| File | Purpose |
|------|---------|
| `apps/server/src/modules/records/dto/update-travel-record.dto.ts` | PATCH request validation |
| `apps/web/src/components/timeline/TimelineEditForm.vue` | Inline edit form in timeline |
| `apps/web/src/components/shared/ConfirmDialog.vue` | Reusable confirmation dialog |

### Modified Files

| File | Changes |
|------|---------|
| `apps/server/prisma/schema.prisma` | Add `notes`, `tags` to UserTravelRecord |
| `packages/contracts/src/records.ts` | Add `notes`, `tags` to TravelRecord; add UpdateTravelRecordRequest |
| `apps/server/src/modules/records/records.controller.ts` | Add PATCH `:id` and DELETE `record/:id` |
| `apps/server/src/modules/records/records.service.ts` | Add `updateTravel`, `deleteTravelById`; update mapper |
| `apps/server/src/modules/records/records.repository.ts` | Add `updateTravelRecord`, `deleteTravelRecordById` |
| `apps/web/src/services/api/records.ts` | Add `updateTravelRecord`, `deleteTravelRecordById` |
| `apps/web/src/stores/map-points.ts` | Add `updateRecord`, `deleteSingleRecord`, `editingRecordId` |
| `apps/web/src/components/timeline/TimelineVisitCard.vue` | Add edit/delete buttons, wire to store |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | Add "编辑记录" button, `editRecord` emit |
| `apps/web/src/components/map-popup/MapContextPopup.vue` | Pass through `editRecord` emit |
| `apps/web/src/views/StatisticsPageView.vue` | Add date fields to `travelRecordRevision` |

---

## Build Order

### Phase 1: Data Layer (contracts + prisma + backend)
1. Prisma schema migration -- add `notes`, `tags`
2. Contracts -- update `TravelRecord`, add `UpdateTravelRecordRequest`
3. Backend DTO -- `UpdateTravelRecordDto`
4. Backend repository -- `updateTravelRecord`, `deleteTravelRecordById`
5. Backend service -- `updateTravel`, `deleteTravelById`, update mapper
6. Backend controller -- PATCH `:id`, DELETE `record/:id`
7. Backend tests

### Phase 2: Frontend API + Store
8. Frontend API -- `updateTravelRecord`, `deleteTravelRecordById`
9. Map points store -- `updateRecord`, `deleteSingleRecord`, optimistic logic
10. Store tests

### Phase 3: Timeline Edit/Delete UI
11. `ConfirmDialog` component
12. `TimelineEditForm` component
13. Modify `TimelineVisitCard` -- add actions + wire edit form + delete

### Phase 4: Map Popup Edit
14. Modify `PointSummaryCard` -- add "编辑记录" button
15. Modify `MapContextPopup` -- pass through editRecord
16. Wire popup edit to store

### Phase 5: Integration & Propagation
17. Update `travelRecordRevision` in StatisticsPageView
18. E2E verification: edit date -> timeline updates -> stats correct
19. E2E verification: delete single -> timeline removes -> map highlight logic -> stats re-fetch

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| PATCH for edit, not PUT | Partial updates only (date + metadata), place identity immutable |
| Separate `DELETE /records/record/:id` route | Avoids collision with existing `DELETE /records/:placeId` |
| Keep existing place-level delete | Map popup "取消点亮" still needs it |
| Notes/tags only editable from timeline | Popup stays compact; timeline is the "detail view" |
| Tags as string array, not separate model | Simple, PostgreSQL native array, no join table needed |
| No undo history | Per PROJECT.md decision -- confirmation dialog only |
| Optimistic updates | Follows existing illuminate/unilluminate pattern |

---

## Sources

### Internal code (all confidence HIGH)

- `apps/server/prisma/schema.prisma` -- UserTravelRecord model, unique constraint
- `apps/server/src/modules/records/records.controller.ts` -- existing endpoints including DELETE :placeId
- `apps/server/src/modules/records/records.service.ts` -- toContractTravelRecord mapper, deleteTravel
- `apps/server/src/modules/records/records.repository.ts` -- deleteTravelRecordByPlaceId (deleteMany)
- `apps/server/src/modules/records/dto/create-travel-record.dto.ts` -- current DTO shape
- `packages/contracts/src/records.ts` -- TravelRecord, CreateTravelRecordRequest interfaces
- `packages/contracts/src/index.ts` -- re-export surface
- `apps/web/src/services/api/records.ts` -- createTravelRecord, deleteTravelRecord, importTravelRecords
- `apps/web/src/services/api/client.ts` -- apiFetchJson, error handling
- `apps/web/src/stores/map-points.ts` -- illuminate, unilluminate, travelRecords, timelineEntries, displayPoints
- `apps/web/src/stores/stats.ts` -- statsStore, fetchStatsData
- `apps/web/src/views/TimelinePageView.vue` -- timeline rendering, uses timelineEntries
- `apps/web/src/views/StatisticsPageView.vue` -- travelRecordRevision watcher, stats refresh
- `apps/web/src/components/timeline/TimelineVisitCard.vue` -- read-only card, no edit/delete
- `apps/web/src/components/map-popup/PointSummaryCard.vue` -- illuminate/unilluminate, TripDateForm
- `apps/web/src/components/map-popup/TripDateForm.vue` -- date input form pattern
- `apps/web/src/components/map-popup/MapContextPopup.vue` -- popup shell, emit passthrough
- `apps/web/src/services/timeline.ts` -- buildTimelineEntries, TimelineEntry type
