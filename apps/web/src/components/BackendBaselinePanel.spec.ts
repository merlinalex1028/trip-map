import { flushPromises, mount } from '@vue/test-utils'

import BackendBaselinePanel from './BackendBaselinePanel.vue'

const { fetchHealthStatus, createSmokeRecord } = vi.hoisted(() => ({
  fetchHealthStatus: vi.fn(),
  createSmokeRecord: vi.fn(),
}))

vi.mock('../services/api/phase11-smoke', () => ({
  fetchHealthStatus,
  createSmokeRecord,
}))

describe('BackendBaselinePanel', () => {
  beforeEach(() => {
    fetchHealthStatus.mockResolvedValue({
      status: 'ok',
      service: 'server',
      contractsVersion: 'phase11-v1',
      database: 'up',
    })
    createSmokeRecord.mockResolvedValue({
      id: 'smoke-record-1',
      placeId: 'phase11-demo-place',
      boundaryId: 'phase11-demo-boundary',
      placeKind: 'OVERSEAS_ADMIN1',
      datasetVersion: 'phase11-smoke-v1',
      displayName: 'Phase 11 Demo Place',
      createdAt: '2026-03-30T00:00:00.000Z',
      updatedAt: '2026-03-30T00:00:00.000Z',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads health status on mount and renders the contract metadata', async () => {
    const wrapper = mount(BackendBaselinePanel)

    await flushPromises()

    expect(fetchHealthStatus).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('server')
    expect(wrapper.text()).toContain('up')
    expect(wrapper.text()).toContain('phase11-v1')
  })

  it('creates a smoke record and renders the returned canonical fields', async () => {
    const wrapper = mount(BackendBaselinePanel)

    await flushPromises()
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(createSmokeRecord).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('phase11-demo-place')
    expect(wrapper.text()).toContain('phase11-demo-boundary')
    expect(wrapper.text()).toContain('OVERSEAS_ADMIN1')
    expect(wrapper.text()).toContain('phase11-smoke-v1')
  })
})
