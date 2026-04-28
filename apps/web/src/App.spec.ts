import type { TravelRecord } from '@trip-map/contracts'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { computed, defineComponent, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from './App.vue'
import MapHomeView from './views/MapHomeView.vue'
import StatisticsPageView from './views/StatisticsPageView.vue'
import TimelinePageView from './views/TimelinePageView.vue'
import { useAuthSessionStore } from './stores/auth-session'
import { useMapPointsStore } from './stores/map-points'
import { useMapUiStore } from './stores/map-ui'

const authApiMock = vi.hoisted(() => ({
  fetchAuthBootstrap: vi.fn(),
  loginWithPassword: vi.fn(),
  logoutCurrentSession: vi.fn(),
  registerWithPassword: vi.fn(),
}))

const recordsApiMock = vi.hoisted(() => ({
  createTravelRecord: vi.fn(),
  deleteTravelRecord: vi.fn(),
}))

vi.mock('./services/api/auth', () => ({
  fetchAuthBootstrap: authApiMock.fetchAuthBootstrap,
  loginWithPassword: authApiMock.loginWithPassword,
  logoutCurrentSession: authApiMock.logoutCurrentSession,
  registerWithPassword: authApiMock.registerWithPassword,
}))

vi.mock('./services/api/records', () => ({
  createTravelRecord: recordsApiMock.createTravelRecord,
  deleteTravelRecord: recordsApiMock.deleteTravelRecord,
}))

vi.mock('./components/LeafletMapStage.vue', () => ({
  default: defineComponent({
    name: 'LeafletMapStageStub',
    setup() {
      const mapPointsStore = useMapPointsStore()
      const { travelRecords, hasBootstrapped } = storeToRefs(mapPointsStore)
      const recordsCount = computed(() => travelRecords.value.length)

      return {
        hasBootstrapped,
        recordsCount,
      }
    },
    template:
      '<div class="min-h-0 flex-1" data-region="map-stage">Map Stage {{ recordsCount }} {{ hasBootstrapped }}</div>',
  }),
}))

const mountedWrappers: Array<{ unmount: () => void }> = []

async function mountApp(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
  route = '/',
) {
  const pinia = createPinia()
  const appRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'map-home',
        component: MapHomeView,
      },
      {
        path: '/timeline',
        name: 'timeline',
        component: TimelinePageView,
      },
      {
        path: '/statistics',
        name: 'statistics',
        component: StatisticsPageView,
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/',
      },
    ],
  })
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  setup?.(authSessionStore)

  const wrapper = mount(App, {
    global: {
      plugins: [pinia, appRouter],
    },
  })
  mountedWrappers.push(wrapper)

  await appRouter.push(route)
  await appRouter.isReady()
  await flushPromises()

  return {
    authSessionStore,
    router: appRouter,
    wrapper,
  }
}

