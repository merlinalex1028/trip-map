# Phase 45: 可用地点覆盖扩展 - Pattern Map

**Mapped:** 2026-05-15  
**Files analyzed:** 19  
**Analogs found:** 19 / 19

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/server/test/phase45-coverage-cases.ts` | test fixture/model | transform + request-response matrix | `apps/server/test/phase28-overseas-cases.ts` | exact |
| `apps/server/test/canonical-resolve.e2e-spec.ts` | test | request-response | `apps/server/test/canonical-resolve.e2e-spec.ts` | exact |
| `apps/server/test/records-travel.e2e-spec.ts` | test | CRUD + request-response | `apps/server/test/records-travel.e2e-spec.ts` | exact |
| `apps/server/test/auth-bootstrap.e2e-spec.ts` | test | request-response replay | `apps/server/test/auth-bootstrap.e2e-spec.ts` | exact |
| `apps/server/test/records-sync.e2e-spec.ts` | test | CRUD + replay sync | `apps/server/test/records-sync.e2e-spec.ts` | role-match |
| `apps/web/src/services/footprint-availability.ts` | service/utility | transform | `apps/web/src/services/geometry-manifest.ts` + `apps/web/src/services/city-boundaries.ts` | role-match |
| `apps/web/src/services/footprint-availability.spec.ts` | test | transform | `apps/web/src/services/geometry-manifest.spec.ts` + `apps/web/src/services/city-boundaries.spec.ts` | role-match |
| `apps/web/src/components/LeafletMapStage.vue` | component/controller | event-driven + request-response | `apps/web/src/components/LeafletMapStage.vue` | exact |
| `apps/web/src/components/LeafletMapStage.spec.ts` | test | event-driven + request-response | `apps/web/src/components/LeafletMapStage.spec.ts` | exact |
| `apps/web/src/components/map-popup/MapContextPopup.vue` | component bridge | event-driven props/events | `apps/web/src/components/map-popup/MapContextPopup.vue` | exact |
| `apps/web/src/components/map-popup/MapContextPopup.spec.ts` | test | event-driven bridge | `apps/web/src/components/map-popup/MapContextPopup.spec.ts` | exact |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | component | event-driven UI state | `apps/web/src/components/map-popup/PointSummaryCard.vue` | exact |
| `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` | test | event-driven component | `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` | exact |
| `apps/web/src/services/geometry-manifest.ts` | service/utility | transform lookup | `apps/web/src/services/geometry-manifest.ts` | exact |
| `apps/web/src/services/geometry-manifest.spec.ts` | test | transform lookup | `apps/web/src/services/geometry-manifest.spec.ts` | exact |
| `apps/web/src/services/timeline.ts` | service/utility | transform | `apps/web/src/services/timeline.ts` | exact |
| `apps/web/src/services/timeline.spec.ts` | test | transform | `apps/web/src/services/timeline.spec.ts` | exact |
| `apps/web/src/views/StatisticsPageView.vue` | component/view | request-response + store watch | `apps/web/src/views/StatisticsPageView.vue` | exact |
| `apps/web/src/views/StatisticsPageView.spec.ts` | test | request-response + store watch | `apps/web/src/views/StatisticsPageView.spec.ts` | exact |

## Pattern Assignments

### `apps/server/test/phase45-coverage-cases.ts` (test fixture/model, transform + request-response matrix)

**Analog:** `apps/server/test/phase28-overseas-cases.ts`

**Imports and catalog-backed fixture pattern** (lines 1-15):
```typescript
import { buildCanonicalMetadataLookup } from '../src/modules/canonical-places/place-metadata-catalog.js'

type Phase28OverseasCaseSeed = {
  iso2: string
  countryLabel: string
  displayName: string
  lat: number
  lng: number
  expectedTypeLabel: string
}

export type Phase28OverseasCase = Phase28OverseasCaseSeed & {
  expectedPlaceId: string
  expectedBoundaryId: string
}
```

**Seed matrix shape** (lines 52-92):
```typescript
const PHASE28_CASE_SEEDS = [
  {
    iso2: 'IN',
    countryLabel: 'India',
    displayName: 'West Bengal',
    lat: 23.0523,
    lng: 87.7289,
    expectedTypeLabel: 'State',
  },
  {
    iso2: 'CA',
    countryLabel: 'Canada',
    displayName: 'British Columbia',
    lat: 54.6943,
    lng: -124.662,
    expectedTypeLabel: 'Province',
  },
] as const satisfies ReadonlyArray<Phase28OverseasCaseSeed>
```

**Validation and resolved export pattern** (lines 223-307):
```typescript
const canonicalLookup = buildCanonicalMetadataLookup()

