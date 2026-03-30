import { searchOfflineCities } from './city-search'

describe('city search service', () => {
  it('returns Chinese search matches outside the original demo-sized index', () => {
    const results = searchOfflineCities({
      query: '布达佩斯',
      origin: {
        lat: 47.4979,
        lng: 19.0402
      },
      countryCode: 'HU'
    })

    expect(results[0]).toEqual(
      expect.objectContaining({
        cityId: 'hu-budapest',
        cityName: 'Budapest',
        contextLabel: 'Hungary · Budapest'
      })
    )
  })

  it('returns English search matches from the expanded offline catalog', () => {
    const results = searchOfflineCities({
      query: 'nai',
      origin: {
        lat: -1.2921,
        lng: 36.8219
      },
      countryCode: 'KE'
    })

    expect(results[0]).toEqual(
      expect.objectContaining({
        cityId: 'ke-nairobi',
        cityName: 'Nairobi'
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
