# Debug: California Not Recognized (UAT Phase 12, Test 5)

## Symptom
User reports "无法识别" when clicking California on the map. No popup appears.

## Investigation

### 1. Fixture existence — California IS present
`apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` line 149–155:

```ts
{
  kind: 'resolved',
  click: { lat: 36.7783, lng: -119.4179 },
  placeId: 'us-california',
},
```

California is registered and maps to `us-california` in `canonicalPlaceCatalogBase`.

### 2. Geometry manifest — entry IS present
`packages/contracts/src/generated/geometry-manifest.generated.ts` line 66–75:

```json
{
  "boundaryId": "ne-admin1-us-california",
  "layer": "OVERSEAS",
  "geometryDatasetVersion": "2026-03-31-geo-v1",
  "assetKey": "overseas/us.json",
  "renderableId": "ne-admin1-us-california"
}
```

The geometry ref lookup will succeed — this is not the problem.

### 3. Resolver matching — EXTREMELY tight tolerance
`canonical-places.service.ts` lines 151–154:

```ts
private findFixture(input: ResolveCanonicalPlaceRequest): CanonicalResolveFixture | undefined {
  return CANONICAL_RESOLVE_FIXTURES.find(fixture => (
    Math.abs(fixture.click.lat - input.lat) < 0.0001
    && Math.abs(fixture.click.lng - input.lng) < 0.0001
  ))
}
```

The fixture is registered for exactly `lat: 36.7783, lng: -119.4179`. The tolerance is only ±0.0001 degrees (~11 meters). A real user clicking "somewhere on California" on a world map will click coordinates that differ by many degrees from the fixture point. **Any click not within 11 meters of that exact point returns `status: 'failed'` with reason `OUTSIDE_SUPPORTED_DATA`.**

### 4. What happens on OUTSIDE_SUPPORTED_DATA in the client
`LeafletMapStage.vue` lines 650–661:

```ts
if (response.reason === 'OUTSIDE_SUPPORTED_DATA') {
  const geoResult = lookupCountryRegionByCoordinates({ lat, lng })
  if (geoResult) {
    openSavedPointForPlaceOrStartDraft(buildFallbackDraftPoint(geoResult, { lat, lng }))
    // ... clears notice, finishes recognition
    return
  }
}
setInteractionNotice({ tone: 'info', message: response.message })
```

When the server returns `OUTSIDE_SUPPORTED_DATA`, the client **falls back to a client-side geo lookup** (`lookupCountryRegionByCoordinates`). If that geo lookup returns a result for "USA/California", it builds a `fallbackDraftPoint` — but that fallback point has `placeId: null`, `placeKind: null`, `typeLabel: null`, so no canonical State label or United States subtitle is shown.

If the geo lookup returns nothing (e.g. ocean, unsupported region), there is no popup at all — just an interaction notice message. This matches the "无法识别" symptom: the user sees neither a canonical popup nor any draft point.

### 5. typeLabel discrepancy — secondary finding
Even if the exact coordinates were sent, the UAT expects `typeLabel: "State"` but the fixture stores `typeLabel: '一级行政区'` (Chinese). The UAT truth statement says "State" but the fixture produces "一级行政区". This is a data/expectation mismatch that would show up even if the coordinate match succeeded.

## Root Cause Summary

**Primary:** The `findFixture` tolerance (±0.0001°, ~11 meters) is designed for exact fixture matching, not real geographic area matching. A user clicking anywhere on California on a world-scale Leaflet map sends coordinates that almost certainly don't match the single registered point `(36.7783, -119.4179)` within 11 meters. The server returns `OUTSIDE_SUPPORTED_DATA`, and the fallback client-side geo lookup either (a) returns a non-canonical USA region result with no typeLabel, or (b) returns nothing — producing no recognizable popup.

**Secondary:** The fixture `typeLabel` for California is `'一级行政区'`, not `"State"` as expected by UAT Test 5. The UAT expectation and the fixture data disagree.

## Files Involved

- `apps/server/src/modules/canonical-places/canonical-places.service.ts` — `findFixture` method: tolerance ±0.0001° makes it impossible to match via real map clicks
- `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts` — `us-california` fixture: `typeLabel` is `'一级行政区'` not `'State'`; single point coordinate for California
- `apps/web/src/components/LeafletMapStage.vue` — `handleMapClick`: on `OUTSIDE_SUPPORTED_DATA`, falls back to client-side geo; produces non-canonical draft or nothing
- `.planning/phases/12-canonical/12-UAT.md` — Test 5 expects `typeLabel: "State"` which contradicts fixture value