function resolveCase(seed: Phase28OverseasCaseSeed): Phase28OverseasCase {
  const matches = [...canonicalLookup.byPlaceId.values()].filter(place =>
    place.placeKind === 'OVERSEAS_ADMIN1'
    && place.displayName === seed.displayName
    && place.parentLabel === seed.countryLabel
    && place.typeLabel === seed.expectedTypeLabel,
  )

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one canonical summary for ${seed.iso2}/${seed.displayName}; received ${matches.length}.`,
    )
  }

  const [summary] = matches

  return {
    ...seed,
    expectedPlaceId: summary.placeId,
    expectedBoundaryId: summary.boundaryId,
  }
}

export const PHASE28_NEW_COUNTRY_CASES = PHASE28_CASE_SEEDS.map(resolveCase)
```

**Phase 45 adaptation:** define `Phase45CoverageCase` with click coordinates, expected resolve status, exact technical breakpoint (`missing_boundary_id`, `missing_geometry_manifest`, etc.), friendly category, and optional canonical identity. Keep startup validation that throws targeted errors naming sample id, `placeId`, `boundaryId`, and category.

---

### `apps/server/test/canonical-resolve.e2e-spec.ts` (test, request-response)

**Analog:** `apps/server/test/canonical-resolve.e2e-spec.ts`

**Nest app lifecycle pattern** (lines 1-23):
```typescript
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { createApp } from '../src/main.js'

describe('POST /places canonical resolve', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })
})
```

**Resolved identity assertion pattern** (lines 285-321):
```typescript
for (const phase28Case of PHASE28_NEW_COUNTRY_CASES) {
  const response = await app.inject({
    method: 'POST',
    url: '/places/resolve',
    payload: {
      lat: phase28Case.lat,
      lng: phase28Case.lng,
    },
  })

  expect(response.statusCode).toBe(201)
  expect(response.json()).toMatchObject({
    status: 'resolved',
    place: {
      placeKind: 'OVERSEAS_ADMIN1',
      datasetVersion: CANONICAL_DATASET_VERSION,
      displayName: phase28Case.displayName,
      typeLabel: phase28Case.expectedTypeLabel,
      parentLabel: phase28Case.countryLabel,
      placeId: phase28Case.expectedPlaceId,
      boundaryId: phase28Case.expectedBoundaryId,
      geometryRef: {
        assetKey: 'overseas/layer.json',
        geometryDatasetVersion: '2026-04-21-geo-v3',
      },
    },
  })
}
```

**Failed response assertion pattern** (lines 507-543):
```typescript
const response = await app.inject({
  method: 'POST',
  url: '/places/resolve',
  payload: {
    lat: 19.4326,
    lng: -99.1332,
  },
})

expect(response.statusCode).toBe(201)
expect(response.json()).toMatchObject({
  status: 'failed',
  reason: 'OUTSIDE_SUPPORTED_DATA',
  message: '当前点击位置暂未命中已接入的正式行政区数据。',
})
expect(response.json()).not.toHaveProperty('place')
```

**Phase 45 adaptation:** import `PHASE45_COVERAGE_CASES` and loop through resolved/failed/ambiguous samples. Each failure message should include the case id and expected breakpoint reason so CI output is actionable.

---

### `apps/server/test/records-travel.e2e-spec.ts` (test, CRUD + request-response)

**Analog:** `apps/server/test/records-travel.e2e-spec.ts`

**Environment and DB setup pattern** (lines 14-45, 147-210):
```typescript
try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
}
catch {
  // The test runner may inject envs directly.
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.DIRECT_URL)
process.env.SHADOW_DATABASE_URL = normalizeDatabaseUrl(process.env.SHADOW_DATABASE_URL)

beforeAll(async () => {
  app = await createApp()
  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  await prisma.userTravelRecord.deleteMany({
    where: {
      OR: [
        { placeId: { in: [TEST_PLACE_ID, TEST_PLACE_ID_2] } },
        { user: { email: { startsWith: TEST_EMAIL_PREFIX } } },
      ],
    },
  })
})
```

**Authoritative payload builder pattern** (lines 86-115):
```typescript
function createAuthoritativeOverseasRecord(
  placeIdOrOverrides: string | Partial<typeof unsupportedOverseasRecord> = AUTHORITATIVE_OVERSEAS_PLACE_ID,
  maybeOverrides: Partial<typeof unsupportedOverseasRecord> = {},
) {
  const placeId = typeof placeIdOrOverrides === 'string'
    ? placeIdOrOverrides
    : AUTHORITATIVE_OVERSEAS_PLACE_ID
  const overrides = typeof placeIdOrOverrides === 'string'
    ? maybeOverrides
    : placeIdOrOverrides
  const canonicalSummary = getCanonicalPlaceSummaryById(placeId)

  if (!canonicalSummary) {
    throw new Error(`Missing canonical summary for ${placeId}.`)
  }

  return {
    placeId: canonicalSummary.placeId,
    boundaryId: canonicalSummary.boundaryId,
    placeKind: canonicalSummary.placeKind,
    datasetVersion: canonicalSummary.datasetVersion,
    displayName: canonicalSummary.displayName,
    regionSystem: canonicalSummary.regionSystem,
    adminType: canonicalSummary.adminType,
    typeLabel: canonicalSummary.typeLabel,
    parentLabel: canonicalSummary.parentLabel,
    subtitle: canonicalSummary.subtitle,
    ...overrides,
  }
}
```

**Save and rejection pattern** (lines 349-383):
```typescript
const response = await app.inject({
  method: 'POST',
  url: '/records',
  headers: {
    cookie: sidCookie,
  },
  payload: unsupportedOverseasRecord,
})

expect(response.statusCode).toBe(400)
expect(response.json()).toMatchObject({
  message: 'Overseas travel record is outside the current authoritative overseas support catalog.',
})

const forgedResponse = await app.inject({
  method: 'POST',
  url: '/records',
  headers: {
    cookie: sidCookie,
  },
  payload: createAuthoritativeOverseasRecord({
    datasetVersion: 'forged-dataset-version',
    displayName: 'Forged Tokyo',
  }),
})

expect(forgedResponse.statusCode).toBe(400)
```

**Phase 45 adaptation:** for fixed samples, post canonical payloads from the Phase 45 matrix and assert 201 plus persisted canonical fields. For still-blocked samples, assert 400 and do not weaken `assertAuthoritativeOverseasRecord()`.

---

### `apps/server/test/auth-bootstrap.e2e-spec.ts` (test, request-response replay)

**Analog:** `apps/server/test/auth-bootstrap.e2e-spec.ts`

**Mock canonical catalog pattern** (lines 6-63):
```typescript
const { canonicalSummaries } = vi.hoisted(() => {
  const buildOverseasSummary = (
    placeId: string,
    boundaryId: string,
    displayName: string,
    parentLabel: string,
    typeLabel: string,
  ) => ({
    placeId,
    boundaryId,
    placeKind: 'OVERSEAS_ADMIN1' as const,
    datasetVersion: 'canonical-authoritative-2026-04-21',
    displayName,
    regionSystem: 'OVERSEAS' as const,
    adminType: 'ADMIN1' as const,
    typeLabel,
    parentLabel,
    subtitle: `${parentLabel} · ${typeLabel}`,
  })

  return { canonicalSummaries: [buildOverseasSummary('jp-tokyo', 'ne-admin1-jp-tokyo', 'Tokyo', 'Japan', 'Prefecture')] }
})

vi.mock('../src/modules/canonical-places/place-metadata-catalog.js', () => {
  const byPlaceId = new Map(canonicalSummaries.map(summary => [summary.placeId, summary]))
  const byBoundaryId = new Map(canonicalSummaries.map(summary => [summary.boundaryId, summary]))

  return {
    getCanonicalPlaceSummaryById: (placeId: string) => byPlaceId.get(placeId) ?? null,
    getCanonicalPlaceSummaryByBoundaryId: (boundaryId: string) => byBoundaryId.get(boundaryId) ?? null,
  }
})
```

**Replay labels assertion pattern** (lines 322-377):
```typescript
await prisma.userTravelRecord.createMany({
  data: PHASE28_NEW_COUNTRY_CASES.map(({ expectedPlaceId }) => ({
    userId: user!.id,
    ...createAuthoritativeOverseasRecord(expectedPlaceId),
  })),
})

const response = await app.inject({
  method: 'GET',
  url: '/auth/bootstrap',
  headers: {
    cookie: sidCookie!,
  },
})

expect(response.statusCode).toBe(200)
expect(response.json().authenticated).toBe(true)

for (const phase28Case of PHASE28_NEW_COUNTRY_CASES) {
  const canonicalSummary = getCanonicalPlaceSummaryById(phase28Case.expectedPlaceId)

  expect(response.json().records).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        placeId: phase28Case.expectedPlaceId,
        boundaryId: phase28Case.expectedBoundaryId,
        datasetVersion: canonicalSummary!.datasetVersion,
        displayName: canonicalSummary!.displayName,
        typeLabel: canonicalSummary!.typeLabel,
        parentLabel: canonicalSummary!.parentLabel,
        subtitle: canonicalSummary!.subtitle,
      }),
    ]),
  )
}
```

**Phase 45 adaptation:** add only newly fixed/classified samples, not all manifest entries. Assert replay preserves `displayName`, `typeLabel`, `parentLabel`, and `subtitle`.

---

### `apps/server/test/records-sync.e2e-spec.ts` (test, CRUD + replay sync)

**Analog:** `apps/server/test/records-sync.e2e-spec.ts`

**Sync payload builder pattern** (lines 126-160):
```typescript
function createTravelPayload(placeId = TEST_PLACE_ID) {
  return {
    placeId,
    boundaryId: `boundary-${placeId}`,
    placeKind: 'CN_ADMIN',
    datasetVersion: 'v3.0-test',
    displayName: '同步测试地点',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '中国 · 直辖市',
  }
}

function createOverseasTravelPayload(placeId: string) {
  const canonicalSummary = getCanonicalPlaceSummaryById(placeId)

  if (!canonicalSummary) {
    throw new Error(`Missing canonical summary for ${placeId}.`)
  }

  return {
    placeId: canonicalSummary.placeId,
    boundaryId: canonicalSummary.boundaryId,
    placeKind: canonicalSummary.placeKind,
    datasetVersion: canonicalSummary.datasetVersion,
    displayName: canonicalSummary.displayName,
    regionSystem: canonicalSummary.regionSystem,
    adminType: canonicalSummary.adminType,
    typeLabel: canonicalSummary.typeLabel,
    parentLabel: canonicalSummary.parentLabel,
    subtitle: canonicalSummary.subtitle,
  }
}
```

**Phase 45 adaptation:** use as optional replay/sync analog if planner chooses to extend multi-session validation. Keep DB cleanup and mocked canonical catalog pattern aligned with `auth-bootstrap.e2e-spec.ts`.

---

### `apps/web/src/services/footprint-availability.ts` (service/utility, transform)

**Analogs:** `apps/web/src/services/geometry-manifest.ts`, `apps/web/src/services/city-boundaries.ts`, `apps/web/src/types/map-point.ts`

**Small pure service export pattern** (`geometry-manifest.ts` lines 9-33):
```typescript
import type { GeometryManifestEntry } from '@trip-map/contracts'
import {
  GEOMETRY_DATASET_VERSION as _CONTRACTS_GEOMETRY_DATASET_VERSION,
  GEOMETRY_MANIFEST,
} from '@trip-map/contracts'

export const GEOMETRY_DATASET_VERSION = _CONTRACTS_GEOMETRY_DATASET_VERSION

export function getGeometryManifestEntry(boundaryId: string): GeometryManifestEntry | null {
  const entry = GEOMETRY_MANIFEST.find((e) => e.boundaryId === boundaryId)
  return entry ?? null
}
```

**Manifest-first coverage pattern** (`city-boundaries.ts` lines 55-67):
```typescript
export function hasBoundaryCoverageForBoundaryId(boundaryId: string | null | undefined): boolean {
  if (!boundaryId) {
    return false
  }

  if (getGeometryManifestEntry(boundaryId)) {
    return true
  }

  const renderableBoundaryId = resolveRenderableBoundaryId(boundaryId)

  return renderableBoundaryId ? boundaryFeatureById.has(renderableBoundaryId) : false
}
```

**Required map point fields** (`map-point.ts` lines 7-58):
```typescript
interface BaseMapPoint {
  placeId?: string | null
  placeKind?: PlaceKind | null
  datasetVersion?: string | null
  regionSystem?: 'CN' | 'OVERSEAS' | null
  adminType?: ChinaAdminType | 'ADMIN1' | null
  typeLabel?: string | null
  parentLabel?: string | null
  subtitle?: string | null
  boundaryId: string | null
  fallbackNotice: string | null
}

export interface FootprintPlaceSnapshot {
  placeId: string
  boundaryId: string | null
  placeKind: PlaceKind
  datasetVersion: string
  displayName: string
  regionSystem: 'CN' | 'OVERSEAS'
  adminType: ChinaAdminType | 'ADMIN1' | null
  typeLabel: string | null
  parentLabel: string | null
  subtitle: string | null
}
```

**Phase 45 adaptation:** implement a pure `getFootprintAvailability(point)` or `getFootprintAvailability(point, manifestEntry)` that returns `saveable: true` or `saveable: false` with `reason`, `category`, and user-safe copy. Follow UI-SPEC lines 73-89 for exact mapping.

---

### `apps/web/src/services/footprint-availability.spec.ts` (test, transform)

**Analogs:** `apps/web/src/services/geometry-manifest.spec.ts`, `apps/web/src/services/city-boundaries.spec.ts`

**Lookup service test pattern** (`geometry-manifest.spec.ts` lines 1-12, 31-64):
```typescript
import { describe, expect, it } from 'vitest'

import {
  GEOMETRY_DATASET_VERSION,
  getGeometryManifestEntry,
  listGeometryManifestEntriesByLayer,
} from './geometry-manifest'

describe('geometry-manifest service', () => {
  it('exports GEOMETRY_DATASET_VERSION from the generated contracts manifest', () => {
    expect(GEOMETRY_DATASET_VERSION).toBe('2026-04-21-geo-v3')
  })

  it('can look up ne-admin1-us-california entry', () => {
    const entry = getGeometryManifestEntry('ne-admin1-us-california')
    expect(entry).not.toBeNull()
    expect(entry?.layer).toBe('OVERSEAS')
  })

  it('returns null for unknown boundaryId', () => {
    expect(getGeometryManifestEntry('unknown-boundary')).toBeNull()
  })
})
```

**Matrix assertion pattern** (`city-boundaries.spec.ts` lines 111-135):
```typescript
it('maps canonical boundary ids to renderable web boundary ids when geometry exists', () => {
  expect(getBoundaryById('datav-cn-beijing')).toEqual(
    expect.objectContaining({
      boundaryId: 'cn-beijing-municipality',
      cityId: 'cn-beijing',
    }),
  )
})

it('treats authoritative geometry manifest entries as boundary coverage even without legacy offline city-boundaries mapping', () => {
  expect(hasBoundaryCoverageForBoundaryId('datav-cn-440100')).toBe(true)
  expect(hasBoundaryCoverageForBoundaryId('ne-admin1-us-california')).toBe(true)
})
```

**Phase 45 adaptation:** table-test every technical reason and assert both `reason` and `category`. Also assert returned `copy` never contains forbidden terms from UI-SPEC line 65.

---

### `apps/web/src/components/LeafletMapStage.vue` (component/controller, event-driven + request-response)

**Analog:** `apps/web/src/components/LeafletMapStage.vue`

**Imports and orchestration pattern** (lines 1-31):
```typescript
<script setup lang="ts">
import type { VirtualElement } from '@floating-ui/dom'
import L from 'leaflet'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import { loadGeometryShard } from '../services/geometry-loader'
import {
  GEOMETRY_DATASET_VERSION,
  getGeometryManifestEntry,
  listGeometryManifestEntriesByLayer,
} from '../services/geometry-manifest'
import type { DraftMapPoint, FootprintPlaceSnapshot } from '../types/map-point'
import FootprintDateDialog from './map-popup/FootprintDateDialog.vue'
import MapContextPopup from './map-popup/MapContextPopup.vue'
```

**Current split guard to replace** (lines 513-528, 563-580):
```typescript
const isActivePointIlluminatable = computed(() => {
  const surface = summarySurfaceState.value

  if (!surface || surface.mode === 'candidate-select') {
    return false
  }

  const point = surface.point

  return Boolean(
    point.placeId &&
    point.placeKind &&
    point.datasetVersion &&
    point.boundaryId,
  )
})

function openFootprintDateDialog() {
  const surface = summarySurfaceState.value
  if (!surface || surface.mode === 'candidate-select') return
  const point = surface.point

  if (
    !isActivePointIlluminatable.value ||
    !point.placeId ||
    !point.placeKind ||
    !point.datasetVersion ||
    !point.boundaryId ||
    !point.regionSystem ||
    !point.adminType ||
    !point.typeLabel ||
    !point.parentLabel
  ) {
    return
  }
}
```

**Snapshot-safe submit pattern to preserve** (lines 582-655):
```typescript
footprintPlaceSnapshot.value = {
  placeId: point.placeId,
  boundaryId: point.boundaryId,
  placeKind: point.placeKind,
  datasetVersion: point.datasetVersion,
  displayName: point.name,
  regionSystem: point.regionSystem,
  adminType: point.adminType,
  typeLabel: point.typeLabel,
  parentLabel: point.parentLabel,
  subtitle: point.subtitle ?? point.cityContextLabel ?? null,
}

const result = await mapPointsStore.illuminate(snapshotPayload)

if (result.status === 'saved') {
  isFootprintDialogOpen.value = false
  resetFootprintDialogState()
  setInteractionNotice({
    tone: 'info',
    message: FOOTPRINT_SAVE_SUCCESS_NOTICE,
  })

  const entry = getGeometryManifestEntry(snapshot.boundaryId)
  if (entry) {
    await loadShardIfNeeded(snapshot.boundaryId, entry.layer as 'CN' | 'OVERSEAS')
  }
}
```

**Fallback explanation-only pattern** (lines 905-921):
```typescript
if (response.reason === 'OUTSIDE_SUPPORTED_DATA') {
  const geoResult = await lookupCountryRegionByCoordinates({ lat, lng })
  if (geoResult) {
    const fallbackNotice =
      geoResult.countryCode !== 'CN'
        ? buildUnsupportedOverseasNotice(geoResult.regionName ?? geoResult.displayName)
        : geoResult.fallbackNotice

    openSavedPointForPlaceOrStartDraft(
      buildFallbackDraftPoint(
        {
          ...geoResult,
          fallbackNotice,
        },
        { lat, lng },
      ),
    )
  }
}
```

**Template bridge pattern** (lines 985-1008):
```vue
<MapContextPopup
  v-if="isDesktopPopupVisible && summarySurfaceState && popupAnchor"
  ref="popup"
  :surface="summarySurfaceState"
  :is-saved="isActivePointSaved"
  :is-pending="isActivePointPending"
  :is-illuminatable="isActivePointIlluminatable"
  @leave-footprint="openFootprintDateDialog"
/>
<FootprintDateDialog
  v-model:open="isFootprintDialogOpen"
  :place="footprintPlaceSnapshot"
  :is-submitting="isFootprintSubmitting"
  :error-message="footprintDialogError"
  @submit="submitFootprintDate"
  @cancel="closeFootprintDateDialog"
/>
```

**Phase 45 adaptation:** compute one availability result from `summarySurfaceState.point`; pass `saveable` plus user-safe unavailable data through `MapContextPopup` into `PointSummaryCard`; use the same result inside `openFootprintDateDialog()`.

---

### `apps/web/src/components/LeafletMapStage.spec.ts` (test, event-driven + request-response)

**Analog:** `apps/web/src/components/LeafletMapStage.spec.ts`

**Hoisted mock pattern** (lines 1-37, 113-136):
```typescript
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const canonicalPlacesMock = vi.hoisted(() => ({
  resolveCanonicalPlace: vi.fn(),
  confirmCanonicalPlace: vi.fn(),
}))

const geometryLoaderMock = vi.hoisted(() => ({
  loadGeometryShard: vi.fn(),
}))

const geometryManifestMock = vi.hoisted(() => ({
  GEOMETRY_DATASET_VERSION: '2026-04-21-geo-v3',
  listGeometryManifestEntriesByLayer: vi.fn(() => []),
  getGeometryManifestEntry: vi.fn<(...args: any[]) => any>(() => null),
}))

vi.mock('../services/api/canonical-places', () => ({
  resolveCanonicalPlace: canonicalPlacesMock.resolveCanonicalPlace,
  confirmCanonicalPlace: canonicalPlacesMock.confirmCanonicalPlace,
}))
```

**Pinia and mock reset pattern** (lines 252-289):
```typescript
beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)

  addFeaturesMock.mockReset()
  canonicalPlacesMock.resolveCanonicalPlace.mockReset()
  canonicalPlacesMock.confirmCanonicalPlace.mockReset()
  geometryLoaderMock.loadGeometryShard.mockReset()
  geometryManifestMock.getGeometryManifestEntry.mockReset().mockReturnValue(null)
  geoLookupMock.lookupCountryRegionByCoordinates.mockReset().mockResolvedValue(null)
  recordsApiMock.createTravelRecord.mockReset().mockResolvedValue(
    makeRecord(PHASE12_RESOLVED_BEIJING),
  )
  capturedMapClickHandler = null

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
})
```

**Dialog snapshot and save assertion pattern** (lines 812-866):
```typescript
wrapper.getComponent(MapContextPopup).vm.$emit('leaveFootprint')
await nextTick()

mapPointsStore.startDraftFromDetection(
  makeDraftPoint(PHASE28_RESOLVED_CALIFORNIA, {
    lat: 36.7783,
    lng: -119.4179,
  }),
)
await nextTick()

const dialog = wrapper.getComponent({ name: 'FootprintDateDialog' })
expect(document.body.textContent).toContain('北京')
dialog.vm.$emit('submit', { startDate: '2025-10-01', endDate: null })
await flushPromises()

expect(recordsApiMock.createTravelRecord).toHaveBeenCalledWith(
  expect.objectContaining({
    placeId: PHASE12_RESOLVED_BEIJING.placeId,
    boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
    startDate: '2025-10-01',
    endDate: null,
  }),
)
```

**Fallback disabled assertion pattern** (lines 1032-1107):
```typescript
canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue({
  status: 'failed',
  click: { lat: 49.2827, lng: -123.1207 },
  reason: 'OUTSIDE_SUPPORTED_DATA',
  message: '当前点击位置暂未命中已接入的正式行政区数据。',
})

await triggerMapClick({ lat: 49.2827, lng: -123.1207 })
await flushPromises()

const button = wrapper.get('[data-footprint-cta="true"]')
expect(button.attributes('disabled')).toBeDefined()
expect(mapPointsStore.draftPoint).toEqual(
  expect.objectContaining({
    name: 'British Columbia',
    fallbackNotice: buildUnsupportedOverseasNotice('British Columbia'),
    placeId: null,
    boundaryId: null,
  }),
)

await button.trigger('click')
expect(wrapper.getComponent({ name: 'FootprintDateDialog' }).props('open')).toBe(false)
```

**Phase 45 adaptation:** add matrix-driven tests that malformed points with any missing snapshot field render disabled before click. Assert the dialog guard and CTA state use the same availability result.

---

### `apps/web/src/components/map-popup/MapContextPopup.vue` (component bridge, event-driven props/events)

**Analog:** `apps/web/src/components/map-popup/MapContextPopup.vue`

**Typed props and event bridge pattern** (lines 8-36):
```typescript
const props = withDefaults(
  defineProps<{
    surface: SummarySurfaceState
    anchorSource: 'marker' | 'pending' | 'boundary'
    floatingStyles?: CSSProperties | null
    findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
    tripCount?: number
    latestTripLabel?: string | null
  }>(),
  {
    floatingStyles: null,
    findSavedPointByCityId: undefined,
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
    tripCount: 0,
    latestTripLabel: null,
  }
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueFallback: []
  dismiss: []
  leaveFootprint: []
}>()
```

**PointSummaryCard forwarding pattern** (lines 112-124):
```vue
<PointSummaryCard
  :surface="surface"
  :find-saved-point-by-city-id="findSavedPointByCityId"
  :is-saved="isSaved"
  :is-pending="isPending"
  :is-illuminatable="isIlluminatable"
  :trip-count="tripCount"
  :latest-trip-label="latestTripLabel"
  @confirm-candidate="emit('confirmCandidate', $event)"
  @continue-with-fallback="emit('continueFallback')"
  @dismiss="emit('dismiss')"
  @leave-footprint="emit('leaveFootprint')"
/>
```

**Phase 45 adaptation:** if `PointSummaryCard` needs a `footprintAvailability` or `unavailableReason` prop, add it to this bridge and forward unchanged. Do not derive availability inside this component.

---

### `apps/web/src/components/map-popup/MapContextPopup.spec.ts` (test, event-driven bridge)

**Analog:** `apps/web/src/components/map-popup/MapContextPopup.spec.ts`

**Bridge test pattern** (lines 73-95):
```typescript
it('propagates leaveFootprint and keeps role="dialog" plus aria-modal="false"', async () => {
  const wrapper = mount(MapContextPopup, {
    attachTo: document.body,
    props: {
      surface: {
        mode: 'view',
        point: createViewPoint(),
        boundarySupportState: 'supported'
      } satisfies SummarySurfaceState,
      anchorSource: 'boundary'
    }
  })

  wrapper.findComponent(PointSummaryCard).vm.$emit('leaveFootprint')
  await nextTick()

  expect(wrapper.get('.map-context-popup').attributes('role')).toBe('dialog')
  expect(wrapper.get('.map-context-popup').attributes('aria-modal')).toBe('false')
  expect(wrapper.emitted('leaveFootprint')).toHaveLength(1)
})
```

**Phase 45 adaptation:** assert the new availability prop is forwarded to `PointSummaryCard`, and preserve dialog semantics/focus behavior.

---

### `apps/web/src/components/map-popup/PointSummaryCard.vue` (component, event-driven UI state)

**Analog:** `apps/web/src/components/map-popup/PointSummaryCard.vue`

**Props/emits and computed identity pattern** (lines 27-64):
```typescript
const props = withDefaults(
  defineProps<{
    surface: SummarySurfaceState
    findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
    titleClass?: string
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
    tripCount?: number
    latestTripLabel?: string | null
  }>(),
  {
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
  },
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueWithFallback: []
  dismiss: []
  leaveFootprint: []
}>()

const isCandidateMode = computed(() => props.surface.mode === 'candidate-select')
const summaryPoint = computed(() => detailSurface.value?.point ?? null)
const fallbackPoint = computed(() => candidateSurface.value?.fallbackPoint ?? null)
```

**Current unavailable notice to replace/refine** (lines 161-180, 291-315):
```typescript
const illuminateHint = computed(() =>
  props.isIlluminatable ? null : '已识别到这个地点，但当前数据还不满足保存足迹的条件。',
)

function handleIlluminateToggle() {
  if (props.isPending || !props.isIlluminatable) return
  emit('leaveFootprint')
}
```

```vue
<p
  v-if="!isIlluminatable"
  class="point-summary-card__notice"
  data-footprint-unavailable-reason
  role="note"
>
  已识别到这个地点，但当前数据还不满足保存足迹的条件。
</p>

<button
  v-if="showIlluminateButton"
  class="point-summary-card__illuminate-btn"
  data-footprint-cta="true"
  :disabled="isPending || !isIlluminatable"
  :aria-label="illuminateHint ?? illuminateButtonLabel"
  :title="illuminateHint ?? undefined"
  type="button"
  @click="handleIlluminateToggle"
>
  {{ illuminateButtonLabel }}
</button>
```

**Candidate mode pattern** (lines 248-274):
```vue
<div v-if="isCandidateMode" class="point-summary-card__candidate-list" data-scroll-region="true">
  <button
    v-for="item in candidateItems"
    :key="item.candidate.cityId"
    :data-candidate-status="getCandidateStatus(item.statusHint)"
    :data-candidate-recommended="item.isRecommended ? 'true' : undefined"
    type="button"
    @click="handleCandidateConfirm(item.candidate)"
  >
    <span class="point-summary-card__candidate-city">
      {{ item.canonicalCandidate.displayName }}
    </span>
    <span class="point-summary-card__candidate-cta">确认地点</span>
  </button>
</div>
```

**Phase 45 adaptation:** label must stay `留下足迹` for saved saveable places per UI-SPEC line 55. Keep disabled CTA visible and use category copy from UI-SPEC lines 73-82. Do not render technical reason strings.

---

### `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` (test, event-driven component)

**Analog:** `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`

**Fixture builder pattern** (lines 33-67, 105-129):
```typescript
function createDraftPoint(
  place: ResolvedCanonicalPlace = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<DraftMapPoint> = {},
): DraftMapPoint {
  return {
    id: `detected-${place.placeId}`,
    name: place.displayName,
    countryName: place.parentLabel,
    countryCode: place.regionSystem === 'CN' ? 'CN' : '__canonical__',
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    fallbackNotice: null,
    source: 'detected',
    ...overrides,
  }
}

function makeViewSurface(overrides: Partial<MapPointDisplay> = {}): SummarySurfaceState {
  return {
    mode: 'view',
    point: createViewPoint(overrides),
    boundarySupportState: 'supported',
  }
}
```

**Disabled CTA assertion pattern** (lines 162-179):
```typescript
it('renders a disabled footprint CTA and data-footprint-unavailable-reason for non-saveable points', async () => {
  const wrapper = mount(PointSummaryCard, {
    props: {
      surface: makeViewSurface(),
      isSaved: false,
      isIlluminatable: false,
    },
  })

  const btn = wrapper.find('[data-footprint-cta="true"]')

  expect(btn.attributes('disabled')).toBeDefined()
  expect(wrapper.get('[data-footprint-unavailable-reason]').text()).toContain(
    '已识别到这个地点，但当前数据还不满足保存足迹的条件。',
  )
  await btn.trigger('click')
  expect(wrapper.emitted('leaveFootprint')).toBeFalsy()
})
```

**Candidate and fallback assertion pattern** (lines 410-476):
```typescript
expect(wrapper.get('[data-region="point-summary-card"]').attributes('data-summary-mode')).toBe(
  'candidate-select',
)
expect(wrapper.text()).toContain('北京')
expect(wrapper.text()).toContain('直辖市')
expect(wrapper.find('[data-candidate-recommended="true"]').exists()).toBe(true)
expect(wrapper.text()).not.toContain('按国家/地区继续记录')

const notices = wrapper.findAll('[data-notice-tone="fallback"]')
expect(notices).toHaveLength(2)
expect(notices[0]?.text()).toContain(buildUnsupportedOverseasNotice('British Columbia'))
expect(notices[1]?.text()).toContain('当前地点暂不支持边界高亮')
```

**Phase 45 adaptation:** add assertions for each friendly category copy, stable hidden/test category if implemented, and forbidden text absence (`boundaryId`, `metadata`, `manifest`, etc.). Also update saved CTA expectation to `留下足迹` per UI-SPEC.

---

### `apps/web/src/services/geometry-manifest.ts` (service/utility, transform lookup)

**Analog:** `apps/web/src/services/geometry-manifest.ts`

**Current manifest helper pattern** (lines 9-33):
```typescript
import type { GeometryManifestEntry } from '@trip-map/contracts'
import {
  GEOMETRY_DATASET_VERSION as _CONTRACTS_GEOMETRY_DATASET_VERSION,
  GEOMETRY_MANIFEST,
} from '@trip-map/contracts'

export const GEOMETRY_DATASET_VERSION = _CONTRACTS_GEOMETRY_DATASET_VERSION

export function getGeometryManifestEntry(boundaryId: string): GeometryManifestEntry | null {
  const entry = GEOMETRY_MANIFEST.find((e) => e.boundaryId === boundaryId)
  return entry ?? null
}

export function listGeometryManifestEntriesByLayer(
  layer: 'CN' | 'OVERSEAS',
): GeometryManifestEntry[] {
  return GEOMETRY_MANIFEST.filter((e) => e.layer === layer)
}
```

**Phase 45 adaptation:** likely no behavioral change needed unless planner adds convenience helpers for Phase 45 sample assertions. Keep generated manifest as the source of truth; do not guess shard paths manually.

---

### `apps/web/src/services/geometry-manifest.spec.ts` (test, transform lookup)

**Analog:** `apps/web/src/services/geometry-manifest.spec.ts`

**Representative sample assertion pattern** (lines 41-60):
```typescript
it('can look up representative newly supported overseas admin1 entries', () => {
  const representativeBoundaryIds = [
    'ne-admin1-ca-british-columbia',
    'ne-admin1-de-bavaria',
    'ne-admin1-br-rio-grande-do-sul',
    'ne-admin1-eg-aswan',
    'ne-admin1-sa-eastern',
    'ne-admin1-pg-morobe',
  ]

  for (const boundaryId of representativeBoundaryIds) {
    const entry = getGeometryManifestEntry(boundaryId)
    expect(entry).not.toBeNull()
    expect(entry?.boundaryId).toBe(boundaryId)
    expect(entry?.layer).toBe('OVERSEAS')
    expect(entry?.assetKey).toBe('overseas/layer.json')
    expect(entry?.geometryDatasetVersion).toBe('2026-04-21-geo-v3')
    expect(entry?.renderableId).toBe(boundaryId)
  }
})
```

**Phase 45 adaptation:** extend with Phase 45 fixed sample boundary ids. Keep this focused on manifest lookup, not full resolve or save.

---

### `apps/web/src/services/timeline.ts` (service/utility, transform)

**Analog:** `apps/web/src/services/timeline.ts`

**Persisted label transform pattern** (lines 21-39):
```typescript
function toTimelineEntry(record: TravelRecord): Omit<TimelineEntry, 'visitOrdinal' | 'visitCount'> {
  const hasKnownDate = record.startDate !== null

  return {
    recordId: record.id,
    placeId: record.placeId,
    displayName: record.displayName,
    parentLabel: record.parentLabel,
    subtitle: record.subtitle,
    typeLabel: record.typeLabel,
    startDate: record.startDate,
    endDate: record.endDate,
    createdAt: record.createdAt,
    notes: record.notes,
    tags: record.tags,
    hasKnownDate,
    sortDate: hasKnownDate ? (record.endDate ?? record.startDate) : null,
  }
}
```

**Visit ordinal pattern** (lines 69-89):
```typescript
export function buildTimelineEntries(records: TravelRecord[]): TimelineEntry[] {
  const sortedEntries = records.map(toTimelineEntry).sort(compareTimelineEntries)
  const visitCounts = new Map<string, number>()

  for (const entry of sortedEntries) {
    visitCounts.set(entry.placeId, (visitCounts.get(entry.placeId) ?? 0) + 1)
  }

  const visitOrdinals = new Map<string, number>()

  return sortedEntries.map((entry) => {
    const visitOrdinal = (visitOrdinals.get(entry.placeId) ?? 0) + 1
    visitOrdinals.set(entry.placeId, visitOrdinal)

    return {
      ...entry,
      visitOrdinal,
      visitCount: visitCounts.get(entry.placeId) ?? 1,
    }
  })
}
```

**Phase 45 adaptation:** probably no service change needed; extend tests to prove new fixed samples keep persisted canonical labels.

---

### `apps/web/src/services/timeline.spec.ts` (test, transform)

**Analog:** `apps/web/src/services/timeline.spec.ts`

**Record builder and fixture use pattern** (lines 1-34):
```typescript
import type { ResolvedCanonicalPlace, TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE28_RESOLVED_CALIFORNIA,
  PHASE28_RESOLVED_TOKYO,
} from '@trip-map/contracts'

function makeRecord(
  place: ResolvedCanonicalPlace,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `record-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    startDate: null,
    endDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    notes: null,
    tags: [],
    ...overrides,
  }
}
```

**Derived entry assertion pattern** (lines 154-193):
```typescript
it('assigns visitOrdinal and visitCount per place', () => {
  const entries = buildTimelineEntries([
    makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
      id: 'california-visit-1',
      startDate: '2025-04-10',
    }),
    makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
      id: 'california-visit-2',
      startDate: '2025-08-20',
    }),
  ])

  expect(entries).toEqual([
    expect.objectContaining({
      recordId: 'california-visit-1',
      visitOrdinal: 1,
      visitCount: 2,
    }),
    expect.objectContaining({
      recordId: 'california-visit-2',
      visitOrdinal: 2,
      visitCount: 2,
    }),
  ])
})
```

**Phase 45 adaptation:** add a Phase 45 fixed sample and assert `displayName`, `typeLabel`, `parentLabel`, and `subtitle` equal the persisted record fields, not recomputed fallback values.

---

### `apps/web/src/views/StatisticsPageView.vue` (component/view, request-response + store watch)

**Analog:** `apps/web/src/views/StatisticsPageView.vue`

**Store import and derived revision pattern** (lines 1-59):
```typescript
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useStatsStore } from '../stores/stats'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()
const statsStore = useStatsStore()

