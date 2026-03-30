import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import { POINT_STORAGE_KEY } from '../services/point-storage'
import type { DraftMapPoint } from '../types/map-point'
import { useMapPointsStore } from './map-points'

if (PHASE12_AMBIGUOUS_RESOLVE.status !== 'ambiguous') {
  throw new Error('Expected ambiguous canonical resolve fixture')
}

function installStorageMock() {
  const storage = new Map<string, string>()
  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  }

  vi.stubGlobal('localStorage', localStorageMock)
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  })
}

function createCanonicalDraft(
  place = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<DraftMapPoint> = {},
): DraftMapPoint {
  return {
    id: `detected-${place.placeId}`,
    name: place.displayName,
    countryName: place.parentLabel,
    countryCode: place.regionSystem === 'CN' ? 'CN' : '__canonical__',
    precision: 'city-high',
    cityId: null,
    cityName: place.displayName,
    cityContextLabel: place.subtitle,
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    boundaryDatasetVersion: place.datasetVersion,
    fallbackNotice: null,
    lat: place.regionSystem === 'CN' ? 39.9042 : 36.7783,
    lng: place.regionSystem === 'CN' ? 116.4074 : -119.4179,
    clickLat: place.regionSystem === 'CN' ? 39.9042 : 36.7783,
    clickLng: place.regionSystem === 'CN' ? 116.4074 : -119.4179,
    x: place.regionSystem === 'CN' ? 0.74 : 0.15,
    y: place.regionSystem === 'CN' ? 0.31 : 0.44,
    source: 'detected',
    isFeatured: false,
    description: 'canonical draft',
    coordinatesLabel:
      place.regionSystem === 'CN' ? '39.9042°N, 116.4074°E' : '36.7783°N, 119.4179°W',
    ...overrides,
  }
}

