import { searchOfflineCities } from './city-search'

describe('city search service', () => {
  it('returns Chinese search matches from the broader offline index', () => {
    const results = searchOfflineCities({
      query: '巴黎',
      origin: {
        lat: 48.8566,
        lng: 2.3522
      },
      countryCode: 'FR'
    })

    expect(results[0]).toEqual(
      expect.objectContaining({
        cityId: 'fr-paris',
        cityName: 'Paris',
        contextLabel: 'France · Ile-de-France'
      })
    )
  })

  it('prefers the current country context when ranking English results', () => {
    const results = searchOfflineCities({
      query: 'san',
      origin: {
        lat: 37.7749,
        lng: -122.4194
      },
      countryCode: 'US'
    })

    expect(results[0]).toEqual(
      expect.objectContaining({
        cityId: 'us-san-francisco',
        cityName: 'San Francisco'
      })
    )
  })

  it('returns an empty array when the query is blank', () => {
    expect(
      searchOfflineCities({
        query: '   ',
        origin: {
          lat: 35.0116,
          lng: 135.7681
        },
        countryCode: 'JP'
      })
    ).toEqual([])
  })
})