const { boundaryVersion, currentUser, status } = storeToRefs(authSessionStore)
const { travelRecords } = storeToRefs(mapPointsStore)
const { stats, isLoading, error } = storeToRefs(statsStore)
const pendingRefreshAfterLoad = shallowRef(false)

const travelRecordRevision = computed(() =>
  travelRecords.value
    .map((record) => [
      record.id,
      record.placeId,
      record.createdAt,
      record.parentLabel,
      record.displayName,
      record.typeLabel,
      record.subtitle,
      record.startDate,
      record.endDate,
      record.notes,
      record.tags.join(','),
    ].join('\u0000'))
    .join('|'),
)
```

**Refresh watcher pattern** (lines 61-112):
```typescript
function fetchStatsIfAuthenticated() {
  if (status.value === 'authenticated' && currentUser.value !== null) {
    void statsStore.fetchStatsData()
  }
}

onMounted(() => {
  fetchStatsIfAuthenticated()
})

watch(
  () => travelRecordRevision.value,
  (nextRevision, previousRevision) => {
    if (
      previousRevision !== undefined
      && nextRevision !== previousRevision
      && status.value === 'authenticated'
      && currentUser.value !== null
    ) {
      if (isLoading.value) {
        pendingRefreshAfterLoad.value = true
        return
      }

      void statsStore.fetchStatsData()
    }
  },
)
```

**Phase 45 adaptation:** service may not need change; if new samples affect stats, ensure metadata changes in `displayName`, `typeLabel`, `parentLabel`, and `subtitle` remain in `travelRecordRevision`.

---

### `apps/web/src/views/StatisticsPageView.spec.ts` (test, request-response + store watch)

**Analog:** `apps/web/src/views/StatisticsPageView.spec.ts`

**Mount helper and API mock pattern** (lines 14-90):
```typescript
const { fetchStatsMock } = vi.hoisted(() => ({
  fetchStatsMock: vi.fn(),
}))