describe('map-points store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    installStorageMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps pending canonical candidates in summary mode without creating a fallback draft', () => {
    const store = useMapPointsStore()
    const pendingDraft = createCanonicalDraft(PHASE12_RESOLVED_BEIJING, {
      id: 'pending-click',
      name: '待确认地点',
      placeId: null,
      placeKind: null,
      datasetVersion: null,
      typeLabel: null,
      parentLabel: null,
      subtitle: null,
      boundaryId: null,
      boundaryDatasetVersion: null,
      cityName: null,
      cityContextLabel: PHASE12_AMBIGUOUS_RESOLVE.prompt,
      fallbackNotice: PHASE12_AMBIGUOUS_RESOLVE.prompt,
      countryCode: '__canonical__',
      countryName: '待确认',
    })

    store.startPendingCanonicalSelection({
      draftPoint: pendingDraft,
      prompt: PHASE12_AMBIGUOUS_RESOLVE.prompt,
      recommendedPlaceId: PHASE12_AMBIGUOUS_RESOLVE.recommendedPlaceId,
      candidates: PHASE12_AMBIGUOUS_RESOLVE.candidates,
      click: PHASE12_AMBIGUOUS_RESOLVE.click,
    })

    expect(store.summaryMode).toBe('candidate-select')
    expect(store.draftPoint).toBeNull()
    expect(store.pendingCanonicalSelection?.recommendedPlaceId).toBe(
      PHASE12_AMBIGUOUS_RESOLVE.recommendedPlaceId,
    )
    expect(store.summarySurfaceState?.mode).toBe('candidate-select')
    expect(store.summarySurfaceState?.fallbackPoint).toEqual(
      expect.objectContaining({
        fallbackNotice: PHASE12_AMBIGUOUS_RESOLVE.prompt,
        clickLat: PHASE12_AMBIGUOUS_RESOLVE.click.lat,
        clickLng: PHASE12_AMBIGUOUS_RESOLVE.click.lng,
      }),
    )
    expect(store.summarySurfaceState?.cityCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cityId: PHASE12_AMBIGUOUS_RESOLVE.candidates[0]?.placeId,
          cityName: PHASE12_AMBIGUOUS_RESOLVE.candidates[0]?.displayName,
        }),
      ]),
    )
  })

  it('reuses saved points by canonical placeId instead of legacy cityId', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(
      createCanonicalDraft(PHASE12_RESOLVED_BEIJING, {
        cityId: null,
        cityName: null,
        cityContextLabel: 'legacy city field intentionally empty',
      }),
    )
    const savedPoint = store.saveDraftAsPoint()

    const decision = store.openSavedPointForPlaceOrStartDraft(
      createCanonicalDraft(PHASE12_RESOLVED_BEIJING, {
        id: 'detected-beijing-second-click',
        cityId: 'legacy-city-id-should-not-match',
      }),
    )

    expect(savedPoint).not.toBeNull()
    expect(decision.type).toBe('reused')
    expect(decision.point.id).toBe(savedPoint?.id)
    expect(store.activePoint?.placeId).toBe(PHASE12_RESOLVED_BEIJING.placeId)
    expect(store.activePoint?.cityId).toBeNull()
  })

  it('keeps pending, active, and saved surfaces on the same canonical identity fields', () => {
    const store = useMapPointsStore()
    const draftPoint = createCanonicalDraft(PHASE12_RESOLVED_CALIFORNIA)

    store.startPendingCanonicalSelection({
      draftPoint: createCanonicalDraft(PHASE12_RESOLVED_CALIFORNIA, {
        id: 'pending-california',
        name: 'California click',
        placeId: null,
        placeKind: null,
        datasetVersion: null,
        typeLabel: null,
        parentLabel: null,
        subtitle: null,
        boundaryId: null,
        boundaryDatasetVersion: null,
        fallbackNotice: '需要确认一级行政区',
      }),
      prompt: '请确认一级行政区',
      recommendedPlaceId: PHASE12_RESOLVED_CALIFORNIA.placeId,
      candidates: [PHASE12_RESOLVED_CALIFORNIA],
      click: {
        lat: 36.7783,
        lng: -119.4179,
      },
    })

    expect(store.summarySurfaceState).toEqual(
      expect.objectContaining({
        mode: 'candidate-select',
        cityCandidates: [
          expect.objectContaining({
            cityId: PHASE12_RESOLVED_CALIFORNIA.placeId,
          }),
        ],
      }),
    )

    store.startDraftFromDetection(draftPoint)

    expect(store.activePoint).toEqual(
      expect.objectContaining({
        placeId: PHASE12_RESOLVED_CALIFORNIA.placeId,
        boundaryId: PHASE12_RESOLVED_CALIFORNIA.boundaryId,
        placeKind: PHASE12_RESOLVED_CALIFORNIA.placeKind,
        datasetVersion: PHASE12_RESOLVED_CALIFORNIA.datasetVersion,
        clickLat: 36.7783,
        clickLng: -119.4179,
      }),
    )

    const savedPoint = store.saveDraftAsPoint()

    expect(savedPoint).toEqual(
      expect.objectContaining({
        placeId: PHASE12_RESOLVED_CALIFORNIA.placeId,
        boundaryId: PHASE12_RESOLVED_CALIFORNIA.boundaryId,
        placeKind: PHASE12_RESOLVED_CALIFORNIA.placeKind,
        datasetVersion: PHASE12_RESOLVED_CALIFORNIA.datasetVersion,
        clickLat: 36.7783,
        clickLng: -119.4179,
      }),
    )
    expect(store.selectedBoundaryId).toBe(PHASE12_RESOLVED_CALIFORNIA.boundaryId)
    expect(store.savedBoundaryIds).toEqual([PHASE12_RESOLVED_CALIFORNIA.boundaryId])
  })

  it('marks legacy version-1 local snapshots as incompatible during bootstrap', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        userPoints: [],
        seedOverrides: [],
        deletedSeedIds: [],
      }),
    )

    const store = useMapPointsStore()
    store.bootstrapPoints()

    expect(store.storageHealth).toBe('incompatible')
    expect(store.userPoints).toEqual([])
  })
})
