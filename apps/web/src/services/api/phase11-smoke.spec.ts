import { PHASE11_SMOKE_RECORD_REQUEST } from '@trip-map/contracts'

import viteConfig from '../../../vite.config'

describe('phase11 smoke api adapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('fetches health status from the default api base path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ok',
        service: 'server',
        contractsVersion: 'contracts-from-server',
        database: 'up',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const { fetchHealthStatus } = await import('./phase11-smoke')
    const response = await fetchHealthStatus()

    expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({
      method: 'GET',
    }))
    expect(response).toMatchObject({
      status: 'ok',
      service: 'server',
      contractsVersion: 'contracts-from-server',
      database: 'up',
    })
  })

  it('posts the shared smoke fixture to the records smoke endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'smoke-record-1',
        ...PHASE11_SMOKE_RECORD_REQUEST,
        createdAt: '2026-03-30T00:00:00.000Z',
        updatedAt: '2026-03-30T00:00:00.000Z',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const { createSmokeRecord } = await import('./phase11-smoke')
    const response = await createSmokeRecord()

    expect(fetchMock).toHaveBeenCalledWith('/api/records/smoke', expect.objectContaining({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(PHASE11_SMOKE_RECORD_REQUEST),
    }))
    expect(response).toMatchObject({
      id: 'smoke-record-1',
      placeId: PHASE11_SMOKE_RECORD_REQUEST.placeId,
      boundaryId: PHASE11_SMOKE_RECORD_REQUEST.boundaryId,
      placeKind: PHASE11_SMOKE_RECORD_REQUEST.placeKind,
      datasetVersion: PHASE11_SMOKE_RECORD_REQUEST.datasetVersion,
    })
  })
})

describe('apps/web dev proxy config', () => {
  it('proxies /api requests to the local server during development', () => {
    const proxy = viteConfig.server?.proxy

    expect(proxy).toBeDefined()
    expect(proxy).toHaveProperty('/api')
    expect(proxy?.['/api']).toMatchObject({
      target: 'http://127.0.0.1:4000',
      changeOrigin: true,
    })
  })
})
