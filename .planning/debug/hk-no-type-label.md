# Debug: Hong Kong — No Type Label / No Subtitle

**Date:** 2026-04-01  
**Symptom:** Clicking Hong Kong shows popup with no type label ("特别行政区") and no subtitle  
**UAT:** Phase 12, Test 4  

---

## Investigation Summary

### Step 1 — Server fixture (canonical-place-fixtures.ts)

Hong Kong is correctly defined:

```ts
'cn-hong-kong': createChinaPlace(
  'cn-hong-kong',
  'datav-cn-hong-kong',
  '香港',
  'SAR',
  '特别行政区',   // typeLabel ✓
  '中国',         // parentLabel ✓
),
```

`createChinaPlace` produces:
```ts
{
  placeKind: 'CN_ADMIN',
  typeLabel: '特别行政区',
  parentLabel: '中国',
  subtitle: '中国 · 特别行政区',  // ✓ present
}
```

**Conclusion: Server fixture is correct. typeLabel and subtitle are populated.**

---

### Step 2 — Contracts: CanonicalPlaceSummary / TravelRecord

`packages/contracts/src/place.ts`:
```ts
export interface CanonicalPlaceSummary extends CanonicalPlaceRef {
  typeLabel: string       // required, non-optional
  parentLabel: string     // required, non-optional
  subtitle: string        // required, non-optional
}
```

`packages/contracts/src/records.ts` — TravelRecord:
```ts
export interface TravelRecord {
  id: string
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
  displayName: string
  subtitle: string        // only subtitle — NO typeLabel, NO parentLabel
  createdAt: string
}
```

**KEY FINDING: TravelRecord does NOT carry typeLabel or parentLabel.**

---

### Step 3 — Store: recordToDisplayPoint (map-points.ts)

```ts
function recordToDisplayPoint(record: TravelRecord): MapPointDisplay {
  return {
    ...
    typeLabel: null,      // ← always null — no source in TravelRecord
    parentLabel: null,    // ← always null — no source in TravelRecord
    subtitle: record.subtitle,
    ...
  }
}
```

This function is called in two paths:
1. `displayPoints` computed — maps every saved `TravelRecord` to a display point
2. `openSavedPointForPlaceOrStartDraft` — when a previously saved place is re-opened ("reused" branch)

**KEY FINDING: typeLabel is hardcoded to null and parentLabel is hardcoded to null in recordToDisplayPoint.**

---

### Step 4 — PointSummaryCard.vue rendering

```ts
const summaryTypeLabel = computed(() => {
  ...
  return props.surface.point.typeLabel ?? null  // ← null → not rendered
})
const summarySubtitle = computed(() => {
  ...
  return (
    props.surface.point.subtitle ??
    props.surface.point.cityContextLabel ??
    props.surface.point.countryName
  )
})
```

The type label badge is only shown when `summaryTypeLabel` is truthy:
```html
<span v-if="summaryTypeLabel" class="point-summary-card__type-label">
  {{ summaryTypeLabel }}
</span>
```

Since `typeLabel` is null → badge is hidden. ✓ consistent with symptom.

For subtitle: `point.subtitle` is populated from `record.subtitle` (which is `'中国 · 特别行政区'`), so subtitle *should* render from a saved record. But the symptom also says "无副标题" — see below.

---

### Step 5 — The two display paths

**Path A: Fresh click (detected-preview mode)**

Flow: `handleMapClick` → `resolveCanonicalPlace` → `applyResolvedPlace` → `buildCanonicalDraftPoint`

`buildCanonicalDraftPoint` correctly maps `place.typeLabel` and `place.subtitle`:
```ts
typeLabel: place.typeLabel,    // ✓ '特别行政区'
subtitle: place.subtitle,      // ✓ '中国 · 特别行政区'
```

This draft point is used via `openSavedPointForPlaceOrStartDraft`. If it's a **new** place (not yet saved), `startDraftFromDetection` is called → `draftPoint` is set → `summaryMode = 'detected-preview'`.

In this path, `typeLabel` IS populated correctly from the server response.

**Path B: Re-opening a saved place**

If the place was already saved (illuminate called earlier), `openSavedPointForPlaceOrStartDraft` takes the "reused" branch:
```ts
const displayPoint = recordToDisplayPoint(savedRecord)  // typeLabel: null, parentLabel: null
selectedPointId.value = displayPoint.id
summaryMode.value = 'view'
```

In **view mode**, `activePoint` is derived from `displayPoints` which also uses `recordToDisplayPoint` — again `typeLabel: null`.

**Path C: illuminate then view**

After `illuminate()`, the optimistic record stored is a `TravelRecord` (no typeLabel). Then `recordToDisplayPoint` is called → `typeLabel: null`.

---

### Root Cause

The **TravelRecord** contract (both the TypeScript interface and presumably the DB schema / API response) does **not** include `typeLabel` or `parentLabel` fields. When `recordToDisplayPoint` maps a `TravelRecord` to a `MapPointDisplay`, it hardcodes both to `null`.

After illuminate (save), the display point source switches from the canonical draft (which has typeLabel) to the TravelRecord-derived display point (which does not). So after saving, typeLabel and parentLabel are lost.

For the subtitle: the subtitle IS stored in TravelRecord (`'中国 · 特别行政区'`) and IS passed through in `recordToDisplayPoint`. However, if the user tests by clicking HK without prior save (detected-preview path), subtitle should appear. The "无副标题" report may relate specifically to the saved/view state OR the subtitle field in the DB not being populated correctly.

The most systematic cause affecting **all** CN_ADMIN types (Beijing same issue) is: **TravelRecord lacks typeLabel/parentLabel, so view-mode display always shows null type label.**

---

## Files Involved

| File | Issue |
|------|-------|
| `packages/contracts/src/records.ts` | `TravelRecord` interface missing `typeLabel` and `parentLabel` fields |
| `apps/web/src/stores/map-points.ts` | `recordToDisplayPoint` hardcodes `typeLabel: null`, `parentLabel: null` (no source in TravelRecord) |
| `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` | Correct — not the problem |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | Rendering is correct — hides badge when typeLabel is null, which is expected behavior |