vi.mock('../services/api/stats', () => ({
  fetchStats: fetchStatsMock,
}))

function mountStatisticsPage(
  setup?: (context: {
    authSessionStore: ReturnType<typeof useAuthSessionStore>
    mapPointsStore: ReturnType<typeof useMapPointsStore>
  }) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  const mapPointsStore = useMapPointsStore()

  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null
  setup?.({ authSessionStore, mapPointsStore })

  const wrapper = mount(StatisticsPageView, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })

  return { authSessionStore, mapPointsStore, wrapper }
}
```

**Metadata-only refresh assertion pattern** (lines 221-252):
```typescript
const baseRecord = makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
  id: 'california-1',
  createdAt: '2025-02-01T00:00:00.000Z',
})
const refreshedRecord = {
  ...baseRecord,
  parentLabel: 'Canada',
  displayName: 'Ontario',
  typeLabel: 'Province',
  subtitle: 'Canada · Province',
}

const { mapPointsStore, wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = makeUser()
  mapPointsStore.replaceTravelRecords([baseRecord])
})

await flushPromises()
expect(fetchStatsMock).toHaveBeenCalledTimes(1)

mapPointsStore.replaceTravelRecords([refreshedRecord])
await nextTick()
expect(fetchStatsMock).toHaveBeenCalledTimes(2)

