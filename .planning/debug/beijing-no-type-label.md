---
debug_session: beijing-no-type-label
symptom: "无标签显示 — no typeLabel shown in popup after clicking Beijing"
investigated: 2026-04-01
status: root_cause_found
---

# Debug: Beijing Popup Shows No Type Label

## Symptom

UAT Phase 12 Test 2: clicking the Beijing area on the map should show a popup
with `typeLabel = "直辖市"`. User reports "无标签显示" — the type label pill is
completely absent.

Same pattern observed for Hong Kong ("无标签、无副标题") and California ("无法识别"),
suggesting the root cause is systemic rather than Beijing-specific.

---

## Investigation Chain

### Step 1 — Server fixture catalog (`canonical-place-fixtures.ts`)

The server-side fixture catalog (`apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts`)
defines Beijing as:

```ts
'cn-beijing': createChinaPlace(
  'cn-beijing',          // <-- placeId used by the server
  'datav-cn-beijing',
  '北京',
  'MUNICIPALITY',
  '直辖市',
  '中国',
)
```

The server's `getPlace()` method returns this object (plus `geometryRef`), so
the HTTP response for a Beijing click carries `placeId: "cn-beijing"`.

### Step 2 — Shared contracts fixtures (`packages/contracts/src/fixtures.ts`)

The contracts package defines `PHASE12_RESOLVED_BEIJING` with a **different** placeId:

```ts
export const PHASE12_RESOLVED_BEIJING: ResolvedCanonicalPlace = {
  placeId: 'cn-admin-beijing',   // <-- DIFFERENT from server fixture
  ...
  typeLabel: '直辖市',
  ...
}
```

| Source | placeId for Beijing |
|--------|---------------------|
| Server fixture catalog | `cn-beijing` |
| Contracts `PHASE12_RESOLVED_BEIJING` | `cn-admin-beijing` |

This discrepancy means the specs in `PointSummaryCard.spec.ts` test against the
contracts fixture (`cn-admin-beijing`) while the live server returns `cn-beijing`.

### Step 3 — `handleMapClick` in `LeafletMapStage.vue`

On a successful resolve the handler calls `applyResolvedPlace(response.place, ...)`,
which calls `openSavedPointForPlaceOrStartDraft(buildCanonicalDraftPoint(place, geo))`.

`buildCanonicalDraftPoint` correctly maps all fields from `response.place` into
`DraftMapPoint`, including `typeLabel` and `subtitle`. This part is fine **if**
the server response actually contains those fields.

### Step 4 — `recordToDisplayPoint` in `map-points.ts` (the real break point)

When a point is **saved** (after `illuminate()`), it is persisted as a
`TravelRecord`. On subsequent loads/views the store reconstructs the display
point via `recordToDisplayPoint`:

```ts
function recordToDisplayPoint(record: TravelRecord): MapPointDisplay {
  return {
    ...
    typeLabel: null,    // <-- HARDCODED null — never read from TravelRecord
    parentLabel: null,  // <-- HARDCODED null
    ...
  }
}
```

`TravelRecord` (defined in `packages/contracts/src/records.ts`) does **not**
include `typeLabel` or `parentLabel` fields. So when a saved canonical point is
re-opened (mode: `'view'`, `source: 'saved'`), `typeLabel` is always `null`.

For a **fresh detect** (not yet saved, mode: `'detected-preview'`), the
`DraftMapPoint` does carry `typeLabel` from the server response, so the label
_would_ appear — but only transiently, before saving.

### Step 5 — `PointSummaryCard.vue` rendering

```ts
const summaryTypeLabel = computed(() => {
  ...
  return props.surface.point.typeLabel ?? null
})
```

```html
<span v-if="summaryTypeLabel" ...>{{ summaryTypeLabel }}</span>
```

The component correctly gates on `summaryTypeLabel`. If `typeLabel` is `null`
(which it is for any saved point reconstructed via `recordToDisplayPoint`), the
label element is simply not rendered — matching the observed "无标签显示".

### Step 6 — Confirmed for California ("无法识别")

California has `placeId: 'us-california'` in the server fixture but
`'overseas-admin1-california'` in `PHASE12_RESOLVED_CALIFORNIA`. The server's
`findFixture()` uses a tight lat/lng tolerance (`< 0.0001`). If the user clicks
anywhere in California that doesn't land exactly on `(36.7783, -119.4179)`, the
server returns `OUTSIDE_SUPPORTED_DATA` → the geo-lookup fallback fires →
`buildFallbackDraftPoint` is used, which always sets `typeLabel: null`. This
explains "无法识别".

---

## Root Cause Summary

**Primary cause:** `recordToDisplayPoint()` in `apps/web/src/stores/map-points.ts`
hardcodes `typeLabel: null` and `parentLabel: null` because `TravelRecord` does
not store those fields. Any point that has been saved and is re-opened in `'view'`
mode will therefore always display without a type label or subtitle.

**Secondary cause (server/contracts mismatch):** The server fixture catalog uses
short placeIds (`cn-beijing`, `cn-hong-kong`, `us-california`) while the shared
contracts fixtures use longer canonical ids (`cn-admin-beijing`,
`cn-admin-hong-kong`, `overseas-admin1-california`). The specs pass because they
use the contracts fixtures directly; live behaviour differs.

**Tertiary cause (California fixture miss):** The server's `findFixture()` matches
on exact coordinates (tolerance `< 0.0001`). A real map click on California will
almost never land at exactly `(36.7783, -119.4179)`, so the server returns
`OUTSIDE_SUPPORTED_DATA` and the client falls back to the geo-lookup path, which
produces a point with no `typeLabel`.

---

## Files Involved

| File | Issue |
|------|-------|
| `apps/web/src/stores/map-points.ts` | `recordToDisplayPoint` sets `typeLabel: null` unconditionally |
| `packages/contracts/src/records.ts` | `TravelRecord` lacks `typeLabel` / `parentLabel` fields |
| `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` | placeIds differ from contracts fixtures (`cn-beijing` vs `cn-admin-beijing`) |
| `packages/contracts/src/fixtures.ts` | placeIds differ from server (`cn-admin-beijing` vs `cn-beijing`) |
| `apps/web/src/components/LeafletMapStage.vue` | California fixture hit requires exact coords — real clicks miss |