describe('App auth shell', () => {
  afterEach(() => {
    while (mountedWrappers.length > 0) {
      mountedWrappers.pop()?.unmount()
    }
  })

  beforeEach(() => {
    authApiMock.fetchAuthBootstrap.mockReset()
    authApiMock.loginWithPassword.mockReset()
    authApiMock.logoutCurrentSession.mockReset()
    authApiMock.registerWithPassword.mockReset()
    recordsApiMock.createTravelRecord.mockReset()
    recordsApiMock.deleteTravelRecord.mockReset()
  })

  it('calls restoreSession exactly once on the first app mount', async () => {
    let restoreSessionSpy: ReturnType<typeof vi.spyOn>
    await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      restoreSessionSpy = vi
        .spyOn(authSessionStore, 'restoreSession')
        .mockResolvedValue(undefined)
    })

    expect(restoreSessionSpy!).toHaveBeenCalledTimes(1)
  })

  it('shows a single 登录 / 注册 chip in the topbar when anonymous', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()

    const topbar = wrapper.get('[data-region="topbar"]')
    const loginRegisterChips = wrapper
      .findAll('button')
      .filter(button => button.text().trim() === '登录 / 注册')

    expect(topbar.text()).toContain('登录 / 注册')
    expect(loginRegisterChips).toHaveLength(1)
    expect(topbar.text()).not.toContain('退出登录')
    expect(topbar.text()).not.toContain('账号设置')
  })

  it('shows only username, email, and 退出登录 in the authenticated dropdown', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()

    await wrapper.get('[data-auth-trigger="authenticated"]').trigger('click')

    expect(wrapper.get('[data-region="topbar"]').text()).toContain('Alice')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@example.com')
    expect(wrapper.text()).toContain('退出登录')
    expect(wrapper.text()).not.toContain('账号设置')
    expect(wrapper.text()).not.toContain('设备列表')
    expect(wrapper.text()).not.toContain('forgot-password')
  })

  it('keeps LeafletMapStage mounted and renders the restoring overlay inside data-region="map-shell"', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'restoring'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()

    const mapShell = wrapper.get('[data-region="map-shell"]')

    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
    expect(mapShell.text()).toContain('正在恢复账号会话')
    expect(mapShell.text()).toContain('正在载入你的云端旅行记录。')
    expect(wrapper.text()).toContain('旅记')
  })

  it('renders the authenticated bootstrap snapshot without issuing an extra /records fetch', async () => {
    const snapshotRecord = {
      id: 'server-rec-cn-beijing',
      placeId: 'cn-beijing',
      boundaryId: 'cn-beijing',
      placeKind: 'CN_ADMIN' as const,
      datasetVersion: 'v3.0-test',
      displayName: '北京市',
      regionSystem: 'CN' as const,
      adminType: 'MUNICIPALITY' as const,
      typeLabel: '直辖市' as const,
      parentLabel: '中国' as const,
      subtitle: '中国 · 直辖市',
      startDate: null,
      endDate: null,
      createdAt: '2026-04-12T00:00:00.000Z',
      updatedAt: '2026-04-20T00:00:00.000Z',
      notes: null,
      tags: [],
    }

    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'restoring'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockImplementation(async () => {
        const mapPointsStore = useMapPointsStore()
        mapPointsStore.replaceTravelRecords([snapshotRecord])
        authSessionStore.status = 'authenticated'
        authSessionStore.currentUser = {
          id: 'user-1',
          username: 'Alice',
          email: 'alice@example.com',
          createdAt: '2026-04-12T00:00:00.000Z',
        }
      })
    })

    await flushPromises()

    expect(wrapper.get('[data-region="map-stage"]').text()).toContain('Map Stage 1 true')
  })

  it('mounts the local import decision dialog when pendingLocalImportDecision exists', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      authSessionStore.pendingLocalImportDecision = {
        legacyRecordCount: 2,
        records: [],
      }
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()

    expect(wrapper.get('[data-local-import-dialog]').text()).toContain('导入本地记录到当前账号')
    expect(wrapper.get('[data-local-import-dialog]').text()).toContain('以当前账号云端记录为准')
  })

  it('closes the import decision dialog after choosing cloud records while keeping the app shell mounted', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      authSessionStore.pendingLocalImportDecision = {
        legacyRecordCount: 1,
        records: [],
      }
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()
    await wrapper.get('[data-local-import-action="keep-cloud"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-local-import-dialog]').exists()).toBe(false)
    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(true)
  })

  it('shows the authoritative import summary after local records are imported', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      authSessionStore.localImportSummary = {
        importedCount: 2,
        mergedDuplicateCount: 1,
        finalCount: 5,
      }
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()

    expect(wrapper.get('[data-local-import-dialog]').text()).toContain('已导入 2 条本地记录')
    expect(wrapper.get('[data-local-import-dialog]').text()).toContain('mergedDuplicateCount')
    expect(wrapper.get('[data-local-import-dialog]').text()).toContain('finalCount')
  })

  // NOTE: App.spec.ts 使用独立的 memory router（不含 auth guard）。
  // 真实 router 的 auth guard 行为由 router/index.spec.ts 覆盖。
  it('renders timeline route without LeafletMapStage', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    }, '/timeline')

    expect(wrapper.find('[data-route-view="timeline"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="timeline-shell"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
  })

  it('keeps the shared topbar when switching between map and timeline routes', async () => {
    const { router, wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-auth-trigger="anonymous"]').exists()).toBe(true)

    await router.push('/timeline')
    await flushPromises()

    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-auth-trigger="anonymous"]').exists()).toBe(true)
    expect(wrapper.find('[data-route-view="timeline"]').exists()).toBe(true)

    await router.push('/')
    await flushPromises()

    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-auth-trigger="anonymous"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(true)
  })

  it('renders map stage only on the map route', async () => {
    const { router, wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(true)

    await router.push('/timeline')
    await flushPromises()

    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
    expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(false)
    expect(wrapper.find('[data-route-view="timeline"]').exists()).toBe(true)

    await router.push('/statistics')
    await flushPromises()

    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
    expect(wrapper.find('[data-route-view="statistics"]').exists()).toBe(true)
  })

  it('renders the logout boundary notice in the app shell', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null
      useMapUiStore().setInteractionNotice({
        tone: 'info',
        message: '已退出当前账号',
      })
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()

    expect(wrapper.text()).toContain('已退出当前账号')
  })

  it('re-arms the auto-dismiss timer when the same notice message appears again', async () => {
    vi.useFakeTimers()

    try {
      const { wrapper } = await mountApp((authSessionStore) => {
        authSessionStore.status = 'anonymous'
        authSessionStore.currentUser = null
        vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
      })
      const mapUiStore = useMapUiStore()

      await nextTick()

      mapUiStore.setInteractionNotice({
        tone: 'info',
        message: '已同步到当前账号。',
      })
      await nextTick()

      vi.advanceTimersByTime(2000)

      mapUiStore.setInteractionNotice({
        tone: 'info',
        message: '已同步到当前账号。',
      })
      await nextTick()

      vi.advanceTimersByTime(1000)
      await nextTick()

      expect(wrapper.text()).toContain('已同步到当前账号。')

      vi.advanceTimersByTime(1600)
      await nextTick()

      expect(wrapper.text()).not.toContain('已同步到当前账号。')
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps topbar identity and map-stage record count in sync after an account switch notice', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-2',
        username: 'Bob',
        email: 'bob@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      mapPointsStore.replaceTravelRecords([
        {
          id: 'record-california',
          placeId: 'us-california',
          boundaryId: 'us-california',
          placeKind: 'OVERSEAS_ADMIN1',
          datasetVersion: 'v3.0-test',
          displayName: 'California',
          regionSystem: 'OVERSEAS',
          adminType: 'ADMIN1',
          typeLabel: 'State',
          parentLabel: 'United States',
          subtitle: 'United States · State',
          startDate: null,
          endDate: null,
          createdAt: '2026-04-12T00:00:00.000Z',
          updatedAt: '2026-04-20T00:00:00.000Z',
          notes: null,
          tags: [],
        },
      ])
      mapUiStore.setInteractionNotice({
        tone: 'info',
        message: '已切换到 Bob',
      })
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    await nextTick()

    expect(wrapper.text()).toContain('已切换到 Bob')
    expect(wrapper.get('[data-region="topbar"]').text()).toContain('Bob')
    expect(wrapper.get('[data-region="map-stage"]').text()).toContain('Map Stage 1 true')
  })

  it('triggers a same-user foreground refresh on window focus while keeping the map shell mounted', async () => {
    let refreshSpy: ReturnType<typeof vi.spyOn>
    const { wrapper } = await mountApp((store) => {
      store.status = 'authenticated'
      store.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      vi.spyOn(store, 'restoreSession').mockResolvedValue(undefined)
      refreshSpy = vi
        .spyOn(store, 'refreshAuthenticatedSnapshot')
        .mockResolvedValue(undefined)
    })

    await nextTick()
    window.dispatchEvent(new Event('focus'))
    await flushPromises()

    expect(refreshSpy!).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
  })

  it('keeps the app shell on the same user during concurrent foreground refresh overlap on window focus', async () => {
    let resolveCreate!: (value: TravelRecord) => void
    let resolveBootstrap!: (value: {
      authenticated: true
      user: NonNullable<ReturnType<typeof useAuthSessionStore>['currentUser']>
      records: TravelRecord[]
    }) => void
    const sameUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    const authoritativeRecord: TravelRecord = {
      id: 'record-beijing-authoritative',
      placeId: 'cn-beijing',
      boundaryId: 'cn-beijing',
      placeKind: 'CN_ADMIN',
      datasetVersion: 'v3.0-test',
      displayName: '北京市',
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
      startDate: null,
      endDate: null,
      createdAt: '2026-04-12T00:00:00.000Z',
      updatedAt: '2026-04-20T00:00:00.000Z',
      notes: null,
      tags: [],
    }
    const { wrapper } = await mountApp((store) => {
      store.status = 'authenticated'
      store.currentUser = sameUser
      vi.spyOn(store, 'restoreSession').mockResolvedValue(undefined)
    })
    const mapPointsStore = useMapPointsStore()

    recordsApiMock.createTravelRecord.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        }),
    )
    authApiMock.fetchAuthBootstrap.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveBootstrap = resolve
        }),
    )

    await nextTick()
    window.dispatchEvent(new Event('focus'))
    const illuminatePromise = mapPointsStore.illuminate({
      placeId: authoritativeRecord.placeId,
      boundaryId: authoritativeRecord.boundaryId,
      placeKind: authoritativeRecord.placeKind,
      datasetVersion: authoritativeRecord.datasetVersion,
      displayName: authoritativeRecord.displayName,
      regionSystem: authoritativeRecord.regionSystem,
      adminType: authoritativeRecord.adminType,
      typeLabel: authoritativeRecord.typeLabel,
      parentLabel: authoritativeRecord.parentLabel,
      subtitle: authoritativeRecord.subtitle,
      startDate: null,
      endDate: null,
    })

    resolveBootstrap({
      authenticated: true,
      user: sameUser,
      records: [],
    })
    await flushPromises()

    resolveCreate(authoritativeRecord)
    await illuminatePromise
    await flushPromises()

    expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').text()).toContain('Map Stage 1 true')
    expect(wrapper.text()).not.toContain('已切换到')
    expect(wrapper.text()).not.toContain('账号会话已失效')
  })

  it('triggers a same-user foreground refresh when the page becomes visible again', async () => {
    let refreshSpy: ReturnType<typeof vi.spyOn>
    await mountApp((store) => {
      store.status = 'authenticated'
      store.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      vi.spyOn(store, 'restoreSession').mockResolvedValue(undefined)
      refreshSpy = vi
        .spyOn(store, 'refreshAuthenticatedSnapshot')
        .mockResolvedValue(undefined)
    })

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })

    await nextTick()
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()

    expect(refreshSpy!).toHaveBeenCalledTimes(1)
  })

  it.each(['anonymous', 'restoring'] as const)(
    'does not trigger foreground refresh while status is %s',
    async (sessionStatus) => {
      let refreshSpy: ReturnType<typeof vi.spyOn>
      await mountApp((store) => {
        store.status = sessionStatus
        store.currentUser = null
        vi.spyOn(store, 'restoreSession').mockResolvedValue(undefined)
        refreshSpy = vi
          .spyOn(store, 'refreshAuthenticatedSnapshot')
          .mockResolvedValue(undefined)
      })

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      })

      await nextTick()
      window.dispatchEvent(new Event('focus'))
      document.dispatchEvent(new Event('visibilitychange'))
      await flushPromises()

      expect(refreshSpy!).not.toHaveBeenCalled()
    },
  )
})