expect(wrapper.get('[data-state="populated"]').text()).toContain(
  '1 次旅行 · 1 个地点 · 2 个国家/地区',
)
```

**Queued refresh pattern** (lines 254-320):
```typescript
mapPointsStore.replaceTravelRecords([refreshedRecord])
await nextTick()
expect(fetchStatsMock).toHaveBeenCalledTimes(1)

resolveFirst({ totalTrips: 1, uniquePlaces: 1, visitedCountries: 1, totalSupportedCountries: 21 })
await flushPromises()
await nextTick()

expect(fetchStatsMock).toHaveBeenCalledTimes(2)

resolveSecond({ totalTrips: 1, uniquePlaces: 1, visitedCountries: 2, totalSupportedCountries: 21 })
await flushPromises()
await nextTick()
```

**Phase 45 adaptation:** add fixed-sample stats assertions only if Phase 45 changes replayed metadata or stats grouping. Keep this focused on derived view behavior, not map click mechanics.

## Shared Patterns

### Reason Categories and User-Safe Copy

**Source:** `.planning/phases/45-map-authoritative-coverage-expansion/45-UI-SPEC.md` lines 73-89  
**Apply to:** `footprint-availability.ts`, `PointSummaryCard.vue`, `PointSummaryCard.spec.ts`, `LeafletMapStage.spec.ts`

```markdown
| `missing_boundary_id` | `map_data_unavailable` | `已识别到这个地点，但地图数据还不够完整，暂时不能保存足迹。` |
| `missing_geometry_manifest` | `map_data_unavailable` | `已识别到这个地点，但地图数据还不够完整，暂时不能保存足迹。` |
| `missing_metadata_catalog` | `map_data_unavailable` | `已识别到这个地点，但地图数据还不够完整，暂时不能保存足迹。` |
| `frontend_guard_blocked` | `place_not_precise_enough` | `已识别到这个地点，但还需要更稳定的地点信息才能保存足迹。` |
| `missing_canonical_identity` | `place_not_precise_enough` | `已识别到附近区域，但还不能确认到可保存的具体地点。` |
| `fallback_explanatory_only` | `outside_supported_map` | `这里暂时只能用于查看位置，还不能留下足迹。` |
| `record_authoritative_rejected` | `temporarily_unavailable` | `这个地点暂时还不能保存足迹，请稍后再试。` |
```

Do not render technical reason strings in visible UI. Preserve exact technical reasons in tests and logs.

### Availability Gate Must Be Single-Source

**Source:** `.planning/phases/45-map-authoritative-coverage-expansion/45-UI-SPEC.md` lines 93-111  
**Apply to:** `LeafletMapStage.vue`, `MapContextPopup.vue`, `PointSummaryCard.vue`

```markdown
- Replace split boolean checks with a reason-returning predicate such as `getFootprintAvailability(point, manifestState)`.
- The same predicate must decide `PointSummaryCard.isIlluminatable`, `PointSummaryCard` unavailable reason, and `openFootprintDateDialog()` guard.
- If a point lacks any field required for `FootprintPlaceSnapshot`, the CTA must already be disabled before the user can click it.
- `openFootprintDateDialog()` must never fail silently after a visibly enabled CTA click.
```

### Canonical Resolve Contract

**Source:** `packages/contracts/src/resolve.ts` lines 15-47  
**Apply to:** server matrix, resolve e2e, frontend failed/fallback tests

```typescript
export interface ResolvedCanonicalPlace extends CanonicalPlaceSummary {
  geometryRef: GeometryRef
}

