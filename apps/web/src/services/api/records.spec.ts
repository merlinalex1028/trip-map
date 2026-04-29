import type { TravelRecord, UpdateTravelRecordRequest } from '@trip-map/contracts'

import { ApiClientError } from './client'
import { deleteSingleRecord, updateTravelRecord } from './records'

const fetchMock = vi.fn()

vi.stubGlobal('fetch', fetchMock)

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function emptyResponse(status = 204): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => undefined,
  } as Response
}

const sampleRecord: TravelRecord = {
  id: 'rec-1',
  placeId: 'place-1',
  boundaryId: 'boundary-1',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'v1',
  displayName: '北京',
  regionSystem: 'CN',
  adminType: 'MUNICIPALITY',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
  startDate: '2025-01-01',
  endDate: '2025-01-07',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  notes: null,
  tags: [],
}

beforeEach(() => {
  fetchMock.mockReset()
})

describe('updateTravelRecord', () => {
  it('sends PATCH request to /records/{id} with JSON body', async () => {
    const request: UpdateTravelRecordRequest = {
      startDate: '2025-06-01',
      endDate: '2025-06-07',
    }
    fetchMock.mockResolvedValueOnce(jsonResponse(sampleRecord))

    await updateTravelRecord('rec-1', request)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/records/rec-1',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include',
      }),
    )
  })

  it('returns parsed TravelRecord on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(sampleRecord))

    const result = await updateTravelRecord('rec-1', { startDate: '2025-06-01' })

    expect(result).toEqual(sampleRecord)
  })

  it('encodes id with encodeURIComponent for special characters', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(sampleRecord))

    await updateTravelRecord('id/with/slashes', { notes: 'test' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/records/id%2Fwith%2Fslashes',
      expect.anything(),
    )
  })

  it('throws ApiClientError with code session-unauthorized on 401', async () => {
    fetchMock.mockResolvedValue(emptyResponse(401))

    await expect(updateTravelRecord('rec-1', {})).rejects.toThrow(ApiClientError)

    try {
      await updateTravelRecord('rec-1', {})
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      expect((error as ApiClientError).code).toBe('session-unauthorized')
    }
  })

  it('throws ApiClientError with code http-error on non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(500))

    await expect(updateTravelRecord('rec-1', {})).rejects.toMatchObject({
      code: 'http-error',
    })
  })
})

describe('deleteSingleRecord', () => {
  it('sends DELETE request to /records/record/{id}', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(204))

    await deleteSingleRecord('rec-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/records/record/rec-1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      }),
    )
  })

  it('returns undefined on 204 success', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(204))

    const result = await deleteSingleRecord('rec-1')

    expect(result).toBeUndefined()
  })

  it('encodes id with encodeURIComponent for special characters', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(204))

    await deleteSingleRecord('id/with/slashes')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/records/record/id%2Fwith%2Fslashes',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('throws ApiClientError with code session-unauthorized on 401', async () => {
    fetchMock.mockResolvedValue(emptyResponse(401))

    await expect(deleteSingleRecord('rec-1')).rejects.toThrow(ApiClientError)

    try {
      await deleteSingleRecord('rec-1')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      expect((error as ApiClientError).code).toBe('session-unauthorized')
    }
  })

  it('throws ApiClientError with code http-error on non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(500))

    await expect(deleteSingleRecord('rec-1')).rejects.toMatchObject({
      code: 'http-error',
    })
  })
})