export type CanonicalResolveResponse =
  | {
      status: 'resolved'
      click: { lat: number; lng: number }
      place: ResolvedCanonicalPlace
    }
  | {
      status: 'ambiguous'
      click: { lat: number; lng: number }
      prompt: string
      recommendedPlaceId: string | null
      candidates: CanonicalPlaceCandidate[]
    }
  | {
      status: 'failed'
      click: { lat: number; lng: number }
      reason: CanonicalResolveFailedReason
      message: string
    }
```

Failed responses do not carry saveable place fields. Frontend fallback labels must remain explanatory only.

### Metadata Catalog Integrity

**Source:** `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` lines 126-160, 162-201, 216-222  
**Apply to:** `phase45-coverage-cases.ts`, records tests, bootstrap tests

```typescript
function createCanonicalPlaceSummary(
  entry: GeometryManifestEntry,
  feature: GeometryFeature,
): CanonicalPlaceSummary {
  const props = feature.properties

  if (
    !props.placeId
    || !props.displayName
    || !props.placeKind
    || !props.datasetVersion
    || !props.regionSystem
    || !props.adminType
    || !props.typeLabel
    || !props.parentLabel
    || !props.subtitle
  ) {
    throw new Error(
      `Feature "${entry.boundaryId}" is missing canonical place metadata in geometry shard "${entry.assetKey}".`,
    )
  }

  return {
    placeId: props.placeId,
    boundaryId: entry.boundaryId,
    placeKind: props.placeKind,
    datasetVersion: props.datasetVersion,
    displayName: props.displayName,
    regionSystem: props.regionSystem,
    adminType: props.adminType,
    typeLabel: props.typeLabel,
    parentLabel: props.parentLabel,
    subtitle: props.subtitle,
  }
}
```

Use catalog helpers to build authoritative expected payloads; do not duplicate metadata literals when catalog lookup can derive them.

### Record API Authoritative Rejection

**Source:** `apps/server/src/modules/records/records.service.ts` lines 140-179  
**Apply to:** `records-travel.e2e-spec.ts`, coverage matrix blocked cases

```typescript
private assertAuthoritativeOverseasRecord(input: CreateTravelRecordDto): void {
  const isOverseasPayload = input.placeKind === 'OVERSEAS_ADMIN1' || input.regionSystem === 'OVERSEAS'

  if (!isOverseasPayload) {
    return
  }

  if (input.placeKind !== 'OVERSEAS_ADMIN1') {
    throw new BadRequestException(
      'Overseas travel records must use authoritative OVERSEAS_ADMIN1 payloads.',
    )
  }

  const placeSummary = getCanonicalPlaceSummaryById(input.placeId)
  const boundarySummary = getCanonicalPlaceSummaryByBoundaryId(input.boundaryId)

  if (!placeSummary || !boundarySummary || placeSummary.placeId !== boundarySummary.placeId) {
    throw new BadRequestException(
      'Overseas travel record is outside the current authoritative overseas support catalog.',
    )
  }

  const mismatchedFields = [
    ['datasetVersion', input.datasetVersion, placeSummary.datasetVersion],
    ['displayName', input.displayName, placeSummary.displayName],
    ['regionSystem', input.regionSystem, placeSummary.regionSystem],
    ['adminType', input.adminType, placeSummary.adminType],
    ['typeLabel', input.typeLabel, placeSummary.typeLabel],
    ['parentLabel', input.parentLabel, placeSummary.parentLabel],
    ['subtitle', input.subtitle, placeSummary.subtitle],
  ]
    .filter(([, actual, expected]) => actual !== expected)
    .map(([field]) => field)
}
```

Phase 45 should expand coverage without allowing forged or stale overseas payloads.

### Validation Commands

**Source:** `.planning/phases/45-map-authoritative-coverage-expansion/45-VALIDATION.md` lines 41-60  
**Apply to:** all plans

```markdown
45-W0-01: `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts`
45-W0-02: `pnpm --filter @trip-map/web test -- src/services/footprint-availability.spec.ts src/components/map-popup/PointSummaryCard.spec.ts`
45-W0-03: `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts`
45-W0-04: `pnpm --filter @trip-map/web test -- src/services/timeline.spec.ts src/views/StatisticsPageView.spec.ts`
```

DB-backed records/auth-bootstrap failures should be reported as environment health separately from behavioral failures.

## No Analog Found

None. Every planned or implied Phase 45 file has a close analog in the current codebase.

## Metadata

**Analog search scope:** `apps/server/test`, `apps/server/src/modules/canonical-places`, `apps/server/src/modules/records`, `apps/web/src/services`, `apps/web/src/components`, `apps/web/src/views`, `apps/web/src/stores`, `apps/web/src/types`, `packages/contracts/src`  
**Files scanned:** 35+ via `rg --files`, `git ls-files`, targeted `rg`, `wc -l`, and `nl -ba` reads  
**Project instructions:** `AGENTS.md` read; Chinese user communication required  
**Project skills:** no project-local `.codex/skills` or `.agents/skills` directories found; Vue best-practices and Vue testing skill summaries read for Vue SFC/spec constraints  
**Pattern extraction date:** 2026-05-15
